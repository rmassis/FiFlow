import OpenAI from "openai";
import { Transaction, Budget, Goal, Category, ChatMessage } from "../types";

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true // Allowed for client-side demo
});

const MODEL_NAME = "gpt-4o";

// --- Types ---
export interface UnifiedResponse {
    message?: string; // For chat
    action?: {
        type: 'CREATE_BUDGET' | 'CREATE_GOAL' | 'ADD_TRANSACTION' | 'QUERY_INSIGHT' | 'ALERT_ANOMALY' | 'CREATE_CATEGORY';
        payload: any;
    };
    insight?: {
        type: 'ANOMALY' | 'BUDGET_WARNING' | 'POSITIVE_PATTERN';
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
        details: string;
        impact?: string;
    };
    clarification?: {
        missing: string[];
        reason: string;
        suggestion: string;
    };
    confidence: number;
}

export interface CategorizedTransaction {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    categoria_principal: string;
    classificacao: string;
    confianca: 'alta' | 'media' | 'baixa';
    tags?: string[];
}

export interface TransactionInput {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    banco?: string;
}

// --- Prompts ---

const BASE_SYSTEM_PROMPT = `
# SISTEMA DE INTELIGÊNCIA UNIFICADO FIFLOW
Você é o "Cérebro" do FiFlow. Sua missão é dupla:
1. **Assistente Pessoal (Chat):** Conversar, tirar dúvidas, criar orçamentos e metas.
2. **Analista de Dados (Batch):** Categorizar transações bancárias em lote com extrema precisão.

## CONTEXTO DO USUÁRIO
Você DEVE respeitar as categorias já existentes do usuário.
Se uma transação se encaixa em "Energia" e essa categoria existe, USE-A. Não crie "Luz" ou "Eletricidade".

## RESTRIÇÕES GERAIS
1. NUNCA invente dados monetários.
2. Respeite JSON estrito na saída.
3. Se estiver em dúvida sobre categorização, olhe para as categorias existentes primeiro.
`;

const CHAT_INSTRUCTION = `
## MODO CHAT INTERATIVO

### Matriz de Intenções
| Intenção | Gatilhos | Ação |
|----------|----------|------|
| CREATE_BUDGET | "orçamento", "limite", "conta de..." | Controle de gastos recorrentes (ex: Energia). |
| CREATE_GOAL | "meta", "guardar", "comprar...", "viagem" | Acúmulo de patrimônio. |
| CREATE_CATEGORY | "criar categoria", "nova categoria" | Criação de nova etiqueta no sistema. |
| ADD_TRANSACTION | "gastei", "comprei" | Registro manual de gasto. |
| QUERY_INSIGHT | "resumo", "quanto gastei" | Análise de dados. |

**Regras de Desambiguação:**
1. Contas de Consumo (Luz, Água) -> SEMPRE CREATE_BUDGET.
2. Aquisições (Viagem, Carro) -> SEMPRE CREATE_GOAL.
3. Se o usuário pedir para criar categoria -> CREATE_CATEGORY.

**Formato de Resposta (JSON):**
{
  "message": "Texto de resposta...",
  "action": { "type": "...", "payload": {...} },
  "confidence": 0.95
}
`;

const BATCH_INSTRUCTION = `
## MODO CLASSIFICAÇÃO EM LOTE (BATCH)

Sua tarefa é classificar uma lista de transações cruas (CSV/OFX) para as categorias do usuário.

**Regras de Prioridade:**
1. **Match Exato/Histórico:** Se a descrição bate com um padrão conhecido E uma categoria de usuário existente, use-a.
2. **Semântica:** Se não houver match exato, encontre a categoria de usuário mais próxima semanticamente.
3. **Taxonomia Padrão:** Se absolutamente nada se encaixar nas categorias do usuário, use a TAXONOMIA PADRÃO abaixo para sugerir uma nova ou classificar genericamente.

**TAXONOMIA PADRÃO (Guia de Referência):**
- **Moradia:** Aluguel, Condomínio, Luz, Água, Internet, Manutenção, Gás.
- **Alimentação:** Mercado, Restaurante, Ifood, Padaria, Feira.
- **Transporte:** Uber, Gasolina, IPVA, Mecânico, Estacionamento, Transporte Público.
- **Saúde:** Farmácia, Médico, Dentista, Plano de Saúde, Exames.
- **Lazer:** Cinema, Streaming (Netflix/Spotify), Vios, Jogos, Bares.
- **Educação:** Faculdade, Cursos, Material Escolar, Livros.
- **Compras:** Roupas, Eletrônicos, Presentes, Shopee/Amazon (se não especificado).
- **Serviços:** Barbearia, Manicure, Lavanderia, Assinaturas.
- **Investimentos:** CDB, Ações, Tesouro, Cripto, Poupança.
- **Renda:** Salário, Freelance, Reembolso, Dividendos, Venda.

**Formato de Resposta (JSON):**
Retorne um objeto:
{
  "transacoes_categorizadas": [
    {
      "id": "...",
      "categoria_principal": "Nome da Categoria",
      "classificacao": "Subclassificação Específica (ex: 'Uber' para Transporte, 'McDonalds' para Alimentação)",
      "confianca": "alta" | "media" | "baixa"
    }
  ]
}
`;

// --- Service Methods ---

export const autopilotService = {

    /**
     * Process a user command in the Chat interface.
     */
    processChat: async (
        userInput: string,
        context: {
            transactions: Transaction[],
            budgets: Budget[],
            categories: Category[],
            goals: Goal[]
        },
        history: ChatMessage[] = []
    ): Promise<UnifiedResponse> => {
        try {
            const categoryNames = context.categories.map(c => c.name).join(", ");

            const financialContext = {
                available_categories: categoryNames,
                active_budgets: context.budgets.length,
                total_balance: "Calculated in UI", // Simplified for prompt
                current_date: new Date().toISOString().split('T')[0]
            };

            const messages: any[] = [
                { role: "system", content: BASE_SYSTEM_PROMPT + "\n" + CHAT_INSTRUCTION },
                {
                    role: "user",
                    content: `CONTEXTO ATUAL (Use essas categorias se possível):\nCategorias Disponíveis: [${categoryNames}]\n\nDados: ${JSON.stringify(financialContext)}`
                },
                ...history.slice(-10).map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.text
                })),
                { role: "user", content: userInput }
            ];

            const completion = await openai.chat.completions.create({
                model: MODEL_NAME,
                messages: messages,
                temperature: 0.3,
                response_format: { type: "json_object" }
            });

            const resultText = completion.choices[0].message.content || "{}";
            const cleanJson = resultText.replace(/```json\n?|\n?```/g, '').trim();

            let parsed = JSON.parse(cleanJson);

            // Fallback/Validation
            if (!parsed.confidence) parsed.confidence = 0.5;

            return parsed as UnifiedResponse;

        } catch (error) {
            console.error("Unified Chat Error:", error);
            return {
                message: "Erro ao processar mensagem. Tente novamente.",
                confidence: 0.0
            };
        }
    },

    /**
     * Batch process transactions for Import.
     */
    categorizeBatch: async (
        transactions: TransactionInput[],
        existingCategories: Category[]
    ): Promise<{ transacoes_categorizadas: CategorizedTransaction[] }> => {
        try {
            const categoryList = existingCategories.map(c => c.name).join(", ");

            const prompt = `
        CATEGORIAS EXISTENTES DO USUÁRIO: [${categoryList}]
        
        Instrução: Classifique as transações abaixo. Tente encaixar nas categorias existentes acima.
        Se não fizer sentido, use categorias padrão de mercado (Alimentação, Transporte, etc).
        
        TRANSAÇÕES:
        ${JSON.stringify(transactions.map(t => ({ id: t.id, desc: t.descricao, val: t.valor, data: t.data })))}
      `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Mini is faster/cheaper for batch
                messages: [
                    { role: "system", content: BASE_SYSTEM_PROMPT + "\n" + BATCH_INSTRUCTION },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1, // High determinism for categorization
                response_format: { type: "json_object" }
            });

            const resultText = completion.choices[0].message.content || "{}";
            const cleanJson = resultText.replace(/```json\n?|\n?```/g, '').trim();

            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("Unified Batch Error:", error);
            // Fallback: return empty or manual categorization needed
            return { transacoes_categorizadas: [] };
        }
    },

    /**
     * Generate proactive insights for DASHBOARD.
     * This is a lighter version of the chat analysis.
     */
    generateDashboardInsights: async (
        transactions: Transaction[],
        budgets: Budget[],
        categories: Category[]
    ): Promise<Array<{
        type: 'ANOMALY' | 'BUDGET_WARNING' | 'POSITIVE_PATTERN' | 'INFO';
        message: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>> => {
        // Mock Implementation for now (to fix build) - Real logic can be added later or call OpenAI in background
        const insights: Array<any> = [];

        // Simple Rule: Check Overspending
        budgets.forEach(b => {
            const categoryName = categories.find(c => c.id === b.categoryId)?.name || 'Desconhecida';

            if (b.actual > b.planned) {
                insights.push({
                    type: 'BUDGET_WARNING',
                    message: `Você estourou o orçamento de ${categoryName} em R$ ${(b.actual - b.planned).toFixed(2)}.`,
                    severity: 'HIGH'
                });
            } else if (b.actual > b.planned * 0.9) {
                insights.push({
                    type: 'BUDGET_WARNING',
                    message: `Atenção: ${categoryName} já atingiu 90% do limite.`,
                    severity: 'MEDIUM'
                });
            }
        });

        // Simple Rule: Positive Pattern
        if (transactions.filter(t => t.type === 'INCOME').length > 0) {
            insights.push({
                type: 'POSITIVE_PATTERN',
                message: 'Receitas recorrentes detectadas. Seu fluxo está saudável.',
                severity: 'LOW'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'INFO',
                message: 'Nenhum alerta crítico para hoje.',
                severity: 'LOW'
            });
        }

        return insights;
    }
};
