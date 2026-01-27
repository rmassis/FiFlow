import { Hono } from "hono";
import { categorizeTransaction } from "@/services/ai/categorization";
import type { Transaction } from "@/shared/types";

type Bindings = {
  OPENAI_API_KEY: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

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

    const categorized = await categorizeTransaction(transactionWithDate, apiKey);
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
      
      const result = await categorizeTransaction(transactionWithDate, apiKey);
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
    const db = c.env.DB;

    for (const transaction of transactions) {
      await db
        .prepare(
          `
          INSERT INTO transactions (
            date, description, amount, type, category, subcategory,
            confidence, needs_review, imported_from, imported_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        )
        .bind(
          new Date(transaction.date).toISOString().split("T")[0],
          transaction.description,
          transaction.amount,
          transaction.type,
          transaction.category,
          transaction.subcategory,
          transaction.confidence,
          transaction.needsReview ? 1 : 0,
          transaction.importedFrom,
          new Date(transaction.importedAt).toISOString()
        )
        .run();
    }

    return c.json({ success: true, count: transactions.length });
  } catch (error) {
    console.error("Error saving transactions:", error);
    return c.json({ error: "Erro ao salvar transações" }, 500);
  }
});

app.get("/api/transactions", async (c) => {
  try {
    const db = c.env.DB;
    const url = new URL(c.req.url);
    
    // Query parameters for filtering
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const minAmount = url.searchParams.get("minAmount");
    const maxAmount = url.searchParams.get("maxAmount");
    const search = url.searchParams.get("search");
    const needsReview = url.searchParams.get("needsReview");

    let query = "SELECT * FROM transactions WHERE 1=1";
    const params: any[] = [];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }

    if (minAmount) {
      query += " AND amount >= ?";
      params.push(parseFloat(minAmount));
    }

    if (maxAmount) {
      query += " AND amount <= ?";
      params.push(parseFloat(maxAmount));
    }

    if (search) {
      query += " AND description LIKE ?";
      params.push(`%${search}%`);
    }

    if (needsReview === "true") {
      query += " AND needs_review = 1";
    }

    query += " ORDER BY date DESC, id DESC";

    const stmt = db.prepare(query);
    const { results } = await stmt.bind(...params).all();

    const transactions: Transaction[] = results.map((row: any) => ({
      id: (row.id as number).toString(),
      date: new Date(row.date as string),
      description: row.description as string,
      amount: row.amount as number,
      type: row.type as "receita" | "despesa",
      category: (row.category as string) || '',
      subcategory: (row.subcategory as string) || '',
      confidence: (row.confidence as number) || 0,
      needsReview: Boolean(row.needs_review),
      importedFrom: (row.imported_from as string) || '',
      importedAt: new Date((row.imported_at || row.created_at) as string),
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
    const db = c.env.DB;

    const { results } = await db
      .prepare("SELECT * FROM transactions WHERE id = ?")
      .bind(id)
      .all();

    if (results.length === 0) {
      return c.json({ error: "Transação não encontrada" }, 404);
    }

    const row: any = results[0];
    const transaction: Transaction = {
      id: (row.id as number).toString(),
      date: new Date(row.date as string),
      description: row.description as string,
      amount: row.amount as number,
      type: row.type as "receita" | "despesa",
      category: (row.category as string) || '',
      subcategory: (row.subcategory as string) || '',
      confidence: (row.confidence as number) || 0,
      needsReview: Boolean(row.needs_review),
      importedFrom: (row.imported_from as string) || '',
      importedAt: new Date((row.imported_at || row.created_at) as string),
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
    const db = c.env.DB;

    const fields: string[] = [];
    const params: any[] = [];

    if (updates.description !== undefined) {
      fields.push("description = ?");
      params.push(updates.description);
    }
    if (updates.amount !== undefined) {
      fields.push("amount = ?");
      params.push(updates.amount);
    }
    if (updates.type !== undefined) {
      fields.push("type = ?");
      params.push(updates.type);
    }
    if (updates.category !== undefined) {
      fields.push("category = ?");
      params.push(updates.category);
    }
    if (updates.subcategory !== undefined) {
      fields.push("subcategory = ?");
      params.push(updates.subcategory);
    }
    if (updates.date !== undefined) {
      fields.push("date = ?");
      params.push(new Date(updates.date).toISOString().split("T")[0]);
    }

    if (fields.length === 0) {
      return c.json({ error: "Nenhum campo para atualizar" }, 400);
    }

    params.push(id);
    const query = `UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`;

    await db.prepare(query).bind(...params).run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return c.json({ error: "Erro ao atualizar transação" }, 500);
  }
});

app.delete("/api/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = c.env.DB;

    await db.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return c.json({ error: "Erro ao deletar transação" }, 500);
  }
});

app.get("/api/transactions/stats/categories", async (c) => {
  try {
    const db = c.env.DB;

    const { results } = await db
      .prepare(
        `
        SELECT category, COUNT(*) as count, SUM(amount) as total
        FROM transactions
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY total DESC
      `
      )
      .all();

    return c.json({ categories: results });
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return c.json({ error: "Erro ao buscar estatísticas" }, 500);
  }
});

export default app;