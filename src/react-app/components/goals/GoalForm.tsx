import { useState } from "react";
import { X } from "lucide-react";
import type { Goal, GoalType, GoalRecurrence } from "@/shared/types";

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (goal: Goal) => void;
  onCancel: () => void;
}

const GOAL_TYPES = [
  { value: "economia" as GoalType, label: "Meta de Economia", icon: "💰" },
  { value: "limite_gastos" as GoalType, label: "Limite de Gastos", icon: "🚫" },
  { value: "receita" as GoalType, label: "Meta de Receita", icon: "📈" },
  { value: "investimento" as GoalType, label: "Meta de Investimento", icon: "📊" },
];

const RECURRENCE_OPTIONS = [
  { value: "unica" as GoalRecurrence, label: "Única" },
  { value: "mensal" as GoalRecurrence, label: "Mensal" },
  { value: "trimestral" as GoalRecurrence, label: "Trimestral" },
  { value: "anual" as GoalRecurrence, label: "Anual" },
];

const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Investimentos",
  "Outros",
];

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState<Goal>({
    name: goal?.name || "",
    type: goal?.type || "economia",
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    startDate: goal?.startDate || new Date(),
    endDate: goal?.endDate || new Date(),
    category: goal?.category || "",
    recurrence: goal?.recurrence || "unica",
    notifyAt50: goal?.notifyAt50 || false,
    notifyAt75: goal?.notifyAt75 || false,
    notifyAt90: goal?.notifyAt90 || false,
    notifyOnExceed: goal?.notifyOnExceed || false,
    status: goal?.status || "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {goal ? "Editar Meta" : "Nova Meta"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Nome da Meta */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Nome da Meta
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Guardar para viagem"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Tipo de Meta */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tipo de Meta
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GOAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.value })}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${
                  formData.type === type.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="font-semibold text-sm text-gray-900">
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Valor Alvo */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Valor Alvo
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            R$
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.targetAmount}
            onChange={(e) =>
              setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })
            }
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={(e) =>
              setFormData({ ...formData, startDate: new Date(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={(e) =>
              setFormData({ ...formData, endDate: new Date(e.target.value) })
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>

      {/* Categoria (apenas para Limite de Gastos) */}
      {formData.type === "limite_gastos" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Categoria Relacionada
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Selecione uma categoria</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Recorrência */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Recorrência
        </label>
        <div className="grid grid-cols-4 gap-2">
          {RECURRENCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, recurrence: option.value })}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                ${
                  formData.recurrence === option.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notificações */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Notificações
        </label>
        <div className="space-y-2">
          {[
            { key: "notifyAt50", label: "Notificar ao atingir 50%" },
            { key: "notifyAt75", label: "Notificar ao atingir 75%" },
            { key: "notifyAt90", label: "Notificar ao atingir 90%" },
            { key: "notifyOnExceed", label: "Notificar ao ultrapassar" },
          ].map((notification) => (
            <label
              key={notification.key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData[notification.key as keyof Goal] as boolean}
                onChange={(e) =>
                  setFormData({ ...formData, [notification.key]: e.target.checked })
                }
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {notification.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          {goal ? "Salvar Alterações" : "Criar Meta"}
        </button>
      </div>
    </form>
  );
}
