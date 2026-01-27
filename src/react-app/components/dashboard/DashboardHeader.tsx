import { User } from "lucide-react";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import { AdvancedDateFilter } from "./AdvancedDateFilter";

export function DashboardHeader() {
  const { userProfile } = useFinanceStore();
  const userName = userProfile?.full_name?.split(' ')[0] || "Usuário";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">

        {/* User Greeting */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md ring-4 ring-indigo-50">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Olá, {userName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Bem-vindo ao seu painel financeiro
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex items-center">
          <AdvancedDateFilter />
        </div>
      </div>
    </div>
  );
}