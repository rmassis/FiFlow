import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useDashboard } from "@/react-app/contexts/DashboardContext";

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const CustomTooltip = ({ active, payload, data }: any) => {
  if (active && payload && payload.length) {
    const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
    const percentage = ((payload[0].value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-700 mt-1">{formatBRL(payload[0].value)}</p>
        <p className="text-xs text-gray-500 mt-0.5">{percentage}% do total</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, data }: any) => {
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry: any, index: number) => {
        const percentage = ((entry.payload.value / total) * 100).toFixed(1);
        return (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{entry.value}</p>
              <p className="text-xs text-gray-500 tabular-nums">{percentage}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};


export function ExpensesPieChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const { dateRange } = useDashboard();

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      });
      const response = await fetch(`/api/dashboard/categories?${queryParams}`);
      const result = await response.json();
      setData(result.categories || []);
    } catch (error) {
      console.error("Error loading category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
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
          <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
          <p className="text-sm text-slate-600">Distribuição dos gastos do período</p>
        </div>
        <div className="h-[300px] flex items-center justify-center text-gray-500">
          <p>Nenhuma despesa registrada neste período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
        <p className="text-sm text-slate-600">Distribuição dos gastos do período</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={activeIndex === undefined || activeIndex === index ? 1 : 0.5}
                style={{
                  filter: activeIndex === index ? "brightness(1.1)" : "none",
                  transition: "all 0.3s ease"
                }}
              />
            ))}
          </Pie>
          <Tooltip content={(props) => <CustomTooltip {...props} data={data} />} />
          <Legend content={(props) => <CustomLegend {...props} data={data} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
