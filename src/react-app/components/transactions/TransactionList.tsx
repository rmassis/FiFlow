import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  ShoppingCart,
  Home,
  Car,
  Heart,
  GraduationCap,
  Coffee,
  Shirt,
  TrendingUp,
  Sparkles
} from "lucide-react";
import type { Transaction } from "@/shared/types";

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Alimentação': ShoppingCart,
  'Moradia': Home,
  'Transporte': Car,
  'Saúde': Heart,
  'Educação': GraduationCap,
  'Lazer': Coffee,
  'Vestuário': Shirt,
  'Investimentos': TrendingUp,
  'Renda': Sparkles,
};

export function TransactionList({ transactions, onSelectTransaction }: TransactionListProps) {
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || ShoppingCart;
    return Icon;
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <ArrowUpRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Nenhuma transação encontrada
        </h3>
        <p className="text-slate-600">
          Ajuste os filtros ou importe transações para começar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const Icon = getCategoryIcon(transaction.category);
              
              return (
                <tr
                  key={transaction.id}
                  onClick={() => onSelectTransaction(transaction)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'receita'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'receita' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.subcategory && (
                          <div className="text-xs text-gray-500">
                            {transaction.subcategory}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{transaction.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-base font-bold ${
                      transaction.type === 'receita'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'receita' ? '+' : '-'} {formatBRL(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {transaction.needsReview && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Revisar
                        </span>
                      )}
                      {transaction.confidence < 0.7 && !transaction.needsReview && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                          Confiança: {Math.round(transaction.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Mostrando {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
        </p>
      </div>
    </div>
  );
}
