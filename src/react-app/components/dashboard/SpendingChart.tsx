import { TrendingUp } from "lucide-react";

const monthlyData = [
  { month: "Jul", amount: 2400 },
  { month: "Aug", amount: 2800 },
  { month: "Sep", amount: 3200 },
  { month: "Oct", amount: 2900 },
  { month: "Nov", amount: 3400 },
  { month: "Dec", amount: 3180 },
];

export function SpendingChart() {
  const maxAmount = Math.max(...monthlyData.map((d) => d.amount));
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
          <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">Trends</span>
        </div>
      </div>

      <div className="space-y-4">
        {monthlyData.map((data, index) => {
          const percentage = (data.amount / maxAmount) * 100;
          const isHighest = data.amount === maxAmount;
          
          return (
            <div key={data.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{data.month}</span>
                <span className="font-semibold text-gray-900">
                  ${data.amount.toLocaleString()}
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    isHighest
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-blue-500 to-purple-500"
                  }`}
                  style={{ 
                    width: `${percentage}%`,
                    transitionDelay: `${index * 50}ms` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Average Monthly</p>
            <p className="text-2xl font-bold text-gray-900">$2,983</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-bold text-gray-900">$3,180</p>
          </div>
        </div>
      </div>
    </div>
  );
}