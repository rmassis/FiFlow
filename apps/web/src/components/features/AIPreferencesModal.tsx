import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageSquare, Save } from 'lucide-react';

interface AIPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIPreferencesModal: React.FC<AIPreferencesModalProps> = ({ isOpen, onClose }) => {
    const [tone, setTone] = useState<'friendly' | 'formal'>('friendly');
    const [detailLevel, setDetailLevel] = useState<'concise' | 'detailed'>('concise');

    useEffect(() => {
        const savedTone = localStorage.getItem('fiflow_ai_tone') as 'friendly' | 'formal';
        const savedDetail = localStorage.getItem('fiflow_ai_detail') as 'concise' | 'detailed';

        if (savedTone) setTone(savedTone);
        if (savedDetail) setDetailLevel(savedDetail);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('fiflow_ai_tone', tone);
        localStorage.setItem('fiflow_ai_detail', detailLevel);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles size={20} className="text-indigo-600" />
                        IA FinanceFlow Assistant
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Tone Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <MessageSquare size={16} />
                            Tom da Conversa
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTone('friendly')}
                                className={`p-4 rounded-xl border text-center transition-all ${tone === 'friendly'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">😊</div>
                                <div className="font-bold text-sm">Amigável</div>
                                <div className="text-[10px] opacity-70 mt-1">Descontraído e motivador</div>
                            </button>

                            <button
                                onClick={() => setTone('formal')}
                                className={`p-4 rounded-xl border text-center transition-all ${tone === 'formal'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">👔</div>
                                <div className="font-bold text-sm">Formal</div>
                                <div className="text-[10px] opacity-70 mt-1">Direto e profissional</div>
                            </button>
                        </div>
                    </div>

                    {/* Detail Level Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">Nível de Detalhe</label>
                        <div className="bg-slate-100 p-1 rounded-xl flex">
                            <button
                                onClick={() => setDetailLevel('concise')}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${detailLevel === 'concise'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Conciso
                            </button>
                            <button
                                onClick={() => setDetailLevel('detailed')}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${detailLevel === 'detailed'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Detalhado
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">
                            {detailLevel === 'concise'
                                ? 'Respostas curtas e diretas ao ponto.'
                                : 'Explicações completas com contexto financeiro.'}
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        Salvar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIPreferencesModal;
