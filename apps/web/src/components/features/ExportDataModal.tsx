import React, { useState } from 'react';
import { X, Download, Database, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
    const { profile } = useSubscription();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleExport = async () => {
        setLoading(true);
        setStatus('idle');
        try {
            // Fetch all critical user data
            const { data: transactions } = await supabase.from('transactions').select('*');
            const { data: budgets } = await supabase.from('budgets').select('*');
            const { data: goals } = await supabase.from('goals').select('*');
            const { data: categories } = await supabase.from('categories').select('*');

            const exportData = {
                user: profile,
                exported_at: new Date().toISOString(),
                stats: {
                    transactions: transactions?.length || 0,
                    budgets: budgets?.length || 0,
                    goals: goals?.length || 0
                },
                data: {
                    transactions,
                    budgets,
                    goals,
                    categories
                }
            };

            // Create blob and download link
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fiflow_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database size={20} className="text-indigo-600" />
                        Backup e Dados
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileJson size={40} className="text-indigo-600" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Exportar seus Dados</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Baixe uma cópia completa de suas transações, orçamentos e metas em formato JSON.
                            Seus dados estão seguros na nuvem, mas você pode guardar uma cópia local por segurança.
                        </p>
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold bg-emerald-50 py-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                            <CheckCircle size={20} />
                            Download Iniciado!
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center justify-center gap-2 text-rose-600 font-bold bg-rose-50 py-3 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle size={20} />
                            Erro ao exportar dados
                        </div>
                    )}

                    <button
                        onClick={handleExport}
                        disabled={loading || status === 'success'}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Preparando Arquivo...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Baixar Backup Agora
                            </>
                        )}
                    </button>

                    <div className="text-[10px] text-slate-400 font-medium">
                        Formato: JSON • Inclui todas as transações
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportDataModal;
