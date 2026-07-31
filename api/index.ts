import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

const app = express();

app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- API Health ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- API Summarize (Gemini AI with Fallback) ---
app.post('/api/summarize', async (req, res) => {
  const {
    total_spend,
    num_transactions,
    top_category,
    recurring_count,
    recurring_total,
    duplicate_count,
    category_totals,
  } = req.body;

  const defaultSummary =
    `You spent ₹${Number(total_spend || 0).toLocaleString('en-IN')} across ${num_transactions || 0} transactions. ` +
    `Your biggest spending category was ${top_category || 'N/A'}. ` +
    (recurring_count > 0
      ? `You have ${recurring_count} recurring charges costing about ₹${Number(recurring_total || 0).toLocaleString('en-IN')}/month. `
      : '') +
    (duplicate_count > 0 ? `We flagged ${duplicate_count} duplicate charge(s) worth disputing.` : '');

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ summary: defaultSummary, poweredByAI: false });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt =
      `Summarize this spending report in 3 short, conversational sentences.\n` +
      `Total spend: ₹${total_spend}\n` +
      `Top category: ${top_category}\n` +
      `Category breakdown: ${JSON.stringify(category_totals || [])}\n` +
      `Recurring subscriptions flagged: ${recurring_count}\n` +
      `Duplicate charges flagged: ${duplicate_count}\n` +
      `Be direct, mention any financial leaks, and give one actionable tip.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiText = response.text || defaultSummary;
    return res.json({ summary: aiText, poweredByAI: true });
  } catch (err) {
    console.warn('[Gemini API] Failed to summarize with AI:', err);
    return res.json({ summary: defaultSummary, poweredByAI: false, error: 'AI fallback used' });
  }
});

// --- API Parse PDF ---
app.post('/api/parse-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    const rawText = pdfData.text || '';

    const lines = rawText.split('\n');
    const transactions: Array<{ date: string; merchant: string; description: string; amount: number }> = [];

    // Date patterns
    const dateRegex = /(\d{1,4}[/-]\d{1,2}[/-]\d{1,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|\d{1,2}\.\d{1,2}\.\d{2,4})/;
    // Amounts: ₹1,250.00 | Rs 499 | $12.99 | 1,250.00
    const amountRegex = /(?:Rs\.?\s?|₹\s?|\$\s?|INR\s?)?([\d,]+\.\d{2}|[\d,]{3,})/;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || /balance|statement period|account number|opening|closing/i.test(trimmed)) {
        return;
      }

      const dateMatch = trimmed.match(dateRegex);
      const amountMatch = trimmed.match(amountRegex);

      if (dateMatch && amountMatch) {
        const dateStr = dateMatch[0];
        const rawAmt = amountMatch[1].replace(/,/g, '');
        const amt = parseFloat(rawAmt);

        if (!isNaN(amt) && amt > 0 && amt < 10000000) {
          let desc = trimmed
            .replace(dateStr, '')
            .replace(amountMatch[0], '')
            .replace(/Rs\.?|₹|\$|INR|Dr|Cr/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

          if (!desc || desc.length < 2) {
            desc = 'Bank Statement Transaction';
          }

          transactions.push({
            date: dateStr,
            merchant: desc,
            description: desc,
            amount: amt,
          });
        }
      }
    });

    return res.json({ transactions, count: transactions.length });
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    return res.status(500).json({ error: 'Failed to parse PDF file' });
  }
});

export default app;
