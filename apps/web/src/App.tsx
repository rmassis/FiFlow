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
import AIAssistant from './components/features/AIAssistant';
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

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Usar hook para manipulação
  const { addTransaction, categories, transactions, accounts } = useFinance();

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
    name: session?.user?.email?.split('@')[0] || 'Usuário',
    plan: 'Plano Beta',
    avatarUrl: `https://ui-avatars.com/api/?name=${session?.user?.email || 'U'}&background=6366f1&color=fff`
  };

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
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6">
              <Calendar size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Página em Construção</h2>
            <p className="text-slate-500 max-w-xs mx-auto">Esta funcionalidade está sendo refinada pela nossa equipe para oferecer a melhor experiência.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
        user={userProfile}
      />

      <main className="ml-64 min-h-screen p-8 lg:p-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Olá, {userProfile.name} 👋
            </h1>
            <p className="text-slate-500 font-medium whitespace-capitalize">
              Aqui está o resumo financeiro de {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="bg-white border-none text-sm font-medium rounded-2xl pl-12 pr-6 py-3 w-64 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100 hover:text-indigo-600 transition-colors relative">
              <Bell size={22} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Plus size={20} />
              <span>Importar Dados</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}

        {/* AI Assistant Floating */}
        <AIAssistant />

        {/* Modals */}
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={(importedTransactions, accountId) => {
            // Adicionar cada transação importada ao contexto
            const targetAccount = accounts.find(a => a.id === accountId);

            importedTransactions.forEach(t => {
              addTransaction({
                date: t.date,
                description: t.description,
                amount: t.amount,
                category: t.category,
                type: t.type,
                status: 'PAID',
                account: targetAccount?.name || 'Importado'
              });
            });
            setIsImportOpen(false);
          }}
        />
      </main>
    </div>
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;

