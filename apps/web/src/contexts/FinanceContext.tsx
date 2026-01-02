import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Budget, Goal } from '../types';
import { CATEGORIES } from '../constants';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextData {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    goals: Goal[];
    addTransaction: (transaction: Transaction) => Promise<void>;
    updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addCategory: (category: Category) => Promise<void>;
    updateBudget: (categoryId: string, planned: number) => Promise<void>;
    loading: boolean;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);

    // Carregar dados iniciais
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setCategories([]);
            setBudgets([]);
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Carregar Categorias
                const { data: catsData, error: catsError } = await supabase
                    .from('categories')
                    .select('*');

                if (catsError) throw catsError;

                // Se não tiver categorias, inserir as padrão
                let finalCategories = catsData || [];
                if (finalCategories.length === 0) {
                    const defaultCategories = CATEGORIES.map(c => ({
                        user_id: user.id,
                        name: c.name,
                        icon: c.icon,
                        color: c.color
                    }));

                    const { data: newCats, error: insertError } = await supabase
                        .from('categories')
                        .insert(defaultCategories)
                        .select();

                    if (!insertError && newCats) {
                        finalCategories = newCats;
                    }
                }
                setCategories(finalCategories);

                // 2. Carregar Transações
                const { data: transData, error: transError } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('date', { ascending: false });

                if (transError) throw transError;
                setTransactions(transData || []);

                // 3. Carregar Orçamentos
                const { data: budgetsData, error: budgetError } = await supabase
                    .from('budgets')
                    .select('*');

                if (budgetError) throw budgetError;
                setBudgets(budgetsData || []);

            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- CRUD Functions ---

    const addTransaction = async (transaction: Transaction) => {
        if (!user) return;
        try {
            // Remover ID temporário se existir
            const { id, ...newTransaction } = transaction;

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: user.id,
                    description: newTransaction.description,
                    amount: newTransaction.amount,
                    type: newTransaction.type,
                    category: newTransaction.category,
                    date: newTransaction.date,
                    status: newTransaction.status || 'PAID',
                    account: newTransaction.account
                }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setTransactions(prev => [data, ...prev]);
            }
        } catch (err) {
            console.error('Erro ao adicionar transação:', err);
        }
    };

    const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .update(updated)
                .eq('id', id);

            if (error) throw error;

            setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
        } catch (err) {
            console.error('Erro ao atualizar transação:', err);
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Erro ao deletar transação:', err);
        }
    };

    const addCategory = async (category: Category) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('categories')
                .insert([{
                    user_id: user.id,
                    name: category.name,
                    icon: category.icon,
                    color: category.color
                }]);

            if (error) throw error;

            // Recarregar categorias
            const { data } = await supabase.from('categories').select('*');
            if (data) setCategories(data);

        } catch (err) {
            console.error('Erro ao criar categoria:', err);
        }
    };

    const updateBudget = async (categoryId: string, planned: number) => {
        if (!user) return;
        try {
            const existingBudget = budgets.find(b => b.category_id === categoryId);

            if (existingBudget) {
                const { error } = await supabase
                    .from('budgets')
                    .update({ planned })
                    .eq('id', existingBudget.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('budgets')
                    .insert({
                        user_id: user.id,
                        category_id: categoryId,
                        planned,
                        actual: 0
                    });
                if (error) throw error;
            }

            const { data } = await supabase.from('budgets').select('*');
            if (data) setBudgets(data);

        } catch (err) {
            console.error('Erro ao atualizar orçamento:', err);
        }
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            categories,
            budgets,
            goals,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addCategory,
            updateBudget,
            loading
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
