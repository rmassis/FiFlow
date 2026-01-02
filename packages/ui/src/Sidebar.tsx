import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

export interface UserProfile {
    name: string;
    plan: string;
    avatarUrl: string;
}

export interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    menuItems: MenuItem[];
    user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, menuItems, user }) => {
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
                    <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.plan}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
