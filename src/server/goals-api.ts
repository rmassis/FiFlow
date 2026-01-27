import { Hono } from "hono";
import type { Goal } from "@/shared/types";
import { createSupabaseClient, Env } from "./db";

const app = new Hono<{ Bindings: Env }>();

// Helper to convert Supabase row to Goal
function dbToGoal(row: any): Goal {
  return {
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
  };
}

// Calculate current amount based on goal type
// Note: We aggregate in JS for now as Supabase JS doesn't support complex group/sum queries easily without RPCs
async function calculateCurrentAmount(
  supabase: any,
  goal: Goal
): Promise<number> {
  const startDate = new Date(goal.startDate).toISOString().split("T")[0];
  const endDate = new Date(goal.endDate).toISOString().split("T")[0];

  try {
    switch (goal.type) {
      case "economia": {
        // Fetch all transactions in period
        const { data: transactions } = await supabase
          .from('transactions')
          .select('type, amount')
          .gte('date', startDate)
          .lte('date', endDate);

        if (!transactions) return 0;

        const receitas = transactions
          .filter((t: any) => t.type === 'receita')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const despesas = transactions
          .filter((t: any) => t.type === 'despesa')
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        return receitas - despesas;
      }

      case "limite_gastos": {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'despesa')
          .eq('category', goal.category)
          .gte('date', startDate)
          .lte('date', endDate);

        if (!transactions) return 0;
        return transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      }

      case "receita": {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'receita')
          .gte('date', startDate)
          .lte('date', endDate);

        if (!transactions) return 0;
        return transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      }

      case "investimento": {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category', 'Investimentos')
          .gte('date', startDate)
          .lte('date', endDate);

        if (!transactions) return 0;
        return transactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error("Error calculating current amount:", error);
    return 0;
  }
}

// GET /api/goals - List all goals
app.get("/api/goals", async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const goals: Goal[] = [];
    for (const row of data) {
      const goal = dbToGoal(row);
      // Calculate current amount
      goal.currentAmount = await calculateCurrentAmount(supabase, goal);
      goals.push(goal);
    }

    return c.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return c.json({ error: "Failed to fetch goals" }, 500);
  }
});

// POST /api/goals - Create a new goal
app.post("/api/goals", async (c) => {
  try {
    const goal: Goal = await c.req.json();
    const supabase = createSupabaseClient(c.env);

    const { data, error } = await supabase
      .from('goals')
      .insert({
        name: goal.name,
        type: goal.type,
        target_amount: goal.targetAmount,
        current_amount: 0,
        start_date: new Date(goal.startDate).toISOString().split("T")[0],
        end_date: new Date(goal.endDate).toISOString().split("T")[0],
        category: goal.category || null,
        recurrence: goal.recurrence,
        notify_at_50: goal.notifyAt50,
        notify_at_75: goal.notifyAt75,
        notify_at_90: goal.notifyAt90,
        notify_on_exceed: goal.notifyOnExceed,
        status: "active"
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Error creating goal:", error);
    return c.json({ error: "Failed to create goal" }, 500);
  }
});

// PUT /api/goals/:id - Update a goal
app.put("/api/goals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const goal: Goal = await c.req.json();
    const supabase = createSupabaseClient(c.env);

    const { error } = await supabase
      .from('goals')
      .update({
        name: goal.name,
        type: goal.type,
        target_amount: goal.targetAmount,
        start_date: new Date(goal.startDate).toISOString().split("T")[0],
        end_date: new Date(goal.endDate).toISOString().split("T")[0],
        category: goal.category || null,
        recurrence: goal.recurrence,
        notify_at_50: goal.notifyAt50,
        notify_at_75: goal.notifyAt75,
        notify_at_90: goal.notifyAt90,
        notify_on_exceed: goal.notifyOnExceed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    return c.json({ error: "Failed to update goal" }, 500);
  }
});

// DELETE /api/goals/:id - Delete a goal
app.delete("/api/goals/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = createSupabaseClient(c.env);

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return c.json({ error: "Failed to delete goal" }, 500);
  }
});

export default app;
