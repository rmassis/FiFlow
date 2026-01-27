import { useState } from "react";
import { X, Save, Trash2, AlertCircle, Calendar } from "lucide-react";
import type { Transaction } from "@/shared/types";

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIAS_PRINCIPAIS = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Investimentos',
  'Renda',
  'Outros',
];

const SUBCATEGORIAS: Record<string, string[]> = {
  'Alimentação': ['Supermercado', 'Restaurante', 'Fast Food', 'Delivery', 'Padaria'],
  'Transporte': ['Combustível', 'Uber/Taxi', 'Ônibus', 'Estacionamento', 'Manutenção'],
  'Moradia': ['Aluguel', 'Condomínio', 'Energia', 'Água', 'Internet', 'Gás'],
  'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Exames', 'Academia'],
  'Educação': ['Mensalidade', 'Livros', 'Cursos', 'Material'],
  'Lazer': ['Cinema', 'Streaming', 'Viagem', 'Eventos', 'Hobbies'],
  'Vestuário': ['Roupas', 'Calçados', 'Acessórios'],
  'Investimentos': ['Ações', 'Fundos', 'Tesouro', 'Cripto'],
  'Renda': ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  'Outros': ['Não classificado'],
};

export function TransactionDetailModal({ transaction, onClose, onUpdate, onDelete }: TransactionDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    subcategory: transaction.subcategory,
    date: new Date(transaction.date).toISOString().split('T')[0],
  });

  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSave = () => {
    if (transaction.id) {
      onUpdate(transaction.id, {
        ...formData,
        date: new Date(formData.date),
      });
    }
  };

  const handleDelete = () => {
    if (transaction.id) {
      onDelete(transaction.id);
    }
  };

  const availableSubcategories = SUBCATEGORIAS[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Transação' : 'Detalhes da Transação'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Alert for needs review */}
          {transaction.needsReview && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Esta transação precisa de revisão</p>
                <p className="text-sm text-yellow-700">
                  A categorização automática identificou esta transação com baixa confiança.
                  Verifique os dados e faça as correções necessárias.
                </p>
              </div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    category: e.target.value,
                    subcategory: SUBCATEGORIAS[e.target.value]?.[0] || ''
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {CATEGORIAS_PRINCIPAIS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subcategoria
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Descrição</p>
                  <p className="text-base text-gray-900">{transaction.description}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Data</p>
                  <p className="text-base text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Tipo</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    transaction.type === 'receita'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Valor</p>
                  <p className={`text-2xl font-bold ${
                    transaction.type === 'receita' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatBRL(transaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Categoria</p>
                  <p className="text-base text-gray-900">{transaction.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Subcategoria</p>
                  <p className="text-base text-gray-900">{transaction.subcategory}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Informações de Importação</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Importado de</p>
                    <p className="text-sm text-gray-900">{transaction.importedFrom || 'Manual'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Data de importação</p>
                    <p className="text-sm text-gray-900">
                      {new Date(transaction.importedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {transaction.confidence > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Confiança da categorização</p>
                      <p className="text-sm text-gray-900">{Math.round(transaction.confidence * 100)}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
            >
              Cancelar
            </button>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
