import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/react-app/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/react-app/components/dashboard/SummaryCards";
import { EvolutionChart } from "@/react-app/components/dashboard/EvolutionChart";
import { ExpensesPieChart } from "@/react-app/components/dashboard/ExpensesPieChart";
import { TransactionsTable } from "@/react-app/components/dashboard/TransactionsTable";
import { DashboardProvider } from "@/react-app/contexts/DashboardContext";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <DashboardHeader />

          <SummaryCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvolutionChart />
            <ExpensesPieChart />
          </div>

          <TransactionsTable />
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}