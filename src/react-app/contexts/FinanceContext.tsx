
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type {
    User, PersonalInfo, ContactInfo, Address, UserSettings,
    BankAccount, CreditCard, Invoice,
    Goal, Insight, Transaction
} from '@/shared/types';

// Mavel Mappers
const mapProfileFromDB = (data: any): User => ({
    id: data.id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    personalInfo: {
        fullName: data.full_name || '',
        cpf: data.cpf,
        birthDate: data.birth_date ? new Date(data.birth_date) : undefined
    },
    contactInfo: {
        email: '', // Email comes from auth, generally not in profile unless duplicated
        emailVerified: false,
        phone: data.phone || '',
        phoneVerified: false
    },
    address: {
        zipCode: data.address_zip || '',
        street: data.address_street || '',
        number: data.address_number || '',
        complement: data.address_complement,
        neighborhood: data.address_neighborhood || '',
        city: data.address_city || '',
        state: data.address_state || '',
        country: data.address_country || 'Brasil'
    },
    settings: data.settings || {}
});

const mapProfileToDB = (user: User) => ({
    id: user.id,
    full_name: user.personalInfo.fullName,
    cpf: user.personalInfo.cpf,
    phone: user.contactInfo.phone,
    birth_date: user.personalInfo.birthDate,
    address_zip: user.address.zipCode,
    address_street: user.address.street,
    address_number: user.address.number,
    address_complement: user.address.complement,
    address_neighborhood: user.address.neighborhood,
    address_city: user.address.city,
    address_state: user.address.state,
    address_country: user.address.country,
    settings: user.settings,
    updated_at: new Date()
});

const mapBankAccountFromDB = (data: any): BankAccount => ({
    id: data.id,
    userId: data.user_id,
    name: data.name,
    type: data.type,
    bank: data.bank,
    balance: parseFloat(data.balance),
    agency: data.agency,
    number: data.number,
    currency: data.currency,
    color: data.color,
    icon: data.icon,
    isPrimary: data.is_primary,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
});

const mapBankAccountToDB = (acc: BankAccount) => ({
    user_id: acc.userId,
    name: acc.name,
    type: acc.type,
    bank: acc.bank,
    balance: acc.balance,
    agency: acc.agency,
    number: acc.number,
    currency: acc.currency,
    color: acc.color,
    icon: acc.icon,
    is_primary: acc.isPrimary,
    updated_at: new Date()
});

const mapCreditCardFromDB = (data: any): CreditCard => ({
    id: data.id,
    userId: data.user_id,
    name: data.name,
    network: data.network,
    lastFourDigits: data.last_four_digits,
    limit: parseFloat(data.credit_limit),
    usedLimit: parseFloat(data.used_limit),
    closingDay: data.closing_day,
    dueDay: data.due_day,
    color: data.color,
    icon: data.icon,
    isPrimary: data.is_primary,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
});

const mapCreditCardToDB = (card: CreditCard) => ({
    user_id: card.userId,
    name: card.name,
    network: card.network,
    last_four_digits: card.lastFourDigits,
    credit_limit: card.limit,
    used_limit: card.usedLimit,
    closing_day: card.closingDay,
    due_day: card.dueDay,
    color: card.color,
    icon: card.icon,
    is_primary: card.isPrimary,
    updated_at: new Date()
});


interface FinanceStore {
    isLoading: boolean;
    transactions: Transaction[];
    goals: Goal[];
    insights: Insight[];
    chatHistory: any[];

    // User
    user: User | null;
    fetchInitialData: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<void>;
    updatePersonalInfo: (info: Partial<PersonalInfo>) => Promise<void>;
    updateContactInfo: (info: Partial<ContactInfo>) => Promise<void>;
    updateAddress: (address: Partial<Address>) => Promise<void>;

    // Accounts
    bankAccounts: BankAccount[];
    addBankAccount: (account: BankAccount) => Promise<void>;
    updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
    deleteBankAccount: (id: string) => Promise<void>;

    // Cards
    creditCards: CreditCard[];
    addCreditCard: (card: CreditCard) => Promise<void>;
    updateCreditCard: (id: string, updates: Partial<CreditCard>) => Promise<void>;
    deleteCreditCard: (id: string) => Promise<void>;

    invoices: Invoice[];
}

export const useFinanceStore = create<FinanceStore>()(
    persist(
        (set, get) => ({
            isLoading: false,
            transactions: [],
            goals: [],
            insights: [],
            chatHistory: [],
            user: null,
            bankAccounts: [],
            creditCards: [],
            invoices: [],

            fetchInitialData: async () => {
                set({ isLoading: true });
                try {
                    const { data: { user: authUser } } = await supabase.auth.getUser();
                    if (!authUser) return;

                    // Fetch Profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    if (profile) {
                        const mappedUser = mapProfileFromDB(profile);
                        mappedUser.contactInfo.email = authUser.email || '';
                        set({ user: mappedUser });
                    }

                    // Fetch Bank Accounts
                    const { data: accounts } = await supabase.from('bank_accounts').select('*');
                    if (accounts) {
                        set({ bankAccounts: accounts.map(mapBankAccountFromDB) });
                    }

                    // Fetch Credit Cards
                    const { data: cards } = await supabase.from('credit_cards').select('*');
                    if (cards) {
                        set({ creditCards: cards.map(mapCreditCardFromDB) });
                    }

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateUser: async (updates) => {
                // Check for real auth user
                const { data: { user: authUser } } = await supabase.auth.getUser();

                const currentUser = get().user;
                // If we have an auth user, use their ID. Otherwise use the ID provided or current ID.
                const realId = authUser ? authUser.id : (currentUser?.id || updates.id);

                if (!currentUser && !updates) return;

                const newUser = {
                    ...(currentUser || {} as User),
                    ...updates,
                    id: realId, // Enforce ID
                    updatedAt: new Date()
                } as User;

                set({ user: newUser });

                // DB - Only try to save if we have a real authUser (to avoid FK error)
                if (authUser) {
                    try {
                        const mapped = mapProfileToDB(newUser);
                        // Ensure ID is set in mapped object
                        mapped.id = authUser.id;
                        await supabase.from('profiles').upsert(mapped);
                    } catch (err) {
                        console.error("DB Sync Error", err);
                    }
                } else {
                    console.warn("User updated locally but NOT saved to DB (Not Authenticated)");
                }
            },

            ensureUser: async (email: string) => {
                // 1. Check if already logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (user) return user.id;

                // 2. Try to Sign Up / Sign In
                const DEFAULT_PASSWORD = "fiflow-mvp-password";

                // Try Sign Up
                let { data, error } = await supabase.auth.signUp({
                    email,
                    password: DEFAULT_PASSWORD,
                });

                if (error?.message?.includes("already registered") || error?.status === 422) {
                    console.log("User exists, trying sign in...");
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                        email,
                        password: DEFAULT_PASSWORD,
                    });
                    if (signInError) {
                        console.error("Auto-login failed:", signInError);
                        return null;
                    }
                    return signInData.user?.id || null;
                }

                if (error) {
                    console.error("Auto-signup failed:", error);
                    return null;
                }

                return data.user?.id || null;
            },

            updatePersonalInfo: async (info) => {
                const currentUser = get().user;
                if (!currentUser) return;
                const newUser = { ...currentUser, personalInfo: { ...currentUser.personalInfo, ...info } };
                set({ user: newUser });

                try {
                    await supabase.from('profiles').upsert(mapProfileToDB(newUser));
                } catch (err) {
                    console.error("DB Sync Error", err);
                }
            },

            updateContactInfo: async (info) => {
                const currentUser = get().user;
                if (!currentUser) return;
                const newUser = { ...currentUser, contactInfo: { ...currentUser.contactInfo, ...info } };
                set({ user: newUser });
                try {
                    await supabase.from('profiles').upsert(mapProfileToDB(newUser));
                } catch (err) {
                    console.error("DB Sync Error", err);
                }
            },

            updateAddress: async (addr) => {
                const currentUser = get().user;
                if (!currentUser) return;
                const newUser = { ...currentUser, address: { ...currentUser.address, ...addr } };
                set({ user: newUser });
                try {
                    await supabase.from('profiles').upsert(mapProfileToDB(newUser));
                } catch (err) {
                    console.error("DB Sync Error", err);
                }
            },

            addBankAccount: async (account) => {
                // To DB first to get ID if needed, or assume UUID generated by client
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const accountWithUserId = { ...account, userId: user.id };

                // Optimistic
                set((state) => ({ bankAccounts: [...state.bankAccounts, accountWithUserId] }));

                try {
                    await supabase.from('bank_accounts').insert(mapBankAccountToDB(accountWithUserId));
                } catch (err) {
                    console.error("DB Insert Error", err);
                }
            },

            updateBankAccount: async (id, updates) => {
                set((state) => ({
                    bankAccounts: state.bankAccounts.map((acc) =>
                        acc.id === id ? { ...acc, ...updates } : acc
                    ),
                }));

                // We need the full object to map to DB or just the fields?
                // `mapBankAccountToDB` expects full object. merging...
                const updatedAccount = get().bankAccounts.find(a => a.id === id);
                if (updatedAccount) {
                    try {
                        await supabase.from('bank_accounts').update(mapBankAccountToDB(updatedAccount)).eq('id', id);
                    } catch (err) {
                        console.error("DB Update Error", err);
                    }
                }
            },

            deleteBankAccount: async (id) => {
                set((state) => ({
                    bankAccounts: state.bankAccounts.filter((acc) => acc.id !== id),
                }));
                try {
                    await supabase.from('bank_accounts').delete().eq('id', id);
                } catch (err) {
                    console.error("DB Delete Error", err);
                }
            },

            addCreditCard: async (card) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const cardWithUserId = { ...card, userId: user.id };

                set((state) => ({ creditCards: [...state.creditCards, cardWithUserId] }));

                try {
                    await supabase.from('credit_cards').insert(mapCreditCardToDB(cardWithUserId));
                } catch (err) {
                    console.error("DB Insert Error", err);
                }
            },

            updateCreditCard: async (id, updates) => {
                set((state) => ({
                    creditCards: state.creditCards.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
                const updatedCard = get().creditCards.find(c => c.id === id);
                if (updatedCard) {
                    try {
                        await supabase.from('credit_cards').update(mapCreditCardToDB(updatedCard)).eq('id', id);
                    } catch (err) {
                        console.error("DB Update Error", err);
                    }
                }
            },

            deleteCreditCard: async (id) => {
                set((state) => ({
                    creditCards: state.creditCards.filter((c) => c.id !== id),
                }));
                try {
                    await supabase.from('credit_cards').delete().eq('id', id);
                } catch (err) {
                    console.error("DB Delete Error", err);
                }
            },
        }),
        {
            name: 'finance-hub-storage',
            partialize: (state) => ({
                transactions: state.transactions,
                // Do not persist user/accounts/cards locally if we want strictly DB?
                // Or keep them for caching. I'll keep them.
                user: state.user,
                bankAccounts: state.bankAccounts,
                creditCards: state.creditCards,
            }),
        }
    )
);
