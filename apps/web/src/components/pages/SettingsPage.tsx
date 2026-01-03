
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Moon,
  CreditCard,
  LogOut,
  ChevronRight,
  Sparkles,
  Database,
  Cloud
} from 'lucide-react';

import { useSubscription } from '../../contexts/SubscriptionContext';
import EditProfileModal from '../features/EditProfileModal';
import ChangePasswordModal from '../features/ChangePasswordModal';
import DevicesModal from '../features/DevicesModal';
import RegionModal from '../features/RegionModal';
import AIPreferencesModal from '../features/AIPreferencesModal';

const SettingsPage: React.FC = () => {
  const { profile, loading, plan } = useSubscription();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('fiflow_theme') === 'dark';
  });
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    aiAlerts: true
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          email: user.email,
          name: profile?.full_name || user.email?.split('@')[0]
        });
      }
    });
  }
    });
  }, [profile]);

// Dark Mode Effect
useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('fiflow_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('fiflow_theme', 'light');
  }
}, [isDarkMode]);

const SettingItem = ({ icon: Icon, title, subtitle, action, onClick }: { icon: any, title: string, subtitle: string, action?: React.ReactNode, onClick?: () => void }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-6 bg-white hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 first:rounded-t-[24px] last:rounded-b-[24px] ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
    <div>
      {action || <ChevronRight size={18} className="text-slate-300" />}
    </div>
  </div>
);

return (
  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Profile Section */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Perfil do Usuário</h2>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 flex items-center gap-6 border-b border-slate-100">
          <div className="relative group cursor-pointer">
            <img src="https://picsum.photos/100" className="w-20 h-20 rounded-[24px] border-4 border-slate-50 shadow-sm transition-transform group-hover:scale-105" alt="Profile" />
            <div className="absolute inset-0 bg-slate-900/20 rounded-[24px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Smartphone size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user?.name || 'Carregando...'}</h3>
            <p className="text-sm text-slate-500 mb-2">{user?.email || 'email@exemplo.com'}</p>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-100">
              Plano {plan}
            </span>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="ml-auto px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all"
          >
            Editar Perfil
          </button>
        </div>

        <SettingItem
          icon={Shield}
          title="Segurança da Conta"
          subtitle="Gerencie sua senha e autenticação de dois fatores"
          onClick={() => setIsPasswordModalOpen(true)}
        />
        <SettingItem
          icon={Smartphone}
          title="Dispositivos Conectados"
          subtitle="Sessões ativas no seu celular, tablet ou desktop"
          onClick={() => setIsDevicesModalOpen(true)}
        />
      </div>
    </section>

    {/* Preferences Section */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Preferências do Sistema</h2>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <SettingItem
          icon={Moon}
          title="Modo Escuro"
          subtitle="Alterne entre o tema claro e escuro"
          action={
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`} />
            </button>
          }
        />
        <SettingItem
          icon={Globe}
          title="Idioma e Moeda"
          subtitle="Português (Brasil) - BRL (R$)"
          onClick={() => setIsRegionModalOpen(true)}
        />
        <SettingItem
          icon={Sparkles}
          title="IA FinanceFlow Assistant"
          subtitle="Ajuste o tom e a frequência dos conselhos da IA"
          onClick={() => setIsAIModalOpen(true)}
        />
      </div>
    </section>

    {/* Notifications Section */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Notificações</h2>
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <SettingItem
          icon={Bell}
          title="Notificações Push"
          subtitle="Alertas de gastos excedidos e faturas"
          action={
            <button
              onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-emerald-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.push ? 'left-7' : 'left-1'}`} />
            </button>
          }
        />
        <SettingItem
          icon={Database}
          title="Backup e Dados"
          subtitle="Sincronização automática com a nuvem"
          action={
            <div className="flex items-center gap-2 text-emerald-600">
              <Cloud size={16} />
              <span className="text-[10px] font-bold uppercase">Ativo</span>
            </div>
          }
        />
      </div>
    </section>

    {/* Subscription Section */}
    <section>
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Assinatura {plan}</h3>
            <p className="text-indigo-100 text-sm opacity-80">Gerencie sua assinatura</p>
          </div>
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white/10 px-4 py-2 rounded-xl">
            <span className="text-2xl font-bold">R$ 29,90</span>
            <span className="text-xs opacity-60 ml-1">/mês</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest bg-emerald-400 text-emerald-900 px-3 py-1 rounded-full">
            Renovação Automática
          </span>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">
            Gerenciar Plano
          </button>
          <button className="flex-1 py-3 bg-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/30 transition-all">
            Histórico de Pagamentos
          </button>
        </div>
      </div>
    </section>

    {/* Danger Zone */}
    <section className="pt-6">
      <button className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-bold rounded-[24px] hover:bg-rose-100 transition-all border border-rose-100">
        <LogOut size={20} />
        Sair do FinanceFlow Pro
      </button>
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-8">
        FinanceFlow Pro v2.1.0 • Built with Gemini AI
      </p>
    </section>
    <EditProfileModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
    />
    <ChangePasswordModal
      isOpen={isPasswordModalOpen}
      onClose={() => setIsPasswordModalOpen(false)}
    />
    <DevicesModal
      isOpen={isDevicesModalOpen}
      onClose={() => setIsDevicesModalOpen(false)}
    />
    <RegionModal
      isOpen={isRegionModalOpen}
      onClose={() => setIsRegionModalOpen(false)}
    />
    <AIPreferencesModal
      isOpen={isAIModalOpen}
      onClose={() => setIsAIModalOpen(false)}
    />
  </div>
);
};

export default SettingsPage;
