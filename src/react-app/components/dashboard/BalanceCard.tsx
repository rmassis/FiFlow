import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export function BalanceCard() {
  const totalBalance = 45280.50;
  const monthlyChange = 8.5;
  const isPositive = monthlyChange > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 shadow-2xl shadow-blue-500/30">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -ml-36 -mb-36" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 font-medium">Total Balance</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
            isPositive ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-semibold ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}>
              {isPositive ? "+" : ""}{monthlyChange}%
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-5xl font-bold text-white mb-1">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-white/60 text-sm">Across all accounts</p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-sm mb-1">Income</p>
            <p className="text-white text-xl font-semibold">$6,420</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-sm mb-1">Expenses</p>
            <p className="text-white text-xl font-semibold">$3,180</p>
          </div>
        </div>
      </div>
    </div>
  );
}