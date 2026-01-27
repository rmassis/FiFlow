import { Hono } from "hono";
import { processAgentMessage } from "@/services/ai/agent";
import type { AgentFunctions } from "@/services/ai/agent";
import { createSupabaseClient, Env } from "./db";

const app = new Hono<{ Bindings: Env }>();

// Helper to create agent functions with Supabase access
function createAgentFunctions(supabase: any): AgentFunctions {
  return {
    query_database: async (sql: string) => {
      // Use the exec_sql RPC function which allows SELECT queries
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      if (error) throw new Error(`Erro na query: ${error.message}`);
      return data;
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
      const { data: totalsData } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('date', startDate.toISOString().split("T")[0])
        .lte('date', endDate.toISOString().split("T")[0]);

      let receitas = 0;
      let despesas = 0;

      if (totalsData) {
        receitas = totalsData
          .filter((t: any) => t.type === 'receita')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        despesas = totalsData
          .filter((t: any) => t.type === 'despesa')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
      }

      // Get category breakdown (only expenses)
      const { data: categoriesData } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('type', 'despesa')
        .gte('date', startDate.toISOString().split("T")[0])
        .lte('date', endDate.toISOString().split("T")[0])
        .not('category', 'is', null)
        .neq('category', '');

      const stats: Record<string, number> = {};
      if (categoriesData) {
        categoriesData.forEach((row: any) => {
          stats[row.category] = (stats[row.category] || 0) + row.amount;
        });
      }

      const categorias = Object.keys(stats).map(name => ({
        name,
        total: stats[name]
      })).sort((a, b) => b.total - a.total);

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        categorias,
      };
    },

    get_goals: async () => {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        target_amount: row.target_amount,
        current_amount: row.current_amount || 0,
        start_date: row.start_date,
        end_date: row.end_date,
        category: row.category,
        recurrence: row.recurrence,
        status: row.status,
      }));
    },

    create_goal: async (params) => {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          name: params.name,
          type: params.type,
          target_amount: params.target_amount,
          current_amount: 0,
          start_date: new Date(params.start_date).toISOString().split("T")[0],
          end_date: new Date(params.end_date).toISOString().split("T")[0],
          category: params.category || null,
          recurrence: 'única',
          notify_at_50: 0,
          notify_at_75: 0,
          notify_at_90: 0,
          notify_on_exceed: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { id: data.id };
    },

    get_insights: async () => {
      const { data } = await supabase
        .from('insights')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      return (data || []).map((row: any) => ({
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
      await supabase
        .from('transactions')
        .update({
          category,
          subcategory,
          needs_review: false
        })
        .eq('id', id);
    },
  };
}

// POST /api/agent/chat - Send message to agent
app.post("/api/agent/chat", async (c) => {
  try {
    const { message, history } = await c.req.json();
    const apiKey = c.env.OPENAI_API_KEY;
    const supabase = createSupabaseClient(c.env);

    if (!apiKey) {
      return c.json({ error: "OPENAI_API_KEY não configurada" }, 500);
    }

    const functions = createAgentFunctions(supabase);

    const result = await processAgentMessage(
      message,
      history || [],
      functions,
      apiKey
    );

    // Save user message
    await supabase.from('chat_messages').insert({
      role: 'user',
      content: message
    });

    // Save assistant response
    await supabase.from('chat_messages').insert({
      role: 'assistant',
      content: result.response,
      function_call: result.functionCalls.length > 0 ? JSON.stringify(result.functionCalls) : null
    });

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
    const supabase = createSupabaseClient(c.env);
    const limit = parseInt(c.req.query("limit") || "50");

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const messages = (data || []).reverse().map((row: any) => ({
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
    const supabase = createSupabaseClient(c.env);

    // Delete all messages
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .neq('id', 0); // Hack to delete all, or use adequate RLS policy or direct delete

    // Simple delete without where clause is blocked by default safety settings in Supabase client unless allow_all is used or RLS.
    // However, simply filtering by ID > 0 handles it.
    // Or just .delete().neq('role', 'system') (which doesn't exist)

    // Better:
    // await supabase.from('chat_messages').delete().not('id', 'is', null) // Deletes all

    if (error) console.warn("Delete history error (might be restricted):", error);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return c.json({ error: "Erro ao limpar histórico" }, 500);
  }
});

export default app;
