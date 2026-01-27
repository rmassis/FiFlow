
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    User, PersonalInfo, ContactInfo, Address, UserSettings,
    BankAccount, CreditCard, Invoice,
    Goal, Insight, Transaction
} from '@/shared/types';

interface FinanceStore {
    // Existing States
    transactions: Transaction[];
    goals: Goal[];
    insights: Insight[];
    chatHistory: any[];

    // User Profile
    user: User | null;
    updateUser: (updates: Partial<User>) => void;
    updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
    updateContactInfo: (info: Partial<ContactInfo>) => void;
    updateAddress: (address: Partial<Address>) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;

    // Bank Accounts
    bankAccounts: BankAccount[];
    addBankAccount: (account: BankAccount) => void;
    updateBankAccount: (id: string, updates: Partial<BankAccount>) => void;
    deleteBankAccount: (id: string) => void;
    setPrimaryBankAccount: (id: string) => void;

    // Credit Cards
    creditCards: CreditCard[];
    addCreditCard: (card: CreditCard) => void;
    updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
    deleteCreditCard: (id: string) => void;
    setPrimaryCreditCard: (id: string) => void;

    // Invoices
    invoices: Invoice[];
    addInvoice: (invoice: Invoice) => void;
    updateInvoice: (id: string, updates: Partial<Invoice>) => void;
    payInvoice: (id: string, amount: number) => void;
}

export const useFinanceStore = create<FinanceStore>()(
    persist(
        (set, get) => ({
            // Initial States
            transactions: [],
            goals: [],
            insights: [],
            chatHistory: [],
            user: null,
            bankAccounts: [],
            creditCards: [],
            invoices: [],

            // User Actions
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates, updatedAt: new Date() } : null,
                })),

            updatePersonalInfo: (info) =>
                set((state) => ({
                    user: state.user
                        ? {
                            ...state.user,
                            personalInfo: { ...state.user.personalInfo, ...info },
                            updatedAt: new Date(),
                        }
                        : null,
                })),

            updateContactInfo: (info) =>
                set((state) => ({
                    user: state.user
                        ? {
                            ...state.user,
                            contactInfo: { ...state.user.contactInfo, ...info },
                            updatedAt: new Date(),
                        }
                        : null,
                })),

            updateAddress: (address) =>
                set((state) => ({
                    user: state.user
                        ? {
                            ...state.user,
                            address: { ...state.user.address, ...address },
                            updatedAt: new Date(),
                        }
                        : null,
                })),

            updateSettings: (settings) =>
                set((state) => ({
                    user: state.user
                        ? {
                            ...state.user,
                            settings: { ...state.user.settings, ...settings },
                            updatedAt: new Date(),
                        }
                        : null,
                })),

            // Bank Account Actions
            addBankAccount: (account) =>
                set((state) => ({
                    bankAccounts: [...state.bankAccounts, account],
                })),

            updateBankAccount: (id, updates) =>
                set((state) => ({
                    bankAccounts: state.bankAccounts.map((acc) =>
                        acc.id === id ? { ...acc, ...updates, updatedAt: new Date() } : acc
                    ),
                })),

            deleteBankAccount: (id) =>
                set((state) => ({
                    bankAccounts: state.bankAccounts.filter((acc) => acc.id !== id),
                })),

            setPrimaryBankAccount: (id) =>
                set((state) => ({
                    bankAccounts: state.bankAccounts.map((acc) => ({
                        ...acc,
                        isPrimary: acc.id === id,
                    })),
                })),

            // Credit Card Actions
            addCreditCard: (card) =>
                set((state) => ({
                    creditCards: [...state.creditCards, card],
                })),

            updateCreditCard: (id, updates) =>
                set((state) => ({
                    creditCards: state.creditCards.map((card) =>
                        card.id === id ? { ...card, ...updates, updatedAt: new Date() } : card
                    ),
                })),

            deleteCreditCard: (id) =>
                set((state) => ({
                    creditCards: state.creditCards.filter((card) => card.id !== id),
                })),

            setPrimaryCreditCard: (id) =>
                set((state) => ({
                    creditCards: state.creditCards.map((card) => ({
                        ...card,
                        isPrimary: card.id === id,
                    })),
                })),

            // Invoice Actions
            addInvoice: (invoice) =>
                set((state) => ({
                    invoices: [...state.invoices, invoice],
                })),

            updateInvoice: (id, updates) =>
                set((state) => ({
                    invoices: state.invoices.map((inv) =>
                        inv.id === id ? { ...inv, ...updates } : inv
                    ),
                })),

            payInvoice: (id, amount) =>
                set((state) => ({
                    invoices: state.invoices.map((inv) => {
                        if (inv.id !== id) return inv;

                        const newPaidAmount = inv.paidAmount + amount;
                        const newRemainingAmount = inv.totalAmount - newPaidAmount;

                        return {
                            ...inv,
                            paidAmount: newPaidAmount,
                            remainingAmount: newRemainingAmount,
                            status: newRemainingAmount <= 0 ? 'paga' : 'paga_parcial',
                        };
                    }),
                })),
        }),
        {
            name: 'finance-hub-storage',
            partialize: (state) => ({
                transactions: state.transactions,
                goals: state.goals,
                insights: state.insights,
                chatHistory: state.chatHistory,
                user: state.user,
                bankAccounts: state.bankAccounts,
                creditCards: state.creditCards,
                invoices: state.invoices,
            }),
        }
    )
);

// Selector Hooks para Performance
export const useUser = () => useFinanceStore((state) => state.user);
export const useBankAccounts = () => useFinanceStore((state) => state.bankAccounts);
export const useCreditCards = () => useFinanceStore((state) => state.creditCards);
export const useInvoices = () => useFinanceStore((state) => state.invoices);
export const usePrimaryBankAccount = () =>
    useFinanceStore((state) => state.bankAccounts.find((acc) => acc.isPrimary));
export const usePrimaryCreditCard = () =>
    useFinanceStore((state) => state.creditCards.find((card) => card.isPrimary));
