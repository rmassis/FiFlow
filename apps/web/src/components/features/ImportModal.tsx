
import React, { useState, useEffect } from 'react';
import {
  Upload, X, FileText, Table, FileCode, Trash2, Wallet,
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles,
  AlertTriangle, Globe, Link as LinkIcon, Lock
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { autopilotService, TransactionInput } from '../../services/AutopilotService';
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

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const { accounts, cards, addAccount, transactions, addTransaction, addTransactions, categories } = useFinance();
  const { isPro, isFree } = useSubscription();
  const [tab, setTab] = useState<'files' | 'belvo'>('files');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewTransaction[]>([]);
  const [isBelvoLoading, setIsBelvoLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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
            accountNumber: firstAcc.number || '0000',
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

  /* Helper to read file content */
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  /* Helper to parse CSV line respecting quotes */
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    // Clean quotes from results
    return result.map(val => {
      val = val.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        return val.slice(1, -1).replace(/""/g, '"');
      }
      return val;
    });
  };

  /* Helper to parse CSV manually */
  const parseCSV = (content: string): TransactionInput[] => {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Parse header using robust parser
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

    // Enhanced heuristic: look for date, amount, description, type columns
    const dateIdx = headers.findIndex(h => h.includes('data') || h.includes('date') || h.includes('dt'));
    const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('historico') || h.includes('memo') || h.includes('lançamento') || h.includes('lancamento') || h.includes('estabelecimento'));
    const amountIdx = headers.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('rs') || h.includes('r$'));
    const typeIdx = headers.findIndex(h => h.includes('tipo') || h.includes('type') || h.includes('d/c') || h.includes('operacao'));

    const parsedData: TransactionInput[] = [];

    // If headers found (at least 2 matches), skip first line. Otherwise assume no header if parsing logic allows?
    // Safer to assume header exists if ANY match found in line 0.
    const startIdx = (dateIdx !== -1 || descIdx !== -1 || amountIdx !== -1) ? 1 : 0;

    // Default indices if not found (assuming standard: Date, Desc, Amount or similar)
    // Based on the user image: Data(0), Desc(1), Cat(2), Type(3), Valor(4) -> If amountIdx not found, try last column? 
    // But header search should find "valor".
    const effDateIdx = dateIdx !== -1 ? dateIdx : 0;
    const effDescIdx = descIdx !== -1 ? descIdx : 1;
    // Default amount to last column if simple layout, otherwise 2
    const effAmountIdx = amountIdx !== -1 ? amountIdx : (headers.length > 2 ? headers.length - 1 : 2);
    // Explicit type column if found
    const effTypeIdx = typeIdx;

    for (let i = startIdx; i < lines.length; i++) {
      // Use robust parser
      const cols = parseCSVLine(lines[i]);

      if (cols.length < 2) continue;

      let rawDate = cols[effDateIdx]?.trim();
      let rawDesc = cols[effDescIdx]?.trim();
      let rawAmount = cols[effAmountIdx]?.trim();
      let rawType = effTypeIdx !== -1 ? cols[effTypeIdx]?.trim() : '';

      // Skip empty rows
      if (!rawDate && !rawDesc && !rawAmount) continue;

      // Parse Amount (handle R$, dots/commas)
      // Example: "-R$ 20,00" or "R$ 16,00"
      if (!rawAmount) rawAmount = "0";

      // Clean string to just numbers, minus, and comma/dot
      const cleanAmountStr = rawAmount.replace(/[^0-9,-.]/g, '');

      // Brazilian Format check (comma as decimal usually comes at the end)
      // Heuristic: if comma is after the last dot, or no dot exists, assume comma is decimal
      let amountVal: number;

      if (cleanAmountStr.includes(',') && (!cleanAmountStr.includes('.') || cleanAmountStr.lastIndexOf(',') > cleanAmountStr.lastIndexOf('.'))) {
        // It's likely BRL format: 1.000,00 -> remove dots, replace comma with dot
        const normalized = cleanAmountStr.replace(/\./g, '').replace(',', '.');
        amountVal = parseFloat(normalized);
      } else {
        // Likely US format: 1,000.00 -> remove commas
        const normalized = cleanAmountStr.replace(/,/g, '');
        amountVal = parseFloat(normalized);
      }

      // Final check: if still NaN, skip this row
      if (isNaN(amountVal)) continue;

      // Determine type based on rawType column OR amount sign
      // If explicit type column exists:
      let isIncome = false;
      if (rawType) {
        const lowerType = rawType.toLowerCase();
        if (lowerType.includes('crédito') || lowerType.includes('receita') || lowerType.includes('entrada') || lowerType.includes('deposit')) {
          isIncome = true;
        }
      } else {
        // Checking Account Logic: - = Expense, + = Income.
        if (amountVal > 0 && !rawType) {
          // We'll let AI or user decide, but default to current logic
        }
      }

      // STRICT HEADER CHECK: match against the CLEANED value
      if (rawDate && /^(data|date|dt|dia)$/i.test(rawDate)) continue;
      if (rawDesc && /^(descrição|desc|historico|lançamento|lancamento)$/i.test(rawDesc)) continue;

      parsedData.push({
        id: `import-${Date.now()}-${i}`,
        data: rawDate || new Date().toLocaleDateString('pt-BR'),
        descricao: rawDesc || 'Sem descrição',
        valor: Math.abs(amountVal),
        banco: 'Importado',
        // Pass hints to AI or UI
        // @ts-ignore
        tipo_sugerido: isIncome ? 'INCOME' : 'EXPENSE'
      });
    }

    return parsedData;
  };

  /* Helper to parse OFX manually */
  const parseOFX = (content: string): TransactionInput[] => {
    const transactions: TransactionInput[] = [];

    // Split into transaction blocks
    const rawTransactions = content.split('<STMTTRN>');

    // Skip the first chunk (header stuff)
    for (let i = 1; i < rawTransactions.length; i++) {
      const block = rawTransactions[i];

      // Extract fields using Regex
      // SGML tags might not close, so we look for the start tag and grab until next tag or newline
      const extractField = (tag: string) => {
        const regex = new RegExp(`<${tag}>([^<\r\n]+)`, 'i');
        const match = block.match(regex);
        return match ? match[1].trim() : null;
      };

      const dateStr = extractField('DTPOSTED');
      const amountStr = extractField('TRNAMT');
      const memoStr = extractField('MEMO');

      if (!dateStr || !amountStr || !memoStr) continue;

      // Parse Date: YYYYMMDDHHMMSS[-3:GMT] -> DD/MM/YYYY
      // 20251031000000 -> 31/10/2025
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const formattedDate = `${day}/${month}/${year}`;

      // Parse Amount
      const amount = parseFloat(amountStr.replace(',', '.')); // OFX usually uses dot, but safe to handle comma

      if (isNaN(amount)) continue;

      transactions.push({
        id: `ofx-${Date.now()}-${i}`,
        data: formattedDate,
        descricao: memoStr,
        valor: Math.abs(amount), // We store absolute value for the categorization/UI, type is derived later
        banco: 'Importado (OFX)',
        // @ts-ignore
        tipo_sugerido: amount > 0 ? 'INCOME' : 'EXPENSE'
      });
    }

    return transactions;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      let allRawTransactions: TransactionInput[] = [];

      // Process uploaded files
      for (const file of files) {
        const content = await readFileContent(file);

        if (file.name.toLowerCase().endsWith('.csv')) {
          const parsed = parseCSV(content);
          allRawTransactions = [...allRawTransactions, ...parsed];
        } else if (file.name.toLowerCase().endsWith('.ofx')) {
          const parsed = parseOFX(content);
          allRawTransactions = [...allRawTransactions, ...parsed];
        } else {
          console.warn('Formato não suportado:', file.name);
          alert(`Formato .${file.name.split('.').pop()} não suportado. Use CSV ou OFX.`);
        }
      }

      if (allRawTransactions.length === 0 && files.length > 0) {
        throw new Error("Nenhuma transação encontrada. Verifique o formato dos arquivos.");
      }

      let mappedPreview: PreviewTransaction[] = [];

      if (allRawTransactions.length > 0) {
        console.log("Chamando categorização IA...", allRawTransactions.length);

        const BATCH_SIZE = 50; // OpenAI suporta lotes maiores (Otimizado para Performance)
        const totalTransactions = allRawTransactions.length;
        let processedCount = 0;
        let allCategorized: any[] = [];

        for (let i = 0; i < totalTransactions; i += BATCH_SIZE) {
          const chunk = allRawTransactions.slice(i, i + BATCH_SIZE);

          const currentProgress = Math.round((processedCount / totalTransactions) * 100);
          setProgress(currentProgress);

          // Process chunk
          const result = await autopilotService.categorizeBatch(chunk, categories);
          allCategorized = [...allCategorized, ...result.transacoes_categorizadas];

          processedCount += chunk.length;
          setProgress(Math.round((processedCount / totalTransactions) * 100));

          // Pequeno delay para permitir atualização da UI, sem penalizar performance
          if (i + BATCH_SIZE < totalTransactions) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        setProgress(100);

        mappedPreview = allCategorized.map(t => {
          let finalCategory = t.categoria_principal;

          // Safety check: if AI returns error strings (hallucination or catch block), normalize them
          const errorPattern = /err|fail|classificar|undefined|null/i;
          if (!finalCategory || errorPattern.test(finalCategory) || finalCategory === 'OUTROS - Erro') {
            finalCategory = 'OUTROS';
          }

          // Determine High Level Type (Income/Expense)
          let finalType: 'INCOME' | 'EXPENSE' = 'EXPENSE';

          if (finalCategory.includes('RECEITAS') || finalCategory.includes('Salário') || finalCategory.includes('Investimento')) {
            finalType = 'INCOME';
          } else {
            // Fallback to CSV hint if AI didn't categorize as Income explicitly
            // @ts-ignore
            const csvHint = allRawTransactions.find(r => r.id === t.id)?.tipo_sugerido;
            if (csvHint === 'INCOME') finalType = 'INCOME';
          }

          const original = allRawTransactions.find(r => r.id === t.id);

          return {
            id: t.id,
            date: original?.data || new Date().toLocaleDateString('pt-BR'),
            description: original?.descricao || t.descricao || 'Sem descrição',
            amount: original?.valor || 0,
            category: finalCategory,
            subcategory: t.classificacao,
            type: finalType,
            confidence: t.confianca
          };
        });
      }

      setPreviewData(mappedPreview);
      setStep('preview');
      setProgress(0);
    } catch (error) {
      console.error("Falha na análise:", error);
      alert("Houve um erro ao processar os arquivos. Verifique se é um CSV válido.");
      setProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Deduplication Logic - Updated handleConfirm
  const handleConfirm = () => {
    if (previewData.length > 0 && selectedAccountId) {

      const existingTransactions = transactions || [];
      const newTransactions: PreviewTransaction[] = [];
      let duplicateCount = 0;

      // Filter duplicates
      for (const item of previewData) {
        // Unique key: Date + Amount + Description (normalized)
        const isDuplicate = existingTransactions.some(existing => {
          const sameDate = existing.date === item.date;
          // Use small epsilon for float comparison just in case, though usually exact for currency
          const sameAmount = Math.abs(existing.amount - item.amount) < 0.01;
          const sameDescription = existing.description.toLowerCase().trim() === item.description.toLowerCase().trim();

          return sameDate && sameAmount && sameDescription;
        });

        if (isDuplicate) {
          duplicateCount++;
        } else {
          newTransactions.push(item);
        }
      }

      if (newTransactions.length > 0) {
        const processImport = async () => {
          const toImport = newTransactions.map(item => ({
            date: item.date,
            description: item.description,
            amount: item.amount,
            type: item.type as 'INCOME' | 'EXPENSE',
            category: item.category,
            subcategory: item.subcategory,
            status: 'PAID' as const,
            accountId: selectedAccountId === 'AUTO_CREATE' ? undefined : selectedAccountId,
            account: accounts.find(a => a.id === selectedAccountId)?.name || ''
          }));

          await addTransactions(toImport);
        };
        const runProcess = async () => {
          await processImport();

          if (duplicateCount > 0) {
            alert(`✅ Importação concluída com sucesso!\n\n📥 Importados: ${newTransactions.length}\n🚫 Duplicados ignorados: ${duplicateCount}`);
          } else {
            alert(`✅ ${newTransactions.length} transações importadas com sucesso!`);
          }

          setFiles([]);
          setSelectedAccountId('');
          setStep('upload');
          setPreviewData([]);
          onClose();
        };
        runProcess();
      } else if (duplicateCount > 0) { // Keep else if logic for pure duplicates
        alert(`⚠️ Todas as ${duplicateCount} transações já foram importadas anteriormente.`);
      }


    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" >
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
                        {accounts.length === 0 && cards.length === 0 && (
                          <option value="AUTO_CREATE">✨ Criar conta automaticamente</option>
                        )}
                        {accounts.length > 0 && (
                          <optgroup label="Contas Bancárias">
                            {accounts.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.name} ({account.bankName})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {cards.length > 0 && (
                          <optgroup label="Cartões de Crédito">
                            {cards.map(card => (
                              <option key={card.id} value={card.id}>
                                {card.name} ({card.brand})
                              </option>
                            ))}
                          </optgroup>
                        )}
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
                    className={`w-full mt-auto py-3 font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 relative overflow-hidden ${isFree ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {isAnalyzing && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center gap-2">
                      {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : (isFree ? <FileText size={18} /> : <Sparkles size={18} />)}
                      <span>
                        {isAnalyzing ? `Analisando... ${progress}%` : (isFree ? 'Importar Arquivo (Básico)' : 'Analisar com IA')}
                      </span>
                    </div>
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
                            {accounts.length === 0 && cards.length === 0 && (
                              <option value="AUTO_CREATE">✨ Criar conta automaticamente</option>
                            )}
                            {accounts.length > 0 && (
                              <optgroup label="Contas Bancárias">
                                {accounts.map(account => (
                                  <option key={account.id} value={account.id}>
                                    {account.name} ({account.bankName})
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {cards.length > 0 && (
                              <optgroup label="Cartões de Crédito">
                                {cards.map(card => (
                                  <option key={card.id} value={card.id}>
                                    {card.name} ({card.brand})
                                  </option>
                                ))}
                              </optgroup>
                            )}
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
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase">Subcategoria</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase text-right">Valor</th>
                    <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase text-center">Confiança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{item.date}</td>
                      <td className="px-5 py-4 text-sm text-slate-800 font-bold max-w-[200px] truncate" title={item.description}>{item.description}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-extrabold text-slate-700 uppercase">{item.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{item.subcategory || '-'}</span>
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
    </div >
  );
};

export default ImportModal;
