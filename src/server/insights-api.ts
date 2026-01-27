import { Hono } from "hono";
import { generateInsights, analyzeTransactionsForContext } from "@/services/ai/insights";
import { createSupabaseClient, Env } from "./db";
import type { Insight, Transaction, Goal } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Helper to convert DB row to Insight
function dbToInsight(row: any): Insight {
  return {
    id: row.id,
    tipo: row.tipo,
    título: row.título,
    descrição: row.descrição,
    impacto: row.impacto,
    ação_sugerida: row.ação_sugerida,
    economia_potencial: row.economia_potencial,
    period_start: new Date(row.period_start),
    period_end: new Date(row.period_end),
    is_read: Boolean(row.is_read),
    is_applied: Boolean(row.is_applied),
    createdAt: new Date(row.created_at),
  };
}

// GET /api/insights - List all insights
app.get("/api/insights", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);

    const { data: results, error } = await supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const insights = results.map(dbToInsight);
    return c.json({ insights });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return c.json({ error: "Failed to fetch insights" }, 500);
  }
});

// POST /api/insights/generate - Generate new insights
app.post("/api/insights/generate", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const apiKey = c.env.OPENAI_API_KEY;

    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    // Fetch all transactions
    const { data: transactionRows, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (txError) throw txError;

    const transactions: Transaction[] = transactionRows.map((row: any) => ({
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

    // Fetch active goals
    const { data: goalRows, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('status', 'active');

    if (goalsError) throw goalsError;

    const goals: Goal[] = goalRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount || 0,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      category: row.category,
      recurrence: row.recurrence,
      notifyAt50: Boolean(row.notify_at_50),
      notifyAt75: Boolean(row.notify_at_75),
      notifyAt90: Boolean(row.notify_at_90),
      notifyOnExceed: Boolean(row.notify_on_exceed),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    // Analyze and generate context
    const context = await analyzeTransactionsForContext(transactions, goals);

    // Generate insights using AI
    const insights = await generateInsights(context, apiKey);

    // Save insights to database
    // Batch insert is more efficient
    if (insights.length > 0) {
      const { error: insertError } = await supabase
        .from('insights')
        .insert(
          insights.map(insight => ({
            tipo: insight.tipo,
            título: insight.título,
            descrição: insight.descrição,
            impacto: insight.impacto,
            ação_sugerida: insight.ação_sugerida,
            economia_potencial: insight.economia_potencial || null,
            period_start: new Date(insight.period_start).toISOString().split("T")[0],
            period_end: new Date(insight.period_end).toISOString().split("T")[0]
          }))
        );

      if (insertError) throw insertError;
    }

    return c.json({ success: true, insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    return c.json({ error: "Failed to generate insights" }, 500);
  }
});

// PATCH /api/insights/:id/read - Mark insight as read
app.patch("/api/insights/:id/read", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env);

    const { error } = await supabase
      .from('insights')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error marking insight as read:", error);
    return c.json({ error: "Failed to mark insight as read" }, 500);
  }
});

// PATCH /api/insights/:id/apply - Mark insight as applied
app.patch("/api/insights/:id/apply", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env);

    const { error } = await supabase
      .from('insights')
      .update({ is_applied: true })
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error marking insight as applied:", error);
    return c.json({ error: "Failed to mark insight as applied" }, 500);
  }
});

// DELETE /api/insights/:id - Delete an insight
app.delete("/api/insights/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env);

    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting insight:", error);
    return c.json({ error: "Failed to delete insight" }, 500);
  }
});

export default app;
