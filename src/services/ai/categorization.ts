import OpenAI from "openai";
import type { Transaction } from "@/shared/types";

interface CategorizationResult {
  categoria: string;
  subcategoria: string;
  confianca: number;
}

const CATEGORIAS_PRINCIPAIS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Investimentos',
  'Renda',
  'Outros',
];

const SUBCATEGORIAS: Record<string, string[]> = {
  'Alimentação': ['Supermercado', 'Restaurante', 'Fast Food', 'Delivery', 'Padaria'],
  'Transporte': ['Combustível', 'Uber/Taxi', 'Ônibus', 'Estacionamento', 'Manutenção'],
  'Moradia': ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Gás'],
  'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Exames', 'Academia'],
  'Educação': ['Mensalidade', 'Livros', 'Cursos', 'Material'],
  'Lazer': ['Cinema', 'Streaming', 'Viagem', 'Eventos', 'Hobbies'],
  'Vestuário': ['Roupas', 'Calçados', 'Acessórios'],
  'Investimentos': ['Ações', 'Fundos', 'Tesouro', 'Cripto'],
  'Renda': ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  'Outros': ['Não classificado'],
};

export async function categorizeTransaction(
  transaction: Transaction,
  apiKey: string
): Promise<Transaction> {
  try {
    const client = new OpenAI({ apiKey });

    // Ensure date is a Date object
    const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);

    const prompt = `Você é um assistente de categorização financeira.

TRANSAÇÃO:
- Descrição: ${transaction.description}
- Valor: R$ ${transaction.amount.toFixed(2)}
- Data: ${date.toLocaleDateString('pt-BR')}
- Tipo: ${transaction.type}

CATEGORIAS_PRINCIPAIS disponíveis:
${CATEGORIAS_PRINCIPAIS.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

SUBCATEGORIAS para cada categoria:
${Object.entries(SUBCATEGORIAS).map(([cat, subs]) => `${cat}: [${subs.join(', ')}]`).join('\n')}

REGRAS:
- Analise a descrição com atenção
- Considere o contexto brasileiro
- A categoria deve ser uma das CATEGORIAS_PRINCIPAIS listadas acima
- A subcategoria deve ser uma das subcategorias válidas para a categoria escolhida
- A confiança deve ser um número entre 0 e 1, onde 1 é confiança máxima`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de categorização financeira. Retorne APENAS JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "categorization_result",
          schema: {
            type: "object",
            properties: {
              categoria: { type: "string" },
              subcategoria: { type: "string" },
              confianca: { type: "number" },
            },
            required: ["categoria", "subcategoria", "confianca"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    const result: CategorizationResult = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    // Validate categoria exists
    if (!CATEGORIAS_PRINCIPAIS.includes(result.categoria)) {
      result.categoria = 'Outros';
      result.subcategoria = 'Não classificado';
      result.confianca = 0.3;
    }

    // Validate subcategoria exists for categoria
    const validSubcategorias = SUBCATEGORIAS[result.categoria] || [];
    if (!validSubcategorias.includes(result.subcategoria)) {
      result.subcategoria = validSubcategorias[0] || 'Não classificado';
      result.confianca = Math.min(result.confianca, 0.6);
    }

    return {
      ...transaction,
      category: result.categoria,
      subcategory: result.subcategoria,
      confidence: result.confianca,
      needsReview: result.confianca < 0.7,
    };
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return {
      ...transaction,
      category: 'Outros',
      subcategory: 'Não classificado',
      confidence: 0,
      needsReview: true,
    };
  }
}

export async function categorizeTransactions(
  transactions: Transaction[],
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<Transaction[]> {
  const categorized: Transaction[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const result = await categorizeTransaction(transaction, apiKey);
    categorized.push(result);
    
    if (onProgress) {
      onProgress(i + 1, transactions.length);
    }

    // Small delay to avoid rate limiting
    if (i < transactions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return categorized;
}

export { CATEGORIAS_PRINCIPAIS, SUBCATEGORIAS };