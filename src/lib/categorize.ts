import { Transaction } from '../types';

export const RULE_CATEGORIES: Record<string, string[]> = {
  Subscriptions: ["netflix", "spotify", "amazon prime", "hotstar", "youtube", "disney", "apple music"],
  "Food Delivery": ["zomato", "swiggy", "instamart", "blinkit", "dominos", "starbucks", "cafe coffee"],
  Transport: ["uber", "ola", "rapido", "irctc", "metro", "petrol"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "zara", "nykaa"],
  "Bills & Utilities": ["airtel", "jio", "electricity", "water board", "bescom", "broadband"],
};

const TRAINING_DATA: [string, string][] = [
  ["dominos pizza", "Food Delivery"],
  ["cafe coffee day", "Food Delivery"],
  ["starbucks", "Food Delivery"],
  ["youtube premium", "Subscriptions"],
  ["apple music", "Subscriptions"],
  ["disney plus", "Subscriptions"],
  ["myntra fashion", "Shopping"],
  ["zara store", "Shopping"],
  ["nykaa cosmetics", "Shopping"],
  ["petrol pump fuel", "Transport"],
  ["metro card recharge", "Transport"],
  ["bescom bill", "Bills & Utilities"],
  ["broadband recharge", "Bills & Utilities"],
];

function tokenJaccardSimilarity(text1: string, text2: string): number {
  const set1 = new Set(text1.toLowerCase().split(/\s+/));
  const set2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

export function categorizeTransaction(merchant: string, description: string = ''): string {
  const text = `${merchant} ${description}`.toLowerCase().trim();

  // 1. Rule-based keyword matching first
  for (const [category, keywords] of Object.entries(RULE_CATEGORIES)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }

  // 2. Similarity classifier fallback
  let bestCategory = 'Other';
  let bestScore = 0;

  for (const [sampleText, category] of TRAINING_DATA) {
    const score = tokenJaccardSimilarity(text, sampleText);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestScore > 0.1 ? bestCategory : 'Other';
}

export function categorizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((t) => ({
    ...t,
    category: t.category || categorizeTransaction(t.merchant, t.description),
  }));
}
