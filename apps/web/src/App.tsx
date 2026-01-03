import React, { useState, useEffect } from 'react';
import { Sidebar } from '@fiflow/ui';
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import Dashboard from './components/pages/Dashboard';
import BudgetPage from './components/pages/BudgetPage';
import GoalsPage from './components/pages/GoalsPage';
import InvestmentsPage from './components/pages/InvestmentsPage';
import CardsPage from './components/pages/CardsPage';
import AccountsPage from './components/pages/AccountsPage';
import SettingsPage from './components/pages/SettingsPage';
import TransactionList from './components/features/TransactionList';
import CategoriesPage from './components/pages/CategoriesPage';
import LoginPage from './components/pages/LoginPage';
import SignUpPage from './components/pages/SignUpPage';
import ImportModal from './components/features/ImportModal';
import UpdatePasswordModal from './components/features/UpdatePasswordModal';
import AIAssistant from './components/features/AIAssistant';
import OnboardingWizard from './components/features/OnboardingWizard';
import {
  Plus,
  Search,
  Bell,
  Calendar,
  LayoutDashboard,
  Receipt,
  Target,
  Wallet,
  CreditCard,
  TrendingUp,
  Settings,
  ArrowRightLeft
} from 'lucide-react';


import { FinanceProvider } from './contexts/FinanceContext';
import { useFinance } from './contexts/FinanceContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';

const AppContent: React.FC<{ session: Session }> = ({ session }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      // Verifica query parameter OU hash (comum em magic links)
      const hash = window.location.hash;
      if (params.get('update_password') === 'true' || hash.includes('type=recovery') || hash.includes('type=invite')) {
        setIsUpdatePasswordOpen(true);
        // Limpa URL para não reabrir ao dar refresh
        if (params.get('update_password') === 'true') {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };

    checkUrl();
    window.addEventListener('check-password-url', checkUrl);
    return () => window.removeEventListener('check-password-url', checkUrl);
  }, []);

  const { profile, loading: subLoading, plan } = useSubscription();
  const { addTransaction, categories, transactions, accounts, loading } = useFinance();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: ArrowRightLeft },
    { id: 'categories', label: 'Categorias', icon: Wallet },
    { id: 'budget', label: 'Orçamento', icon: Receipt },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'accounts', label: 'Contas Bancárias', icon: Wallet },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const userProfile = {
    name: profile?.full_name || session?.user?.email?.split('@')[0] || 'Usuário',
    plan: `Plano ${plan}`,
    avatarUrl: profile?.avatar_url || `https://ui-avatars.com/api/?name=${session?.user?.email || 'U'}&background=6366f1&color=fff`
  };

  const firstName = userProfile.name.split(' ')[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'budget':
        return <BudgetPage />;
      case 'goals':
        return <GoalsPage />;
      case 'investments':
        return <InvestmentsPage />;
      case 'cards':
        return <CardsPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'transactions':
        return <TransactionList />;
      case 'categories':
        return <CategoriesPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-indigo-500/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        menuItems={menuItems}
        user={userProfile}
        mobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300"
            >
              <div className="space-y-1.5 w-6">
                <span className="block w-6 h-0.5 bg-current rounded-full"></span>
                <span className="block w-4 h-0.5 bg-current rounded-full"></span>
                <span className="block w-5 h-0.5 bg-current rounded-full"></span>
              </div>
            </button>
            <span className="font-bold text-lg text-slate-900 dark:text-white">FiFlow</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
            {firstName[0]}
          </div>
        </div>

        {/* Desktop Header / Top Bar */}
        <header className="px-8 py-6 flex items-center justify-between md:sticky md:top-0 z-20 md:bg-slate-50/80 md:dark:bg-black/80 md:backdrop-blur-sm">
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
              Olá, {firstName} 👋
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Aqui está o resumo financeiro de hoje
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="relative flex-1 md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar transações, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="p-1 px-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700">⌘ K</span>
              </div>
            </div>

            <button className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 transition-all shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/10"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Novo Lançamento</span>
            </button>
          </div>
          <button
            onClick={() => setIsImportOpen(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center z-50"
          >
            <Plus size={28} />
          </button>
        </header>

        <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSave={addTransaction}
        categories={categories}
        accounts={accounts}
      />

      <UpdatePasswordModal
        isOpen={isUpdatePasswordOpen}
        onClose={() => {
          setIsUpdatePasswordOpen(false);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }}
      />

      <AIAssistant />

      <OnboardingWizard
        isOpen={!loading && accounts.length === 0 && !subLoading && !isUpdatePasswordOpen}
        onClose={() => { }}
      />

    </div >
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        // Usuário clicou no link de redefinição ou aceitou convite que pede senha
        setAuthView('login'); // Garante que não está em signup
        // Pequeno delay para garantir que o AppContent monte
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          params.set('update_password', 'true');
          window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
          // Recarrega ou força atualização
          window.dispatchEvent(new Event('check-password-url'));
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('App Rendering - Session:', !!session, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    console.log('Rendering Auth View:', authView);
    return authView === 'login' ? (
      <LoginPage onNavigateToSignUp={() => setAuthView('signup')} />
    ) : (
      <SignUpPage onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  console.log('Rendering FinanceProvider and AppContent');
  return (
    <SubscriptionProvider>
      <FinanceProvider>
        <AppContent session={session} />
      </FinanceProvider>
    </SubscriptionProvider>
  );
}

export default App;

