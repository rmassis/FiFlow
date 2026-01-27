import { Hono } from "hono";
import { createSupabaseClient, Env } from "./db";

const app = new Hono<{ Bindings: Env }>();

// GET /api/dashboard/stats - Get dashboard summary statistics
app.get("/api/dashboard/stats", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    // Fetch transactions for current month and last month and last 7 days
    // To minimize requests, we can fetch all from startOfLastMonth
    // (assuming stats are viewed frequently, optimization involves simpler queries)

    // 1. Current Month Data
    const { data: currentMonthTx } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', startOfMonth)
      .lte('date', today);

    let currentReceitas = 0;
    let currentDespesas = 0;

    if (currentMonthTx) {
      currentReceitas = currentMonthTx
        .filter((t: any) => t.type === 'receita')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      currentDespesas = currentMonthTx
        .filter((t: any) => t.type === 'despesa')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    }

    // 2. Last Month Data
    const { data: lastMonthTx } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', startOfLastMonth)
      .lte('date', endOfLastMonth);

    let lastReceitas = 0;
    let lastDespesas = 0;

    if (lastMonthTx) {
      lastReceitas = lastMonthTx
        .filter((t: any) => t.type === 'receita')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      lastDespesas = lastMonthTx
        .filter((t: any) => t.type === 'despesa')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    }

    // Calculate variations
    const receitasVariation =
      lastReceitas > 0
        ? ((currentReceitas - lastReceitas) / lastReceitas) * 100
        : 0;
    const despesasVariation =
      lastDespesas > 0
        ? ((currentDespesas - lastDespesas) / lastDespesas) * 100
        : 0;

    const currentSaldo = currentReceitas - currentDespesas;
    const lastSaldo = lastReceitas - lastDespesas;
    const saldoVariation =
      lastSaldo > 0 ? ((currentSaldo - lastSaldo) / lastSaldo) * 100 : 0;

    // 3. Sparkline Data (Last 7 days)
    const { data: sparklineTx } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: true });

    const sparklineMap = new Map<string, { receita: number; despesa: number }>();
    if (sparklineTx) {
      sparklineTx.forEach((row: any) => {
        const existing = sparklineMap.get(row.date) || { receita: 0, despesa: 0 };
        if (row.type === "receita") {
          existing.receita += row.amount;
        } else {
          existing.despesa += row.amount;
        }
        sparklineMap.set(row.date, existing);
      });
    }

    const receitasSparkline: number[] = [];
    const despesasSparkline: number[] = [];
    const saldoSparkline: number[] = [];
    const dates: string[] = [];

    // Fill last 7 days including empty ones
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const data = sparklineMap.get(d) || { receita: 0, despesa: 0 };
      receitasSparkline.push(data.receita);
      despesasSparkline.push(data.despesa);
      saldoSparkline.push(data.receita - data.despesa);
      dates.push(d);
    }

    return c.json({
      receitas: {
        value: currentReceitas,
        variation: receitasVariation,
        sparkline: receitasSparkline,
      },
      despesas: {
        value: currentDespesas,
        variation: despesasVariation,
        sparkline: despesasSparkline,
      },
      saldo: {
        value: currentSaldo,
        variation: saldoVariation,
        sparkline: saldoSparkline,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return c.json({ error: "Failed to fetch dashboard stats" }, 500);
  }
});

// GET /api/dashboard/evolution - Get evolution chart data
app.get("/api/dashboard/evolution", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    const { data: results, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .gte('date', startOfMonth)
      .order('date', { ascending: true });

    if (error) throw error;

    const evolutionMap = new Map<string, { receitas: number; despesas: number }>();

    if (results) {
      results.forEach((row: any) => {
        const dia = row.date.split('-')[2]; // Get DD part
        const existing = evolutionMap.get(dia) || { receitas: 0, despesas: 0 };

        if (row.type === "receita") {
          existing.receitas += row.amount;
        } else if (row.type === "despesa") {
          existing.despesas += row.amount;
        }

        evolutionMap.set(dia, existing);
      });
    }

    // Sort by day (map entries are not guaranteed sorted by key if inserted randomly, though here input is sorted)
    // We should ensure all days are present or just returning present days. 
    // Usually evolution chart shows existing days.
    const evolution = Array.from(evolutionMap.entries()).map(([dia, values]) => ({
      dia,
      receitas: values.receitas,
      despesas: values.despesas,
    })).sort((a, b) => parseInt(a.dia) - parseInt(b.dia));

    return c.json({ evolution });
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    return c.json({ error: "Failed to fetch evolution data" }, 500);
  }
});

// GET /api/dashboard/categories - Get expenses by category
app.get("/api/dashboard/categories", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    const { data: results, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'despesa')
      .gte('date', startOfMonth)
      .not('category', 'is', null)
      .neq('category', '');

    if (error) throw error;

    const categoryStats: Record<string, number> = {};

    if (results) {
      results.forEach((row: any) => {
        categoryStats[row.category] = (categoryStats[row.category] || 0) + row.amount;
      });
    }

    const categoryColors: Record<string, string> = {
      Alimentação: "#EF4444",
      Transporte: "#F59E0B",
      Moradia: "#8B5CF6",
      Saúde: "#06B6D4",
      Educação: "#10B981",
      Lazer: "#EC4899",
      Vestuário: "#F97316",
      Investimentos: "#6366F1",
      Outros: "#64748B",
    };

    const categories = Object.keys(categoryStats).map(name => ({
      name,
      value: categoryStats[name],
      color: categoryColors[name] || "#64748B",
    })).sort((a, b) => b.value - a.value);

    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching category data:", error);
    return c.json({ error: "Failed to fetch category data" }, 500);
  }
});

// GET /api/dashboard/recent - Get recent transactions
app.get("/api/dashboard/recent", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const limit = parseInt(c.req.query("limit") || "10");

    const { data: results, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const transactions = results.map((row: any) => ({
      id: row.id,
      date: row.date,
      description: row.description,
      amount: row.amount,
      type: row.type,
      category: row.category || "",
      subcategory: row.subcategory || "",
    }));

    return c.json({ transactions });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return c.json({ error: "Failed to fetch recent transactions" }, 500);
  }
});

export default app;
