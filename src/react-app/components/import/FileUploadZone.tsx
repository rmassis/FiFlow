import { Upload, FileText, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

interface FileUploadZoneProps {
  onFileUpload: (files: File[]) => void;
}

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.pdf', '.ofx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({ onFileUpload }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo ${file.name} muito grande. Tamanho máximo: 10MB`;
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return `Arquivo ${file.name} com formato não suportado.`;
    }

    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 bg-white shadow-lg
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center transition-all
            ${isDragging
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 scale-110'
              : 'bg-gradient-to-br from-indigo-100 to-purple-100'
            }
          `}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-indigo-600'}`} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isDragging ? 'Solte os arquivos aqui' : 'Arraste e solte seus arquivos'}
            </h3>
            <p className="text-slate-600 mb-1">
              ou clique para selecionar (múltiplos permitidos)
            </p>
            <p className="text-sm text-slate-500">
              Formatos aceitos: CSV, OFX, PDF, Excel (XLSX, XLS)
            </p>
            <p className="text-sm text-slate-500">
              Tamanho máximo: 10MB
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Alguns arquivos não puderam ser adicionados:</p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-1">
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'CSV', icon: FileText, desc: 'Arquivos de texto separados por vírgula' },
          { name: 'Excel', icon: FileText, desc: 'Planilhas XLSX e XLS' },
          { name: 'OFX', icon: FileText, desc: 'Formato padrão de instituições financeiras' },
          { name: 'PDF', icon: FileText, desc: 'Extratos em PDF de bancos' },
        ].map((format) => {
          const Icon = format.icon;
          return (
            <div
              key={format.name}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-semibold text-gray-900">{format.name}</span>
              </div>
              <p className="text-xs text-slate-600">{format.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}