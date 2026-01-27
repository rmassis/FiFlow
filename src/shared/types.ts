export interface Transaction {
  id?: string;
  date: Date;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  subcategory: string;
  confidence: number;
  needsReview: boolean;
  importedFrom: string;
  importedAt: Date;
}

export interface ImportResult {
  success: boolean;
  transactions: Transaction[];
  errors: ImportError[];
  duplicates: Transaction[];
  lowConfidence: Transaction[];
}

export interface ImportError {
  line: number;
  field: string;
  message: string;
}

export interface CSVConfig {
  delimiter: ',' | ';' | '|' | '\t';
  encoding: 'UTF-8' | 'Latin1';
  hasHeaders: boolean;
  dateColumn: number;
  descriptionColumn: number;
  amountColumn: number;
  typeColumn?: number;
}

export interface ParsedFile {
  type: 'csv' | 'ofx' | 'pdf' | 'xlsx';
  content: string;
  name: string;
  size: number;
}

export type GoalType = 'economia' | 'limite_gastos' | 'receita' | 'investimento';
export type GoalRecurrence = 'unica' | 'mensal' | 'trimestral' | 'anual';
export type GoalStatus = 'active' | 'completed' | 'overdue';

export interface Goal {
  id?: number;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  category?: string;
  recurrence: GoalRecurrence;
  notifyAt50: boolean;
  notifyAt75: boolean;
  notifyAt90: boolean;
  notifyOnExceed: boolean;
  status: GoalStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalProgress {
  percentage: number;
  remaining: number;
  daysRemaining: number;
  dailyAverage: number;
  isOnTrack: boolean;
  colorClass: string;
}

export type InsightType = 'alerta' | 'oportunidade' | 'padrão' | 'previsão';
export type InsightImpact = 'alto' | 'médio' | 'baixo';

export interface Insight {
  id?: number;
  tipo: InsightType;
  título: string;
  descrição: string;
  impacto: InsightImpact;
  ação_sugerida: string;
  economia_potencial?: number;
  period_start: Date;
  period_end: Date;
  is_read: boolean;
  is_applied: boolean;
  createdAt?: Date;
}

export interface InsightGenerationContext {
  startDate: string;
  endDate: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  categoriesBreakdown: CategoryBreakdown[];
  comparison?: PeriodComparison;
  outliers: Transaction[];
  goals: Goal[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface PeriodComparison {
  previousReceitas: number;
  previousDespesas: number;
  receitasChange: number;
  despesasChange: number;
  receitasChangePercentage: number;
  despesasChangePercentage: number;
}

// ===== NOVOS TIPOS A ADICIONAR EM types.ts =====

// Interface de Usuário
export interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Dados Pessoais
  personalInfo: PersonalInfo;

  // Dados de Contato
  contactInfo: ContactInfo;

  // Endereço
  address: Address;

  // Configurações
  settings: UserSettings;
}

// Dados Pessoais
export interface PersonalInfo {
  fullName: string;                    // Nome completo (min: 3, max: 100 caracteres)
  cpf?: string;                         // CPF (opcional, formato: 000.000.000-00)
  birthDate?: Date;                     // Data de nascimento (opcional)
  profilePicture?: string;              // URL da foto de perfil (base64 ou URL)
}

// Dados de Contato
export interface ContactInfo {
  email: string;                        // E-mail principal (obrigatório, validação RFC 5322)
  emailVerified: boolean;               // Status de verificação do e-mail
  phone: string;                        // Telefone principal (formato: +55 11 98765-4321)
  phoneVerified: boolean;               // Status de verificação do telefone
  alternativePhone?: string;            // Telefone alternativo (opcional)
}

// Endereço Completo
export interface Address {
  zipCode: string;                      // CEP (formato: 00000-000)
  street: string;                       // Logradouro
  number: string;                       // Número
  complement?: string;                  // Complemento (opcional)
  neighborhood: string;                 // Bairro
  city: string;                         // Cidade
  state: string;                        // Estado (UF - 2 letras)
  country: string;                      // País (padrão: "Brasil")
}

// Configurações do Usuário
export interface UserSettings {
  currency: string;                     // Moeda padrão (BRL, USD, EUR)
  language: string;                     // Idioma (pt-BR, en-US)
  timezone: string;                     // Fuso horário (America/Sao_Paulo)
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  goalAlerts: boolean;
  insightAlerts: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  analyticsEnabled: boolean;
}

// ===== CONTAS E CARTÕES =====

// Conta Bancária (Débito ou Corrente)
export interface BankAccount {
  id: string;
  userId: string;                       // Referência ao usuário
  createdAt: Date;
  updatedAt: Date;

  // Identificação da Conta
  accountName: string;                  // Nome customizado (ex: "Nubank Principal")
  accountType: 'corrente' | 'poupanca' | 'salario' | 'pagamento';

  // Dados Bancários
  bankInfo: BankInfo;

  // Dados da Conta
  accountNumber: string;                // Número da conta
  accountDigit: string;                 // Dígito verificador
  agency: string;                       // Agência
  agencyDigit?: string;                 // Dígito da agência (opcional)

  // Saldos
  balance: number;                      // Saldo atual
  availableBalance: number;             // Saldo disponível

  // Configurações
  isActive: boolean;                    // Conta ativa?
  isPrimary: boolean;                   // Conta principal?
  color: string;                        // Cor para identificação visual
  icon: string;                         // Ícone para identificação visual

  // Importação
  allowAutoImport: boolean;             // Permite importação automática?
  lastSyncDate?: Date;                  // Data da última sincronização
}

// Informações Bancárias
export interface BankInfo {
  bankCode: string;                     // Código do banco (3 dígitos)
  bankName: string;                     // Nome do banco
  bankLogo?: string;                    // URL do logo do banco
}

// Cartão de Crédito
export interface CreditCard {
  id: string;
  userId: string;                       // Referência ao usuário
  createdAt: Date;
  updatedAt: Date;

  // Identificação do Cartão
  cardName: string;                     // Nome customizado (ex: "Nubank Roxo")
  cardNetwork: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outros';

  // Dados do Cartão
  lastFourDigits: string;               // Últimos 4 dígitos (para segurança)
  cardHolderName: string;               // Nome impresso no cartão

  // Relacionamento Bancário
  issuingBank: BankInfo;                // Banco emissor
  linkedBankAccount?: string;           // ID da conta vinculada (opcional)

  // Limites e Fatura
  creditLimit: number;                  // Limite total do cartão
  availableLimit: number;               // Limite disponível
  usedLimit: number;                    // Limite utilizado

  // Fechamento e Vencimento
  closingDay: number;                   // Dia do fechamento da fatura (1-31)
  dueDay: number;                       // Dia do vencimento da fatura (1-31)

  // Faturas
  currentInvoice: Invoice;              // Fatura atual

  // Configurações
  isActive: boolean;                    // Cartão ativo?
  isPrimary: boolean;                   // Cartão principal?
  color: string;                        // Cor para identificação visual
  icon: string;                         // Ícone para identificação visual
}

// Fatura do Cartão
export interface Invoice {
  id: string;
  creditCardId: string;
  referenceMonth: string;               // Mês de referência (YYYY-MM)
  closingDate: Date;                    // Data de fechamento
  dueDate: Date;                        // Data de vencimento
  totalAmount: number;                  // Valor total da fatura
  paidAmount: number;                   // Valor pago
  remainingAmount: number;              // Valor restante
  status: 'aberta' | 'fechada' | 'vencida' | 'paga' | 'paga_parcial';
  transactions: string[];               // IDs das transações da fatura
}

// ===== CONSTANTES =====

// Bancos Brasileiros Principais
export const BRAZILIAN_BANKS: Record<string, BankInfo> = {
  '001': { bankCode: '001', bankName: 'Banco do Brasil', bankLogo: '' },
  '033': { bankCode: '033', bankName: 'Santander', bankLogo: '' },
  '104': { bankCode: '104', bankName: 'Caixa Econômica Federal', bankLogo: '' },
  '237': { bankCode: '237', bankName: 'Bradesco', bankLogo: '' },
  '341': { bankCode: '341', bankName: 'Itaú', bankLogo: '' },
  '260': { bankCode: '260', bankName: 'Nubank', bankLogo: '' },
  '077': { bankCode: '077', bankName: 'Inter', bankLogo: '' },
  '290': { bankCode: '290', bankName: 'PagSeguro', bankLogo: '' },
  '323': { bankCode: '323', bankName: 'Mercado Pago', bankLogo: '' },
  '380': { bankCode: '380', bankName: 'PicPay', bankLogo: '' },
  '102': { bankCode: '102', bankName: 'XP Investimentos', bankLogo: '' },
  '336': { bankCode: '336', bankName: 'C6 Bank', bankLogo: '' },
  '212': { bankCode: '212', bankName: 'Banco Original', bankLogo: '' },
  '389': { bankCode: '389', bankName: 'Banco Mercantil', bankLogo: '' },
};

// Cores para Contas e Cartões
export const ACCOUNT_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#64748B', // Slate
];

// Ícones para Contas e Cartões
export const ACCOUNT_ICONS = [
  '💳', '🏦', '💰', '💵', '💴', '💶', '💷', '🪙', '💸', '📊'
];
