
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
import { 
  Plus, 
  Search, 
  Bell, 
  Download, 
  Filter, 
  Calendar,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { MOCK_TRANSACTIONS, CATEGORIES } from './constants.tsx';

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
        return (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Lançamentos</h2>
                <p className="text-sm text-slate-500">Histórico detalhado de sua movimentação</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                  <Filter size={18} />
                  <span>Filtros</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                  <Download size={18} />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Data</th>
                    <th className="px-8 py-4">Descrição</th>
                    <th className="px-8 py-4">Categoria</th>
                    <th className="px-8 py-4 text-right">Valor</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_TRANSACTIONS.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">{t.date}</td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{t.description}</span>
                          <span className="text-xs text-slate-400 font-medium">{t.account}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-tight">
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-8 py-5 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase ${
                          t.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Olá, Brad Pitt 👋
            </h1>
            <p className="text-slate-500 font-medium">Aqui está o resumo financeiro de Março de 2025</p>
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
          onImport={(file) => {
            console.log('Importing file:', file.name);
            setIsImportOpen(false);
          }}
        />
      </main>
    </div>
  );
};

export default App;
