import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Lock, AlertCircle, Loader2, Save, CheckCircle } from 'lucide-react';

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            setSuccess(true);

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-indigo-100 p-8">

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Lock size={32} className="text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Definir Senha</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        Para garantir seu acesso futuro, defina uma senha segura para sua conta.
                    </p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-3">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Senha Atualizada!</h3>
                        <p className="text-sm">Sua conta está segura.</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-rose-100">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 mt-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Salvar Senha</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdatePasswordModal;
