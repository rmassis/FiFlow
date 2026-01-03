import React, { useState } from 'react';
import { X, ShieldAlert, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface AdminAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const { error } = await supabase.functions.invoke('invite-privilege-user', {
                body: {
                    email,
                    redirectTo: window.location.origin + '?update_password=true'
                }
            });

            if (error) throw error;

            setStatus('success');
            setEmail('');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 3000);
        } catch (error: any) {
            console.error('Invite failed:', error);
            setStatus('error');
            // Mensagem amigável para erro provável de usuário existente
            if (error.message?.includes('FunctionsHttpError') || error.status === 400 || error.status === 422) {
                setErrorMessage('Não foi possível enviar o convite. Verifique se o e-mail já está cadastrado.');
            } else {
                setErrorMessage(error.message || 'Falha ao processar convite.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-indigo-100">
                <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/50 rounded-t-[30px]">
                    <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                        <ShieldAlert size={20} className="text-indigo-600" />
                        Acesso Administrativo
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-indigo-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-sm">
                            <UserPlus size={32} className="text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Convidar Usuário VIP</h3>
                        <p className="text-sm text-slate-500">
                            Adicione o e-mail abaixo. O usuário receberá um convite e terá <strong>acesso PRO automático</strong> ao se cadastrar.
                        </p>
                    </div>

                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                E-mail do Convidado
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>

                        {status === 'success' && (
                            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                <CheckCircle size={20} className="shrink-0" />
                                <div>
                                    <span className="font-bold block">Convite Enviado!</span>
                                    Usuário adicionado à lista VIP.
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex items-center gap-3 bg-rose-50 text-rose-700 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0" />
                                <div>
                                    <span className="font-bold block">Erro</span>
                                    {errorMessage}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || status === 'success'}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={20} />
                                    Enviar Convite VIP
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAccessModal;
