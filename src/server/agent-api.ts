import { Hono } from "hono";
import { processAgentMessage } from "@/services/ai/agent";
import type { AgentFunctions } from "@/services/ai/agent";

type Bindings = {
  OPENAI_API_KEY: string;
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper to create agent functions with DB access
function createAgentFunctions(db: D1Database): AgentFunctions {
  return {
    query_database: async (sql: string) => {
      // Validate that it's a SELECT query
      if (!sql.trim().toUpperCase().startsWith("SELECT")) {
        throw new Error("Apenas queries SELECT são permitidas");
      }

      const { results } = await db.prepare(sql).all();
      return results;
    },

    calculate_summary: async (period: string) => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (period) {
        case "current_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case "current_year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          throw new Error("Período inválido");
      }

      // Get totals
      const totalsQuery = await db
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
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        )
        .all();

      let receitas = 0;
      let despesas = 0;

      totalsQuery.results.forEach((row: any) => {
        if (row.type === "receita") {
          receitas = (row.total as number) || 0;
        } else if (row.type === "despesa") {
          despesas = (row.total as number) || 0;
        }
      });

      // Get category breakdown
      const categoriesQuery = await db
        .prepare(
          `
          SELECT 
            category as name,
            SUM(amount) as total
          FROM transactions
          WHERE type = 'despesa' 
            AND date >= ? 
            AND date <= ?
            AND category IS NOT NULL
            AND category != ''
          GROUP BY category
          ORDER BY total DESC
        `
        )
        .bind(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        )
        .all();

      const categorias = categoriesQuery.results.map((row: any) => ({
        name: row.name as string,
        total: (row.total as number) || 0,
      }));

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        categorias,
      };
    },

    get_goals: async () => {
      const { results } = await db
        .prepare("SELECT * FROM goals ORDER BY created_at DESC")
        .all();

      return results.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        target_amount: row.target_amount,
        current_amount: row.current_amount,
        start_date: row.start_date,
        end_date: row.end_date,
        category: row.category,
        recurrence: row.recurrence,
        status: row.status,
      }));
    },

    create_goal: async (params) => {
      const result = await db
        .prepare(
          `
          INSERT INTO goals (
            name, type, target_amount, current_amount,
            start_date, end_date, category, recurrence,
            notify_50, notify_75, notify_90, notify_exceeded,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, 0, ?, ?, ?, 'única', 0, 0, 0, 0, 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
        )
        .bind(
          params.name,
          params.type,
          params.target_amount,
          params.start_date,
          params.end_date,
          params.category || null
        )
        .run();

      return { id: result.meta.last_row_id || 0 };
    },

    get_insights: async () => {
      const { results } = await db
        .prepare(
          "SELECT * FROM insights WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10"
        )
        .all();

      return results.map((row: any) => ({
        id: row.id,
        tipo: row.tipo,
        título: row.título,
        descrição: row.descrição,
        impacto: row.impacto,
        ação_sugerida: row.ação_sugerida,
        economia_potencial: row.economia_potencial,
      }));
    },

    categorize_transaction: async (id, category, subcategory) => {
      await db
        .prepare(
          "UPDATE transactions SET category = ?, subcategory = ?, needs_review = 0 WHERE id = ?"
        )
        .bind(category, subcategory, id)
        .run();
    },
  };
}

// POST /api/agent/chat - Send message to agent
app.post("/api/agent/chat", async (c) => {
  try {
    const { message, history } = await c.req.json();
    const apiKey = c.env.OPENAI_API_KEY;
    const db = c.env.DB;

    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    const functions = createAgentFunctions(db);

    const result = await processAgentMessage(
      message,
      history || [],
      functions,
      apiKey
    );

    // Save user message
    await db
      .prepare(
        "INSERT INTO chat_messages (role, content) VALUES (?, ?)"
      )
      .bind("user", message)
      .run();

    // Save assistant response
    await db
      .prepare(
        "INSERT INTO chat_messages (role, content, function_call) VALUES (?, ?, ?)"
      )
      .bind(
        "assistant",
        result.response,
        JSON.stringify(result.functionCalls)
      )
      .run();

    return c.json({
      response: result.response,
      functionCalls: result.functionCalls,
    });
  } catch (error) {
    console.error("Error in agent chat:", error);
    return c.json({ error: "Erro ao processar mensagem" }, 500);
  }
});

// GET /api/agent/history - Get chat history
app.get("/api/agent/history", async (c) => {
  try {
    const db = c.env.DB;
    const limit = parseInt(c.req.query("limit") || "50");

    const { results } = await db
      .prepare(
        "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?"
      )
      .bind(limit)
      .all();

    const messages = results.reverse().map((row: any) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      function_call: row.function_call
        ? JSON.parse(row.function_call as string)
        : null,
      created_at: row.created_at,
    }));

    return c.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return c.json({ error: "Erro ao buscar histórico" }, 500);
  }
});

// DELETE /api/agent/history - Clear chat history
app.delete("/api/agent/history", async (c) => {
  try {
    const db = c.env.DB;
    await db.prepare("DELETE FROM chat_messages").run();
    return c.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return c.json({ error: "Erro ao limpar histórico" }, 500);
  }
});

export default app;
