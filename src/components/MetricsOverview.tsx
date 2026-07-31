import React from 'react';
import { IndianRupee, CreditCard, PieChart, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricsOverviewProps {
  totalSpend: number;
  numTransactions: number;
  topCategory: string;
  recurringMonthlyTotal: number;
  duplicateCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalSpend,
  numTransactions,
  topCategory,
  recurringMonthlyTotal,
  duplicateCount,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-emerald-100 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-5 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Total Spend</span>
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">
          ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">Across analyzed statement</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-emerald-100 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-5 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Transactions</span>
          <div className="p-2 bg-teal-100 text-teal-700 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 tracking-tight">{numTransactions}</div>
        <p className="text-xs text-slate-500 font-medium mt-1">Total items processed</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-white border border-emerald-100 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-5 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Top Category</span>
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 truncate tracking-tight">{topCategory}</div>
        <p className="text-xs text-slate-500 font-medium mt-1">Highest spending area</p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="bg-emerald-50/70 border-2 border-emerald-300 shadow-xs hover:shadow-md transition-shadow rounded-2xl p-5 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">Flagged Leaks</span>
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-800 tracking-tight">
          ₹{recurringMonthlyTotal.toLocaleString('en-IN')}/mo
        </div>
        <p className="text-xs text-emerald-900/80 font-semibold mt-1">
          {duplicateCount > 0 ? `${duplicateCount / 2} duplicate charge(s) detected` : 'Recurring subscriptions'}
        </p>
      </motion.div>
    </motion.div>
  );
};

