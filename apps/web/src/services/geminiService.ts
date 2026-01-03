
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Budget, Goal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialAdvice = async (
  prompt: string,
  data: { transactions: Transaction[], budget: Budget[], goals: Goal[] }
) => {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    Você é um Especialista em Gestão Financeira Pessoal (Agente Financeiro IA).
    Sua missão é ajudar o usuário a organizar suas finanças, categorizar transações e dar conselhos estratégicos.
    
    Contexto Atual do Usuário:
    - Transações recentes: ${JSON.stringify(data.transactions.slice(0, 10))}
    - Orçamento: ${JSON.stringify(data.budget)}
    - Metas: ${JSON.stringify(data.goals)}

    Regras:
    1. Seja conciso e direto.
    2. Use um tom encorajador mas profissional.
    3. Se o usuário pedir para categorizar, sugira categorias baseadas nos gastos comuns.
    4. Se o usuário perguntar "como estou", analise o saldo atual vs metas.
    5. Fale sempre em Português do Brasil.
    6. Nunca invente dados que não estão no contexto.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao processar sua solicitação. Tente novamente em instantes.";
  }
};

export const autoCategorize = async (description: string) => {
  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Categorize esta transação bancária: "${description}". Responda apenas com o nome da categoria em uma única palavra.`,
      config: {
        temperature: 0.1,
      },
    });

    return response.text?.trim() || "Outros";
  } catch (error) {
    return "Outros";
  }
};
