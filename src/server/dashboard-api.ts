import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// GET /api/dashboard/stats - Get dashboard summary statistics
app.get("/api/dashboard/stats", async (c) => {
  try {
    const db = c.env.DB;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month totals
    const currentMonthQuery = await db
      .prepare(
        `
        SELECT 
          type,
          SUM(amount) as total
        FROM transactions
        WHERE date >= ? AND date <= ?
        GROUP BY type
      `
      )
      .bind(
        startOfMonth.toISOString().split("T")[0],
        now.toISOString().split("T")[0]
      )
      .all();

    let currentReceitas = 0;
    let currentDespesas = 0;

    currentMonthQuery.results.forEach((row: any) => {
      if (row.type === "receita") {
        currentReceitas = row.total as number;
      } else if (row.type === "despesa") {
        currentDespesas = row.total as number;
      }
    });

    // Last month totals for comparison
    const lastMonthQuery = await db
      .prepare(
        `
        SELECT 
          type,
          SUM(amount) as total
        FROM transactions
        WHERE date >= ? AND date <= ?
        GROUP BY type
      `
      )
      .bind(
        startOfLastMonth.toISOString().split("T")[0],
        endOfLastMonth.toISOString().split("T")[0]
      )
      .all();

    let lastReceitas = 0;
    let lastDespesas = 0;

    lastMonthQuery.results.forEach((row: any) => {
      if (row.type === "receita") {
        lastReceitas = row.total as number;
      } else if (row.type === "despesa") {
        lastDespesas = row.total as number;
      }
    });

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

    // Daily sparkline data (last 7 days)
    const sparklineQuery = await db
      .prepare(
        `
        SELECT 
          date,
          type,
          SUM(amount) as total
        FROM transactions
        WHERE date >= date('now', '-7 days')
        GROUP BY date, type
        ORDER BY date ASC
      `
      )
      .all();

    const sparklineMap = new Map<string, { receita: number; despesa: number }>();
    sparklineQuery.results.forEach((row: any) => {
      const existing = sparklineMap.get(row.date) || { receita: 0, despesa: 0 };
      if (row.type === "receita") {
        existing.receita = row.total as number;
      } else {
        existing.despesa = row.total as number;
      }
      sparklineMap.set(row.date, existing);
    });

    const receitasSparkline: number[] = [];
    const despesasSparkline: number[] = [];
    const saldoSparkline: number[] = [];

    Array.from(sparklineMap.values()).forEach((day) => {
      receitasSparkline.push(day.receita);
      despesasSparkline.push(day.despesa);
      saldoSparkline.push(day.receita - day.despesa);
    });

    // Ensure we have at least 7 data points
    while (receitasSparkline.length < 7) {
      receitasSparkline.unshift(0);
      despesasSparkline.unshift(0);
      saldoSparkline.unshift(0);
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
    const db = c.env.DB;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { results } = await db
      .prepare(
        `
        SELECT 
          strftime('%d', date) as dia,
          type,
          SUM(amount) as total
        FROM transactions
        WHERE date >= ?
        GROUP BY strftime('%d', date), type
        ORDER BY date ASC
      `
      )
      .bind(startOfMonth.toISOString().split("T")[0])
      .all();

    const evolutionMap = new Map<string, { receitas: number; despesas: number }>();
    
    results.forEach((row: any) => {
      const dia = row.dia;
      const existing = evolutionMap.get(dia) || { receitas: 0, despesas: 0 };
      
      if (row.type === "receita") {
        existing.receitas = row.total as number;
      } else if (row.type === "despesa") {
        existing.despesas = row.total as number;
      }
      
      evolutionMap.set(dia, existing);
    });

    const evolution = Array.from(evolutionMap.entries()).map(([dia, values]) => ({
      dia,
      receitas: values.receitas,
      despesas: values.despesas,
    }));

    return c.json({ evolution });
  } catch (error) {
    console.error("Error fetching evolution data:", error);
    return c.json({ error: "Failed to fetch evolution data" }, 500);
  }
});

// GET /api/dashboard/categories - Get expenses by category
app.get("/api/dashboard/categories", async (c) => {
  try {
    const db = c.env.DB;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { results } = await db
      .prepare(
        `
        SELECT 
          category,
          SUM(amount) as total
        FROM transactions
        WHERE type = 'despesa' 
          AND date >= ?
          AND category IS NOT NULL 
          AND category != ''
        GROUP BY category
        ORDER BY total DESC
      `
      )
      .bind(startOfMonth.toISOString().split("T")[0])
      .all();

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

    const categories = results.map((row: any) => ({
      name: row.category,
      value: row.total as number,
      color: categoryColors[row.category] || "#64748B",
    }));

    return c.json({ categories });
  } catch (error) {
    console.error("Error fetching category data:", error);
    return c.json({ error: "Failed to fetch category data" }, 500);
  }
});

// GET /api/dashboard/recent - Get recent transactions
app.get("/api/dashboard/recent", async (c) => {
  try {
    const db = c.env.DB;
    const limit = parseInt(c.req.query("limit") || "10");

    const { results } = await db
      .prepare(
        `
        SELECT * FROM transactions
        ORDER BY date DESC, id DESC
        LIMIT ?
      `
      )
      .bind(limit)
      .all();

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
