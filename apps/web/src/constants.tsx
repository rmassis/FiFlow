
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

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_GOALS: Goal[] = [];

export const MOCK_BUDGET: Budget[] = [];

export const MOCK_INVESTMENTS: InvestmentAsset[] = [];

export const MOCK_CARDS: CreditCard[] = [];

export const MOCK_ACCOUNTS: BankAccount[] = [];
