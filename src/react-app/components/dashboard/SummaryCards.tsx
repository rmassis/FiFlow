import { useDashboard } from "@/react-app/contexts/DashboardContext";

// ... (existing imports, interfaces, configs, SummaryCard component - NO CHANGE)

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
