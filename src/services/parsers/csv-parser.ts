import Papa from 'papaparse';
import type { Transaction, CSVConfig, ImportError } from '@/shared/types';

export async function parseCSV(
  file: File,
  config: CSVConfig
): Promise<{ transactions: Transaction[]; errors: ImportError[] }> {
  const transactions: Transaction[] = [];
  const errors: ImportError[] = [];

  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      Papa.parse(text, {
        delimiter: config.delimiter,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as string[][];
          const startRow = config.hasHeaders ? 1 : 0;

          for (let i = startRow; i < data.length; i++) {
            const row = data[i];
            
            try {
              // Extract date
              const dateStr = row[config.dateColumn]?.trim();
              if (!dateStr) {
                errors.push({
                  line: i + 1,
                  field: 'date',
                  message: 'Data não encontrada',
                });
                continue;
              }

              const date = parseDate(dateStr);
              if (!date) {
                errors.push({
                  line: i + 1,
                  field: 'date',
                  message: `Data inválida: ${dateStr}`,
                });
                continue;
              }

              // Extract description
              const description = row[config.descriptionColumn]?.trim() || '';
              if (!description) {
                errors.push({
                  line: i + 1,
                  field: 'description',
                  message: 'Descrição não encontrada',
                });
                continue;
              }

              // Extract amount
              const amountStr = row[config.amountColumn]?.trim();
              if (!amountStr) {
                errors.push({
                  line: i + 1,
                  field: 'amount',
                  message: 'Valor não encontrado',
                });
                continue;
              }

              const amount = parseAmount(amountStr);
              if (isNaN(amount)) {
                errors.push({
                  line: i + 1,
                  field: 'amount',
                  message: `Valor inválido: ${amountStr}`,
                });
                continue;
              }

              // Determine type
              let type: 'receita' | 'despesa';
              if (config.typeColumn !== undefined && row[config.typeColumn]) {
                const typeStr = row[config.typeColumn].toLowerCase().trim();
                type = typeStr.includes('receita') || typeStr.includes('credito') || typeStr.includes('entrada')
                  ? 'receita'
                  : 'despesa';
              } else {
                type = amount >= 0 ? 'receita' : 'despesa';
              }

              transactions.push({
                date,
                description,
                amount: Math.abs(amount),
                type,
                category: '',
                subcategory: '',
                confidence: 0,
                needsReview: true,
                importedFrom: file.name,
                importedAt: new Date(),
              });
            } catch (error) {
              errors.push({
                line: i + 1,
                field: 'general',
                message: error instanceof Error ? error.message : 'Erro desconhecido',
              });
            }
          }

          resolve({ transactions, errors });
        },
      });
    };

    reader.readAsText(file, config.encoding === 'Latin1' ? 'ISO-8859-1' : 'UTF-8');
  });
}

function parseDate(dateStr: string): Date | null {
  // Try different date formats
  const formats = [
    // DD/MM/YYYY
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // DD/MM/YY
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day: number, month: number, year: number;
      
      if (format === formats[2]) {
        // YYYY-MM-DD
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else if (format === formats[3]) {
        // DD/MM/YY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]) + 2000;
      } else {
        // DD/MM/YYYY or DD-MM-YYYY
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
      }

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function parseAmount(amountStr: string): number {
  // Remove currency symbols and spaces
  let cleaned = amountStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '') // Remove thousands separator
    .replace(',', '.'); // Replace decimal comma with dot

  return parseFloat(cleaned);
}

export async function detectCSVConfig(file: File): Promise<Partial<CSVConfig>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 5);
      
      // Detect delimiter
      const delimiters = [',', ';', '|', '\t'];
      let bestDelimiter: CSVConfig['delimiter'] = ',';
      let maxColumns = 0;

      for (const delimiter of delimiters) {
        const columns = lines[0].split(delimiter).length;
        if (columns > maxColumns) {
          maxColumns = columns;
          bestDelimiter = delimiter as CSVConfig['delimiter'];
        }
      }

      // Parse first row to detect headers and columns
      const firstRow = lines[0].split(bestDelimiter).map(s => s.trim().toLowerCase());
      
      const config: Partial<CSVConfig> = {
        delimiter: bestDelimiter,
        encoding: 'UTF-8',
        hasHeaders: true,
      };

      // Try to detect column indices
      firstRow.forEach((header, index) => {
        if (header.includes('data') || header.includes('date')) {
          config.dateColumn = index;
        }
        if (header.includes('descri') || header.includes('historic') || header.includes('memo')) {
          config.descriptionColumn = index;
        }
        if (header.includes('valor') || header.includes('amount') || header.includes('quantia')) {
          config.amountColumn = index;
        }
        if (header.includes('tipo') || header.includes('type') || header.includes('natureza')) {
          config.typeColumn = index;
        }
      });

      resolve(config);
    };

    reader.readAsText(file, 'UTF-8');
  });
}