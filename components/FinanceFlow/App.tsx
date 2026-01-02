
import React, { useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import BudgetPage from './components/BudgetPage.tsx';
import GoalsPage from './components/GoalsPage.tsx';
import InvestmentsPage from './components/InvestmentsPage.tsx';
import CardsPage from './components/CardsPage.tsx';
import AccountsPage from './components/AccountsPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import ImportModal from './components/ImportModal.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import Header from './components/Header.tsx';
import TransactionsPage from './components/TransactionsPage.tsx';
import { Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        return <TransactionsPage />;
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="ml-64 min-h-screen p-8 lg:p-12">
        {/* Header */}
        <Header
          userName="Brad Pitt"
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onImportClick={() => setIsImportOpen(true)}
        />

        {/* Dynamic Content */}
        {renderContent()}

        {/* AI Assistant Floating */}
        <AIAssistant />

        {/* Modals */}
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={(files, accountId) => {
            console.log('Importing files:', files.map(f => f.name), 'to account:', accountId);
            setIsImportOpen(false);
          }}
        />
      </main>
    </div>
  );
};

export default App;
