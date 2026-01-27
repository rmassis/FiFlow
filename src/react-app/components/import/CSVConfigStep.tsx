import { useState, useEffect } from "react";
import { ChevronDown, Wand2, AlertCircle } from "lucide-react";
import type { CSVConfig } from "@/shared/types";
import { detectCSVConfig } from "@/services/parsers/csv-parser";

interface CSVConfigStepProps {
  file: File;
  onConfigured: (config: CSVConfig) => void;
  onBack: () => void;
}

export function CSVConfigStep({ file, onConfigured, onBack }: CSVConfigStepProps) {
  const [config, setConfig] = useState<CSVConfig>({
    delimiter: ',',
    encoding: 'UTF-8',
    hasHeaders: true,
    dateColumn: 0,
    descriptionColumn: 1,
    amountColumn: 2,
  });

  const [preview, setPreview] = useState<string[][]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    loadPreview();
  }, [file, config.delimiter, config.encoding]);

  const loadPreview = async () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6);
      const rows = lines.map(line => 
        line.split(config.delimiter).map(cell => cell.trim())
      );
      setPreview(rows);
    };
    reader.readAsText(file, config.encoding === 'Latin1' ? 'ISO-8859-1' : 'UTF-8');
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const detected = await detectCSVConfig(file);
      setConfig(prev => ({ ...prev, ...detected }));
    } finally {
      setIsDetecting(false);
    }
  };

  const columnOptions = preview.length > 0 
    ? preview[0].map((_, index) => ({
        value: index,
        label: config.hasHeaders ? preview[0][index] : `Coluna ${index + 1}`,
      }))
    : [];

  const handleContinue = () => {
    if (config.dateColumn === undefined || config.descriptionColumn === undefined || config.amountColumn === undefined) {
      return;
    }
    onConfigured(config);
  };

  const isValid = 
    config.dateColumn !== undefined && 
    config.descriptionColumn !== undefined && 
    config.amountColumn !== undefined;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Configurar CSV</h2>
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            {isDetecting ? 'Detectando...' : 'Detectar automaticamente'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Delimiter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Delimitador
            </label>
            <div className="relative">
              <select
                value={config.delimiter}
                onChange={(e) => setConfig({ ...config, delimiter: e.target.value as CSVConfig['delimiter'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value=",">Vírgula (,)</option>
                <option value=";">Ponto e vírgula (;)</option>
                <option value="|">Pipe (|)</option>
                <option value={"\t"}>Tab</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Encoding */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Codificação
            </label>
            <div className="relative">
              <select
                value={config.encoding}
                onChange={(e) => setConfig({ ...config, encoding: e.target.value as CSVConfig['encoding'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="UTF-8">UTF-8</option>
                <option value="Latin1">Latin1 (ISO-8859-1)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Has Headers */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasHeaders}
                onChange={(e) => setConfig({ ...config, hasHeaders: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-gray-700">
                Primeira linha contém cabeçalhos
              </span>
            </label>
          </div>
        </div>

        {/* Column Mapping */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Mapeamento de Colunas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Column */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coluna de Data *
              </label>
              <div className="relative">
                <select
                  value={config.dateColumn ?? ''}
                  onChange={(e) => setConfig({ ...config, dateColumn: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {columnOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Description Column */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coluna de Descrição *
              </label>
              <div className="relative">
                <select
                  value={config.descriptionColumn ?? ''}
                  onChange={(e) => setConfig({ ...config, descriptionColumn: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {columnOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Amount Column */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coluna de Valor *
              </label>
              <div className="relative">
                <select
                  value={config.amountColumn ?? ''}
                  onChange={(e) => setConfig({ ...config, amountColumn: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {columnOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Type Column */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coluna de Tipo (opcional)
              </label>
              <div className="relative">
                <select
                  value={config.typeColumn ?? ''}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    typeColumn: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Nenhuma</option>
                  {columnOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Preview</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {preview[0].map((cell, idx) => (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 ${
                          idx === config.dateColumn ? 'bg-blue-50' :
                          idx === config.descriptionColumn ? 'bg-green-50' :
                          idx === config.amountColumn ? 'bg-purple-50' :
                          idx === config.typeColumn ? 'bg-yellow-50' : ''
                        }`}
                      >
                        {config.hasHeaders ? cell : `Col ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {preview.slice(config.hasHeaders ? 1 : 0, 6).map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-4 py-2 text-sm text-gray-900 ${
                            cellIdx === config.dateColumn ? 'bg-blue-50/30' :
                            cellIdx === config.descriptionColumn ? 'bg-green-50/30' :
                            cellIdx === config.amountColumn ? 'bg-purple-50/30' :
                            cellIdx === config.typeColumn ? 'bg-yellow-50/30' : ''
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span className="text-gray-600">Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <span className="text-gray-600">Descrição</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-200 rounded"></div>
                <span className="text-gray-600">Valor</span>
              </div>
              {config.typeColumn !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span className="text-gray-600">Tipo</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!isValid && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Configuração incompleta</p>
              <p className="text-sm text-amber-700">
                Selecione as colunas obrigatórias: Data, Descrição e Valor
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar para Preview
        </button>
      </div>
    </div>
  );
}