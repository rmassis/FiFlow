
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageCircle, Play, CheckCircle2 } from 'lucide-react';
import { processUserCommand } from '../../services/aiAutopilotService';
import { useFinance } from '../../contexts/FinanceContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { ChatMessage } from '../../types';

const AIAssistant: React.FC = () => {
  const { transactions = [], budgets = [], goals = [], categories = [], updateBudget, addGoal, addTransaction } = useFinance();
  const { isFree } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou seu Autopilot Financeiro. Posso criar orçamentos, lançar gastos ou analisar suas finanças. O que manda hoje?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = async (action: any) => {
    try {
      switch (action.type) {
        case 'CREATE_BUDGET':
          // Find category ID by name
          const catName = action.payload.category;
          const category = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
          if (category && updateBudget) {
            await updateBudget(category.id, action.payload.amount);
            return true;
          }
          return false;
        case 'CREATE_GOAL':
          if (addGoal) {
            await addGoal({
              name: action.payload.name,
              target: action.payload.targetAmount,
              current: 0,
              deadline: action.payload.deadline || new Date().toISOString(),
            });
            return true;
          }
          return false;
        case 'ADD_TRANSACTION':
          if (addTransaction) {
            await addTransaction({
              description: action.payload.description,
              amount: action.payload.amount,
              type: action.payload.type || 'EXPENSE',
              category: action.payload.category || 'Outros',
              date: new Date().toISOString().split('T')[0],
              status: 'PAID', // Assume paid for quick adds
              account: 'Carteira' // Default
            });
            return true;
          }
          return false;
        default:
          return false;
      }
    } catch (e) {
      console.error("Erro ao executar ação AI:", e);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processUserCommand(input, {
        transactions,
        budgets,
        categories,
        goals
      }, messages);

      const aiMsg: ChatMessage = { role: 'model', text: response.message, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);

      if (response.action) {
        const success = await handleAction(response.action);
        if (success) {
          setMessages(prev => [...prev, {
            role: 'model',
            text: '✅ Ação executada com sucesso!',
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            role: 'model',
            text: '⚠️ Tentei executar a ação, mas encontrei um problema (talvez a categoria não exista?).',
            timestamp: new Date()
          }]);
        }
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um erro de conexão.', timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/20 flex items-center justify-center hover:scale-105 transition-all active:scale-95 z-40 group"
        title="AI Autopilot"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-[400px] h-[600px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-slate-900/5">
          {/* Header with Glass Effect */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between relative overflow-hidden">

            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Autopilot</h3>
                <span className="text-[11px] text-indigo-100 flex items-center gap-1.5 font-medium opacity-90">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  Online e pronto
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {!isFree ? (
            <>
              <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'model' && (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-2 mt-2 shrink-0">
                        <Bot size={14} />
                      </div>
                    )}
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1.5 border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ex: Definir orçamento de alimentação..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-200/50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
              {/* Same Free Plan view */}
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <Sparkles size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Modo Autopilot</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automatize suas finanças. O Autopilot cria orçamentos, categoriza gastos e dá insights em tempo real.
                </p>
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Ativar Autopilot Premium
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;

