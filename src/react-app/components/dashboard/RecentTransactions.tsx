import { ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Home, Zap } from "lucide-react";

const transactions = [
  { id: 1, name: "Starbucks", amount: -5.80, category: "Food & Dining", icon: Coffee, date: "Today, 9:45 AM" },
  { id: 2, name: "Amazon", amount: -124.99, category: "Shopping", icon: ShoppingBag, date: "Yesterday, 3:20 PM" },
  { id: 3, name: "Salary Deposit", amount: 4200.00, category: "Income", icon: ArrowDownRight, date: "Dec 1, 9:00 AM" },
  { id: 4, name: "Rent Payment", amount: -1800.00, category: "Housing", icon: Home, date: "Dec 1, 8:00 AM" },
  { id: 5, name: "Electric Bill", amount: -89.50, category: "Utilities", icon: Zap, date: "Nov 30, 2:15 PM" },
];

export function RecentTransactions() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          const isPositive = transaction.amount > 0;
          
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPositive 
                  ? "bg-green-100 text-green-600" 
                  : "bg-gray-100 text-gray-600"
              } group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {transaction.name}
                </p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
                <p className="text-xs text-gray-400 mt-0.5">{transaction.date}</p>
              </div>
              
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowDownRight className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-gray-600" />
                )}
                <span className={`font-semibold ${
                  isPositive ? "text-green-600" : "text-gray-900"
                }`}>
                  {isPositive ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}