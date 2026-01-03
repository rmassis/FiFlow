import React, { useState, useEffect } from 'react';
import { X, Globe, Check, Coins } from 'lucide-react';

interface RegionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegionModal: React.FC<RegionModalProps> = ({ isOpen, onClose }) => {
    const [currency, setCurrency] = useState('BRL');
    const [language, setLanguage] = useState('pt-BR');

    useEffect(() => {
        const savedCurrency = localStorage.getItem('fiflow_currency');
        if (savedCurrency) setCurrency(savedCurrency);

        // Language is fixed for now as per plan, but we set state for UI
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('fiflow_currency', currency);
        // Trigger a custom event so other components can react if needed
        window.dispatchEvent(new Event('currencyChange'));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Globe size={20} className="text-indigo-600" />
                        Idioma e Moeda
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Language Section - Read Only for now */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Idioma</label>
                        <div className="relative">
                            <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 font-medium flex justify-between items-center opacity-75 cursor-not-allowed">
                                <span>Português (Brasil)</span>
                                <Check size={18} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-1">
                                O idioma é definido automaticamente pela sua região.
                            </p>
                        </div>
                    </div>

                    {/* Currency Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Moeda Principal</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setCurrency('BRL')}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currency === 'BRL'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currency === 'BRL' ? 'bg-indigo-100' : 'bg-slate-100'
                                    }`}>
                                    <span className="text-xs font-bold">R$</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-bold">Real</span>
                                    <span className="block text-[10px] opacity-70">BRL</span>
                                </div>
                                {currency === 'BRL' && <Check size={16} className="ml-auto" />}
                            </button>

                            <button
                                onClick={() => setCurrency('USD')}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${currency === 'USD'
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currency === 'USD' ? 'bg-indigo-100' : 'bg-slate-100'
                                    }`}>
                                    <span className="text-xs font-bold">$</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-bold">Dólar</span>
                                    <span className="block text-[10px] opacity-70">USD</span>
                                </div>
                                {currency === 'USD' && <Check size={16} className="ml-auto" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Coins size={18} />
                        Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegionModal;
