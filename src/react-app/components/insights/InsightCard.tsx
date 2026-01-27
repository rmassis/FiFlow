import { AlertTriangle, Lightbulb, BarChart3, Sparkles, TrendingUp, Check, X } from "lucide-react";
import type { Insight } from "@/shared/types";

interface InsightCardProps {
  insight: Insight;
  onMarkAsRead: (id: number) => void;
  onMarkAsApplied: (id: number) => void;
  onDelete: (id: number) => void;
}

const INSIGHT_TYPE_CONFIG = {
  alerta: {
    icon: AlertTriangle,
    label: "Alerta",
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  },
  oportunidade: {
    icon: Lightbulb,
    label: "Oportunidade",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
  },
  padrão: {
    icon: BarChart3,
    label: "Padrão",
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  previsão: {
    icon: Sparkles,
    label: "Previsão",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
  },
};

const IMPACT_CONFIG = {
  alto: {
    label: "Alto Impacto",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  médio: {
    label: "Médio Impacto",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  baixo: {
    label: "Baixo Impacto",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export function InsightCard({ insight, onMarkAsRead, onMarkAsApplied, onDelete }: InsightCardProps) {
  const typeConfig = INSIGHT_TYPE_CONFIG[insight.tipo];
  const impactConfig = IMPACT_CONFIG[insight.impacto];
  const Icon = typeConfig.icon;

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleApply = () => {
    if (insight.id) {
      onMarkAsApplied(insight.id);
      if (!insight.is_read) {
        onMarkAsRead(insight.id);
      }
    }
  };

  const handleDismiss = () => {
    if (insight.id) {
      onDelete(insight.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${typeConfig.borderColor} ${
        !insight.is_read ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                  {typeConfig.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${impactConfig.color}`}>
                  {impactConfig.label}
                </span>
                {!insight.is_read && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    Novo
                  </span>
                )}
                {insight.is_applied && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Aplicado
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{insight.título}</h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{insight.descrição}</p>
        </div>

        {/* Potential Savings */}
        {insight.economia_potencial !== undefined && insight.economia_potencial > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-900">Economia Potencial</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {formatBRL(insight.economia_potencial)}
            </p>
          </div>
        )}

        {/* Suggested Action */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-sm font-semibold text-indigo-900 mb-1">💡 Ação Sugerida</p>
          <p className="text-sm text-indigo-700">{insight.ação_sugerida}</p>
        </div>

        {/* Actions */}
        {!insight.is_applied && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Aplicar Sugestão
            </button>
            <button
              onClick={handleDismiss}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Dispensar
            </button>
          </div>
        )}

        {/* Period Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-slate-500">
            Período analisado: {new Date(insight.period_start).toLocaleDateString('pt-BR')} -{' '}
            {new Date(insight.period_end).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
