import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Coffee, Car, Home, Heart, Gamepad2, ShoppingBag, TrendingUp, GraduationCap, Shirt, Sparkles } from "lucide-react";

const categoryIcons: Record<string, any> = {
  "Alimentação": Coffee,
  "Transporte": Car,
  "Moradia": Home,
  "Saúde": Heart,
  "Lazer": Gamepad2,
  "Educação": GraduationCap,
  "Vestuário": Shirt,
  "Investimentos": TrendingUp,
  "Renda": Sparkles,
  "Outros": ShoppingBag,
};

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: "receita" | "despesa";
}

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/dashboard/recent?limit=10");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate("/transactions");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
            <p className="text-sm text-slate-600">Últimas 10 movimentações</p>
          </div>
        </div>
        <div className="py-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma transação encontrada</p>
          <p className="text-sm text-gray-400 mt-1">Importe transações para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
          <p className="text-sm text-slate-600">Últimas 10 movimentações</p>
        </div>
        <button 
          onClick={handleViewAll}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Descrição</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Categoria</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Subcategoria</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const Icon = categoryIcons[transaction.category] || ShoppingBag;
              return (
                <tr 
                  key={transaction.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={handleViewAll}
                >
                  <td className="py-3 px-4 text-sm text-gray-700 tabular-nums">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "receita" 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "receita"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {transaction.subcategory}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-semibold tabular-nums ${
                    transaction.type === "receita" ? "text-emerald-600" : "text-gray-900"
                  }`}>
                    {transaction.type === "receita" ? "+" : "-"}{formatBRL(Math.abs(transaction.amount))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
