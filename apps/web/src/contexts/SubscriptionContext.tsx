import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, UserPlan } from '../types';

interface SubscriptionContextData {
    profile: UserProfile | null;
    loading: boolean;
    plan: UserPlan;
    isFree: boolean;
    isPremium: boolean;
    isPro: boolean;
    isPro: boolean;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextData>({} as SubscriptionContextData);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setProfile(null);
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If profile doesn't exist, we might want to create one or assume FREE
                // For now, let's assume valid users have profiles via trigger
                return;
            }

            setProfile(data as UserProfile);
        } catch (error) {
            console.error('Subscription check failed', error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    useEffect(() => {
        refreshProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshProfile();
        });

        return () => subscription.unsubscribe();
    }, []);

    const plan = profile?.plan || 'FREE';
    const isFree = plan === 'FREE';
    const isPremium = plan === 'PREMIUM';
    const isPro = plan === 'PRO';

    return (
        <SubscriptionContext.Provider value={{
            profile,
            loading,
            plan,
            isFree,
            isPremium,
            isPro,
            isPro,
            refreshProfile,
            updateProfile
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
