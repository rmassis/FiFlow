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
