import type { Transaction, ImportError } from '@/shared/types';

export async function parseOFX(
  file: File
): Promise<{ transactions: Transaction[]; errors: ImportError[] }> {
  const transactions: Transaction[] = [];
  const errors: ImportError[] = [];

  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      try {
        // Find all transaction entries
        const transactionMatches = text.matchAll(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/g);
        
        let lineNumber = 0;
        for (const match of transactionMatches) {
          lineNumber++;
          const transactionBlock = match[1];
          
          try {
            // Extract DTPOSTED (date)
            const dateMatch = transactionBlock.match(/<DTPOSTED>(\d{8})/);
            if (!dateMatch) {
              errors.push({
                line: lineNumber,
                field: 'date',
                message: 'Data não encontrada',
              });
              continue;
            }
            
            const dateStr = dateMatch[1];
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1;
            const day = parseInt(dateStr.substring(6, 8));
            const date = new Date(year, month, day);

            // Extract MEMO or NAME (description)
            let description = '';
            const memoMatch = transactionBlock.match(/<MEMO>([^<]+)/);
            const nameMatch = transactionBlock.match(/<NAME>([^<]+)/);
            
            if (memoMatch) {
              description = memoMatch[1].trim();
            } else if (nameMatch) {
              description = nameMatch[1].trim();
            }
            
            if (!description) {
              errors.push({
                line: lineNumber,
                field: 'description',
                message: 'Descrição não encontrada',
              });
              continue;
            }

            // Extract TRNAMT (amount)
            const amountMatch = transactionBlock.match(/<TRNAMT>([^<]+)/);
            if (!amountMatch) {
              errors.push({
                line: lineNumber,
                field: 'amount',
                message: 'Valor não encontrado',
              });
              continue;
            }

            const amount = parseFloat(amountMatch[1]);
            if (isNaN(amount)) {
              errors.push({
                line: lineNumber,
                field: 'amount',
                message: `Valor inválido: ${amountMatch[1]}`,
              });
              continue;
            }

            transactions.push({
              date,
              description,
              amount: Math.abs(amount),
              type: amount >= 0 ? 'receita' : 'despesa',
              category: '',
              subcategory: '',
              confidence: 0,
              needsReview: true,
              importedFrom: file.name,
              importedAt: new Date(),
            });
          } catch (error) {
            errors.push({
              line: lineNumber,
              field: 'general',
              message: error instanceof Error ? error.message : 'Erro ao processar transação',
            });
          }
        }
      } catch (error) {
        errors.push({
          line: 0,
          field: 'general',
          message: error instanceof Error ? error.message : 'Erro ao processar arquivo OFX',
        });
      }

      resolve({ transactions, errors });
    };

    reader.readAsText(file);
  });
}