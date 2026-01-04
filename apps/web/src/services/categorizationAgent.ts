import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

// Using GPT-4o-mini for speed and cost-effectiveness in bulk processing, 
// or GPT-4o if high precision is required. User asked for "Análise profunda".
// Let's use GPT-4o-mini which is very capable for strict JSON and much cheaper/faster for bulk.
const MODEL_NAME = "gpt-4o-mini";

export interface TransactionInput {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  banco: string;
  tipo_sugerido?: 'INCOME' | 'EXPENSE'; // Optional hint from CSV
}

export interface CategorizedTransaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria_principal: string;
  classificacao: string;
  tags?: string[];
  confianca: 'alta' | 'media' | 'baixa';
  justificativa?: string;
  tipo_detectado?: 'INCOME' | 'EXPENSE';
}

export interface BatchAnalysisResult {
  transacoes_categorizadas: CategorizedTransaction[];
  estatisticas: {
    total_processadas: number;
    alta_confianca: number;
    media_confianca: number;
    baixa_confianca: number;
    nao_categorizadas: number;
    taxa_sucesso: number;
  };
  metadata: {
    versao_sistema: string;
    data_processamento: string;
    tempo_processamento_ms: number;
  };
}

const SYSTEM_PROMPT = `
# SISTEMA DE CATEGORIZAÇÃO BANCÁRIA (PT-BR)

Você é um especialista financeiro. Sua tarefa é categorizar transações bancárias cruas em categorias padronizadas.

## CATEGORIAS PERMITIDAS (Use EXATAMENTE estes nomes):
- ALIMENTAÇÃO (Sub: Supermercado, Restaurante, Delivery, Padaria)
- TRANSPORTE (Sub: Combustível, Uber/99, Estacionamento, Manutenção, Transporte Público)
- MORADIA (Sub: Aluguel, Condomínio, Luz, Água, Internet, Gás, Manutenção)
- SAÚDE (Sub: Farmácia, Médico, Dentista, Exames, Plano de Saúde, Academia)
- COMPRAS (Sub: Roupas, Eletrônicos, Casa, Cosméticos, Presentes, Online)
- LAZER (Sub: Streaming, Cinema, Jogos, Viagem, Hobby)
- EDUCAÇÃO (Sub: Cursos, Faculdade, Material Escolar, Livros)
- SERVIÇOS (Sub: Banco, Assinaturas, Seguros, Taxas)
- RECEITAS (Sub: Salário, Pix Recebido, Reembolso, Rendimentos, Venda)
- TRANSFERÊNCIAS (Sub: Pix Enviado, TED/DOC, Cartão de Crédito)
- OUTROS (Use apenas se impossível classificar)

## REGRAS DE OURO:
1. Retorne APENAS um JSON válido.
2. Analise a descrição e o valor.
3. Transações de entrada (Crédito/Receita) devem ir para RECEITAS.
4. "Pix Enviado" -> TRANSFERÊNCIAS.
5. "Pix Recebido" -> RECEITAS.
6. Nome de estabelecimentos famosos (Uber, iFood, Netflix, Amazon) tem alta prioridade.

## FORMATO DE SAÍDA (JSON):
{
  "transacoes": [
    {
      "id": "string",
      "categoria_principal": "CATEGORIA (ex: ALIMENTAÇÃO)",
      "classificacao": "Subcategoria (ex: Supermercado)",
      "confianca": "alta" | "media" | "baixa"
    }
  ]
}
`;

export const categorizeTransactions = async (
  transactions: TransactionInput[]
): Promise<BatchAnalysisResult> => {
  const startTime = Date.now();

  try {
    // Prepare payload (minimize tokens)
    const payload = transactions.map(t => ({
      id: t.id,
      desc: t.descricao,
      val: t.valor,
      hint: t.tipo_sugerido
    }));

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(payload) }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Deterministic
    });

    const resultText = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(resultText);
    const categorizedList = parsed.transacoes || [];

    // Merge results with original data
    const enrichedTransactions: CategorizedTransaction[] = transactions.map(original => {
      const aiResult = categorizedList.find((c: any) => c.id === original.id);

      if (!aiResult) {
        return {
          ...original,
          categoria_principal: 'OUTROS',
          classificacao: 'Não Analisado',
          confianca: 'baixa'
        };
      }

      return {
        ...original,
        categoria_principal: aiResult.categoria_principal,
        classificacao: aiResult.classificacao,
        confianca: aiResult.confianca
      };
    });

    // Calculate stats
    const stats = {
      total_processadas: transactions.length,
      alta_confianca: enrichedTransactions.filter(t => t.confianca === 'alta').length,
      media_confianca: enrichedTransactions.filter(t => t.confianca === 'media').length,
      baixa_confianca: enrichedTransactions.filter(t => t.confianca === 'baixa').length,
      nao_categorizadas: enrichedTransactions.filter(t => t.categoria_principal === 'OUTROS').length,
      taxa_sucesso: 0
    };
    stats.taxa_sucesso = ((stats.alta_confianca + stats.media_confianca) / stats.total_processadas) * 100;

    return {
      transacoes_categorizadas: enrichedTransactions,
      estatisticas: stats,
      metadata: {
        versao_sistema: "OpenAI-Hybrid-v1",
        data_processamento: new Date().toISOString(),
        tempo_processamento_ms: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error("OpenAI Categorization Error:", error);
    return {
      transacoes_categorizadas: transactions.map(t => ({
        ...t,
        categoria_principal: 'OUTROS - Erro',
        classificacao: 'Erro API',
        confianca: 'baixa'
      })),
      estatisticas: {
        total_processadas: transactions.length,
        alta_confianca: 0,
        media_confianca: 0,
        baixa_confianca: transactions.length,
        nao_categorizadas: transactions.length,
        taxa_sucesso: 0
      },
      metadata: {
        versao_sistema: "Error",
        data_processamento: new Date().toISOString(),
        tempo_processamento_ms: Date.now() - startTime
      }
    };
  }
};