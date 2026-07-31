export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  description: string;
  amount: number;
  category?: string;
}

export interface RecurringSubscription {
  merchant: string;
  times_charged: number;
  avg_amount: number;
  total_monthly: number;
}

export interface DuplicateCharge {
  date: string;
  merchant: string;
  amount: number;
  description: string;
  count: number;
}

export interface PriceCreep {
  merchant: string;
  date: string;
  old_amount: number;
  new_amount: number;
  increase: number;
}

export interface LeakResults {
  recurring: RecurringSubscription[];
  duplicates: Transaction[];
  priceCreep: PriceCreep[];
}

export interface CategoryTotal {
  category: string;
  amount: number;
  count: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}
