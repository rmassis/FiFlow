
import { Category, Transaction, Goal, Budget, InvestmentAsset, CreditCard, BankAccount } from './types.ts';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Aluguel', icon: '🏠', color: '#6366f1' },
  { id: '2', name: 'Alimentação', icon: '🍲', color: '#ef4444' },
  { id: '3', name: 'Transporte', icon: '🚗', color: '#f59e0b' },
  { id: '4', name: 'Saúde', icon: '🏥', color: '#10b981' },
  { id: '5', name: 'Lazer', icon: '🎭', color: '#ec4899' },
  { id: '6', name: 'Salário', icon: '💰', color: '#10b981' },
  { id: '7', name: 'Investimentos', icon: '📈', color: '#8b5cf6' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2025-03-01', description: 'Salário Mensal', amount: 8500, category: 'Salário', type: 'INCOME', status: 'PAID', account: 'Santander' },
  { id: 't2', date: '2025-03-02', description: 'Aluguel Apto', amount: 2500, category: 'Aluguel', type: 'EXPENSE', status: 'PAID', account: 'Nubank' },
  { id: 't3', date: '2025-03-03', description: 'Mercado Central', amount: 450.50, category: 'Alimentação', type: 'EXPENSE', status: 'PAID', account: 'Nubank' },
  { id: 't4', date: '2025-03-04', description: 'Combustível', amount: 220, category: 'Transporte', type: 'EXPENSE', status: 'PAID', account: 'C6 Bank' },
  { id: 't5', date: '2025-03-05', description: 'Netflix', amount: 55.90, category: 'Lazer', type: 'EXPENSE', status: 'PAID', account: 'C6 Bank' },
  { id: 't6', date: '2025-03-06', description: 'Freelance Design', amount: 1200, category: 'Salário', type: 'INCOME', status: 'PAID', account: 'PayPal' },
];

export const MOCK_GOALS: Goal[] = [
  { id: 'g1', name: 'Reserva de Emergência', target: 30000, current: 12500 },
  { id: 'g2', name: 'Viagem Disney', target: 15000, current: 4200 },
  { id: 'g3', name: 'Troca de Carro', target: 80000, current: 15000 },
];

export const MOCK_BUDGET: Budget[] = [
  { categoryId: '1', planned: 2500, actual: 2500 },
  { categoryId: '2', planned: 1200, actual: 850 },
  { categoryId: '3', planned: 600, actual: 440 },
  { categoryId: '5', planned: 500, actual: 620 },
];

export const MOCK_INVESTMENTS: InvestmentAsset[] = [
  { id: 'i1', name: 'Tesouro Selic 2029', type: 'FIXED_INCOME', value: 45000, change24h: 0.05, allocation: 45 },
  { id: 'i2', name: 'Bitcoin', symbol: 'BTC', type: 'CRYPTO', value: 12500, change24h: 3.2, allocation: 12.5 },
  { id: 'i3', name: 'CDB Banco Inter', type: 'FIXED_INCOME', value: 25000, change24h: 0.1, allocation: 25 },
  { id: 'i4', name: 'Itaú Unibanco', symbol: 'ITUB4', type: 'STOCK', value: 8500, change24h: -1.2, allocation: 8.5 },
  { id: 'i5', name: 'HGLG11', type: 'REIT', value: 9000, change24h: 0.45, allocation: 9 },
];

export const MOCK_CARDS: CreditCard[] = [
  { 
    id: 'c1', 
    name: 'Nubank Ultravioleta', 
    brand: 'MASTERCARD', 
    lastDigits: '8821', 
    limit: 15000, 
    usedLimit: 4250.80, 
    currentInvoice: 3850.20, 
    closingDay: 25, 
    dueDay: 2, 
    color: '#820ad1' 
  },
  { 
    id: 'c2', 
    name: 'Inter Black', 
    brand: 'MASTERCARD', 
    lastDigits: '4412', 
    limit: 12000, 
    usedLimit: 1200.00, 
    currentInvoice: 1200.00, 
    closingDay: 15, 
    dueDay: 22, 
    color: '#ff7a00' 
  },
  { 
    id: 'c3', 
    name: 'XP Visa Infinite', 
    brand: 'VISA', 
    lastDigits: '9901', 
    limit: 25000, 
    usedLimit: 850.50, 
    currentInvoice: 850.50, 
    closingDay: 10, 
    dueDay: 17, 
    color: '#1a1a1a' 
  }
];

export const MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: 'a1',
    name: 'Conta Corrente Principal',
    bankName: 'Nubank',
    type: 'CHECKING',
    balance: 12450.80,
    accountNumber: '****-5521',
    color: '#820ad1'
  },
  {
    id: 'a2',
    name: 'Reserva Financeira',
    bankName: 'Itaú Personalité',
    type: 'SAVINGS',
    balance: 45200.00,
    accountNumber: '****-9901',
    color: '#ec7000'
  },
  {
    id: 'a3',
    name: 'Conta Inter Empresa',
    bankName: 'Banco Inter',
    type: 'CHECKING',
    balance: 8900.25,
    accountNumber: '****-1244',
    color: '#ff7a00'
  },
  {
    id: 'a4',
    name: 'Investimentos Exterior',
    bankName: 'Nomad',
    type: 'INVESTMENT',
    balance: 3200.50,
    accountNumber: '****-8872',
    color: '#00d084'
  }
];
