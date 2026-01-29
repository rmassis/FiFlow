import { Hono } from "hono";
import { categorizeTransaction } from "@/services/ai/categorization";
import { createSupabaseClient, Env } from "./db";
import type { Transaction } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Helper to sync categories from transactions
async function syncCategories(supabase: any, transactions: any[], userId: string) {
  const catsToSync = transactions.map(t => ({
    name: t.category,
    subcategory: t.subcategory,
    type: t.type
  })).filter(c => c.name && c.name !== "");

  if (catsToSync.length === 0) return;

  // Get all existing categories for this user 
  const { data: existingCats } = await supabase.from('categories').select('*');
  const existingMap = new Map();
  existingCats?.forEach((c: any) => {
    const key = `${c.name}|${c.parent_id || 'root'}`;
    existingMap.set(key, c.id);
  });

  for (const item of catsToSync) {
    // 1. Sync Root Category
    let rootId = existingMap.get(`${item.name}|root`);
    if (!rootId) {
      const rootData: any = {
        name: item.name,
        type: item.type,
        is_pending: true,
        icon: "🤖",
        user_id: userId
      };

      const { data: newRoot, error: rootErr } = await supabase
        .from('categories')
        .insert(rootData)
        .select()
        .single();

      if (!rootErr && newRoot) {
        rootId = newRoot.id;
        existingMap.set(`${item.name}|root`, rootId);
      } else if (rootErr && rootErr.message?.includes('is_pending')) {
        delete rootData.is_pending;
        const { data: retryRoot } = await supabase
          .from('categories')
          .insert(rootData)
          .select()
          .single();
        if (retryRoot) {
          rootId = retryRoot.id;
          existingMap.set(`${item.name}|root`, rootId);
        }
      }
    }

    // 2. Sync Subcategory
    if (rootId && item.subcategory && item.subcategory !== "") {
      const subKey = `${item.subcategory}|${rootId}`;
      if (!existingMap.has(subKey)) {
        const subData: any = {
          name: item.subcategory,
          type: item.type,
          parent_id: rootId,
          icon: "🔹",
          user_id: userId
        };

        // We set is_pending only if it's available in the DB or we are sure it's there
        // Actually, since we are moving towards adding it, let's keep it but handle error
        subData.is_pending = true;

        const { data: newSub, error: subErr } = await supabase
          .from('categories')
          .insert(subData)
          .select()
          .single();

        if (!subErr && newSub) {
          existingMap.set(subKey, newSub.id);
        } else if (subErr && subErr.message?.includes('is_pending')) {
          // Fallback if column missing
          delete subData.is_pending;
          const { data: retrySub } = await supabase
            .from('categories')
            .insert(subData)
            .select()
            .single();
          if (retrySub) existingMap.set(subKey, retrySub.id);
        }
      }
    }
  }
}

app.post("/api/categorize", async (c) => {
  try {
    const transaction: Transaction = await c.req.json();
    const apiKey = c.env.OPENAI_API_KEY;

    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    // Ensure date is a Date object (JSON serializes dates as strings)
    const transactionWithDate = {
      ...transaction,
      date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
    };

    let categorized = await categorizeTransaction(transactionWithDate, apiKey);

    // Heuristic Override for Investment Profit vs Principal
    const desc = categorized.description.toLowerCase();
    if (/(rendimento|juros|dividendo|proventos|lucro)/i.test(desc)) {
      categorized.category = 'Rendimento'; // This will be INCLUDED in Dashboard
    } else if (/(resgate|aplicação|aplicacao|investimento|CDB|LCI|LCA|Tesouro)/i.test(desc)) {
      // Only override if not already explicitly identified as something else specific
      // But user wants strict control: Principal = Investimento (Excluded)
      if (categorized.category !== 'Rendimento') {
        categorized.category = 'Investimento'; // This will be EXCLUDED in Dashboard
      }
    }

    return c.json(categorized);
  } catch (error) {
    console.error("Error in /api/categorize:", error);
    return c.json({ error: "Erro ao categorizar transação" }, 500);
  }
});

app.post("/api/categorize-batch", async (c) => {
  try {
    const { transactions }: { transactions: Transaction[] } = await c.req.json();
    const apiKey = c.env.OPENAI_API_KEY;

    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    const categorized: Transaction[] = [];
    for (const transaction of transactions) {
      // Ensure date is a Date object (JSON serializes dates as strings)
      const transactionWithDate = {
        ...transaction,
        date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date),
      };

      let result = await categorizeTransaction(transactionWithDate, apiKey);

      // Heuristic Override for Investment Profit vs Principal
      const desc = result.description.toLowerCase();
      if (/(rendimento|juros|dividendo|proventos|lucro)/i.test(desc)) {
        result.category = 'Rendimento'; // This will be INCLUDED in Dashboard
      } else if (/(resgate|aplicação|aplicacao|investimento|CDB|LCI|LCA|Tesouro)/i.test(desc)) {
        if (result.category !== 'Rendimento') {
          result.category = 'Investimento'; // This will be EXCLUDED in Dashboard
        }
      }

      categorized.push(result);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return c.json({ transactions: categorized });
  } catch (error) {
    console.error("Error in /api/categorize-batch:", error);
    return c.json({ error: "Erro ao categorizar transações" }, 500);
  }
});

app.post("/api/transactions", async (c) => {
  try {
    const { transactions }: { transactions: Transaction[] } = await c.req.json();
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    if (transactions.length === 0) {
      return c.json({ success: true, count: 0 });
    }

    // 1. Determine Date Range to fetch relevant existing transactions
    // We treat dates as strings YYYY-MM-DD for comparison to avoid timezone issues with exact matches
    const dates = transactions.map(t => new Date(t.date).getTime());
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

    // 2. Fetch existing transactions in this range
    const { data: existing, error: fetchError } = await supabase
      .from('transactions')
      .select('date, amount, description, bank_account_id, credit_card_id')
      .gte('date', minDate)
      .lte('date', maxDate);

    if (fetchError) throw fetchError;

    // 3. Filter out duplicates
    // Key format: YYYY-MM-DD|amount|description|bankId|cardId
    const existingSet = new Set(
      existing?.map(t => {
        const d = t.date; // already YYYY-MM-DD from DB
        const amt = t.amount;
        const desc = t.description;
        const bank = t.bank_account_id || 'null';
        const card = t.credit_card_id || 'null';
        return `${d}|${amt}|${desc}|${bank}|${card}`;
      })
    );

    const toInsert = transactions.filter(t => {
      const d = new Date(t.date).toISOString().split("T")[0];
      const amt = t.amount;
      const desc = t.description;
      const bank = t.bankAccountId || 'null';
      const card = t.creditCardId || 'null';
      const key = `${d}|${amt}|${desc}|${bank}|${card}`;

      return !existingSet.has(key);
    });

    if (toInsert.length === 0) {
      return c.json({ success: true, count: 0, message: "Todas as transações já foram importadas anteriormente." });
    }

    // 4. Insert only new transactions
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { error } = await supabase.from('transactions').insert(
      toInsert.map(t => {
        let dateToUse;
        try {
          const parsed = new Date(t.date);
          if (isNaN(parsed.getTime())) throw new Error();
          dateToUse = parsed.toISOString().split("T")[0];
        } catch (e) {
          dateToUse = new Date().toISOString().split("T")[0];
        }

        return {
          date: dateToUse,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          subcategory: t.subcategory,
          confidence: t.confidence,
          needs_review: t.needsReview,
          imported_from: t.importedFrom,
          imported_at: new Date(t.importedAt || new Date()).toISOString(),
          bank_account_id: t.bankAccountId || null,
          credit_card_id: t.creditCardId || null,
          user_id: user.id
        };
      })
    );

    if (error) throw error;

    // 5. Get User ID for Sync Categories
    if (user) {
      await syncCategories(supabase, toInsert, user.id);
    }

    return c.json({
      success: true,
      count: toInsert.length,
      duplicates: transactions.length - toInsert.length
    });
  } catch (error: any) {
    console.error("Error saving transactions:", error);
    return c.json({
      error: "Erro ao salvar transações",
      details: error.message || error,
      hint: error.hint,
      code: error.code
    }, 500);
  }
});

app.get("/api/transactions", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));
    const url = new URL(c.req.url);

    let query = supabase.from('transactions').select('*');

    // Query parameters for filtering
    const type = url.searchParams.get("type");
    if (type) query = query.eq('type', type);

    const category = url.searchParams.get("category");
    if (category) query = query.eq('category', category);

    const startDate = url.searchParams.get("startDate");
    if (startDate) query = query.gte('date', startDate);

    const endDate = url.searchParams.get("endDate");
    if (endDate) query = query.lte('date', endDate);

    const minAmount = url.searchParams.get("minAmount");
    if (minAmount) query = query.gte('amount', minAmount);

    const maxAmount = url.searchParams.get("maxAmount");
    if (maxAmount) query = query.lte('amount', maxAmount);

    const search = url.searchParams.get("search");
    if (search) query = query.ilike('description', `%${search}%`);

    const needsReview = url.searchParams.get("needsReview");
    if (needsReview === "true") query = query.is('needs_review', true);

    const { data: results, error } = await query.order('date', { ascending: false }).order('id', { ascending: false });

    if (error) throw error;

    const transactions: Transaction[] = results.map((row: any) => ({
      id: row.id.toString(),
      date: new Date(row.date),
      description: row.description,
      amount: row.amount,
      type: row.type,
      category: row.category || '',
      subcategory: row.subcategory || '',
      confidence: row.confidence || 0,
      needsReview: Boolean(row.needs_review),
      importedFrom: row.imported_from || '',
      importedAt: new Date(row.imported_at || row.created_at),
    }));

    return c.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: "Erro ao buscar transações" }, 500);
  }
});

app.get("/api/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return c.json({ error: "Transação não encontrada" }, 404);

    const transaction: Transaction = {
      id: data.id.toString(),
      date: new Date(data.date),
      description: data.description,
      amount: data.amount,
      type: data.type,
      category: data.category || '',
      subcategory: data.subcategory || '',
      confidence: data.confidence || 0,
      needsReview: Boolean(data.needs_review),
      importedFrom: data.imported_from || '',
      importedAt: new Date(data.imported_at || data.created_at),
    };

    return c.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return c.json({ error: "Erro ao buscar transação" }, 500);
  }
});

app.patch("/api/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates: Partial<Transaction> = await c.req.json();
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const dbUpdates: any = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
    if (updates.date !== undefined) dbUpdates.date = new Date(updates.date).toISOString().split("T")[0];

    if (Object.keys(dbUpdates).length === 0) {
      return c.json({ error: "Nenhum campo para atualizar" }, 400);
    }

    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;

    // 2. Sync if category/subcategory updated
    if (dbUpdates.category || dbUpdates.subcategory) {
      const { data: updatedTrans } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (updatedTrans) {
        await syncCategories(supabase, [{
          category: updatedTrans.category,
          subcategory: updatedTrans.subcategory,
          type: updatedTrans.type
        }]);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return c.json({ error: "Erro ao atualizar transação" }, 500);
  }
});

app.delete("/api/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return c.json({ error: "Erro ao deletar transação" }, 500);
  }
});

app.get("/api/transactions/stats/categories", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    // Note: Supabase JS doesn't support complex aggregations directly easily, 
    // we might need an RPC function or fetch and aggregate.
    // For now, let's fetch all and aggregate in memory (not ideal for large datasets) in MVP
    // OR allow SQL via RPC. But we are avoiding raw SQL.
    // Let's use a simpler query: fetch transactions with categories

    // Better approach for MVP without creating RPC: Select categories and map them.
    // But since we need counts and sums, raw SQL or RPC is best.
    // Given user constraints, let's execute SQL via Supabase RPC if we create one, 
    // OR just fetch data and aggregate in Worker (acceptable for MVP/small data).

    const { data, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .not('category', 'is', null)
      .neq('category', '');

    if (error) throw error;

    const stats = data.reduce((acc: any, curr: any) => {
      if (!acc[curr.category]) {
        acc[curr.category] = { count: 0, total: 0 };
      }
      acc[curr.category].count++;
      acc[curr.category].total += curr.amount;
      return acc;
    }, {});

    const results = Object.keys(stats).map(category => ({
      category,
      count: stats[category].count,
      total: stats[category].total
    })).sort((a, b) => b.total - a.total);

    return c.json({ categories: results });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return c.json({ error: "Erro ao buscar estatísticas" }, 500);
  }
});

// Helper function to clean and normalize category names (sync with frontend)
function formatCategoryName(name: string): string {
  if (!name) return name;
  return name
    .trim()
    .replace(/[0-9]+$/, '') // Remove trailing numbers
    .replace(/[^a-zA-ZÀ-ÿ\u00C0-\u017F\s]/g, '') // Keep only letters, accents, and spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Categories API

app.post("/api/categories/cleanup", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;

    let totalProcessed = categories.length;
    let cleanedCount = 0;
    let duplicatesRemoved = 0;

    const seen = new Map(); // name -> id

    for (const cat of categories) {
      const cleanName = formatCategoryName(cat.name);

      // 1. Check for duplicates
      if (seen.has(cleanName.toLowerCase())) {
        const originalId = seen.get(cleanName.toLowerCase());
        // Simple strategy: delete current duplicate
        await supabase.from('categories').delete().eq('id', cat.id);
        duplicatesRemoved++;
        continue;
      }

      seen.set(cleanName.toLowerCase(), cat.id);

      // 2. Check if rename needed
      if (cleanName !== cat.name) {
        await supabase
          .from('categories')
          .update({ name: cleanName })
          .eq('id', cat.id);
        cleanedCount++;
      }
    }

    return c.json({
      success: true,
      totalProcessed,
      cleanedCount,
      duplicatesRemoved
    });
  } catch (error) {
    console.error("Error cleaning up categories:", error);
    return c.json({ error: "Erro na limpeza das categorias" }, 500);
  }
});

app.get("/api/categories", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Supabase Error fetching categories:", error);
      throw error;
    }
    return c.json(data);
  } catch (error) {
    console.error("Detailed catch error in /api/categories:", error);
    return c.json({ error: "Erro ao buscar categorias" }, 500);
  }
});

app.post("/api/categories", async (c) => {
  try {
    const category = await c.req.json();
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error: any) {
    console.error("Error creating category:", error);
    return c.json({
      error: "Erro ao criar categoria",
      details: error.message || error,
      hint: error.hint,
      code: error.code
    }, 500);
  }
});

app.patch("/api/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (error) {
    console.error("Error updating category:", error);
    return c.json({ error: "Erro ao atualizar categoria" }, 500);
  }
});

app.delete("/api/categories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return c.json({ error: "Erro ao deletar categoria" }, 500);
  }
});

app.post("/api/categories/reclassify", async (c) => {
  try {
    const { oldCategory, newCategory, type } = await c.req.json();
    const supabase = createSupabaseClient(c.env);

    // This is a bulk update on Transactions TEXT field
    const { data, error } = await supabase
      .from('transactions')
      .update({ category: newCategory })
      .eq('category', oldCategory)
      .eq('type', type) // Safety check
      .select();

    if (error) throw error;

    return c.json({ success: true, count: data.length });
  } catch (error) {
    console.error("Error reclassifying transactions:", error);
    return c.json({ error: "Erro ao reclassificar transações" }, 500);
  }
});

app.post("/api/system/reset", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env, c.req.header("Authorization"));

    // Order matters for foreign keys
    const tables = [
      'budgets',
      'goals',
      'transactions',
      'categories',
      'bank_accounts',
      'credit_cards',
      'investments' // Added missing table
    ];

    const results: any = {};

    for (const table of tables) {
      // Trying a universal approach: delete everything where ID is not null
      // Some Supabase versions/configs might require different filters
      const { data, error, count } = await supabase
        .from(table)
        .delete()
        .neq('id', -1) // Generic numeric filter
        .or('id.neq.00000000-0000-0000-0000-000000000000') // Generic UUID filter fallback
        .select('*', { count: 'exact' }); // requesting count to verify

      if (error) {
        // If the combined filter fails, try a simpler one
        const { error: error2 } = await supabase.from(table).delete().not('id', 'is', null);
        if (error2) {
          console.error(`FAILED to reset table ${table}:`, error2);
          results[table] = { success: false, error: error2 };
        } else {
          results[table] = { success: true };
        }
      } else {
        results[table] = { success: true, count };
      }
    }

    return c.json({ success: true, results, message: "Operação de reset concluída." });
  } catch (error: any) {
    console.error("Critical error during system reset:", error);
    return c.json({
      error: "Erro crítico ao resetar o sistema",
      details: error.message || error
    }, 500);
  }
});

export default app;