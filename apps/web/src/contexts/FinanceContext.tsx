
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Budget, Goal } from '../types';
import { CATEGORIES } from '../constants';

interface FinanceContextData {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    goals: Goal[];
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updated: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    addCategory: (category: Category) => void;
    updateBudget: (categoryId: string, planned: number) => void;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const storedTransactions = localStorage.getItem('fiflow_transactions');
        const storedCategories = localStorage.getItem('fiflow_categories');
        const storedBudgets = localStorage.getItem('fiflow_budgets');
        const storedGoals = localStorage.getItem('fiflow_goals');

        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));

        // Se não houver categorias, iniciar com ZERO (pedido do usuário) ou com as padrões
        // O usuário pediu para limpar dados de demonstração.
        // Porem categorias são estrutura base. Vou manter as categorias base mas permitir que sejam apagadas se quiser,
        // ou carrego as do constant se o localStorage estiver vazio mas salvo imediatamente.
        // Melhor: Iniciar com as CATEGORIES do constant apenas se o usuário NÃO tiver limpado explicitamente.
        // Como o pedido foi "realizar limpeza e usar dados reais", vou assumir que categorias padrão são úteis, 
        // mas transações devem ser zero.

        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            // Carga inicial de categorias padrão
            setCategories(CATEGORIES);
            localStorage.setItem('fiflow_categories', JSON.stringify(CATEGORIES));
        }

        if (storedBudgets) {
            setBudgets(JSON.parse(storedBudgets));
        } else {
            // Iniciar orçamentos zerados se não houver
            // Para limpeza de dados, iniciamos sem mock de budget
            setBudgets([]);
        }

        if (storedGoals) setGoals(JSON.parse(storedGoals));
    }, []);

    // Sync to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('fiflow_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('fiflow_categories', JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        localStorage.setItem('fiflow_budgets', JSON.stringify(budgets));
    }, [budgets]);

    useEffect(() => {
        localStorage.setItem('fiflow_goals', JSON.stringify(goals));
    }, [goals]);


    const addTransaction = (transaction: Transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const updateTransaction = (id: string, updated: Partial<Transaction>) => {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addCategory = (category: Category) => {
        setCategories(prev => [...prev, category]);
        // Inicializa budget zerado para nova categoria
        setBudgets(prev => [...prev, { categoryId: category.id, planned: 0, actual: 0 }]);
    };

    const updateBudget = (categoryId: string, planned: number) => {
        setBudgets(prev => {
            const index = prev.findIndex(b => b.categoryId === categoryId);
            if (index >= 0) {
                const newBudgets = [...prev];
                newBudgets[index] = { ...newBudgets[index], planned };
                return newBudgets;
            } else {
                return [...prev, { categoryId, planned, actual: 0 }];
            }
        });
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
            updateBudget
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => useContext(FinanceContext);
