import {
  TrendingUp,
  Target,
  PiggyBank,
  FileText,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface QuickActionsProps {
  onAction: (action: string) => void;
  className?: string;
}

const actions = [
  {
    icon: Calendar,
    label: "Quanto gastei este mês?",
    action: "Quanto gastei este mês?",
  },
  {
    icon: PiggyBank,
    label: "Onde posso economizar?",
    action: "Analise meus gastos e me diga onde posso economizar",
  },
  {
    icon: Target,
    label: "Resumo das metas",
    action: "Me mostre um resumo das minhas metas financeiras",
  },
  {
    icon: TrendingUp,
    label: "Comparar com mês passado",
    action: "Compare meus gastos deste mês com o mês passado",
  },
  {
    icon: FileText,
    label: "Criar relatório",
    action: "Crie um relatório detalhado das minhas despesas por categoria",
  },
  {
    icon: AlertCircle,
    label: "Gastos incomuns",
    action: "Identifique gastos incomuns ou outliers nos últimos 3 meses",
  },
];

export default function QuickActions({
  onAction,
  className = "",
}: QuickActionsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${className}`}>
      {actions.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.action}
            onClick={() => onAction(item.action)}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
              <Icon className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
