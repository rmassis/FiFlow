import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";
import { FileUploadZone } from "@/react-app/components/import/FileUploadZone";
import { CSVConfigStep } from "@/react-app/components/import/CSVConfigStep";
import { PreviewStep } from "@/react-app/components/import/PreviewStep";
import { useState } from "react";
import { parseCSV } from "@/services/parsers/csv-parser";
import { parseOFX } from "@/services/parsers/ofx-parser";
import { parseExcel } from "@/services/parsers/excel-parser";
// import { parsePDF } from "@/services/parsers/pdf-parser";
import type { CSVConfig, Transaction } from "@/shared/types";

type ImportStep = 'upload' | 'configure' | 'preview' | 'complete';

export default function Import() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');

  // Queue for files requiring manual configuration (CSV, Excel)
  const [configQueue, setConfigQueue] = useState<File[]>([]);

  // Accumulated transactions from all files
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Current file being configured (first in queue)
  const currentConfigFile = configQueue[0];

  const handleFileUpload = async (files: File[]) => {
    const autoFiles: File[] = [];
    const manualFiles: File[] = [];

    // Sort files
    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'ofx' || ext === 'pdf') {
        autoFiles.push(file);
      } else {
        manualFiles.push(file);
      }
    });

    // Process auto-parsable files immediately
    const autoTransactions: Transaction[] = [];

    for (const file of autoFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      try {
        if (ext === 'ofx') {
          const result = await parseOFX(file);
          autoTransactions.push(...result.transactions);
        } else if (ext === 'pdf') {
          const { parsePDF } = await import("@/services/parsers/pdf-parser");
          const result = await parsePDF(file);
          autoTransactions.push(...result.transactions);
        }
      } catch (error) {
        console.error(`Error parsing file ${file.name}:`, error);
        alert(`Erro ao processar arquivo ${file.name}`);
      }
    }

    setTransactions(prev => [...prev, ...autoTransactions]);

    if (manualFiles.length > 0) {
      setConfigQueue(manualFiles);
      setCurrentStep('configure');
    } else if (autoFiles.length > 0) {
      setCurrentStep('preview');
    }
    // If no files valid, stay on upload (or show error in Dropzone)
  };

  const handleCSVConfigured = async (config: CSVConfig) => {
    if (!currentConfigFile) return;

    const extension = currentConfigFile.name.split('.').pop()?.toLowerCase();
    let result;

    try {
      if (extension === 'xlsx' || extension === 'xls') {
        result = await parseExcel(currentConfigFile, config);
      } else {
        result = await parseCSV(currentConfigFile, config);
      }

      setTransactions(prev => [...prev, ...result.transactions]);

      // Remove current file from queue
      const nextQueue = configQueue.slice(1);
      setConfigQueue(nextQueue);

      // If more files in queue, stay in configure (React will update currentConfigFile)
      // If queue empty, go to preview
      if (nextQueue.length === 0) {
        setCurrentStep('preview');
      }
    } catch (error) {
      console.error(`Error parsing file ${currentConfigFile.name}:`, error);
      alert(`Erro ao processar arquivo ${currentConfigFile.name}`);
    }
  };

  const handleConfirmImport = async (finalTransactions: Transaction[]) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: finalTransactions }),
      });

      if (response.ok) {
        setCurrentStep('complete');
      } else {
        alert('Erro ao salvar transações. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
      alert('Erro ao salvar transações. Por favor, tente novamente.');
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setConfigQueue([]);
    setTransactions([]);
  };

  // Helper title for config step
  const configTitle = currentConfigFile
    ? `Configurar ${currentConfigFile.name} (${configQueue.length} restante${configQueue.length > 1 ? 's' : ''})`
    : 'Configurar Arquivo';

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Importar Extrato</h1>
          <p className="text-slate-600 mt-2">
            Faça upload de seus extratos bancários para importar transações automaticamente
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'configure', label: 'Configurar' },
              { id: 'preview', label: 'Revisar' },
              { id: 'complete', label: 'Concluir' },
            ].map((step, index, arr) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep === step.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : arr.findIndex(s => s.id === currentStep) > index
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">
                    {step.label}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200 relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all ${arr.findIndex(s => s.id === currentStep) > index
                        ? 'w-full'
                        : 'w-0'
                        }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        {currentStep === 'upload' && (
          <FileUploadZone onFileUpload={handleFileUpload} />
        )}

        {currentStep === 'configure' && currentConfigFile && (
          <div>
            <div className="mb-4 text-sm text-gray-500 font-medium">
              Arquivo {currentConfigFile.name}
            </div>
            <CSVConfigStep
              file={currentConfigFile}
              onConfigured={handleCSVConfigured}
              onBack={() => {
                // Warning: Going back clears the queue
                if (confirm("Voltar cancelará a importação atual. Deseja continuar?")) {
                  handleReset();
                }
              }}
            />
          </div>
        )}

        {currentStep === 'preview' && transactions.length > 0 && (
          <PreviewStep
            transactions={transactions}
            onConfirm={handleConfirmImport}
            onBack={() => {
              if (confirm("Voltar cancelará a importação atual. Deseja continuar?")) {
                handleReset();
              }
            }}
          />
        )}

        {currentStep === 'complete' && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Importação concluída!
            </h2>
            <p className="text-slate-600 mb-6">
              {transactions.length} transações foram importadas com sucesso.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Importar novo arquivo
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}