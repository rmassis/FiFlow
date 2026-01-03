
import React, { useState } from 'react';
import { Target, Wallet, ArrowRight, Check, X, CreditCard, Building2 } from 'lucide-react';
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

// Expanded Bank List
const BANKS = [
  { id: 'nubank', name: 'Nubank', color: '#820ad1' },
  { id: 'itau', name: 'Itaú', color: '#ec7000' },
  { id: 'bradesco', name: 'Bradesco', color: '#cc092f' },
  { id: 'santander', name: 'Santander', color: '#ea0000' },
  { id: 'inter', name: 'Inter', color: '#ff7a00' },
  { id: 'bb', name: 'Banco do Brasil', color: '#fbf600' },
  { id: 'caixa', name: 'Caixa', color: '#005ca9' },
  { id: 'btg', name: 'BTG Pactual', color: '#000028' },
  { id: 'c6', name: 'C6 Bank', color: '#252525' },
  { id: 'xp', name: 'XP', color: '#000000' },
  { id: 'neon', name: 'Neon', color: '#00bdae' },
  { id: 'next', name: 'Next', color: '#00ff5f' },
  { id: 'sicoob', name: 'Sicoob', color: '#003641' },
  { id: 'sicredi', name: 'Sicredi', color: '#3fb03e' },
  { id: 'other', name: 'Outro', color: '#64748b' },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Account Type Selection
  const [accountType, setAccountType] = useState<'CHECKING' | 'CREDIT'>('CHECKING');

  const [accountData, setAccountData] = useState({
    bank: '',
    balance: '', // Used for checking balance OR credit limit
    name: ''
  });

  const { addAccount, addCard } = useFinance();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    } else if (step === 2) {
      if (!accountData.bank) return;

      setLoading(true);
      const selectedBankConfig = BANKS.find(b => b.name === accountData.bank) || BANKS[BANKS.length - 1];
      const numericAmount = accountData.balance ? parseFloat(accountData.balance.replace(',', '.')) : 0;

      try {
        if (accountType === 'CHECKING') {
          await addAccount({
            name: accountData.name || `Conta ${accountData.bank} `,
            bankName: accountData.bank,
            type: 'CHECKING',
            balance: numericAmount,
            accountNumber: '0000',
            color: selectedBankConfig.color
          });
        } else {
          // Create Credit Card
          await addCard({
            name: accountData.name || `Cartão ${accountData.bank} `,
            brand: 'MASTERCARD', // Default guess, user can edit later
            lastDigits: '****',
            limit: numericAmount,
            usedLimit: 0,
            currentInvoice: 0,
            closingDay: 1,
            dueDay: 10,
            color: selectedBankConfig.color
          });
        }

        setLoading(false);
        setStep(3);
      } catch (error) {
        console.error("Error creating onboarding account", error);
        setLoading(false);
      }

    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}% ` }}
          />
        </div>

        {/* Close Button (Skip) */}
        {step < 3 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        {/* content */}
        <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar px-1">
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
                    className={`flex items - center gap - 4 p - 4 rounded - 2xl border - 2 text - left transition - all ${selectedGoal === goal.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                      } `}
                  >
                    <div className={`p - 3 rounded - xl ${selectedGoal === goal.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'} `}>
                      <goal.icon size={24} />
                    </div>
                    <div>
                      <h3 className={`font - bold ${selectedGoal === goal.id ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'} `}>{goal.label}</h3>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adicione sua primeira conta</h2>
                <p className="text-slate-500 dark:text-slate-400">Não se preocupe, você pode adicionar outras depois.</p>
              </div>

              {/* Type Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setAccountType('CHECKING')}
                  className={`flex - 1 py - 2 px - 4 rounded - lg text - sm font - semibold transition - all flex items - center justify - center gap - 2 ${accountType === 'CHECKING'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    } `}
                >
                  <Building2 size={16} />
                  Conta Bancária
                </button>
                <button
                  onClick={() => setAccountType('CREDIT')}
                  className={`flex - 1 py - 2 px - 4 rounded - lg text - sm font - semibold transition - all flex items - center justify - center gap - 2 ${accountType === 'CREDIT'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    } `}
                >
                  <CardIcon size={16} />
                  Cartão de Crédito
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selecione a instituição</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                    {BANKS.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setAccountData({ ...accountData, bank: b.name })}
                        className={`p - 2 rounded - xl border text - xs font - medium transition - all flex flex - col items - center gap - 2 text - center h - [80px] justify - center ${accountData.bank === b.name
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          } `}
                      >
                        <div className="w-8 h-8 rounded-full shadow-sm shrink-0 flex items-center justify-center text-white font-bold text-[10px]" style={{ backgroundColor: b.color }}>
                          {/* Fallback for no logo */}
                          {b.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="leading-tight line-clamp-2">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {accountType === 'CHECKING' ? 'Saldo Atual (Opcional)' : 'Limite do Cartão (Opcional)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      className="w-full text-lg font-bold text-slate-800 dark:text-white pl-12 pr-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 dark:bg-slate-800 placeholder:text-slate-300"
                      value={accountData.balance}
                      onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
                    />
                  </div>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tudo pronto! 🎉</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  {accountType === 'CHECKING'
                    ? 'Sua conta foi criada. Agora você pode adicionar transações a ela.'
                    : 'Cartão adicionado. Controle o limite e faturas no menu Cartões.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleNext}
            disabled={step === 1 && !selectedGoal || step === 2 && !accountData.bank || loading}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 cursor-pointer"
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

