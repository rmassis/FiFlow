import React from 'react';
import { LucideIcon, X } from 'lucide-react';

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
    mobileOpen?: boolean;
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, menuItems, user, mobileOpen = false, onClose }) => {
    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 
                flex flex-col shadow-2xl shadow-indigo-500/5 transition-transform duration-300 ease-in-out
                md:translate-x-0 py-6
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="px-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                            F
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            FiFlow
                            <span className="text-indigo-500 text-xs ml-1 font-mono">PRO</span>
                        </h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    if (onClose) onClose();
                                }}
                                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full" />
                                )}
                                <Icon
                                    size={20}
                                    className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="px-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group text-left">
                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm group-hover:border-indigo-500 transition-colors object-cover flex-shrink-0" alt="User" />
                        <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full" title={user.name}>{user.name}</span>
                            <span className="text-xs text-indigo-500 font-bold">{user.plan}</span>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
};
