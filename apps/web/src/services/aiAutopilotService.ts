import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget, Goal, Category } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

// Model Configuration
const MODEL_NAME = "gemini-2.0-flash-exp";

export interface AutopilotResponse {
    message: string;
    action?: {
        type: 'CREATE_BUDGET' | 'CREATE_GOAL' | 'ADD_TRANSACTION' | 'ANALYZE_SPENDING';
        payload: any;
    };
}

const SYSTEM_PROMPT = `
Você é o Autopilot Financeiro do FiFlow, um assistente inteligente proativo.
Sua missão é ajudar o usuário a gerenciar suas finanças executando ações e fornecendo insights.

# OBJETIVO
Analise a entrada do usuário e o contexto financeiro para:
1. Responder dúvidas sobre finanças.
2. Identificar a intenção de executar uma ação (criar orçamento, adicionar gasto, etc).
3. Gerar INSIGHTS proativos se identificar anomalias no contexto (ex: gastos altos).

# AÇÕES SUPORTADAS (Intents)
Se o usuário solicitar uma ação, retorne o objeto "action" apropriado:

1. **CREATE_BUDGET**: "Defina um limite de 500 reais para alimentação"
   - Payload: { "category": string, "amount": number, "period": "monthly" }
   - Nota: Tente mapear o nome da categoria para uma das categorias existentes no contexto.

2. **CREATE_GOAL**: "Quero juntar 10 mil para meu casamento até dezembro"
   - Payload: { "name": string, "targetAmount": number, "deadline": string (ISO date YYYY-MM-DD) }

3. **ADD_TRANSACTION**: "Gastei 50 reais no Uber"
   - Payload: { "description": string, "amount": number, "type": "EXPENSE" | "INCOME", "category": string }

# FORMATO DE RESPOSTA (JSON OBRIGATÓRIO)
Você deve SEMPRE retornar um JSON estritamente válido. Não use blocos de código markdown.

Formato:
{
  "message": "Texto amigável, curto e em português do Brasil respondendo ao usuário.",
  "action": { "type": "TIPO_DA_ACAO", "payload": { ... } } // Opcional, apenas se houver ação
}

# CONTEXTO
Use os dados fornecidos no prompt do usuário para enriquecer sua resposta.
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
        const contextSummary = `
        Contexto Atual:
        - Categorias Disponíveis: ${context.categories.map(c => c.name).join(', ')}
        - Orçamentos Ativos: ${context.budgets.length}
        - Total de Transações: ${context.transactions.length}
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: JSON.stringify({
                user_input: userInput,
                context_summary: contextSummary
            }),
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.4,
                responseMimeType: "application/json"
            },
        });

        const textResponse = response.text || "{}";
        const parsed = JSON.parse(textResponse);

        return parsed as AutopilotResponse;

    } catch (error) {
        console.error("Autopilot Error:", error);
        return {
            message: "Desculpe, tive um problema ao processar seu comando. Tente novamente.",
        };
    }
};
