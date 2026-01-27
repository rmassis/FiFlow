import { Wallet, CreditCard, PiggyBank, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Checking",
    value: "$12,450.00",
    icon: Wallet,
    change: "+2.5%",
    isPositive: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Credit Cards",
    value: "$2,340.50",
    icon: CreditCard,
    change: "-1.2%",
    isPositive: false,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Savings",
    value: "$28,490.00",
    icon: PiggyBank,
    change: "+5.8%",
    isPositive: true,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Investments",
    value: "$32,000.00",
    icon: TrendingUp,
    change: "+12.3%",
    isPositive: true,
    color: "from-orange-500 to-red-500",
  },
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
              <Icon className="w-full h-full text-gray-900" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${
                  stat.isPositive ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.change}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-1">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}