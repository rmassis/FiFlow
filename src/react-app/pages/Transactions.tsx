import { useState, useEffect } from "react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { TransactionFilters } from "@/react-app/components/transactions/TransactionFilters";
import { TransactionList } from "@/react-app/components/transactions/TransactionList";
import { TransactionDetailModal } from "@/react-app/components/transactions/TransactionDetailModal";
import { ArrowLeftRight, Loader2, AlertCircle } from "lucide-react";
import type { Transaction } from "@/shared/types";

export interface TransactionFilters {
  type?: 'receita' | 'despesa';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  needsReview?: boolean;
}

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString());
      if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.needsReview) params.append('needsReview', 'true');

      const response = await fetch(`/api/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar transações');
      }

      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Erro ao carregar transações. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar transação');
      }

      await loadTransactions();
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error updating transaction:', err);
      alert('Erro ao atualizar transação');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir transação');
      }

      await loadTransactions();
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Erro ao excluir transação');
    }
  };

  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ArrowLeftRight className="w-8 h-8 text-indigo-600" />
                Transações
              </h1>
              <p className="text-slate-600 mt-2">
                Gerencie e visualize todas as suas transações
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-900 mb-1">Total Receitas</p>
              <p className="text-3xl font-bold text-emerald-700">{formatBRL(totalReceitas)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
              <p className="text-sm font-semibold text-red-900 mb-1">Total Despesas</p>
              <p className="text-3xl font-bold text-red-700">{formatBRL(totalDespesas)}</p>
            </div>
            <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
              saldo >= 0 
                ? 'from-indigo-50 to-purple-50 border-indigo-200'
                : 'from-gray-50 to-slate-50 border-gray-200'
            }`}>
              <p className="text-sm font-semibold text-gray-900 mb-1">Saldo</p>
              <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-indigo-700' : 'text-gray-700'}`}>
                {formatBRL(saldo)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters filters={filters} onFiltersChange={setFilters} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Erro</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Transactions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onSelectTransaction={setSelectedTransaction}
          />
        )}

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
