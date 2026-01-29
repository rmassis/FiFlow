import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFinanceStore } from "@/react-app/contexts/FinanceContext";
import { UserPlus, Mail, Lock, Loader2, ArrowRight, User } from "lucide-react";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = useFinanceStore(state => state.register);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: regError } = await register(email, password, fullName);
            if (regError) {
                setError(regError.message);
            } else {
                navigate("/");
            }
        } catch (err) {
            setError("Erro ao criar conta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-rose-50">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-gray-200/50 p-12 border border-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/30 rounded-full -ml-16 -mt-16 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-100/30 rounded-full -mr-16 -mb-16 blur-3xl" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-gray-200 mx-auto transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <UserPlus className="w-8 h-8" />
                        </div>

                        <h1 className="text-3xl font-black text-gray-900 text-center tracking-tight mb-2">Crie sua conta</h1>
                        <p className="text-gray-500 font-medium text-center mb-10">Comece sua jornada financeira hoje mesmo</p>

                        <form onSubmit={handleRegister} className="space-y-6">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold animate-in shake duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all font-bold placeholder:text-gray-300 text-gray-900 shadow-inner"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all font-bold placeholder:text-gray-300 text-gray-900 shadow-inner"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 transition-all font-bold placeholder:text-gray-300 text-gray-900 shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Cadastrar
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-gray-500 font-bold text-sm">
                                Já tem uma conta?{" "}
                                <Link to="/login" className="text-gray-900 border-b-2 border-gray-900 hover:opacity-70 transition-opacity">
                                    Faça login
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
