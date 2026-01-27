import * as XLSX from 'xlsx';
import type { Transaction, CSVConfig, ImportError } from '@/shared/types';

export async function parseExcel(
  file: File,
  config: CSVConfig
): Promise<{ transactions: Transaction[]; errors: ImportError[] }> {
  const transactions: Transaction[] = [];
  const errors: ImportError[] = [];

  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const startRow = config.hasHeaders ? 1 : 0;

        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          if (!row || row.length === 0) continue;
          
          try {
            // Extract date
            const dateValue = row[config.dateColumn];
            if (!dateValue) {
              errors.push({
                line: i + 1,
                field: 'date',
                message: 'Data não encontrada',
              });
              continue;
            }

            let date: Date;
            if (typeof dateValue === 'number') {
              // Excel date (days since 1900-01-01)
              date = XLSX.SSF.parse_date_code(dateValue);
            } else {
              const parsedDate = parseDate(String(dateValue));
              if (!parsedDate) {
                errors.push({
                  line: i + 1,
                  field: 'date',
                  message: `Data inválida: ${dateValue}`,
                });
                continue;
              }
              date = parsedDate;
            }

            // Extract description
            const description = String(row[config.descriptionColumn] || '').trim();
            if (!description) {
              errors.push({
                line: i + 1,
                field: 'description',
                message: 'Descrição não encontrada',
              });
              continue;
            }

            // Extract amount
            const amountValue = row[config.amountColumn];
            if (amountValue === undefined || amountValue === null) {
              errors.push({
                line: i + 1,
                field: 'amount',
                message: 'Valor não encontrado',
              });
              continue;
            }

            let amount: number;
            if (typeof amountValue === 'number') {
              amount = amountValue;
            } else {
              amount = parseAmount(String(amountValue));
            }

            if (isNaN(amount)) {
              errors.push({
                line: i + 1,
                field: 'amount',
                message: `Valor inválido: ${amountValue}`,
              });
              continue;
            }

            // Determine type
            let type: 'receita' | 'despesa';
            if (config.typeColumn !== undefined && row[config.typeColumn]) {
              const typeStr = String(row[config.typeColumn]).toLowerCase().trim();
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
      } catch (error) {
        errors.push({
          line: 0,
          field: 'general',
          message: error instanceof Error ? error.message : 'Erro ao processar arquivo Excel',
        });
      }

      resolve({ transactions, errors });
    };

    reader.readAsArrayBuffer(file);
  });
}

function parseDate(dateStr: string): Date | null {
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
    /^(\d{2})-(\d{2})-(\d{4})$/,
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{2})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let day: number, month: number, year: number;
      
      if (format === formats[2]) {
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      } else if (format === formats[3]) {
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]) + 2000;
      } else {
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
  let cleaned = amountStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  return parseFloat(cleaned);
}