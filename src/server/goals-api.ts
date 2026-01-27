import { Hono } from "hono";
import type { Goal } from "@/shared/types";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper to convert DB row to Goal
function dbToGoal(row: any): Goal {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
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
async function calculateCurrentAmount(
  db: D1Database,
  goal: Goal
): Promise<number> {
  const startDate = new Date(goal.startDate).toISOString().split("T")[0];
  const endDate = new Date(goal.endDate).toISOString().split("T")[0];

  try {
    switch (goal.type) {
      case "economia": {
        // Sum all income minus expenses in the period
        const result = await db
          .prepare(
            `
            SELECT 
              COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) -
              COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as total
            FROM transactions
            WHERE date >= ? AND date <= ?
          `
          )
          .bind(startDate, endDate)
          .first();
        return (result?.total as number) || 0;
      }

      case "limite_gastos": {
        // Sum expenses for specific category
        const result = await db
          .prepare(
            `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type = 'despesa'
              AND category = ?
              AND date >= ? 
              AND date <= ?
          `
          )
          .bind(goal.category, startDate, endDate)
          .first();
        return (result?.total as number) || 0;
      }

      case "receita": {
        // Sum all income in the period
        const result = await db
          .prepare(
            `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE type = 'receita'
              AND date >= ? 
              AND date <= ?
          `
          )
          .bind(startDate, endDate)
          .first();
        return (result?.total as number) || 0;
      }

      case "investimento": {
        // Sum transactions in Investment category
        const result = await db
          .prepare(
            `
            SELECT COALESCE(SUM(amount), 0) as total
            FROM transactions
            WHERE category = 'Investimentos'
              AND date >= ? 
              AND date <= ?
          `
          )
          .bind(startDate, endDate)
          .first();
        return (result?.total as number) || 0;
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
    const db = c.env.DB;
    const { results } = await db
      .prepare("SELECT * FROM goals ORDER BY created_at DESC")
      .all();

    const goals: Goal[] = [];
    for (const row of results) {
      const goal = dbToGoal(row);
      // Calculate current amount
      goal.currentAmount = await calculateCurrentAmount(db, goal);
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
    const db = c.env.DB;

    const result = await db
      .prepare(
        `
        INSERT INTO goals (
          name, type, target_amount, current_amount, start_date, end_date,
          category, recurrence, notify_at_50, notify_at_75, notify_at_90,
          notify_on_exceed, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        goal.name,
        goal.type,
        goal.targetAmount,
        0,
        new Date(goal.startDate).toISOString().split("T")[0],
        new Date(goal.endDate).toISOString().split("T")[0],
        goal.category || null,
        goal.recurrence,
        goal.notifyAt50 ? 1 : 0,
        goal.notifyAt75 ? 1 : 0,
        goal.notifyAt90 ? 1 : 0,
        goal.notifyOnExceed ? 1 : 0,
        "active"
      )
      .run();

    return c.json({ success: true, id: result.meta.last_row_id });
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
    const db = c.env.DB;

    await db
      .prepare(
        `
        UPDATE goals SET
          name = ?,
          type = ?,
          target_amount = ?,
          start_date = ?,
          end_date = ?,
          category = ?,
          recurrence = ?,
          notify_at_50 = ?,
          notify_at_75 = ?,
          notify_at_90 = ?,
          notify_on_exceed = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `
      )
      .bind(
        goal.name,
        goal.type,
        goal.targetAmount,
        new Date(goal.startDate).toISOString().split("T")[0],
        new Date(goal.endDate).toISOString().split("T")[0],
        goal.category || null,
        goal.recurrence,
        goal.notifyAt50 ? 1 : 0,
        goal.notifyAt75 ? 1 : 0,
        goal.notifyAt90 ? 1 : 0,
        goal.notifyOnExceed ? 1 : 0,
        id
      )
      .run();

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
    const db = c.env.DB;

    await db.prepare("DELETE FROM goals WHERE id = ?").bind(id).run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return c.json({ error: "Failed to delete goal" }, 500);
  }
});

export default app;
