
import React, { useState } from 'react';
import { Upload, X, FileText, Table, FileCode } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImport(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Importar Dados</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>

          <div 
            className={`relative h-64 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-8 text-center ${
              dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
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
              onChange={handleChange}
            />
            
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
              <Upload size={32} />
            </div>
            
            <p className="text-lg font-semibold text-slate-800 mb-1">Arraste seu arquivo aqui</p>
            <p className="text-sm text-slate-500 mb-6">Suporte para CSV, OFX, PDF, XML e XLSX</p>
            
            <button className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Selecionar Arquivo
            </button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Table size={20} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">CSV/XLSX</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <FileCode size={20} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">OFX/XML</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <FileText size={20} className="text-rose-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">PDF Bank</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
            ✨
          </div>
          <p className="text-sm text-slate-600 leading-tight">
            Nossa IA irá categorizar automaticamente seus lançamentos após o upload.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
