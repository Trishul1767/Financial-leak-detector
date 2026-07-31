import { useState, useEffect, useMemo, useCallback } from 'react';
import { Edit3, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { MetricsOverview } from './components/MetricsOverview';
import { CategoryChart } from './components/CategoryChart';
import { SpendingOverTimeChart } from './components/SpendingOverTimeChart';
import { LeakTabs } from './components/LeakTabs';
import { MonthlySummary } from './components/MonthlySummary';
import { TransactionTable } from './components/TransactionTable';
import { WelcomeScreen } from './components/WelcomeScreen';

import { Transaction, CategoryTotal, DailySpend } from './types';
import { SAMPLE_CSV_TEXT } from './data/sample_transactions';
import { normalizeAndParseCSV } from './lib/csv_parser';
import { categorizeTransactions } from './lib/categorize';
import { analyzeLeaks } from './lib/leak_detection';

export function App() {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('leak_detector_user_name') || '';
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isUsingSample, setIsUsingSample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [summary, setSummary] = useState<string>('');
  const [poweredByAI, setPoweredByAI] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleSaveName = (name: string) => {
    localStorage.setItem('leak_detector_user_name', name);
    setUserName(name);
    setIsEditingName(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('leak_detector_user_name');
    setUserName('');
    setIsEditingName(false);
    setTransactions([]);
    setSummary('');
    setErrorMsg(null);
  };

  // Load sample data on initial mount
  const loadSampleData = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const parsed = normalizeAndParseCSV(SAMPLE_CSV_TEXT);
      const categorized = categorizeTransactions(parsed);
      setTransactions(categorized);
      setIsUsingSample(true);
    } catch (err) {
      console.error('Error loading sample data:', err);
      setErrorMsg('Failed to parse sample data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  // Handle File Upload (CSV or PDF)
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('PDF parsing failed on server');

        const data = await res.json();
        if (!data.transactions || data.transactions.length === 0) {
          setErrorMsg(
            "Couldn't find recognizable transactions in this PDF statement. Try a CSV export instead."
          );
          setIsLoading(false);
          return;
        }

        const formatted: Transaction[] = data.transactions.map((t: any, idx: number) => ({
          id: `pdf_tx_${idx}_${Date.now()}`,
          date: t.date,
          merchant: t.merchant,
          description: t.description || t.merchant,
          amount: Math.abs(t.amount),
        }));

        const categorized = categorizeTransactions(formatted);
        setTransactions(categorized);
        setIsUsingSample(false);
      } else {
        const text = await file.text();
        const parsed = normalizeAndParseCSV(text);
        if (parsed.length === 0) {
          setErrorMsg(
            'Missing required columns or empty file. Expected Date, Merchant/Description, Amount.'
          );
          setIsLoading(false);
          return;
        }
        const categorized = categorizeTransactions(parsed);
        setTransactions(categorized);
        setIsUsingSample(false);
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setErrorMsg('Error reading file. Please upload a valid CSV or PDF bank statement.');
    } finally {
      setIsLoading(false);
    }
  };

  // Metrics computation
  const totalSpend = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const numTransactions = transactions.length;

  const categoryTotals = useMemo<CategoryTotal[]>(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    for (const t of transactions) {
      const cat = t.category || 'Other';
      if (!map[cat]) map[cat] = { amount: 0, count: 0 };
      map[cat].amount += t.amount;
      map[cat].count += 1;
    }
    return Object.entries(map)
      .map(([category, { amount, count }]) => ({ category, amount, count }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topCategory = categoryTotals.length > 0 ? categoryTotals[0].category : 'N/A';

  const dailySpend = useMemo<DailySpend[]>(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (!t.date) continue;
      map[t.date] = (map[t.date] || 0) + t.amount;
    }
    return Object.entries(map)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const leaks = useMemo(() => analyzeLeaks(transactions), [transactions]);

  const recurringMonthlyTotal = useMemo(() => {
    return leaks.recurring.reduce((acc, r) => acc + r.avg_amount, 0);
  }, [leaks]);

  // Request AI / Fallback Summary
  const fetchSummary = useCallback(async () => {
    if (transactions.length === 0) return;
    setSummaryLoading(true);

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_spend: Math.round(totalSpend),
          num_transactions: numTransactions,
          top_category: topCategory,
          recurring_count: leaks.recurring.length,
          recurring_total: recurringMonthlyTotal,
          duplicate_count: leaks.duplicates.length / 2,
          category_totals: categoryTotals.slice(0, 5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setPoweredByAI(!!data.poweredByAI);
      } else {
        throw new Error('Summary request failed');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setSummary(
        `You spent ₹${Math.round(totalSpend).toLocaleString('en-IN')} across ${numTransactions} transactions. Your biggest category was ${topCategory}.`
      );
      setPoweredByAI(false);
    } finally {
      setSummaryLoading(false);
    }
  }, [transactions, totalSpend, numTransactions, topCategory, leaks, recurringMonthlyTotal, categoryTotals]);

  useEffect(() => {
    if (transactions.length > 0) {
      fetchSummary();
    }
  }, [transactions, fetchSummary]);

  const categoriesList = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.category || 'Other')));
  }, [transactions]);

  return (
    <AnimatePresence mode="wait">
      {!userName || isEditingName ? (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <WelcomeScreen
            onSaveName={handleSaveName}
            initialName={userName}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-emerald-50/30 text-slate-900 flex flex-col lg:flex-row font-sans"
        >
          <Sidebar
            onFileUpload={handleFileUpload}
            onUseSampleData={loadSampleData}
            isUsingSample={isUsingSample}
            isLoading={isLoading}
          />

          <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Header Greeting Banner */}
            <motion.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between gap-4 pb-2 border-b border-emerald-100/80"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                  Welcome, {userName}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-emerald-800/80 font-medium mt-0.5">
                  Here is your financial leak audit and subscription breakdown.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingName(true)}
                  className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit your name"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Name</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Log out and clear session data"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log Out & Reset</span>
                </motion.button>
              </div>
            </motion.header>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center justify-between shadow-xs font-medium"
              >
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-slate-600 hover:text-slate-900 text-xs font-bold px-2.5 py-1 bg-white border border-rose-200 rounded-lg cursor-pointer"
                >
                  Dismiss
                </button>
              </motion.div>
            )}

            {isUsingSample && (
              <div className="p-3.5 bg-emerald-100/70 border border-emerald-200/90 rounded-2xl text-emerald-950 text-xs font-semibold flex items-center justify-between shadow-2xs">
                <span>
                  ℹ️ Currently displaying built-in sample data. Upload your bank CSV or statement PDF in the sidebar to analyze real transactions.
                </span>
              </div>
            )}

            <MetricsOverview
              totalSpend={totalSpend}
              numTransactions={numTransactions}
              topCategory={topCategory}
              recurringMonthlyTotal={recurringMonthlyTotal}
              duplicateCount={leaks.duplicates.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart categories={categoryTotals} />
              <SpendingOverTimeChart data={dailySpend} />
            </div>

            <LeakTabs leaks={leaks} />

            <MonthlySummary
              summary={summary}
              poweredByAI={poweredByAI}
              isLoading={summaryLoading}
              onRefresh={fetchSummary}
            />

            <TransactionTable
              transactions={transactions}
              categories={categoriesList}
            />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
