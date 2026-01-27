import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { GoalForm } from "@/react-app/components/goals/GoalForm";
import { GoalCard } from "@/react-app/components/goals/GoalCard";
import type { Goal } from "@/shared/types";

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goal: Goal) => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });

      if (response.ok) {
        await loadGoals();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  const handleUpdateGoal = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });

      if (response.ok) {
        await loadGoals();
        setEditingGoal(null);
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadGoals();
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
            <p className="text-slate-600 mt-1">
              Defina e acompanhe suas metas de economia, gastos e investimentos
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Meta
          </button>
        </div>

        {/* Goal Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <GoalForm
                goal={editingGoal}
                onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <Plus className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma meta criada ainda
            </h3>
            <p className="text-slate-600 mb-6">
              Comece criando sua primeira meta financeira para acompanhar seu progresso
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Criar Primeira Meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
