import { useState } from "react";
import { ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboard, PeriodType } from "@/react-app/contexts/DashboardContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
    const { periodType, setPeriodType, navigatePeriod, selectedDate, dateRange } = useDashboard();

    const currentLabel = PERIOD_OPTIONS.find(p => p.id === periodType)?.label;

    const formatDateLabel = () => {
        if (periodType === 'day') return format(selectedDate, "dd 'de' MMMM", { locale: ptBR });
        if (periodType === 'month') return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
        if (periodType === 'year') return format(selectedDate, "yyyy");
        // For ranges
        return `${format(dateRange.start, "dd/MM")} - ${format(dateRange.end, "dd/MM")}`;
    };

    return (
        <div className="flex items-center gap-2">
            {/* Navigation Controls */}
            <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm p-1">
                <button
                    onClick={() => navigatePeriod('prev')}
                    className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-900 min-w-[120px] text-center capitalize">
                    {formatDateLabel()}
                </span>
                <button
                    onClick={() => navigatePeriod('next')}
                    className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Period Type Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all border border-gray-200 shadow-sm group"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{currentLabel}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animation-fade-in">
                            <div className="p-1">
                                {PERIOD_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setPeriodType(option.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${periodType === option.id
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {option.label}
                                        {periodType === option.id && (
                                            <Check className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
