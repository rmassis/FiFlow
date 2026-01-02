import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';

interface HeaderProps {
    userName: string;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onImportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, searchQuery, setSearchQuery, onImportClick }) => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Olá, {userName} 👋
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
                    onClick={onImportClick}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Importar Dados</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
