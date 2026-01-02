import React, { useState } from 'react';
import { Upload, X, FileText, Table, FileCode, Trash2, Wallet, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { MOCK_ACCOUNTS } from '../../constants';
import { categorizeTransactions, TransactionInput } from '../../services/categorizationAgent';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: File[], accountId: string) => void;
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

// Mock de dados brutos para simular a leitura do arquivo e testar o Agente
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
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTransaction[]>([]);

  if (!isOpen) return null;

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
      // Aqui estamos simulando que lemos os arquivos e extraímos MOCK_RAW_TRANSACTIONS
      // Em produção, aqui entraria o parser de OFX/PDF/CSV
      console.log("Enviando transações para o Agente de IA...");

      const result = await categorizeTransactions(MOCK_RAW_TRANSACTIONS);

      console.log("Resposta do Agente:", result);

      const mappedPreview: PreviewTransaction[] = result.transacoes_categorizadas.map(t => ({
        id: t.id,
        date: t.data,
        description: t.descricao,
        amount: t.valor,
        category: t.categoria_principal,
        subcategory: t.classificacao,
        type: t.categoria_principal.includes('RECEITAS') || t.categoria_principal.includes('Salário') ? 'INCOME' : 'EXPENSE', // Lógica simplificada baseada na categoria
        confidence: t.confianca
      }));

      setPreviewData(mappedPreview);
      setStep('preview');
    } catch (error) {
      console.error("Falha na análise:", error);
      alert("Houve um erro ao processar os arquivos com a IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (files.length > 0 && selectedAccountId) {
      onImport(files, selectedAccountId);
      // Reset state after import
      setFiles([]);
      setSelectedAccountId('');
      setStep('upload');
      setPreviewData([]);
    }
  };

  const handleBack = () => {
    setStep('upload');
    setPreviewData([]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white w-full ${step === 'preview' ? 'max-w-5xl' : 'max-w-2xl'} max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 mobile-safe-area transition-all`}>

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center bg-white flex-shrink-0 rounded-t-[32px]">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {step === 'upload' ? 'Importar Dados' : 'Conferência Inteligente'}
              {step === 'preview' && <Sparkles size={20} className="text-purple-500 animate-pulse" />}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {step === 'upload' ? 'Selecione os arquivos e a conta de destino' : 'Verifique a categorização realizada pela IA'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
          {step === 'upload' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              {/* Left Side: Upload Area */}
              <div
                className={`min-h-[250px] lg:h-full border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-6 text-center relative ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                  }`}
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

              {/* Right Side: Configuration */}
              <div className="flex flex-col h-full">
                <div className="mb-6 flex-shrink-0">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vincular à Conta</label>
                  <div className="relative">
                    <select
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    >
                      <option value="" disabled>Selecione uma conta...</option>
                      {MOCK_ACCOUNTS.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.bankName})
                        </option>
                      ))}
                    </select>
                    <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[100px] space-y-2 mb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white">Arquivos Selecionados ({files.length})</p>
                  {files.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-20 text-slate-400 text-sm italic border border-slate-100 rounded-xl bg-slate-50/50">
                      Nenhum arquivo selecionado
                    </div>
                  )}
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.name.endsWith('.pdf') ? <FileText size={16} className="text-rose-500 flex-shrink-0" /> :
                          file.name.endsWith('.csv') || file.name.endsWith('.xlsx') ? <Table size={16} className="text-emerald-500 flex-shrink-0" /> :
                            <FileCode size={16} className="text-blue-500 flex-shrink-0" />}
                        <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={files.length === 0 || !selectedAccountId || isAnalyzing}
                  className="w-full mt-auto py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processando com IA...</span>
                    </>
                  ) : (
                    <>
                      <span>Analisar Inteligente</span>
                      <Sparkles size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria & Classificação</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                      <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Confiança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {previewData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.date}</td>
                        <td className="px-5 py-4 text-sm text-slate-800 font-bold">{item.description}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-extrabold text-slate-700 uppercase">{item.category}</span>
                            <span className="text-xs text-slate-500">{item.subcategory}</span>
                          </div>
                        </td>
                        <td className={`px-5 py-4 text-sm font-bold text-right whitespace-nowrap ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {item.type === 'INCOME' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${item.confidence === 'alta' ? 'bg-emerald-100 text-emerald-700' :
                                item.confidence === 'media' ? 'bg-amber-100 text-amber-700' :
                                  'bg-rose-100 text-rose-700'
                              }`}
                            title={`Confiança: ${item.confidence.toUpperCase()}`}
                          >
                            {item.confidence === 'alta' ? 'A' : item.confidence === 'media' ? 'M' : 'B'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'upload' ? (
          <div className="p-5 bg-slate-50 flex items-center gap-3 border-t border-slate-100 flex-shrink-0 rounded-b-[32px]">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              O <strong>Agente Financeiro IA</strong> analisa suas transações em tempo real para categorizá-las automaticamente com alta precisão.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-6 bg-white border-t border-slate-100 flex-shrink-0 rounded-b-[32px]">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>

            <div className="flex items-center gap-4">
              {previewData.some(i => i.confidence === 'baixa') && (
                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} />
                  <span>Revise itens com baixa confiança</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold">
                <AlertCircle size={16} />
                <span>{previewData.length} transações</span>
              </div>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                <span>Importar Transações</span>
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
