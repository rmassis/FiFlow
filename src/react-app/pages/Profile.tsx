
import { useState } from "react";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { PersonalDataForm } from "@/react-app/components/profile/PersonalDataForm";
import { AccountsManager } from "@/react-app/components/profile/AccountsManager";
import { User, CreditCard, ShieldAlert, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Profile() {
    const [activeTab, setActiveTab] = useState<'profile' | 'accounts'>('profile');
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Initial, 2: Final confirmation

    const handleFullReset = async () => {
        setIsResetting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch("/api/system/reset", {
                method: "POST",
                headers: {
                    "Authorization": session?.access_token ? `Bearer ${session.access_token}` : ""
                }
            });
            if (response.ok) {
                // Success - reload page to clear all client states
                window.location.href = "/";
            } else {
                alert("Erro ao resetar dados. Tente novamente.");
                setIsResetting(false);
            }
        } catch (error) {
            console.error("Reset error:", error);
            alert("Erro de conexão ao tentar resetar.");
            setIsResetting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto pb-40">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Área do Usuário</h1>
                    <p className="text-gray-500 font-medium mt-2">Gerencie seus dados pessoais e contas financeiras</p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl w-fit mb-12 shadow-inner">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'profile'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Dados Cadastrais
                    </button>
                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === 'accounts'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Contas e Cartões
                    </button>
                </div>

                {/* Content Area */}
                <div className="space-y-16">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'profile' ? (
                            <PersonalDataForm />
                        ) : (
                            <AccountsManager />
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-gray-100 pt-16">
                        <div className="bg-rose-50/50 border border-rose-100 rounded-[2.5rem] p-10 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100/20 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:scale-110" />

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="max-w-xl text-center md:text-left">
                                    <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                                        <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-black text-rose-900 tracking-tight">Zona de Perigo</h2>
                                    </div>
                                    <h3 className="text-lg font-bold text-rose-900 mb-2">Resetar todo o aplicativo</h3>
                                    <p className="text-rose-700/70 font-medium leading-relaxed">
                                        Esta ação irá apagar **permanentemente** todas as suas transações, categorias, contas, cartões, metas e orçamentos. Não há como desfazer esta operação.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsResetModalOpen(true);
                                        setResetStep(1);
                                    }}
                                    className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-rose-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Apagar Tudo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reset Confirmation Modal */}
                {isResetModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-2 bg-rose-600" />

                            <div className="flex items-center justify-between mb-8">
                                <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                                <button
                                    onClick={() => !isResetting && setIsResetModalOpen(false)}
                                    className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            {resetStep === 1 ? (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Confirmar Reset?</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        Você está prestes a apagar todos os seus dados financeiros. Deseja prosseguir com o pedido de exclusão total?
                                    </p>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => setIsResetModalOpen(false)}
                                            className="flex-1 py-4 text-gray-500 font-black text-sm hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => setResetStep(2)}
                                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-200 hover:bg-black transition-all uppercase tracking-widest"
                                        >
                                            Prosseguir
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-rose-600 tracking-tight">AVISO FINAL!</h2>
                                    <p className="text-gray-700 font-bold leading-relaxed">
                                        ESTA AÇÃO É IRREVERSÍVEL. Todos os 470+ lançamentos e configurações serão perdidos para sempre.
                                    </p>
                                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                        <p className="text-rose-600 text-[11px] font-black uppercase text-center tracking-widest">
                                            TEM CERTEZA ABSOLUTA?
                                        </p>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            disabled={isResetting}
                                            onClick={() => setIsResetModalOpen(false)}
                                            className="flex-1 py-4 text-gray-500 font-black text-sm hover:bg-gray-50 rounded-2xl transition-all uppercase tracking-widest"
                                        >
                                            Voltar
                                        </button>
                                        <button
                                            disabled={isResetting}
                                            onClick={handleFullReset}
                                            className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {isResetting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Limpando...
                                                </>
                                            ) : (
                                                "SIM, APAGAR TUDO"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
