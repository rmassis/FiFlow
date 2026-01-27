import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'trimester' | 'year';

interface DateFilterOption {
    id: PeriodType;
    label: string;
}

const PERIOD_OPTIONS: DateFilterOption[] = [
    { id: 'day', label: 'Dia' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'trimester', label: 'Quadrimestre' },
    { id: 'year', label: 'Ano' },
];

export function AdvancedDateFilter() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

    const currentLabel = PERIOD_OPTIONS.find(p => p.id === selectedPeriod)?.label;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all border border-gray-200 shadow-sm min-w-[180px] justify-between group"
            >
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-indigo-50 rounded text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{currentLabel} atual</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animation-fade-in">
                        <div className="p-2">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                                Período de Visualização
                            </div>
                            {PERIOD_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSelectedPeriod(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${selectedPeriod === option.id
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {option.label}
                                    {selectedPeriod === option.id && (
                                        <Check className="w-4 h-4 text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 my-1" />

                        {/* Quick Actions (Mock) */}
                        <div className="p-2 bg-gray-50">
                            <button className="w-full text-xs text-center text-indigo-600 hover:text-indigo-700 font-medium py-1">
                                Personalizar intervalo...
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
