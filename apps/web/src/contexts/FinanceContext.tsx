```
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Budget, Goal, BankAccount, CreditCard, InvestmentAsset } from '../types';
import { CATEGORIES } from '../constants';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  accounts: BankAccount[];
  cards: CreditCard[];
  investments: InvestmentAsset[];

  loading: boolean;

  // Transactions
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories & Budgets
  addCategory: (category: Category) => Promise<void>;
  updateBudget: (categoryId: string, planned: number) => Promise<void>;

  // Goals
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (id: string, updated: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Accounts
  addAccount: (account: BankAccount) => Promise<void>;
  updateAccount: (id: string, updated: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Cards
  addCard: (card: CreditCard) => Promise<void>;
  updateCard: (id: string, updated: Partial<CreditCard>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;

  // Investments
  addInvestment: (investment: InvestmentAsset) => Promise<void>;
  updateInvestment: (id: string, updated: Partial<InvestmentAsset>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [investments, setInvestments] = useState<InvestmentAsset[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    if (!user) {
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
        setGoals([]);
        setAccounts([]);
        setCards([]);
        setInvestments([]);
        setLoading(false);
        return;
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            // Parallel Fetching for performance
            const [
                catsRes, 
                transRes, 
                budgRes,
                goalsRes,
                accRes,
                cardsRes,
                invRes
            ] = await Promise.all([
                supabase.from('categories').select('*'),
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('budgets').select('*'),
                supabase.from('goals').select('*'),
                supabase.from('accounts').select('*'),
                supabase.from('credit_cards').select('*'),
                supabase.from('investments').select('*')
            ]);

            // 1. Categories
            let finalCategories = catsRes.data || [];
            if (finalCategories.length === 0 && !catsRes.error) {
                 const defaultCategories = CATEGORIES.map(c => ({
                     user_id: user.id,
                     name: c.name,
                     icon: c.icon,
                     color: c.color
                 }));
                 const initCats = await supabase.from('categories').insert(defaultCategories).select();
                 if (initCats.data) finalCategories = initCats.data;
            }
            setCategories(finalCategories);

            // 2. Others
            if (transRes.data) setTransactions(transRes.data);
            if (budgRes.data) setBudgets(budgRes.data);
            if (goalsRes.data) setGoals(goalsRes.data);
            if (accRes.data) setAccounts(accRes.data);
            if (cardsRes.data) setCards(cardsRes.data);
            if (invRes.data) setInvestments(invRes.data);

        } catch (err) {
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [user]);

  // --- CRUD helpers ---
  // Generic insert helper
  const insertItem = async (table: string, item: any, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      if (!user) return;
      try {
          // Remove ID se vier do frontend (deixa Supabase gerar) ou trata específico
          const { id, ...payload } = item;
          const { data, error } = await supabase.from(table).insert([{ ...payload, user_id: user.id }]).select().single();
          if (error) throw error;
          if (data) setter(prev => [...prev, data]);
      } catch (err) { console.error(`Erro ao inserir em ${ table }: `, err); }
  };

  // Generic update helper
  const updateItem = async (table: string, id: string, updated: any, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
          const { error } = await supabase.from(table).update(updated).eq('id', id);
          if (error) throw error;
          setter(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      } catch (err) { console.error(`Erro ao atualizar em ${ table }: `, err); }
  };

  // Generic delete helper
  const deleteItem = async (table: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
      try {
          const { error } = await supabase.from(table).delete().eq('id', id);
          if (error) throw error;
          setter(prev => prev.filter(i => i.id !== id));
      } catch (err) { console.error(`Erro ao deletar de ${ table }: `, err); }
  };

  // --- Exposures ---

  // Transactions
  const addTransaction = (t: Transaction) => insertItem('transactions', t, setTransactions);
  const updateTransaction = (id: string, u: Partial<Transaction>) => updateItem('transactions', id, u, setTransactions);
  const deleteTransaction = (id: string) => deleteItem('transactions', id, setTransactions);

  // Categories
  const addCategory = (c: Category) => insertItem('categories', c, setCategories);
  
  // Budgets (Logic specific for upsert)
  const updateBudget = async (categoryId: string, planned: number) => {
      if (!user) return;
      try {
          const existing = budgets.find(b => b.category_id === categoryId); // Note: field name depends on DB mapping
          // Mapeamento: no DB pode ser category_id, no type do front pode ser categoryId. 
          // O fetch retorna colunas do banco. Se banco tem category_id, o objeto terá category_id.
          // O type Budget tem categoryId. Vamos assumir que corrigimos o type ou mapper.
          // Simplificação: Upsert direto no banco
          
          /*
            IMPORTANTE: O type Budget no frontend usa 'categoryId', no banco usamos 'category_id'.
            O Supabase retorna o que está no banco. Precisamos normalizar ou aceitar campos do banco. 
            Para simplificar, vamos assumir que o objeto em memória 'budgets' tem as chaves do banco 
            se tirarmos do fetch direto.
          */

          const { data, error } = await supabase
            .from('budgets')
            .upsert({ 
                user_id: user.id, 
                category_id: categoryId, 
                planned,
                // Preserva ID se já existir para update, ou cria novo se insert? Upsert lida com unique constraint.
                // Precisamos de uma constraint unique em (user_id, category_id)
            }, { onConflict: 'category_id,user_id' }) // Requer índice único
            .select();

           if (error) {
               // Fallback se não tiver indice unico: tentar update, se falhar insert
               // Ou logica manual anterior.
               console.error('Erro upsert budget', error);
           }
           
           // Refresh budgets list to be safe
           const { data: bData } = await supabase.from('budgets').select('*');
           if (bData) setBudgets(bData);

      } catch (err) { console.error(err); }
  };

  // Goals
  const addGoal = (g: Goal) => insertItem('goals', g, setGoals);
  const updateGoal = (id: string, u: Partial<Goal>) => updateItem('goals', id, u, setGoals);
  const deleteGoal = (id: string) => deleteItem('goals', id, setGoals);

  // Accounts
  const addAccount = (a: BankAccount) => insertItem('accounts', a, setAccounts);
  const updateAccount = (id: string, u: Partial<BankAccount>) => updateItem('accounts', id, u, setAccounts);
  const deleteAccount = (id: string) => deleteItem('accounts', id, setAccounts);

  // Cards
  const addCard = (c: CreditCard) => insertItem('credit_cards', c, setCards);
  const updateCard = (id: string, u: Partial<CreditCard>) => updateItem('credit_cards', id, u, setCards);
  const deleteCard = (id: string) => deleteItem('credit_cards', id, setCards);

  // Investments
  const addInvestment = (i: InvestmentAsset) => insertItem('investments', i, setInvestments);
  const updateInvestment = (id: string, u: Partial<InvestmentAsset>) => updateItem('investments', id, u, setInvestments);
  const deleteInvestment = (id: string) => deleteItem('investments', id, setInvestments);


  return (
    <FinanceContext.Provider value={{
      transactions, categories, budgets, goals, accounts, cards, investments,
      loading,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateBudget,
      addGoal, updateGoal, deleteGoal,
      addAccount, updateAccount, deleteAccount,
      addCard, updateCard, deleteCard,
      addInvestment, updateInvestment, deleteInvestment
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
```
