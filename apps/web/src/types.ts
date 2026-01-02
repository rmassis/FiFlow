
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  status: 'PAID' | 'PENDING';
  account: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}

export interface Budget {
  categoryId: string;
  planned: number;
  actual: number;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  symbol?: string;
  type: 'STOCK' | 'FIXED_INCOME' | 'CRYPTO' | 'REIT' | 'OTHER';
  value: number; // Valor Atual
  entryValue: number; // Valor de Entrada
  entryDate: string; // Data de Entrada
  exitValue?: number; // Valor de Saída
  exitDate?: string; // Data de Saída
  change24h: number;
  allocation: number;
}

export interface CreditCard {
  id: string;
  name: string;
  brand: 'VISA' | 'MASTERCARD' | 'AMEX' | 'ELO';
  lastDigits: string;
  limit: number;
  usedLimit: number;
  currentInvoice: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'OTHER';
  balance: number;
  accountNumber: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
