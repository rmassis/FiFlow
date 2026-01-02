import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Budget, Goal, BankAccount, CreditCard, InvestmentAsset } from '../types';
import { supabase } from '../services/supabase';

interface FinanceContextData {
    transactions: Transaction[];
    categories: Category[];
    budgets: Budget[];
    goals: Goal[];
    accounts: BankAccount[];
    cards: CreditCard[];
    investments: InvestmentAsset[];

    // Transactions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction | null>;
    updateTransaction: (id: string, updated: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;

    // Categories & Budgets
    addCategory: (category: Omit<Category, 'id'>) => Promise<Category | null>;
    updateBudget: (categoryId: string, planned: number) => Promise<void>;
    deleteBudget: (categoryId: string) => Promise<void>;

    // Goals
    addGoal: (goal: Omit<Goal, 'id'>) => Promise<Goal | null>;
    updateGoal: (id: string, updated: Partial<Goal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;

    // Accounts
    addAccount: (account: Omit<BankAccount, 'id'>) => Promise<BankAccount | null>;
    updateAccount: (id: string, updated: Partial<BankAccount>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;

    // Cards
    addCard: (card: Omit<CreditCard, 'id'>) => Promise<CreditCard | null>;
    updateCard: (id: string, updated: Partial<CreditCard>) => Promise<void>;
    deleteCard: (id: string) => Promise<void>;

    // Investments
    addInvestment: (investment: Omit<InvestmentAsset, 'id'>) => Promise<InvestmentAsset | null>;
    updateInvestment: (id: string, updated: Partial<InvestmentAsset>) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;

    loading: boolean;
    refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [investments, setInvestments] = useState<InvestmentAsset[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Parallel fetch for better performance
            const [
                { data: transData },
                { data: catData },
                { data: budgetData },
                { data: goalData },
                { data: accData },
                { data: cardData },
                { data: invData }
            ] = await Promise.all([
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('categories').select('*'),
                supabase.from('budgets').select('*'),
                supabase.from('goals').select('*'),
                supabase.from('bank_accounts').select('*'),
                supabase.from('credit_cards').select('*'),
                supabase.from('investments').select('*')
            ]);

            if (transData) setTransactions(transData as any);
            if (catData) setCategories(catData as any);
            if (budgetData) {
                setBudgets(budgetData.map(b => ({
                    categoryId: b.category_id,
                    planned: b.planned,
                    actual: b.actual
                })) as any);
            }
            if (goalData) setGoals(goalData as any);
            if (accData) {
                setAccounts(accData.map(a => ({
                    id: a.id,
                    name: a.name,
                    bankName: a.bank_name,
                    type: a.type,
                    balance: a.balance,
                    accountNumber: a.account_number,
                    color: a.color
                })) as any);
            }
            if (cardData) {
                setCards(cardData.map(c => ({
                    id: c.id,
                    name: c.name,
                    brand: c.brand,
                    lastDigits: c.last_digits,
                    limit: c.limit,
                    usedLimit: c.used_limit,
                    currentInvoice: c.current_invoice,
                    closingDay: c.closing_day,
                    dueDay: c.due_day,
                    color: c.color
                })) as any);
            }
            if (invData) {
                setInvestments(invData.map(i => ({
                    id: i.id,
                    name: i.name,
                    symbol: i.symbol,
                    type: i.type,
                    value: i.value,
                    entryValue: i.entry_value,
                    entryDate: i.entry_date,
                    exitValue: i.exit_value,
                    exitDate: i.exit_date,
                    change24h: i.change_24h,
                    allocation: i.allocation
                })) as any);
            }

        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- CRUD Functions ---

    // Transactions
    const addTransaction = async (item: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('transactions').insert([{
            ...item,
            user_id: user.id
        }]).select().single();

        if (error) {
            console.error('Add Transaction error:', error);
            return null;
        } else {
            await refreshData();
            return data as Transaction;
        }
    };

    const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
        const { error } = await supabase.from('transactions').update(updated).eq('id', id);
        if (error) console.error('Update Transaction error:', error);
        else refreshData();
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) console.error('Delete Transaction error:', error);
        else refreshData();
    };

    // Categories
    const addCategory = async (item: Omit<Category, 'id'>): Promise<Category | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('categories').insert([{
            ...item,
            user_id: user.id
        }]).select().single();

        if (error) {
            console.error('Add Category error:', error);
            return null;
        } else {
            await refreshData();
            return data as Category;
        }
    };

    // Budgets
    const updateBudget = async (categoryId: string, planned: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const now = new Date();
        const { error } = await supabase.from('budgets').upsert({
            user_id: user.id,
            category_id: categoryId,
            planned,
            month: now.getMonth() + 1,
            year: now.getFullYear()
        }, { onConflict: 'user_id, category_id, month, year' });

        if (error) console.error('Update Budget error:', error);
        else refreshData();
    };

    const deleteBudget = async (categoryId: string) => {
        const { error } = await supabase.from('budgets').delete().eq('category_id', categoryId);
        if (error) console.error('Delete Budget error:', error);
        else refreshData();
    };

    // Goals
    const addGoal = async (item: Omit<Goal, 'id'>): Promise<Goal | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('goals').insert([{ ...item, user_id: user.id }]).select().single();
        if (error) {
            console.error('Add Goal error:', error);
            return null;
        } else {
            await refreshData();
            return data as Goal;
        }
    };

    const updateGoal = async (id: string, updated: Partial<Goal>) => {
        const { error } = await supabase.from('goals').update(updated).eq('id', id);
        if (error) console.error('Update Goal error:', error);
        else refreshData();
    };

    const deleteGoal = async (id: string) => {
        const { error } = await supabase.from('goals').delete().eq('id', id);
        if (error) console.error('Delete Goal error:', error);
        else refreshData();
    };

    // Accounts
    const addAccount = async (item: Omit<BankAccount, 'id'>): Promise<BankAccount | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('bank_accounts').insert([{
            user_id: user.id,
            name: item.name,
            bank_name: item.bankName,
            type: item.type,
            balance: item.balance,
            account_number: item.accountNumber,
            color: item.color
        }]).select().single();

        if (error) {
            console.error('Add Account error:', error);
            return null;
        } else {
            await refreshData();
            return {
                id: data.id,
                name: data.name,
                bankName: data.bank_name,
                type: data.type,
                balance: data.balance,
                accountNumber: data.account_number,
                color: data.color
            };
        }
    };

    const updateAccount = async (id: string, updated: Partial<BankAccount>) => {
        const dbUpdate: any = { ...updated };
        if (updated.bankName) dbUpdate.bank_name = updated.bankName;
        if (updated.accountNumber) dbUpdate.account_number = updated.accountNumber;

        const { error } = await supabase.from('bank_accounts').update(dbUpdate).eq('id', id);
        if (error) console.error('Update Account error:', error);
        else refreshData();
    };

    const deleteAccount = async (id: string) => {
        const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
        if (error) console.error('Delete Account error:', error);
        else refreshData();
    };

    // Cards
    const addCard = async (item: Omit<CreditCard, 'id'>): Promise<CreditCard | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('credit_cards').insert([{
            user_id: user.id,
            name: item.name,
            brand: item.brand,
            last_digits: item.lastDigits,
            limit: item.limit,
            used_limit: item.usedLimit,
            current_invoice: item.currentInvoice,
            closing_day: item.closingDay,
            due_day: item.dueDay,
            color: item.color
        }]).select().single();

        if (error) {
            console.error('Add Card error:', error);
            return null;
        } else {
            await refreshData();
            return {
                id: data.id,
                name: data.name,
                brand: data.brand,
                lastDigits: data.last_digits,
                limit: data.limit,
                usedLimit: data.used_limit,
                currentInvoice: data.current_invoice,
                closingDay: data.closing_day,
                dueDay: data.due_day,
                color: data.color
            };
        }
    };

    const updateCard = async (id: string, updated: Partial<CreditCard>) => {
        const dbUpdate: any = { ...updated };
        if (updated.lastDigits) dbUpdate.last_digits = updated.lastDigits;
        if (updated.usedLimit) dbUpdate.used_limit = updated.usedLimit;
        if (updated.currentInvoice) dbUpdate.current_invoice = updated.currentInvoice;
        if (updated.closingDay) dbUpdate.closing_day = updated.closingDay;
        if (updated.dueDay) dbUpdate.due_day = updated.dueDay;

        const { error } = await supabase.from('credit_cards').update(dbUpdate).eq('id', id);
        if (error) console.error('Update Card error:', error);
        else refreshData();
    };

    const deleteCard = async (id: string) => {
        const { error } = await supabase.from('credit_cards').delete().eq('id', id);
        if (error) console.error('Delete Card error:', error);
        else refreshData();
    };

    // Investments
    const addInvestment = async (item: Omit<InvestmentAsset, 'id'>): Promise<InvestmentAsset | null> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase.from('investments').insert([{
            user_id: user.id,
            name: item.name,
            symbol: item.symbol,
            type: item.type,
            value: item.value,
            entry_value: item.entryValue,
            entry_date: item.entryDate,
            exit_value: item.exitValue,
            exit_date: item.exitDate,
            change_24h: item.change24h,
            allocation: item.allocation
        }]).select().single();

        if (error) {
            console.error('Add Investment error:', error);
            return null;
        } else {
            await refreshData();
            return {
                id: data.id,
                name: data.name,
                symbol: data.symbol,
                type: data.type,
                value: data.value,
                entryValue: data.entry_value,
                entryDate: data.entry_date,
                exitValue: data.exit_value,
                exitDate: data.exit_date,
                change24h: data.change_24h,
                allocation: data.allocation
            };
        }
    };

    const updateInvestment = async (id: string, updated: Partial<InvestmentAsset>) => {
        const dbUpdate: any = { ...updated };
        if (updated.entryValue) dbUpdate.entry_value = updated.entryValue;
        if (updated.entryDate) dbUpdate.entry_date = updated.entryDate;
        if (updated.exitValue) dbUpdate.exit_value = updated.exitValue;
        if (updated.exitDate) dbUpdate.exit_date = updated.exitDate;
        if (updated.change24h) dbUpdate.change_24h = updated.change24h;

        const { error } = await supabase.from('investments').update(dbUpdate).eq('id', id);
        if (error) console.error('Update Investment error:', error);
        else refreshData();
    };

    const deleteInvestment = async (id: string) => {
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) console.error('Delete Investment error:', error);
        else refreshData();
    };

    return (
        <FinanceContext.Provider value={{
            transactions, categories, budgets, goals, accounts, cards, investments,
            loading, refreshData,
            addTransaction, updateTransaction, deleteTransaction,
            addCategory, updateBudget, deleteBudget,
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

