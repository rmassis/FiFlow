
import React, { useState } from 'react';
import { Target, Wallet, ArrowRight, Check, X } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

interface OnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

const GOALS = [
    { id: 'organize', label: 'Organizar Gastos', icon: Wallet, description: 'Quero ver para onde meu dinheiro vai.' },
    { id: 'save', label: 'Guardar Dinheiro', icon: Target, description: 'Quero criar uma reserva de emergência.' },
    { id: 'invest', label: 'Começar a Investir', icon: ArrowRight, description: 'Quero fazer meu dinheiro render.' },
];

const BANKS = [
    { id: 'nubank', name: 'Nubank', color: '#820ad1' },
    { id: 'itau', name: 'Itaú', color: '#ec7000' },
    { id: 'bradesco', name: 'Bradesco', color: '#cc092f' },
    { id: 'inter', name: 'Inter', color: '#ff7a00' },
    { id: 'bb', name: 'Banco do Brasil', color: '#fbf600' },
    { id: 'caixa', name: 'Caixa', color: '#005ca9' },
    { id: 'other', name: 'Outro', color: '#64748b' },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [accountData, setAccountData] = useState({ bank: '', balance: '' });
    const { addAccount } = useFinance();
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleNext = async () => {
        if (step === 1 && selectedGoal) {
            setStep(2);
        } else if (step === 2) {
            if (!accountData.bank || !accountData.balance) return;

            setLoading(true);
            const selectedBankConfig = BANKS.find(b => b.name === accountData.bank) || BANKS[BANKS.length - 1];

            await addAccount({
                name: `Conta ${accountData.bank}`,
                bankName: accountData.bank,
                type: 'CHECKING',
                balance: parseFloat(accountData.balance.replace(',', '.')),
                accountNumber: '0000', // Mock for basic setup
                color: selectedBankConfig.color
            });
            setLoading(false);
            setStep(3);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Close Button (Skip) */}
                {step < 3 && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* content */}
                <div className="mt-4">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bem-vindo ao FiFlow! 🚀</h2>
                                <p className="text-slate-500 dark:text-slate-400">Para começar, qual é o seu principal objetivo hoje?</p>
                            </div>

                            <div className="grid gap-3">
                                {GOALS.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${selectedGoal === goal.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                                : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${selectedGoal === goal.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                            <goal.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${selectedGoal === goal.id ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>{goal.label}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{goal.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vamos configurar sua conta</h2>
                                <p className="text-slate-500 dark:text-slate-400">Adicione uma conta principal para começar a controlar seu saldo.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selecione seu banco</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {BANKS.slice(0, 6).map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => setAccountData({ ...accountData, bank: b.name })}
                                                className={`p-2 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${accountData.bank === b.name
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 hover:border-indigo-300 text-slate-600'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: b.color }} />
                                                {b.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Saldo Atual (R$)</label>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        className="w-full text-3xl font-bold text-slate-800 p-4 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                                        value={accountData.balance}
                                        onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <Check size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Conta criada com sucesso! 🎉</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Seu dashboard já está atualizado. O FiFlow está pronto para te ajudar a evoluir.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={handleNext}
                        disabled={step === 1 && !selectedGoal || step === 2 && (!accountData.bank || !accountData.balance) || loading}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200"
                    >
                        {loading ? 'Criando...' : step === 3 ? 'Começar a usar' : 'Continuar'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OnboardingWizard;
