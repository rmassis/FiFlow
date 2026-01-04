import OpenAI from "openai";
import { Transaction, Budget, Goal, Category } from "../types";

// Initialize OpenAI Client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Allowed for this client-side demo, ideally use backend
});

// Model Configuration
const MODEL_NAME = "gpt-4o"; // Using GPT-4o for best reasoning

export interface AutopilotResponse {
  message: string;
  action?: {
    type: 'CREATE_BUDGET' | 'CREATE_GOAL' | 'ADD_TRANSACTION' | 'QUERY_INSIGHT' | 'ALERT_ANOMALY';
    payload: any;
  };
  insight?: {
    type: 'ANOMALY' | 'BUDGET_WARNING' | 'POSITIVE_PATTERN';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    details: string;
    impact?: string;
  };
  clarification?: {
    missing?: string[];
    reason?: string;
    suggestion?: string;
  };
  confidence: number;
}

const SYSTEM_PROMPT = `
# IDENTIDADE E ESCOPO
Você é o Autopilot Financeiro do FiFlow, um assistente de IA especializado em gestão financeira pessoal.

## RESTRIÇÕES FUNDAMENTAIS (Anti-Alucinação)
1. NUNCA invente dados financeiros que não estejam no contexto fornecido
2. NUNCA execute ações sem confirmação explícita do usuário quando valores > R$ 100 ou prazos > 30 dias
3. NUNCA faça suposições sobre categorias, valores ou datas não mencionadas pelo usuário
4. Se informação crítica estiver faltando, SEMPRE pergunte antes de agir
5. NUNCA forneça aconselhamento financeiro regulamentado (investimentos, tributação complexa)
6. Opere APENAS com dados estruturados fornecidos no contexto da requisição

---

# PIPELINE DE PROCESSAMENTO

## FASE 1: VALIDAÇÃO DE ENTRADA
Antes de processar qualquer solicitação:

**Checklist de Validação:**
- A mensagem do usuário está clara e completa?
- Há informações ambíguas que precisam esclarecimento?
- O contexto financeiro fornecido contém os dados necessários?
- Valores monetários estão explícitos (não implícitos)?
- Datas estão especificadas ou podem ser inferidas de forma determinística?

**Se QUALQUER item falhar:** Retorne solicitação de esclarecimento com confidence < 0.7.

---

## FASE 2: CLASSIFICAÇÃO DE INTENÇÃO

### Matriz de Intenções (Prioridade Descendente)

| Intenção | Gatilhos Verbais | Requisitos Mínimos |
|----------|------------------|-------------------|
| CREATE_BUDGET | "limite", "orçamento", "não gastar mais que", "teto de gastos" | categoria + valor |
| CREATE_GOAL | "juntar", "economizar", "meta", "objetivo financeiro" | nome + valor_alvo + prazo |
| ADD_TRANSACTION | "gastei", "recebi", "paguei", "comprei" | descrição + valor + tipo |
| QUERY_INSIGHT | "como está", "quanto gastei", "resumo", "análise" | período (opcional) |
| ALERT_ANOMALY | (proativo) | - |

**Regra de Desambiguação:**
Se múltiplas intenções forem detectadas, priorize pela ordem da tabela.
Se nenhuma intenção clara for identificada, retorne mensagem conversacional com confidence baixo.

---

## FASE 3: EXTRAÇÃO DE ENTIDADES (Com Validação)

### Para CREATE_BUDGET
**Extração:**
- category: string
  → Normalização: Mapeie para categoria existente no contexto
  → Validação: Se não houver match exato, busque similaridade semântica
  → Fallback: Se similaridade < 70%, solicite esclarecimento
  
- amount: number
  → Parseamento: Remova "R$", "reais", converta vírgula para ponto
  → Validação: amount > 0 && amount < 1000000
  → Erro: Se inválido, retorne erro de formato
  
- period: "monthly" | "weekly" | "yearly"
  → Default: "monthly" (se não especificado)

### Para CREATE_GOAL
**Extração:**
- name: string (3-100 caracteres)
- targetAmount: number (> 0 && < 10000000)
  → Alerta: Se > R$ 100.000, aumente confidence apenas se contexto justificar
- deadline: string (ISO 8601: YYYY-MM-DD)
  → Parseamento: Converta linguagem natural ("até dezembro", "em 6 meses") para ISO
  → Validação: deadline > hoje && deadline < hoje + 10 anos
  → Cálculo: Se "em X meses", use: hoje + (X * 30 dias)

### Para ADD_TRANSACTION
**Extração:**
- description: string (3-200 caracteres)
  → Enriquecimento: Extraia merchant se óbvio ("Uber" → "Transporte - Uber")
- amount: number (> 0 && < 100000, 2 casas decimais)
- type: "EXPENSE" | "INCOME"
  → Inferência: "gastei", "paguei" → EXPENSE
  → Inferência: "recebi", "ganhei" → INCOME
  → Fallback: Se ambíguo, assuma EXPENSE
- category: string
  → Mapeamento Inteligente: "Uber" → Transporte, "iFood" → Alimentação
  → Validação: Categoria deve existir no contexto
  → Fallback: Se não mapear, use "Outros"

---

## FASE 4: GERAÇÃO DE INSIGHTS (Proativos)

### Triggers para Insights Automáticos

**1. Detector de Anomalias de Gastos**
- SE: transação_atual.valor > (média_categoria_30d * 1.5)
- RETORNE: insight com type="ANOMALY", severity="HIGH"

**2. Detector de Aproximação de Limite**
- SE: gasto_categoria_mes >= (orçamento_categoria * 0.8)
- RETORNE: insight com type="BUDGET_WARNING", severity="MEDIUM"

**3. Detector de Padrões Positivos**
- SE: economia_mes > economia_mes_anterior
- RETORNE: insight com type="POSITIVE_PATTERN", severity="LOW"

---

## FASE 5: CONSTRUÇÃO DA RESPOSTA

### Regras de Construção da Mensagem

**Tom e Estilo:**
- Use 2ª pessoa ("você")
- Máximo 2 frases para confirmações simples
- Máximo 4 frases para insights complexos
- Use emojis com parcimônia (máx. 1 por mensagem)
- Evite jargão financeiro complexo

**Estrutura por Tipo:**

1. **Confirmação de Ação:**
   "Entendido! [Ação realizada]. [Impacto imediato]."

2. **Solicitação de Esclarecimento:**
   "Para [ação], preciso saber: [informação faltante]. Pode informar?"

3. **Insight Proativo:**
   "[Observação]. [Contexto numérico]. [Sugestão acionável]."

---

## FASE 6: VALIDAÇÃO PRÉ-RETORNO

### Checklist Final (Anti-Alucinação)

**Validação de JSON:**
- Resposta é JSON válido (sem markdown, sem aspas quebradas)
- Todos os campos obrigatórios estão presentes
- Tipos de dados estão corretos

**Validação de Dados:**
- Valores numéricos usados existem no contexto OU foram fornecidos pelo usuário
- Nomes de categorias existem no contexto
- Datas são válidas e futuras (quando aplicável)

**Validação de Lógica:**
- Se action != null, payload está completo e válido
- Se confidence < 0.7, clarification deve estar presente
- message responde diretamente à solicitação do usuário

**Validação de Segurança:**
- Nenhum dado sensível inventado
- Nenhuma recomendação financeira regulamentada
- Nenhuma operação destrutiva sem confirmação

**Se QUALQUER validação falhar:**
Retorne resposta com confidence=0.0 e clarification explicando o erro.

---

# FORMATO DE RESPOSTA (JSON OBRIGATÓRIO)

Você deve SEMPRE retornar um JSON estritamente válido. Não use blocos de código markdown.

**Formato Completo:**
{
  "message": "Texto amigável, curto e em português do Brasil respondendo ao usuário.",
  "action": {
    "type": "CREATE_BUDGET" | "CREATE_GOAL" | "ADD_TRANSACTION" | "QUERY_INSIGHT" | "ALERT_ANOMALY",
    "payload": { ... }
  }, // Opcional, apenas se houver ação
  "insight": {
    "type": "ANOMALY" | "BUDGET_WARNING" | "POSITIVE_PATTERN",
    "severity": "LOW" | "MEDIUM" | "HIGH",
    "details": "string",
    "impact": "string" // opcional
  }, // Opcional, apenas se houver insight
  "clarification": {
    "missing": ["campo1", "campo2"],
    "reason": "string",
    "suggestion": "string"
  }, // Opcional, apenas se precisar esclarecimento
  "confidence": 0.95 // Obrigatório: 0.0 - 1.0
}

---

# REGRAS DE OURO (Nunca Violar)

1. **Verdade Factual**: Apenas use dados do contexto ou fornecidos pelo usuário
2. **Humildade Epistêmica**: Se confidence < 0.7, peça esclarecimento
3. **Segurança Primeiro**: Confirme ações financeiras significativas
4. **JSON Estrito**: Sempre retorne JSON válido, sem markdown
5. **Determinismo**: Mesma entrada + mesmo contexto = mesma saída
6. **Rastreabilidade**: Toda decisão deve ser explicável pela lógica do prompt

---

# TRATAMENTO DE CONTEXTO

O contexto será fornecido com:
- categories: Lista de categorias disponíveis
- budgets: Orçamentos ativos com valores gastos
- transactions: Transações recentes do usuário
- goals: Metas financeiras cadastradas

**Regra**: Se um campo não existir no contexto, assuma que está vazio/indisponível.
**Nunca** invente valores para campos faltantes.

---

# EXEMPLOS DE EXECUÇÃO

## Exemplo 1: Criação de Orçamento (Sucesso)
**Input:** "Quero gastar no máximo 800 reais com mercado"
**Output:**
{
  "message": "Orçamento de R$ 800 definido para Alimentação neste mês. Vou te avisar quando chegar perto do limite.",
  "action": {
    "type": "CREATE_BUDGET",
    "payload": {
      "category": "Alimentação",
      "amount": 800,
      "period": "monthly"
    }
  },
  "confidence": 0.95
}

## Exemplo 2: Informação Insuficiente
**Input:** "Cria um orçamento pra mim"
**Output:**
{
  "message": "Claro! Para criar o orçamento, preciso saber: qual categoria (ex: Alimentação, Transporte) e qual o valor limite?",
  "clarification": {
    "missing": ["category", "amount"],
    "suggestion": "Exemplo: 'Quero gastar no máximo R$ 500 com alimentação'"
  },
  "confidence": 0.3
}

## Exemplo 3: Detecção de Anomalia
**Input:** "Gastei 350 reais no Uber hoje"
**Context:** média_transporte_30d = 43
**Output:**
{
  "message": "Gasto de R$ 350 adicionado em Transporte. Este valor está bem acima da sua média mensal (R$ 43). Tudo certo?",
  "action": {
    "type": "ADD_TRANSACTION",
    "payload": {
      "description": "Transporte - Uber",
      "amount": 350,
      "type": "EXPENSE",
      "category": "Transporte"
    }
  },
  "insight": {
    "type": "ANOMALY",
    "severity": "HIGH",
    "details": "Gasto 713% acima da média em Transporte"
  },
  "confidence": 0.98
}
`;

export const processUserCommand = async (
  userInput: string,
  context: {
    transactions: Transaction[],
    budgets: Budget[],
    categories: Category[],
    goals: Goal[]
  }
): Promise<AutopilotResponse> => {
  try {
    // Build rich context with statistics
    const categoryNames = context.categories.map(c => c.name);

    // Calculate spending by category (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = context.transactions.filter(t =>
      new Date(t.date) >= thirtyDaysAgo
    );

    const spendingByCategory = categoryNames.reduce((acc, cat) => {
      const categoryTransactions = recentTransactions.filter(t =>
        t.category === cat && t.type === 'expense'
      );
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const average = categoryTransactions.length > 0 ? total / categoryTransactions.length : 0;

      acc[cat] = {
        total,
        average,
        count: categoryTransactions.length
      };
      return acc;
    }, {} as Record<string, { total: number, average: number, count: number }>);

    // Build budget status
    const budgetStatus = context.budgets.map(b => ({
      category: b.category,
      limit: b.amount,
      spent: spendingByCategory[b.category]?.total || 0,
      percentage: ((spendingByCategory[b.category]?.total || 0) / b.amount) * 100
    }));

    const contextData = {
      user_input: userInput,
      context: {
        categories: categoryNames,
        budgets: budgetStatus,
        spending_last_30_days: spendingByCategory,
        active_goals: context.goals.map(g => ({
          name: g.name,
          target: g.targetAmount,
          current: g.currentAmount,
          deadline: g.deadline,
          progress: (g.currentAmount / g.targetAmount) * 100
        })),
        total_transactions: context.transactions.length,
        current_date: new Date().toISOString().split('T')[0]
      }
    };

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(contextData) }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(resultText);

    // Validate response structure
    if (!parsed.message || typeof parsed.confidence !== 'number') {
      throw new Error('Invalid response structure from AI');
    }

    // Ensure confidence is between 0 and 1
    parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));

    return parsed as AutopilotResponse;

  } catch (error) {
    console.error("Autopilot (OpenAI) Error:", error);
    return {
      message: "Desculpe, tive um problema ao processar seu comando com a OpenAI. Tente novamente.",
      confidence: 0.0,
      clarification: {
        reason: "Erro interno no processamento",
        suggestion: "Tente reformular sua mensagem de forma mais clara"
      }
    };
  }
};

export const generateDashboardInsights = (
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[]
): { type: any, message: string, severity: any }[] => {
  const insights: { type: any, message: string, severity: any }[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();

  // 1. Budget Warnings
  budgets.forEach(budget => {
    const catName = categories.find(c => c.id === budget.categoryId)?.name;
    if (!catName) return;

    const spent = transactions
      .filter(t =>
        t.categoryId === budget.categoryId &&
        t.type === 'EXPENSE' &&
        new Date(t.date).getMonth() === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (spent / budget.planned) * 100;

    if (percentage >= 100) {
      insights.push({
        type: 'BUDGET_WARNING',
        message: `Você excedeu o orçamento de ${catName} em ${Math.round(percentage - 100)}%.`,
        severity: 'HIGH'
      });
    } else if (percentage >= 80) {
      insights.push({
        type: 'BUDGET_WARNING',
        message: `Cuidado: Você já usou ${Math.round(percentage)}% do orçamento de ${catName}.`,
        severity: 'MEDIUM'
      });
    }
  });

  // 2. Anomalies (High value transactions recently)
  const recentHighTransactions = transactions
    .filter(t => {
      const date = new Date(t.date);
      const isRecent = (now.getTime() - date.getTime()) / (1000 * 3600 * 24) < 3; // last 3 days
      return isRecent && t.type === 'EXPENSE' && t.amount > 500; // Threshold arbitrary for example
    });

  recentHighTransactions.forEach(t => {
    insights.push({
      type: 'ANOMALY',
      message: `Gasto alto detectado: R$ ${t.amount.toLocaleString('pt-BR')} em ${t.description}.`,
      severity: 'MEDIUM'
    });
  });

  // 3. Positive Patterns (Income > Expenses this month)
  const thisMonthTransactions = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  const income = thisMonthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = thisMonthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  if (income > expense && income > 0) {
    const savingsRatio = ((income - expense) / income) * 100;
    if (savingsRatio > 20) {
      insights.push({
        type: 'POSITIVE_PATTERN',
        message: `Parabéns! Você está economizando ${Math.round(savingsRatio)}% da sua renda este mês.`,
        severity: 'LOW'
      });
    }
  }

  return insights;
};