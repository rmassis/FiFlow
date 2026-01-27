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
  // Account Linking
  bankAccountId?: string;
  creditCardId?: string;
  category_id?: string; // For syncing with DB
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

export interface BankAccount {
  id: string;
  userId?: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'salario' | 'pagamento' | 'carteira';
  bank: string;
  balance: number;
  agency?: string;
  number?: string;
  currency: string;
  color: string;
  icon: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditCard {
  id: string;
  userId?: string;
  name: string;
  network: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outro';
  lastFourDigits: string;
  limit: number;
  usedLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  icon: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  creditCardId: string;
  referenceMonth: string;
  closingDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'aberta' | 'fechada' | 'vencida' | 'paga' | 'paga_parcial';
  transactions: string[];
}

// ===== CONSTANTES =====

export interface BankInfo {
  code: string;
  name: string;
}

export const BRAZILIAN_BANKS: BankInfo[] = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '237', name: 'Bradesco' },
  { code: '341', name: 'Itaú' },
  { code: '260', name: 'Nubank' },
  { code: '077', name: 'Inter' },
  { code: '290', name: 'PagSeguro' },
  { code: '323', name: 'Mercado Pago' },
  { code: '380', name: 'PicPay' },
  { code: '102', name: 'XP Investimentos' },
  { code: '336', name: 'C6 Bank' },
  { code: '212', name: 'Banco Original' },
  { code: '389', name: 'Banco Mercantil' },
];

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
