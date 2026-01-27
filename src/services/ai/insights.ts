import OpenAI from "openai";
import type { 
  Insight, 
  InsightGenerationContext,
  Transaction,
  Goal,
  CategoryBreakdown,
  PeriodComparison
} from "@/shared/types";

export async function generateInsights(
  context: InsightGenerationContext,
  apiKey: string
): Promise<Insight[]> {
  try {
    const openai = new OpenAI({ apiKey });

    const prompt = buildInsightsPrompt(context);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um consultor financeiro pessoal brasileiro especializado em análise de dados e insights acionáveis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Resposta vazia da API");
    }

    const result = JSON.parse(responseContent);
    const insights: Insight[] = result.insights.map((insight: any) => ({
      ...insight,
      period_start: new Date(context.startDate),
      period_end: new Date(context.endDate),
      is_read: false,
      is_applied: false,
    }));

    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}

function buildInsightsPrompt(context: InsightGenerationContext): string {
  const categoriesText = context.categoriesBreakdown
    .map(cat => 
      `- ${cat.category}: R$ ${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%) - ${cat.transactionCount} transações, média R$ ${cat.averageTransaction.toFixed(2)}`
    )
    .join('\n');

  const comparisonText = context.comparison
    ? `
COMPARAÇÃO COM PERÍODO ANTERIOR:
- Receitas anteriores: R$ ${context.comparison.previousReceitas.toFixed(2)}
- Despesas anteriores: R$ ${context.comparison.previousDespesas.toFixed(2)}
- Variação Receitas: ${context.comparison.receitasChangePercentage > 0 ? '+' : ''}${context.comparison.receitasChangePercentage.toFixed(1)}%
- Variação Despesas: ${context.comparison.despesasChangePercentage > 0 ? '+' : ''}${context.comparison.despesasChangePercentage.toFixed(1)}%
`
    : '';

  const outliersText = context.outliers.length > 0
    ? `
TRANSAÇÕES INCOMUNS (valores acima da média):
${context.outliers.slice(0, 5).map(t => 
  `- ${t.description}: R$ ${t.amount.toFixed(2)} (${t.category})`
).join('\n')}
`
    : 'Nenhuma transação incomum detectada.';

  const goalsText = context.goals.length > 0
    ? `
METAS ATIVAS:
${context.goals.map(g => 
  `- ${g.name} (${g.type}): R$ ${g.currentAmount.toFixed(2)} / R$ ${g.targetAmount.toFixed(2)} - ${Math.round((g.currentAmount / g.targetAmount) * 100)}%`
).join('\n')}
`
    : 'Nenhuma meta ativa.';

  return `Você é um consultor financeiro pessoal analisando dados do usuário brasileiro.

DADOS DO PERÍODO:
- Período: ${context.startDate} a ${context.endDate}
- Total Receitas: R$ ${context.totalReceitas.toFixed(2)}
- Total Despesas: R$ ${context.totalDespesas.toFixed(2)}
- Saldo: R$ ${context.saldo.toFixed(2)}

GASTOS POR CATEGORIA:
${categoriesText}
${comparisonText}
${outliersText}
${goalsText}

GERE 3-5 INSIGHTS ACIONÁVEIS no formato JSON estrito abaixo. RETORNE APENAS O JSON, SEM TEXTO ADICIONAL:

{
  "insights": [
    {
      "tipo": "alerta|oportunidade|padrão|previsão",
      "título": "Título curto e chamativo do insight",
      "descrição": "Explicação detalhada com números específicos",
      "impacto": "alto|médio|baixo",
      "ação_sugerida": "Ação prática que o usuário pode fazer",
      "economia_potencial": 0.00
    }
  ]
}

REGRAS IMPORTANTES:
- Seja específico com números e valores em R$
- Use contexto brasileiro (costumes, datas, moeda)
- Seja empático e construtivo, não julgue
- Foque em ações práticas e implementáveis
- Destaque padrões não óbvios mas relevantes
- Se houver metas ativas, relacione os insights com elas
- Para "economia_potencial", use 0 se não aplicável
- Priorize insights de alto impacto
- Tipos válidos: alerta, oportunidade, padrão, previsão
- Impactos válidos: alto, médio, baixo`;
}

export async function analyzeTransactionsForContext(
  transactions: Transaction[],
  goals: Goal[]
): Promise<InsightGenerationContext> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endDate = now;

  // Filter transactions for the period
  const periodTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= startDate && tDate <= endDate;
  });

  // Calculate totals
  const totalReceitas = periodTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = periodTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  // Categories breakdown
  const categoryMap = new Map<string, { amount: number; count: number }>();
  periodTransactions
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

  const categoriesBreakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: (data.amount / totalDespesas) * 100,
      transactionCount: data.count,
      averageTransaction: data.amount / data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Period comparison
  const previousStartDate = new Date(startDate);
  previousStartDate.setMonth(previousStartDate.getMonth() - 3);
  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);

  const previousTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= previousStartDate && tDate <= previousEndDate;
  });

  const previousReceitas = previousTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const previousDespesas = previousTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const comparison: PeriodComparison = {
    previousReceitas,
    previousDespesas,
    receitasChange: totalReceitas - previousReceitas,
    despesasChange: totalDespesas - previousDespesas,
    receitasChangePercentage: previousReceitas > 0
      ? ((totalReceitas - previousReceitas) / previousReceitas) * 100
      : 0,
    despesasChangePercentage: previousDespesas > 0
      ? ((totalDespesas - previousDespesas) / previousDespesas) * 100
      : 0,
  };

  // Detect outliers
  const despesas = periodTransactions.filter(t => t.type === 'despesa');
  const averageAmount = despesas.reduce((sum, t) => sum + t.amount, 0) / despesas.length;
  const outliers = despesas
    .filter(t => t.amount > averageAmount * 2)
    .sort((a, b) => b.amount - a.amount);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    totalReceitas,
    totalDespesas,
    saldo,
    categoriesBreakdown,
    comparison,
    outliers,
    goals: goals.filter(g => g.status === 'active'),
  };
}
