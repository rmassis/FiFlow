import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

export interface Insight {
  type: 'ANOMALY' | 'BUDGET_WARNING' | 'POSITIVE_PATTERN' | 'INFO';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AiInsightsWidgetProps {
  insights: Insight[];
  isLoading?: boolean;
}

const AiInsightsWidget: React.FC<AiInsightsWidgetProps> = ({ insights, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-3xl shadow-sm animate-pulse h-full">
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-3xl shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Lightbulb size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Insights IA</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Análise proativa das suas finanças</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[300px]">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tudo parece normal por aqui!</p>
          </div>
        ) : (
          insights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-2xl border text-sm flex gap-3 items-start transition-all hover:scale-[1.02] ${
                insight.type === 'ANOMALY' 
                  ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30 text-rose-800 dark:text-rose-200' 
                  : insight.type === 'BUDGET_WARNING'
                  ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {insight.type === 'ANOMALY' && <AlertTriangle size={16} />}
                {insight.type === 'BUDGET_WARNING' && <AlertTriangle size={16} />}
                {insight.type === 'POSITIVE_PATTERN' && <TrendingUp size={16} />}
                {insight.type === 'INFO' && <Lightbulb size={16} />}
              </div>
              <span className="leading-tight">{insight.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AiInsightsWidget;
