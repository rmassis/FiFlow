import type { Transaction, ImportError } from '@/shared/types';

export async function parsePDF(
  file: File
): Promise<{ transactions: Transaction[]; errors: ImportError[] }> {
  const transactions: Transaction[] = [];
  const errors: ImportError[] = [];

  try {
    // Import pdf-parse dynamically
    const pdfParse = await import('pdf-parse');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // @ts-ignore - pdf-parse has type issues with ESM imports
    const data = await pdfParse(buffer);
    const text = data.text;

    // Try different bank patterns
    const patterns = [
      // Generic pattern: DD/MM/YYYY Description Value
      {
        name: 'Generic',
        regex: /(\d{2}\/\d{2}\/\d{4})\s+([^\d\r\n]+?)\s+([\d.,]+)/g,
      },
      // Nubank pattern
      {
        name: 'Nubank',
        regex: /(\d{2}\s+\w{3})\s+([^\r\n]+?)\s+R\$\s*([\d.,]+)/g,
      },
      // Inter pattern
      {
        name: 'Inter',
        regex: /(\d{2}\/\d{2}\/\d{4})\s+([^\r\n]+?)\s+R\$\s*([\d.,]+)/g,
      },
    ];

    let foundPattern = false;
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern.regex)];

      if (matches.length > 0) {
        foundPattern = true;

        for (const match of matches) {
          try {
            const dateStr = match[1];
            const description = match[2].trim();
            const amountStr = match[3];

            // Parse date
            const date = parseDate(dateStr);
            if (!date) continue;

            // Parse amount
            const amount = parseAmount(amountStr);
            if (isNaN(amount)) continue;

            // Determine if it's income or expense based on description keywords
            const isIncome =
              description.toLowerCase().includes('credito') ||
              description.toLowerCase().includes('deposito') ||
              description.toLowerCase().includes('recebimento') ||
              description.toLowerCase().includes('salario') ||
              description.toLowerCase().includes('pix recebido');

            transactions.push({
              date,
              description,
              amount: Math.abs(amount),
              type: isIncome ? 'receita' : 'despesa',
              category: '',
              subcategory: '',
              confidence: 0,
              needsReview: true,
              importedFrom: file.name,
              importedAt: new Date(),
            });
          } catch (error) {
            // Skip malformed entries
          }
        }

        if (transactions.length > 0) break;
      }
    }

    if (!foundPattern || transactions.length === 0) {
      errors.push({
        line: 0,
        field: 'general',
        message: 'Não foi possível identificar transações no PDF. Formatos suportados: Nubank, Inter, ou formato padrão.',
      });
    }
  } catch (error) {
    errors.push({
      line: 0,
      field: 'general',
      message: error instanceof Error ? error.message : 'Erro ao processar PDF',
    });
  }

  return { transactions, errors };
}

function parseDate(dateStr: string): Date | null {
  // DD/MM/YYYY
  const fullDateMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (fullDateMatch) {
    const day = parseInt(fullDateMatch[1]);
    const month = parseInt(fullDateMatch[2]) - 1;
    const year = parseInt(fullDateMatch[3]);
    return new Date(year, month, day);
  }

  // DD MMM (month name, assuming current year)
  const shortDateMatch = dateStr.match(/(\d{2})\s+(\w{3})/);
  if (shortDateMatch) {
    const day = parseInt(shortDateMatch[1]);
    const monthStr = shortDateMatch[2].toLowerCase();
    const months: Record<string, number> = {
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
    };
    const month = months[monthStr];
    if (month !== undefined) {
      const year = new Date().getFullYear();
      return new Date(year, month, day);
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