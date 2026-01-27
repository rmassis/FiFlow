import OpenAI from "openai";

export interface AgentMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  name?: string;
}

export interface AgentFunctions {
  query_database: (sql: string) => Promise<any[]>;
  calculate_summary: (period: string) => Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    categorias: Array<{ name: string; total: number }>;
  }>;
  get_goals: () => Promise<any[]>;
  create_goal: (params: {
    name: string;
    type: string;
    target_amount: number;
    start_date: string;
    end_date: string;
    category?: string;
  }) => Promise<{ id: number }>;
  get_insights: () => Promise<any[]>;
  categorize_transaction: (
    id: string,
    category: string,
    subcategory: string
  ) => Promise<void>;
}

const SYSTEM_PROMPT = `Você é o assistente financeiro pessoal do usuário no FinanceHub.

DADOS DISPONÍVEIS:
- Transações completas com datas, valores, categorias
- Metas financeiras ativas e concluídas
- Insights gerados automaticamente
- Histórico de gastos por categoria e período

CAPACIDADES:
1. query_database(sql) - Executar consultas SQL no banco de dados
2. calculate_summary(period) - Obter resumo financeiro ('current_month', 'last_month', 'current_year')
3. get_goals() - Listar metas financeiras
4. create_goal(params) - Criar nova meta financeira
5. get_insights() - Buscar insights gerados
6. categorize_transaction(id, category, subcategory) - Recategorizar transação

ESTILO DE COMUNICAÇÃO:
- Seja conversacional, amigável e prestativo
- Use emojis quando apropriado (💰 📊 🎯 💡 ✨)
- Sempre formate valores em BRL: R$ 1.234,56
- Forneça números específicos e precisos
- Ofereça ações concretas e próximos passos
- Se não souber algo, consulte os dados ao invés de inventar

REGRAS IMPORTANTES:
- Sempre valide e confirme antes de criar/modificar dados
- Use query_database para consultas complexas aos dados do usuário
- Use calculate_summary para resumos rápidos
- Para análises comparativas, busque dados de múltiplos períodos
- Ao criar metas, valide que os parâmetros façam sentido
- Nunca execute ações destrutivas sem confirmação explícita

CONTEXTO BRASILEIRO:
- Use formatação brasileira (R$, datas dd/mm/yyyy)
- Considere feriados e costumes locais
- Categorias comuns: Alimentação, Transporte, Moradia, Saúde, etc.

Seja proativo em oferecer insights e sugestões baseadas nos dados do usuário.`;

const FUNCTION_DEFINITIONS: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [
  {
    name: "query_database",
    description:
      "Executa uma consulta SQL SELECT no banco de dados de transações. Use para análises detalhadas e customizadas.",
    parameters: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description:
            "Query SQL SELECT. Tabela disponível: transactions (id, date, description, amount, type, category, subcategory). Exemplo: SELECT category, SUM(amount) as total FROM transactions WHERE type='despesa' GROUP BY category",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "calculate_summary",
    description:
      "Obtém resumo financeiro rápido para um período específico com totais de receitas, despesas, saldo e breakdown por categoria",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["current_month", "last_month", "current_year"],
          description:
            "Período para calcular: current_month (mês atual), last_month (mês passado), current_year (ano atual)",
        },
      },
      required: ["period"],
    },
  },
  {
    name: "get_goals",
    description: "Lista todas as metas financeiras do usuário",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_goal",
    description: "Cria uma nova meta financeira",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Nome da meta (ex: 'Economizar para viagem')",
        },
        type: {
          type: "string",
          enum: ["economia", "limite_gastos", "receita", "investimento"],
          description:
            "Tipo da meta: economia, limite_gastos, receita, investimento",
        },
        target_amount: {
          type: "number",
          description: "Valor alvo em reais",
        },
        start_date: {
          type: "string",
          description: "Data de início (formato YYYY-MM-DD)",
        },
        end_date: {
          type: "string",
          description: "Data fim (formato YYYY-MM-DD)",
        },
        category: {
          type: "string",
          description:
            "Categoria relacionada (obrigatório apenas para tipo limite_gastos)",
        },
      },
      required: ["name", "type", "target_amount", "start_date", "end_date"],
    },
  },
  {
    name: "get_insights",
    description: "Busca insights financeiros gerados automaticamente",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "categorize_transaction",
    description: "Recategoriza uma transação específica",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID da transação",
        },
        category: {
          type: "string",
          description: "Nova categoria",
        },
        subcategory: {
          type: "string",
          description: "Nova subcategoria",
        },
      },
      required: ["id", "category", "subcategory"],
    },
  },
];

export async function processAgentMessage(
  userMessage: string,
  conversationHistory: AgentMessage[],
  functions: AgentFunctions,
  apiKey: string
): Promise<{ response: string; functionCalls: any[] }> {
  const openai = new OpenAI({ apiKey });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory.map((msg) => {
      if (msg.role === "function") {
        return {
          role: "function" as const,
          name: msg.name!,
          content: msg.content,
        };
      }
      return {
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        ...(msg.function_call && {
          function_call: {
            name: msg.function_call.name,
            arguments: msg.function_call.arguments,
          },
        }),
      };
    }),
    { role: "user", content: userMessage },
  ];

  const functionCalls: any[] = [];
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      functions: FUNCTION_DEFINITIONS,
      temperature: 0.7,
    });

    const choice = response.choices[0];
    const message = choice.message;

    if (choice.finish_reason === "function_call" && message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      functionCalls.push({ name: functionName, arguments: functionArgs });

      // Add assistant message with function call
      messages.push({
        role: "assistant",
        content: message.content || "",
        function_call: message.function_call,
      });

      // Execute function
      let functionResult;
      try {
        switch (functionName) {
          case "query_database":
            functionResult = await functions.query_database(functionArgs.sql);
            break;
          case "calculate_summary":
            functionResult = await functions.calculate_summary(
              functionArgs.period
            );
            break;
          case "get_goals":
            functionResult = await functions.get_goals();
            break;
          case "create_goal":
            functionResult = await functions.create_goal(functionArgs);
            break;
          case "get_insights":
            functionResult = await functions.get_insights();
            break;
          case "categorize_transaction":
            functionResult = await functions.categorize_transaction(
              functionArgs.id,
              functionArgs.category,
              functionArgs.subcategory
            );
            break;
          default:
            functionResult = { error: "Função não reconhecida" };
        }
      } catch (error: any) {
        functionResult = { error: error.message };
      }

      // Add function result
      messages.push({
        role: "function",
        name: functionName,
        content: JSON.stringify(functionResult),
      });
    } else {
      // Final response
      return {
        response: message.content || "Desculpe, não consegui processar isso.",
        functionCalls,
      };
    }
  }

  return {
    response:
      "Desculpe, precisei fazer muitas consultas. Pode reformular sua pergunta?",
    functionCalls,
  };
}
