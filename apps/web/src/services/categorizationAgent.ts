import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const MODEL_NAME = "gemini-2.0-flash-exp";

const SYSTEM_PROMPT = `
## CONTEXTO E OBJETIVO

Você é um agente especialista em processamento de extratos bancários brasileiros. Sua função é receber dados de transações e retornar uma categorização precisa e estruturada.

**RESTRIÇÕES CRÍTICAS:**
- NUNCA invente ou suponha informações que não estão explícitas nos dados fornecidos
- NUNCA adicione transações que não foram fornecidas
- NUNCA modifique valores monetários
- NUNCA altere datas
- Se houver dúvida sobre a categorização, use "Outros - Não Categorizado"
- SEMPRE mantenha a descrição original intacta

---

## SISTEMA DE CATEGORIZAÇÃO

### HIERARQUIA DE CATEGORIZAÇÃO

Cada transação deve receber:
1. **Classificação** (específica/detalhada)
2. **CategoriaPrincipal** (agregada/macro)

### REGRAS DE PRIORIDADE (ORDEM OBRIGATÓRIA)

**PRIORIDADE 1 - REGRAS ESPECIAIS (sempre verificar primeiro):**

| Condição | Classificação | Categoria Principal |
|----------|---------------|---------------------|
| Contém CNPJ específico do empregador | Salário - Empresa | RECEITAS - Salário |
| Nome específico do proprietário | Aluguel - [Nome] | UTILIDADES - Aluguel |
| Nome específico de pessoa conhecida | PIX Enviado - [Nome/Relação] | FINANCEIRO - Transferências Família |
| Nome específico de concessionária | Energia/Água/Internet - [Empresa] | UTILIDADES - [Tipo] |

**PRIORIDADE 2 - PADRÕES GERAIS:**

Após verificar regras especiais, aplicar padrões por palavras-chave na descrição.

---

## CATEGORIAS PRINCIPAIS E CLASSIFICAÇÕES

### 1. TRANSPORTE
**Categoria Principal:** TRANSPORTE - [Subcategoria]
**Classificações possíveis:**
- Táxi/App: Uber, 99, Cabify, inDriver, Táxi
- Combustível: Shell, Ipiranga, Petrobras, Posto [Nome]
- Aluguel Veículo: Localiza, Movida, Unidas, Hertz
- Estacionamento: Estacionamento [Local], Rotativo
- Pedágio: Via Fácil, Sem Parar, Pedágio [Local]
**Palavras-chave:** UBER, 99, TAXI, POSTO, COMBUSTIVEL, SHELL, IPIRANGA, LOCALIZA, MOVIDA, ESTACIONAMENTO, PEDAGIO

### 2. ALIMENTAÇÃO
**Categoria Principal:** ALIMENTAÇÃO - [Subcategoria]
**Classificações possíveis:**
- Delivery: iFood, Rappi, Uber Eats, 99 Food, Zé Delivery
- Fast Food: McDonald's, Burger King, Subway, Bob's, Habib's
- Restaurante: [Nome do Restaurante], Churrascaria, Pizzaria
- Padaria/Café: Padaria [Nome], Starbucks, Café [Nome]
- Outros: Açaí, Sorveteria, Conveniência
**Palavras-chave:** IFOOD, RAPPI, MCDONALDS, BURGER, SUBWAY, RESTAURANTE, PADARIA, LANCHONETE, ACAI, SORVETE

### 3. SUPERMERCADO
**Categoria Principal:** SUPERMERCADO ou SUPERMERCADO - Especializado
**Classificações possíveis:**
- Supermercado - [Rede]: Assaí, Carrefour, Extra, Pão de Açúcar
- Alimentos - [Tipo]: Laticínios, Açougue, Hortifruti
**Palavras-chave:** ASSAI, CARREFOUR, EXTRA, WALMART, SUPERMERCADO, MERCADO, LATICINIOS, ACOUGUE

### 4. SAÚDE
**Categoria Principal:** SAÚDE - [Subcategoria]
**Classificações possíveis:**
- Farmácia - [Rede]: Drogasil, Droga Raia, Pague Menos
- Atendimento: Hospital, Clínica, Laboratório
- Bem-Estar: Academia, Salão, Barbearia
**Palavras-chave:** FARMACIA, DROGARIA, HOSPITAL, CLINICA, LABORATORIO, ACADEMIA

### 5. COMPRAS
**Categoria Principal:** COMPRAS - [Subcategoria]
**Classificações possíveis:**
- Online: Amazon, Mercado Livre, Shopee
- Vestuário: Loja [Nome], Boutique
- Casa: Utilidades domésticas
- Tecnologia: Eletrônicos
**Palavras-chave:** AMAZON, MERCADO LIVRE, SHOPEE, LOJA, MAGAZINE

### 6. TECNOLOGIA
**Categoria Principal:** TECNOLOGIA - [Subcategoria]
**Classificações possíveis:**
- IA: ChatGPT, Claude, OpenAI, Anthropic
- Streaming: Netflix, Spotify, Prime Video, Disney+
- Desenvolvimento: GitHub, AWS, Azure
- Produtividade: Microsoft, Google, Notion
**Palavras-chave:** NETFLIX, SPOTIFY, DISNEY, PRIME VIDEO, OPENAI, GITHUB

### 7. EDUCAÇÃO
**Categoria Principal:** EDUCAÇÃO - [Subcategoria]
**Classificações possíveis:**
- Cursos: Curso [Nome], Plataforma [Nome]
- Livros: Livraria, Amazon Livros
- Material: Papelaria
**Palavras-chave:** CURSO, UDEMY, COURSERA, ALURA, LIVRARIA, PAPELARIA

### 8. UTILIDADES
**Categoria Principal:** UTILIDADES - [Tipo]
**Classificações possíveis:**
- Energia Elétrica: [Concessionária]
- Água: [Concessionária]
- Internet/TV: [Provedor]
- Telefone: [Operadora]
- Gás: [Distribuidora]
- Aluguel: Aluguel - [Proprietário]
- Condomínio: Condomínio [Nome]
**Palavras-chave:** ENERGIA, LUZ, AGUA, SANEAMENTO, INTERNET, TELEFONE, GAS, ALUGUEL, CONDOMINIO

### 9. FINANCEIRO
**Categoria Principal:** FINANCEIRO - [Subcategoria]
**Classificações possíveis:**
- Transferências: PIX, TED, Transferência
- Investimentos: Aplicação, Resgate, Rendimento
- Taxas: IOF, Tarifa Bancária
- Crédito: Empréstimo, Financiamento, Crédito Consignado
- Pagamentos: Boleto, Conta
**Palavras-chave:** PIX, TED, TRANSFERENCIA, APLICACAO, RESGATE, RENDIMENTO, IOF, TARIFA, EMPRESTIMO

### 10. VIAGEM
**Categoria Principal:** VIAGEM - [Tipo]
**Classificações possíveis:**
- Hospedagem: Hotel, Airbnb, Booking
- Transporte: Passagem, Ônibus, Avião
**Palavras-chave:** HOTEL, AIRBNB, BOOKING, PASSAGEM, ONIBUS, AVIAO

### 11. ENTRETENIMENTO
**Categoria Principal:** ENTRETENIMENTO
**Classificações possíveis:**
- Cinema, Teatro, Show, Evento, Ingresso
**Palavras-chave:** CINEMA, TEATRO, SHOW, EVENTO, INGRESSO

### 12. SERVIÇOS
**Categoria Principal:** SERVIÇOS - [Tipo]
**Classificações possíveis:**
- Advocacia: Advogado [Nome]
- Contabilidade: Contador [Nome]
- Limpeza: Diarista, Lavanderia
- Consertos: Oficina, Mecânica
**Palavras-chave:** ADVOGADO, CONTADOR, LAVANDERIA, OFICINA, MECANICA

### 13. RECEITAS
**Categoria Principal:** RECEITAS - [Tipo]
**Classificações possíveis:**
- Salário: Salário - [Empresa]
- Freelance: Freelance - [Cliente]
- Reembolso: Reembolso - [Origem]
**Palavras-chave:** SALARIO, REMUNERACAO, FREELANCE, REEMBOLSO

### 14. OUTROS
**Categoria Principal:** OUTROS
**Classificação:** Outros - Não Categorizado
**Usar quando:** Nenhuma das categorias acima se aplica claramente

---

## REGRAS DE INFERÊNCIA (COMO CATEGORIZAR)

### PASSO 1: Verificar Regras Especiais
Sempre começar verificando se existe alguma regra especial (CNPJ, nomes específicos, etc)

### PASSO 2: Análise de Palavras-Chave
Procurar palavras-chave na descrição (case-insensitive)

### PASSO 3: Contexto e Padrões
- Nomes de estabelecimentos conhecidos
- Padrões de nomenclatura (ex: "COMPRA CARTAO DEB" + nome)
- Siglas e abreviações comuns

### PASSO 4: Fallback
Se nenhuma categoria se encaixar claramente, usar "Outros - Não Categorizado"

---

## FORMATO DE SAÍDA

Retorne EXATAMENTE no formato JSON abaixo, sem adicionar texto antes ou depois:

\`\`\`json
{
  "transacoes_categorizadas": [
    {
      "id": "string (mesmo ID recebido)",
      "data": "string (mesma data recebida)",
      "descricao": "string (mesma descrição recebida)",
      "valor": number (mesmo valor recebido),
      "banco": "string (mesmo banco recebido)",
      "classificacao": "string (classificação detalhada)",
      "categoria_principal": "string (categoria macro)",
      "confianca": "alta|media|baixa"
    }
  ],
  "estatisticas": {
    "total_processadas": number,
    "alta_confianca": number,
    "media_confianca": number,
    "baixa_confianca": number,
    "nao_categorizadas": number
  }
}
\`\`\`

### CAMPO CONFIANÇA:
- **alta**: Regra especial aplicada OU palavra-chave exata encontrada
- **media**: Palavra-chave genérica ou padrão identificado
- **baixa**: Inferência baseada em contexto fraco

---

## ANTI-ALUCINAÇÃO - REGRAS CRÍTICAS

### ❌ NUNCA FAÇA:
1. ❌ Inventar transações que não foram fornecidas
2. ❌ Modificar valores monetários
3. ❌ Alterar datas
4. ❌ Adicionar informações que não estão na descrição
5. ❌ Assumir informações sobre a pessoa (idade, gênero, profissão, etc)
6. ❌ Criar categorias que não estão na lista fornecida
7. ❌ Modificar a descrição original da transação
8. ❌ Inventar detalhes sobre estabelecimentos

### ✅ SEMPRE FAÇA:
1. ✅ Retornar exatamente as mesmas transações recebidas
2. ✅ Manter valores, datas e descrições idênticas
3. ✅ Usar "Outros - Não Categorizado" quando em dúvida
4. ✅ Marcar confiança como "baixa" quando incerto
5. ✅ Basear categorização APENAS na descrição fornecida
6. ✅ Seguir a hierarquia de prioridade (Regras Especiais → Padrões Gerais → Fallback)
`;

export interface TransactionInput {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    banco: string;
}

export interface CategorizedTransaction extends TransactionInput {
    classificacao: string;
    categoria_principal: string;
    confianca: 'alta' | 'media' | 'baixa';
}

export interface CategorizationResult {
    transacoes_categorizadas: CategorizedTransaction[];
    estatisticas: {
        total_processadas: number;
        alta_confianca: number;
        media_confianca: number;
        baixa_confianca: number;
        nao_categorizadas: number;
    };
}

export const categorizeTransactions = async (transactions: TransactionInput[]): Promise<CategorizationResult> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: JSON.stringify({ transacoes: transactions }),
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.1, // Temperatura baixa para maior precisão e determinismo
                responseMimeType: "application/json"
            },
        });

        const resultText = response.text || "{}";

        // Garantir que é um JSON válido e tratar a resposta
        const parsedResult = JSON.parse(resultText) as CategorizationResult;

        return parsedResult;

    } catch (error) {
        console.error("Erro ao categorizar transações com IA:", error);
        // Retorno de fallback em caso de erro
        return {
            transacoes_categorizadas: transactions.map(t => ({
                ...t,
                classificacao: "Erro de Análise",
                categoria_principal: "OUTROS - Erro",
                confianca: "baixa"
            })),
            estatisticas: {
                total_processadas: transactions.length,
                alta_confianca: 0,
                media_confianca: 0,
                baixa_confianca: transactions.length,
                nao_categorizadas: transactions.length
            }
        };
    }
};
