import { Calendar, Plus, Upload, User } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Olá, Usuário</h1>
            <p className="text-sm text-slate-600">Bem-vindo ao seu painel financeiro</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Últimos 30 dias</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors shadow-md">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Importar</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/30">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Nova Transação</span>
          </button>
        </div>
      </div>
    </div>
  );
}