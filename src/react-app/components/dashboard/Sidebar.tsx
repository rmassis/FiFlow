import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  Target,
  TrendingUp,
  Bot
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Transactions", icon: ArrowLeftRight, href: "/transactions" },
  { name: "Import", icon: Upload, href: "/import" },
  { name: "Goals", icon: Target, href: "/goals" },
  { name: "Insights", icon: TrendingUp, href: "/insights" },
  { name: "AI Assistant", icon: Bot, href: "/agent" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname);
    return currentNav?.name || "Dashboard";
  };

  return (
    <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinanceHub
            </h1>
            <p className="text-xs text-gray-500">Your finance companion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = getActiveTab() === item.name;

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-700 hover:bg-gray-100/80"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200/50">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900">Need help?</p>
          <p className="text-xs text-gray-600 mt-1">
            Ask our AI assistant anything about your finances
          </p>
        </div>
      </div>
    </div>
  );
}