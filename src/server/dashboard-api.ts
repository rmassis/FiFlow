import { Hono } from "hono";
import { createSupabaseClient, Env } from "./db";

const app = new Hono<{ Bindings: Env }>();

const EXCLUDED_CATEGORIES = ['Investimento', 'Investimentos', 'Aplicação', 'Resgate', 'Transferência'];

// GET /api/dashboard/stats - Get dashboard summary statistics
app.get("/api/dashboard/stats", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const url = new URL(c.req.url); // Use URL to get query params safely in all environments

    // Parse Date Ranges from Query (sent by DashboardContext)
    // Default to current month if not provided
    const now = new Date();
    const startDate = url.searchParams.get("startDate")?.split('T')[0] || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate = url.searchParams.get("endDate")?.split('T')[0] || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    // Fetch transactions for the selected period
    // Apply Category Exclusion
    const { data: periodTx, error } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category', 'in', `("${EXCLUDED_CATEGORIES.join('","')}")`);
    // Supabase Postgrest syntax for NOT IN is slightly complex via JS client raw filter, 
    // but simpler to fetch and filter in memory if volume is low, or use .filter properly.
    // JS Client doesn't have a direct .notIn() easily accessible in all versions. 
    // Let's us .neq combined or better: fetch and filter in memory for MVP safety/simplicity 
    // unless dataset is huge. 
    // Actually, let's use the explicit filter if possible, but 'not.in' is tricky.
    // Workaround: Use 'neq' for each, or just filter in memory for robustness now.

    if (error) throw error;

    // Filter in memory for safety against Supabase syntax edge cases in this environment
    const filteredTx = periodTx?.filter((t: any) => !EXCLUDED_CATEGORIES.includes(t.category));

    let currentReceitas = 0;
    let currentDespesas = 0;

    if (filteredTx) {
      currentReceitas = filteredTx
        .filter((t: any) => t.type === 'receita')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      currentDespesas = filteredTx
        .filter((t: any) => t.type === 'despesa')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    }

    // Previous Period Calculation (Simple approximation: same duration before startDate)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const prevStart = new Date(start.getTime() - duration - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { data: prevTx } = await supabase
      .from('transactions')
      .select('type, amount')
      .gte('date', prevStart)
      .lte('date', prevEnd);

    const filteredPrevTx = prevTx?.filter((t: any) => !EXCLUDED_CATEGORIES.includes(t.category));

    let lastReceitas = 0;
    let lastDespesas = 0;

    if (filteredPrevTx) {
      lastReceitas = filteredPrevTx
        .filter((t: any) => t.type === 'receita')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      lastDespesas = filteredPrevTx
        .filter((t: any) => t.type === 'despesa')
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    }

    // Calculate variations
    const receitasVariation = lastReceitas > 0 ? ((currentReceitas - lastReceitas) / lastReceitas) * 100 : 0;
    const despesasVariation = lastDespesas > 0 ? ((currentDespesas - lastDespesas) / lastDespesas) * 100 : 0;

    const currentSaldo = currentReceitas - currentDespesas;
    const lastSaldo = lastReceitas - lastDespesas;
    const saldoVariation = lastSaldo > 0 ? ((currentSaldo - lastSaldo) / lastSaldo) * 100 : 0;

    // Sparkline (Distribution over the selected period, bucketed?)
    // For simplicity, let's map the actual daily data of the selected period.
    const sparklineMap = new Map<string, { receita: number; despesa: number }>();
    if (filteredTx) {
      filteredTx.forEach((row: any) => {
        const existing = sparklineMap.get(row.date) || { receita: 0, despesa: 0 };
        if (row.type === "receita") existing.receita += row.amount;
        else existing.despesa += row.amount;
        sparklineMap.set(row.date, existing);
      });
    }

    // Generate buckets (last 7 days of the period implies the "trend" sparkline usually)
    // But the component draws a line. Let's return the last 7 items from the map sorted? 
    // Or just 7 equally spaced points? 
    // Standard sparkline = last 7 days ending at endDate.
    const receitasSparkline: number[] = [];
    const despesasSparkline: number[] = [];
    const saldoSparkline: number[] = [];

    // Generate last 7 days ending at endDate
    const sparkEnd = new Date(endDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(sparkEnd.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const data = sparklineMap.get(d) || { receita: 0, despesa: 0 };
      receitasSparkline.push(data.receita);
      despesasSparkline.push(data.despesa);
      saldoSparkline.push(data.receita - data.despesa);
    }

    return c.json({
      receitas: { value: currentReceitas, variation: receitasVariation, sparkline: receitasSparkline },
      despesas: { value: currentDespesas, variation: despesasVariation, sparkline: despesasSparkline },
      saldo: { value: currentSaldo, variation: saldoVariation, sparkline: saldoSparkline },
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
    const url = new URL(c.req.url);
    const startDate = url.searchParams.get("startDate")?.split('T')[0] || "";
    const endDate = url.searchParams.get("endDate")?.split('T')[0] || "";

    const { data: results, error } = await supabase
      .from('transactions')
      .select('date, type, amount, category')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    const evolutionMap = new Map<string, { receitas: number; despesas: number }>();

    if (results) {
      results
        .filter((t: any) => !EXCLUDED_CATEGORIES.includes(t.category))
        .forEach((row: any) => {
          const dia = row.date.split('-')[2]; // Visual simplification: just showing Day ID. 
          // Note: If range > 1 month, this overlaps days. 
          // Ideally should return full date.
          // Let's change behavior: Return full date label if range > 31 days?
          // For now, keep "Day" as per original but be aware of collision. 
          // Better: Use `row.date` as key, and frontend formats it.
          // But original frontend expects "dia". Let's stick to "dia" for simple monthly view, 
          // or use DD/MM if necessary. Let's use DD/MM to be safe.
          const label = `${row.date.split('-')[2]}/${row.date.split('-')[1]}`;

          const existing = evolutionMap.get(label) || { receitas: 0, despesas: 0 };
          if (row.type === "receita") existing.receitas += row.amount;
          else if (row.type === "despesa") existing.despesas += row.amount;
          evolutionMap.set(label, existing);
        });
    }

    const evolution = Array.from(evolutionMap.entries()).map(([dia, values]) => ({
      dia,
      receitas: values.receitas,
      despesas: values.despesas,
    }));
    // Logic to sort by date needed? They are already inserted in date order from DB sort? 
    // Usually yes, but Map iteration order is insertion order in JS.
    // So distinct keys will be in order of first appearance. DB returns ordered by date, so we are good.

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
    const url = new URL(c.req.url);
    const startDate = url.searchParams.get("startDate")?.split('T')[0] || "";
    const endDate = url.searchParams.get("endDate")?.split('T')[0] || "";

    const { data: results, error } = await supabase
      .from('transactions')
      .select('category, amount')
      .eq('type', 'despesa')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category', 'is', null)
      .neq('category', '');

    if (error) throw error;

    const categoryStats: Record<string, number> = {};

    if (results) {
      results
        .filter((t: any) => !EXCLUDED_CATEGORIES.includes(t.category))
        .forEach((row: any) => {
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
      Investimentos: "#6366F1", // Even if excluded, keeping color just in case
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
// (Normally recent transactions list SHOULD show investments, so user can see them, even if excluded from totals)
// So we DO NOT exclude them here.
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
