
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, MessageCircle } from 'lucide-react';
import { getFinancialAdvice } from '../../services/geminiService';
import { useFinance } from '../../contexts/FinanceContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { ChatMessage } from '../../types';


const AIAssistant: React.FC = () => {
  const { transactions, budgets, goals } = useFinance();
  const { isFree } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou seu assistente FinanceFlow Pro. Como posso ajudar com suas finanças hoje?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getFinancialAdvice(input, {
      transactions: transactions,
      budget: budgets,
      goals: goals
    });

    setMessages(prev => [...prev, { role: 'model', text: response || 'Não consegui processar sua dúvida agora.', timestamp: new Date() }]);
    setIsLoading(false);
  };


  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-300 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
      >
        <Bot size={32} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 duration-300">
          <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold">Agente de IA</h3>
                <span className="text-xs text-indigo-100 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  Online agora
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl">
              <X size={20} />
            </button>
          </div>

          {!isFree ? (
            <>
              <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <div className="relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Pergunte sobre seus dados..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Powered by FinanceFlow Gemini Core
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                <Sparkles size={40} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Recurso Premium</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  A nossa Inteligência Artificial analisa seus gastos e dá dicas personalizadas. Faça o upgrade para desbloquear!
                </p>
              </div>
              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                Assinar Premium
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIAssistant;
