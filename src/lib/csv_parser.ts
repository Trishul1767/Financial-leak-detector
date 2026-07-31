import Papa from 'papaparse';
import { Transaction } from '../types';

export function normalizeAndParseCSV(csvContent: string): Transaction[] {
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (!parsed.data || parsed.data.length === 0) {
    return [];
  }

  const rawHeaders = parsed.meta.fields || Object.keys(parsed.data[0] || {});
  const colMap: Record<string, 'date' | 'merchant' | 'description' | 'amount' | 'debit' | 'credit'> = {};

  for (const h of rawHeaders) {
    const c = h.trim().toLowerCase();
    if (['date', 'txn_date', 'transaction_date', 'posted_date', 'posting_date', 'value_date', 'trans_date', 'dt'].some(k => c.includes(k))) {
      colMap[h] = 'date';
    } else if (['merchant', 'payee', 'vendor', 'party'].some(k => c.includes(k))) {
      colMap[h] = 'merchant';
    } else if (['description', 'narration', 'memo', 'details', 'particulars', 'remarks'].some(k => c.includes(k))) {
      colMap[h] = 'description';
    } else if (['debit', 'withdrawal', 'outflow'].some(k => c.includes(k))) {
      colMap[h] = 'debit';
    } else if (['credit', 'deposit', 'inflow'].some(k => c.includes(k))) {
      colMap[h] = 'credit';
    } else if (['amount', 'cost', 'spend', 'total', 'value'].some(k => c.includes(k))) {
      colMap[h] = 'amount';
    }
  }

  const transactions: Transaction[] = [];

  parsed.data.forEach((row, index) => {
    let dateVal = '';
    let merchantVal = '';
    let descVal = '';
    let amountVal = 0;
    let debitVal = 0;

    for (const [col, val] of Object.entries(row)) {
      if (!val) continue;
      const type = colMap[col];
      const cleanVal = val.toString().trim();

      if (type === 'date') {
        dateVal = cleanVal;
      } else if (type === 'merchant') {
        merchantVal = cleanVal;
      } else if (type === 'description') {
        descVal = cleanVal;
      } else if (type === 'debit') {
        const num = parseNumber(cleanVal);
        if (num > 0) debitVal = num;
      } else if (type === 'amount') {
        const num = parseNumber(cleanVal);
        if (num > 0) amountVal = num;
      }
    }

    // Fallback row inspection if headers failed to match
    if (!dateVal || (!merchantVal && !descVal) || (amountVal === 0 && debitVal === 0)) {
      for (const val of Object.values(row)) {
        if (!val) continue;
        const str = val.toString().trim();
        if (!dateVal && isDateString(str)) {
          dateVal = str;
        } else if (!merchantVal && isTextString(str)) {
          merchantVal = str;
        } else if (amountVal === 0 && isNumericString(str)) {
          const num = parseNumber(str);
          if (num > 0) amountVal = num;
        }
      }
    }

    const finalAmount = debitVal > 0 ? debitVal : amountVal;
    if (!merchantVal && descVal) merchantVal = descVal;
    if (!descVal && merchantVal) descVal = merchantVal;

    if (dateVal && merchantVal && finalAmount > 0) {
      transactions.push({
        id: `tx_${index + 1}_${Date.now()}`,
        date: formatDateString(dateVal),
        merchant: cleanMerchantName(merchantVal),
        description: descVal || merchantVal,
        amount: finalAmount,
      });
    }
  });

  return transactions;
}

function parseNumber(rawStr: string): number {
  const cleaned = rawStr.replace(/[^0-9.-]+/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.abs(val);
}

function isDateString(str: string): boolean {
  return /(\d{1,4}[/-]\d{1,2}[/-]\d{1,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})/.test(str);
}

function isNumericString(str: string): boolean {
  return /^[₹$Rs\s,-]*\d+(\.\d{1,2})?[DrCr]*$/i.test(str.trim());
}

function isTextString(str: string): boolean {
  return str.length > 2 && /[a-zA-Z]/.test(str) && !isDateString(str);
}

function cleanMerchantName(raw: string): string {
  return raw
    .replace(/^POS\s+|\bUPI-|\bNEFT-|\bIMPS-/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDateString(rawDate: string): string {
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // ignore
  }
  return rawDate;
}
