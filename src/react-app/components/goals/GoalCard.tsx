import { MoreVertical, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useState } from "react";
import type { Goal, GoalProgress } from "@/shared/types";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
}

const GOAL_TYPE_CONFIG = {
  economia: { icon: DollarSign, label: "Economia", color: "text-emerald-600" },
  limite_gastos: { icon: TrendingDown, label: "Limite", color: "text-red-600" },
  receita: { icon: TrendingUp, label: "Receita", color: "text-blue-600" },
  investimento: { icon: Target, label: "Investimento", color: "text-purple-600" },
};

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const calculateProgress = (): GoalProgress => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 150);
    const remaining = goal.targetAmount - goal.currentAmount;
    
    const now = new Date();
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const dailyAverage = daysRemaining > 0 ? remaining / daysRemaining : 0;
    const isOnTrack = percentage >= (((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);

    let colorClass = "bg-gray-400";
    if (percentage >= 100) {
      colorClass = percentage > 100 ? "bg-red-500" : "bg-emerald-500";
    } else if (percentage >= 76) {
      colorClass = "bg-emerald-500";
    } else if (percentage >= 51) {
      colorClass = "bg-yellow-500";
    }

    return {
      percentage,
      remaining,
      daysRemaining,
      dailyAverage,
      isOnTrack,
      colorClass,
    };
  };

  const progress = calculateProgress();

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  const getStatusBadge = () => {
    if (progress.percentage >= 100) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          Concluída
        </span>
      );
    }
    if (progress.daysRemaining === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
          Atrasada
        </span>
      );
    }
    if (progress.isOnTrack) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
          No prazo
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
        Atenção
      </span>
    );
  };

  const typeConfig = GOAL_TYPE_CONFIG[goal.type];
  const Icon = typeConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center ${typeConfig.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{goal.name}</h3>
              <p className="text-xs text-slate-600">{typeConfig.label}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-10 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => {
                      onEdit(goal);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (goal.id) onDelete(goal.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(progress.percentage)}%
            </span>
            <span className="text-sm text-slate-600">
              {progress.percentage >= 100 ? "Atingido" : "Progresso"}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${progress.colorClass} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Values */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Atual</span>
            <span className="font-bold text-gray-900">{formatBRL(goal.currentAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Alvo</span>
            <span className="font-semibold text-gray-700">{formatBRL(goal.targetAmount)}</span>
          </div>
          {progress.remaining > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-slate-600">Faltam</span>
              <span className="font-bold text-indigo-600">{formatBRL(progress.remaining)}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{formatDate(goal.startDate)}</span>
            <span>•</span>
            <span>{formatDate(goal.endDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {progress.daysRemaining > 0 
                ? `${progress.daysRemaining} dias restantes`
                : "Prazo expirado"}
            </span>
          </div>
          {progress.daysRemaining > 0 && progress.remaining > 0 && (
            <div className="text-xs text-slate-600">
              Média diária necessária: <span className="font-semibold text-gray-900">{formatBRL(progress.dailyAverage)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        {getStatusBadge()}
      </div>
    </div>
  );
}
