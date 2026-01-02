
import React, { useState, useEffect } from 'react';
import {
  Upload, X, FileText, Table, FileCode, Trash2, Wallet,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles,
  AlertTriangle, Globe, Link as LinkIcon, Lock
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { categorizeTransactions, TransactionInput } from '../../services/categorizationAgent';
import { belvoService } from '../../services/belvoService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: PreviewTransaction[], accountId: string) => void;
}

interface PreviewTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  type: 'INCOME' | 'EXPENSE';
  confidence: 'alta' | 'media' | 'baixa';
}

const MOCK_RAW_TRANSACTIONS: TransactionInput[] = [
  { id: '101', data: '10/03/2025', descricao: 'UBER *TRIP SAO PAULO BR', valor: 24.90, banco: 'Nubank' },
  { id: '102', data: '10/03/2025', descricao: 'RESTAURANTE COCO BAMBU', valor: 156.00, banco: 'Nubank' },
  { id: '103', data: '11/03/2025', descricao: 'DROGASIL SAO PAULO', valor: 89.45, banco: 'Nubank' },
  { id: '104', data: '12/03/2025', descricao: 'SALARIO MENSAL EMPRESA X', valor: 5200.00, banco: 'Nubank' },
  { id: '105', data: '12/03/2025', descricao: 'NETFLIX.COM SAO PAULO', valor: 55.90, banco: 'Nubank' },
  { id: '106', data: '13/03/2025', descricao: 'POSTO IPIRANGA 123', valor: 240.00, banco: 'Nubank' },
  { id: '107', data: '14/03/2025', descricao: 'PIX ENVIADO JOAO SILVA', valor: 150.00, banco: 'Nubank' },
  { id: '108', data: '14/03/2025', descricao: 'AMAZON MARKETPLACE', valor: 89.90, banco: 'Nubank' },
];

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const { accounts, addAccount } = useFinance();
  const { isPro, isFree } = useSubscription();
  const [tab, setTab] = useState<'files' | 'belvo'>('files');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTransaction[]>([]);
  const [isBelvoLoading, setIsBelvoLoading] = useState(false);

  // Auto-select "Create automatically" if no accounts exist
  useEffect(() => {
    if (accounts.length === 0 && !selectedAccountId) {
      setSelectedAccountId('AUTO_CREATE');
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (isOpen && tab === 'belvo') {
      const script = document.createElement('script');
      script.src = "https://cdn.belvo.io/belvo-widget-1-stable.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        const existingScript = document.querySelector('script[src="https://cdn.belvo.io/belvo-widget-1-stable.js"]');
        if (existingScript) document.body.removeChild(existingScript);
      };
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handleOpenBelvo = async () => {
    setIsBelvoLoading(true);
    try {
      const accessToken = await belvoService.getAccessToken();

      // @ts-ignore
      if (window.belvoSDK) {
        // @ts-ignore
        window.belvoSDK.createWidget(accessToken, {
          callback: async (link: string, institution: string) => {
            console.log('Belvo Success:', link, institution);
            handleBelvoSync(link);
          },
          onExit: (data: any) => console.log('Belvo Exit:', data),
          onEvent: (data: any) => console.log('Belvo Event:', data),
        }).build();
      } else {
        throw new Error('Belvo SDK not loaded yet');
      }

    } catch (error) {
      console.error('Belvo error:', error);
      alert('Erro ao iniciar Open Finance. Verifique suas credenciais Belvo no arquivo .env');
    } finally {
      setIsBelvoLoading(false);
    }
  };

  const handleBelvoSync = async (linkId: string) => {
    setIsAnalyzing(true);
    try {
      let finalAccountId = selectedAccountId;

      // Handle Automatic Account Creation
      if (selectedAccountId === 'AUTO_CREATE') {
        const belvoAccounts = await belvoService.getAccounts(linkId);
        if (belvoAccounts && belvoAccounts.length > 0) {
          const firstAcc = belvoAccounts[0];

          const newAcc = await addAccount({
            name: `${firstAcc.institution.name} - ${firstAcc.number || '001'}`,
            bankName: firstAcc.institution.name,
            type: 'CHECKING',
            balance: firstAcc.balance?.current || 0,
            color: '#6366f1'
          });

          if (newAcc) {
            finalAccountId = newAcc.id;
            setSelectedAccountId(newAcc.id);
          }
        }
      }

      const dateTo = new Date().toISOString().split('T')[0];
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const transactions = await belvoService.getTransactions(linkId, dateFrom, dateTo);

      const mappedPreview: PreviewTransaction[] = (transactions || []).map((t: any) => ({
        id: t.id,
        date: t.value_date,
        description: t.description,
        amount: Math.abs(t.amount),
        category: t.category || 'OUTROS',
        type: t.type === 'INFLOW' ? 'INCOME' : 'EXPENSE',
        confidence: 'alta'
      }));

      setPreviewData(mappedPreview);
      setStep('preview');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Erro ao sincronizar dados do banco. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      let mappedPreview: PreviewTransaction[] = [];

      if (isFree) {
        // Free Plan: Basic Import without AI
        mappedPreview = MOCK_RAW_TRANSACTIONS.map(t => ({
          id: t.id,
          date: t.data,
          description: t.descricao,
          amount: t.valor,
          category: 'A CLASSIFICAR', // Manual categorization required
          subcategory: undefined,
          type: 'EXPENSE',
          confidence: 'baixa'
        }));
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        // Premium/Pro Plan: AI Categorization
        const result = await categorizeTransactions(MOCK_RAW_TRANSACTIONS);
        mappedPreview = result.transacoes_categorizadas.map(t => ({
          id: t.id,
          date: t.data,
          description: t.descricao,
          amount: t.valor,
          category: t.categoria_principal,
          subcategory: t.classificacao,
          type: t.categoria_principal.includes('RECEITAS') || t.categoria_principal.includes('Salário') ? 'INCOME' : 'EXPENSE',
          confidence: t.confianca
        }));
      }

      setPreviewData(mappedPreview);
      setStep('preview');
    } catch (error) {
      console.error("Falha na análise:", error);
      alert("Houve um erro ao processar os arquivos.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (previewData.length > 0 && selectedAccountId) {
      onImport(previewData, selectedAccountId);
      setFiles([]);
      setSelectedAccountId('');
      setStep('upload');
      setPreviewData([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white w-full ${step === 'preview' ? 'max-w-5xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 transition-all overflow-hidden`}>

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center bg-white flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {step === 'upload' ? 'Importar Dados' : 'Conferência Inteligente'}
              {step === 'preview' && <Sparkles size={20} className="text-purple-500 animate-pulse" />}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === 'upload' ? 'Escolha o método de importação' : 'Verifique a categorização realizada pela IA'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {step === 'upload' && (
          <div className="px-8 flex gap-4 border-b border-slate-100">
            <button
              onClick={() => setTab('files')}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${tab === 'files' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}
            >
              Arquivos (OFX, CSV)
            </button>
            <button
              onClick={() => setTab('belvo')}
              className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${tab === 'belvo' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}
            >
              <Globe size={16} />
              Open Finance
              {!isPro && <Lock size={12} className="text-amber-500" />}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
          {step === 'upload' ? (
            tab === 'files' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* File Upload UI */}
                <div
                  className={`min-h-[250px] lg:h-full border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-6 text-center relative ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".csv,.ofx,.pdf,.xml,.xlsx"
                    multiple
                    onChange={handleChange}
                  />
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4 pointer-events-none">
                    <Upload size={28} />
                  </div>
                  <p className="text-base font-semibold text-slate-800 mb-1 pointer-events-none">Arraste seus arquivos</p>
                  <p className="text-xs text-slate-500 mb-4 pointer-events-none">CSV, OFX, PDF, XML, XLSX</p>
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 pointer-events-none">
                    Selecionar Arquivos
                  </button>
                </div>

                {/* Config UI */}
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Vincular à Conta</label>
                    <div className="relative">
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                      >
                        <option value="" disabled>Selecione uma conta...</option>
                        {accounts.length === 0 && (
                          <option value="AUTO_CREATE">✨ Criar conta automaticamente</option>
                        )}
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.bankName})
                          </option>
                        ))}
                      </select>
                      <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-4 pr-2 overflow-y-auto max-h-[150px]">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                        <button onClick={() => removeFile(index)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={files.length === 0 || !selectedAccountId || isAnalyzing}
                    className={`w-full mt-auto py-3 font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${isFree ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : (isFree ? <FileText size={18} /> : <Sparkles size={18} />)}
                    <span>
                      {isAnalyzing ? 'Processando...' : (isFree ? 'Importar Arquivo (Básico)' : 'Analisar com IA')}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Belvo Open Finance UI */
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                {!isPro ? (
                  <div className="max-w-md mx-auto p-4">
                    <div className="w-20 h-20 bg-amber-100 rounded-[28px] flex items-center justify-center text-amber-600 mb-6 font-bold mx-auto">
                      <Lock size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Recurso Pro</h3>
                    <p className="text-sm text-slate-500 mb-8">
                      A sincronização automática via Open Finance é exclusiva para assinantes Pro. Conecte seus bancos automaticamente e nunca mais importe arquivos manualmente.
                    </p>
                    <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl">
                      Fazer Upgrade para Pro
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-indigo-100 rounded-[28px] flex items-center justify-center text-indigo-600 mb-6 font-bold">
                      <Globe size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Conexão via Open Finance</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8">
                      Conecte sua conta bancária de forma segura e deixe o FiFlow importar e categorizar suas transações automaticamente.
                    </p>
                    <div className="w-full max-w-sm space-y-4">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Vincular à Conta FiFlow</label>
                        <div className="relative">
                          <select
                            value={selectedAccountId}
                            onChange={(e) => setSelectedAccountId(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                          >
                            <option value="" disabled>Selecione uma conta...</option>
                            {accounts.length === 0 && (
                              <option value="AUTO_CREATE">✨ Criar conta automaticamente</option>
                            )}
                            {accounts.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.name} ({account.bankName})
                              </option>
                            ))}
                          </select>
                          <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                      <button
                        onClick={handleOpenBelvo}
                        disabled={!selectedAccountId || isBelvoLoading}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isBelvoLoading ? <Loader2 size={20} className="animate-spin" /> : <LinkIcon size={20} />}
                        <span>{isBelvoLoading ? 'Iniciando...' : 'Conectar Nova Instituição'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-6 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      Conexão criptografada via protocolo Belvo Open Finance
                    </p>
                  </>
                )}
              </div>
            )
          ) : (
            /* Preview Table UI */
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Categoria</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase text-right">Valor</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase text-center">Confiança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.date}</td>
                      <td className="px-5 py-4 text-sm text-slate-800 font-bold">{item.description}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-slate-700 uppercase">{item.category}</span>
                      </td>
                      <td className={`px-5 py-4 text-sm font-bold text-right whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {item.type === 'INCOME' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${item.confidence === 'alta' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {item.confidence === 'alta' ? 'A' : 'B'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-[32px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <Sparkles size={16} />
            </div>
            <p className="text-[10px] text-slate-600 max-w-[300px]">
              Análise realizada pelo motor de IA do FiFlow. Verifique os dados antes de confirmar a importação.
            </p>
          </div>

          {step === 'preview' && (
            <div className="flex gap-3">
              <button onClick={() => setStep('upload')} className="px-6 py-3 text-slate-500 font-bold hover:bg-white rounded-xl transition-all">Cancelar</button>
              <button onClick={handleConfirm} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Confirmar Importação</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
