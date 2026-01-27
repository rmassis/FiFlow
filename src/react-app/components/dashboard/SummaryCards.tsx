import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { useDashboard } from "@/react-app/contexts/DashboardContext";

interface CardData {
  title: string;
  value: number;
  variation: number;
  sparklineData: number[];
  type: "income" | "expense" | "balance";
}

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const cardConfigs = {
  income: {
    icon: ArrowUpCircle,
    gradientFrom: "#10B981",
    gradientTo: "#059669",
    bgColor: "from-emerald-50 to-emerald-100",
    textColor: "text-emerald-600",
  },
  expense: {
    icon: ArrowDownCircle,
    gradientFrom: "#EF4444",
    gradientTo: "#DC2626",
    bgColor: "from-red-50 to-red-100",
    textColor: "text-red-600",
  },
  balance: {
    icon: Wallet,
    gradientFrom: "#6366F1",
    gradientTo: "#8B5CF6",
    bgColor: "from-indigo-50 to-purple-100",
    textColor: "text-indigo-600",
  },
};

function SummaryCard({ title, value, variation, sparklineData, type }: CardData) {
  const config = cardConfigs[type];
  const Icon = config.icon;
  const isPositiveVariation = variation >= 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.bgColor} flex items-center justify-center shadow-md`}>
          <Icon className={`w-7 h-7 ${config.textColor}`} />
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isPositiveVariation
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
          }`}>
          {isPositiveVariation ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositiveVariation ? "+" : ""}{variation.toFixed(1)}%
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-1">{title}</p>
        <p className={`text-3xl font-bold ${config.textColor} tabular-nums`}>
          {type === "expense" && value > 0 ? "-" : ""}{formatBRL(Math.abs(value))}
        </p>
      </div>

      <div className="mb-3">
        <div className="h-10 flex items-end gap-1">
          {sparklineData.map((value, index) => {
            const max = Math.max(...sparklineData, 1);
            const height = (value / max) * 100;
            return (
              <div
                key={index}
                className="flex-1 rounded-t transition-all duration-300"
                style={{
                  height: `${height}%`,
                  backgroundColor: config.gradientFrom,
                  opacity: 0.7,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SummaryCards() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { dateRange } = useDashboard();

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });
      const response = await fetch(`/api/dashboard/stats?${queryParams}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-14 w-14 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const cardsData: CardData[] = [
    {
      title: "Receitas",
      value: stats?.receitas?.value || 0,
      variation: stats?.receitas?.variation || 0,
      sparklineData: stats?.receitas?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      type: "income",
    },
    {
      title: "Despesas",
      value: stats?.despesas?.value || 0,
      variation: stats?.despesas?.variation || 0,
      sparklineData: stats?.despesas?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      type: "expense",
    },
    {
      title: "Saldo",
      value: stats?.saldo?.value || 0,
      variation: stats?.saldo?.variation || 0,
      sparklineData: stats?.saldo?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      type: "balance",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cardsData.map((card) => (
        <SummaryCard key={card.title} {...card} />
      ))}
    </div>
  );
}
