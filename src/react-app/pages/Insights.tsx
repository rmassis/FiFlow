import { useState, useEffect } from "react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { InsightCard } from "@/react-app/components/insights/InsightCard";
import { Sparkles, Loader2, AlertCircle, History } from "lucide-react";
import type { Insight } from "@/shared/types";

type ViewMode = 'current' | 'history';

export function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/insights');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Erro ao carregar insights. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar insights');
      }

      await loadInsights();
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Erro ao gerar insights. Verifique se a chave OPENAI_API_KEY está configurada.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`/api/insights/${id}/read`, { method: 'PATCH' });
      setInsights(insights.map(i => 
        i.id === id ? { ...i, is_read: true } : i
      ));
    } catch (err) {
      console.error('Error marking insight as read:', err);
    }
  };

  const handleMarkAsApplied = async (id: number) => {
    try {
      await fetch(`/api/insights/${id}/apply`, { method: 'PATCH' });
      setInsights(insights.map(i => 
        i.id === id ? { ...i, is_applied: true } : i
      ));
    } catch (err) {
      console.error('Error marking insight as applied:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/insights/${id}`, { method: 'DELETE' });
      setInsights(insights.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting insight:', err);
    }
  };

  const currentInsights = insights.filter(i => !i.is_applied);
  const historyInsights = insights.filter(i => i.is_applied);

  const displayedInsights = viewMode === 'current' ? currentInsights : historyInsights;
  const sortedInsights = [...displayedInsights].sort((a, b) => {
    const impactOrder = { alto: 3, médio: 2, baixo: 1 };
    return impactOrder[b.impacto] - impactOrder[a.impacto];
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-indigo-600" />
                Insights Financeiros
              </h1>
              <p className="text-slate-600 mt-2">
                Análises inteligentes e sugestões personalizadas para suas finanças
              </p>
            </div>
            <button
              onClick={generateInsights}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Novos Insights
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('current')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'current'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Insights Atuais ({currentInsights.length})
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewMode === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico ({historyInsights.length})
          </button>
        </div>

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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : sortedInsights.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {viewMode === 'current' 
                ? 'Nenhum insight disponível'
                : 'Nenhum insight no histórico'}
            </h3>
            <p className="text-slate-600 mb-6">
              {viewMode === 'current'
                ? 'Clique em "Gerar Novos Insights" para analisar suas transações'
                : 'Insights aplicados aparecerão aqui'}
            </p>
            {viewMode === 'current' && !isGenerating && (
              <button
                onClick={generateInsights}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Gerar Insights Agora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsApplied={handleMarkAsApplied}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
