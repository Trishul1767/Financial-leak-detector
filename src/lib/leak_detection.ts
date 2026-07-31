import {
  Transaction,
  RecurringSubscription,
  PriceCreep,
  LeakResults,
} from '../types';

export function detectRecurringSubscriptions(transactions: Transaction[]): RecurringSubscription[] {
  const merchantGroups: Record<string, Transaction[]> = {};

  for (const t of transactions) {
    const key = t.merchant.trim();
    if (!merchantGroups[key]) merchantGroups[key] = [];
    merchantGroups[key].push(t);
  }

  const recurring: RecurringSubscription[] = [];

  for (const [merchant, txs] of Object.entries(merchantGroups)) {
    // Unique months YYYY-MM
    const months = new Set(txs.map((t) => t.date.substring(0, 7)));
    if (months.size < 2) continue;

    const amounts = txs.map((t) => t.amount);
    const count = amounts.length;
    const sum = amounts.reduce((acc, a) => acc + a, 0);
    const mean = sum / count;

    const variance = amounts.reduce((acc, a) => acc + Math.pow(a - mean, 2), 0) / count;
    const std = Math.sqrt(variance);
    const cv = mean > 0 ? std / mean : 0;

    if (cv < 0.2) {
      recurring.push({
        merchant,
        times_charged: count,
        avg_amount: Math.round(mean),
        total_monthly: Math.round(mean),
      });
    }
  }

  return recurring.sort((a, b) => b.avg_amount - a.avg_amount);
}

export function detectDuplicateCharges(transactions: Transaction[]): Transaction[] {
  const map: Record<string, Transaction[]> = {};

  for (const t of transactions) {
    const key = `${t.date.trim()}_${t.merchant.trim().toLowerCase()}_${t.amount}`;
    if (!map[key]) map[key] = [];
    map[key].push(t);
  }

  const duplicates: Transaction[] = [];
  for (const group of Object.values(map)) {
    if (group.length > 1) {
      duplicates.push(...group);
    }
  }

  return duplicates.sort((a, b) => a.date.localeCompare(b.date) || a.merchant.localeCompare(b.merchant));
}

export function detectPriceCreep(transactions: Transaction[]): PriceCreep[] {
  const recurring = detectRecurringSubscriptions(transactions);
  const recurringSet = new Set(recurring.map((r) => r.merchant.toLowerCase()));

  const merchantGroups: Record<string, Transaction[]> = {};

  const filtered = transactions.filter((t) => recurringSet.has(t.merchant.trim().toLowerCase()));

  for (const t of filtered) {
    const m = t.merchant.trim();
    if (!merchantGroups[m]) merchantGroups[m] = [];
    merchantGroups[m].push(t);
  }

  const priceCreeps: PriceCreep[] = [];

  for (const [merchant, txs] of Object.entries(merchantGroups)) {
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) continue;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      if (curr.amount > prev.amount) {
        priceCreeps.push({
          merchant,
          date: curr.date,
          old_amount: prev.amount,
          new_amount: curr.amount,
          increase: curr.amount - prev.amount,
        });
      }
    }
  }

  return priceCreeps;
}

export function analyzeLeaks(transactions: Transaction[]): LeakResults {
  return {
    recurring: detectRecurringSubscriptions(transactions),
    duplicates: detectDuplicateCharges(transactions),
    priceCreep: detectPriceCreep(transactions),
  };
}
