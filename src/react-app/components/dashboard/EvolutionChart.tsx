import { useState, useEffect } from "react";
import { Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">Dia {payload[0].payload.dia}</p>
        <div className="space-y-1">
          <p className="text-sm text-emerald-600 font-medium">
            Receitas: {formatBRL(payload[0].value)}
          </p>
          <p className="text-sm text-red-600 font-medium">
            Despesas: {formatBRL(payload[1].value)}
          </p>
          <p className="text-sm text-indigo-600 font-semibold pt-1 border-t border-gray-100">
            Saldo: {formatBRL(payload[0].value - payload[1].value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/dashboard/evolution");
      const result = await response.json();
      setData(result.evolution || []);
    } catch (error) {
      console.error("Error loading evolution data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Evolução Temporal</h3>
          <p className="text-sm text-slate-600">Receitas vs Despesas do período</p>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          <p>Nenhum dado disponível para este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Evolução Temporal</h3>
        <p className="text-sm text-slate-600">Receitas vs Despesas do período</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="dia" 
            stroke="#64748B"
            style={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748B"
            style={{ fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="receitas"
            fill="url(#colorReceitas)"
            stroke="none"
          />
          <Area
            type="monotone"
            dataKey="despesas"
            fill="url(#colorDespesas)"
            stroke="none"
          />
          <Line
            type="monotone"
            dataKey="receitas"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: "#10B981", r: 4 }}
            activeDot={{ r: 6 }}
            name="Receitas"
          />
          <Line
            type="monotone"
            dataKey="despesas"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ fill: "#EF4444", r: 4 }}
            activeDot={{ r: 6 }}
            name="Despesas"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
