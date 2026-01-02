
import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Target,
  Wallet,
  CreditCard,
  TrendingUp,
  Settings,
  ArrowRightLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: ArrowRightLeft },
    { id: 'budget', label: 'Orçamento', icon: Receipt },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard },
    { id: 'accounts', label: 'Contas Corrente', icon: Wallet },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-30 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">FinanceFlow</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
          <img src="https://picsum.photos/40" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">Brad Pitt</span>
            <span className="text-xs text-slate-500">Plano Premium</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
