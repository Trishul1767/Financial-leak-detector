import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LeakResults } from '../types';

interface LeakTabsProps {
  leaks: LeakResults;
}

export const LeakTabs: React.FC<LeakTabsProps> = ({ leaks }) => {
  const [activeTab, setActiveTab] = useState<'recurring' | 'duplicates' | 'priceCreep'>('recurring');

  const monthlyTotal = leaks.recurring.reduce((acc, r) => acc + r.avg_amount, 0);

  const tabs = [
    { id: 'recurring', label: `Recurring Subscriptions (${leaks.recurring.length})` },
    { id: 'duplicates', label: `Duplicate Charges (${Math.floor(leaks.duplicates.length / 2)})` },
    { id: 'priceCreep', label: `Price Creep (${leaks.priceCreep.length})` },
  ] as const;

  return (
    <div className="bg-white border border-emerald-100/90 shadow-xs rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2">
            <span className="text-xl">🚨</span> Leaks Found
          </h2>
          <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
            Automated, explainable detection rules flagging wasteful charges
          </p>
        </div>

        <div className="flex bg-emerald-50/80 p-1 rounded-2xl border border-emerald-200/80 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.id ? 'text-white' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeLeakTab"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- TAB 1: RECURRING SUBSCRIPTIONS --- */}
        {activeTab === 'recurring' && (
          <motion.div
            key="recurring"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {leaks.recurring.length === 0 ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-center text-emerald-800 flex items-center justify-center gap-2 text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                No recurring charges detected.
              </div>
            ) : (
              <>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-medium">
                  <AlertTriangle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    You&apos;re paying roughly{' '}
                    <strong className="text-emerald-950 font-extrabold">
                      ₹{monthlyTotal.toLocaleString('en-IN')}/month
                    </strong>{' '}
                    across recurring charges.
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-emerald-50/80 text-emerald-950 uppercase tracking-wider font-extrabold border-b border-emerald-100">
                      <tr>
                        <th className="p-3.5">Merchant</th>
                        <th className="p-3.5">Times Charged</th>
                        <th className="p-3.5">Avg Amount</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {leaks.recurring.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-emerald-950">{item.merchant}</td>
                          <td className="p-3.5 font-medium">{item.times_charged} times</td>
                          <td className="p-3.5 font-extrabold text-emerald-700">
                            ₹{item.avg_amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <RefreshCw className="w-3 h-3" /> Recurring
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* --- TAB 2: DUPLICATE CHARGES --- */}
        {activeTab === 'duplicates' && (
          <motion.div
            key="duplicates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {leaks.duplicates.length === 0 ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-center text-emerald-800 flex items-center justify-center gap-2 text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                No duplicate charges detected.
              </div>
            ) : (
              <>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>
                    Found{' '}
                    <strong className="text-rose-950 font-extrabold">
                      {Math.floor(leaks.duplicates.length / 2)}
                    </strong>{' '}
                    potential duplicate charge(s) - worth disputing with your bank or vendor.
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-emerald-50/80 text-emerald-950 uppercase tracking-wider font-extrabold border-b border-emerald-100">
                      <tr>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Merchant</th>
                        <th className="p-3.5">Description</th>
                        <th className="p-3.5">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {leaks.duplicates.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-rose-50/30 hover:bg-rose-50/60 transition-colors"
                        >
                          <td className="p-3.5 text-slate-500 font-medium">{item.date}</td>
                          <td className="p-3.5 font-bold text-slate-900">{item.merchant}</td>
                          <td className="p-3.5 text-slate-600 font-medium">{item.description}</td>
                          <td className="p-3.5 font-black text-rose-700">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* --- TAB 3: PRICE CREEP --- */}
        {activeTab === 'priceCreep' && (
          <motion.div
            key="priceCreep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {leaks.priceCreep.length === 0 ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-center text-emerald-800 flex items-center justify-center gap-2 text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                No price increases detected on recurring services.
              </div>
            ) : (
              <>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-sm font-medium">
                  <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    These merchants raised their recurring prices over time without an explicit warning.
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-emerald-50/80 text-emerald-950 uppercase tracking-wider font-extrabold border-b border-emerald-100">
                      <tr>
                        <th className="p-3.5">Merchant</th>
                        <th className="p-3.5">Increase Date</th>
                        <th className="p-3.5">Old Price</th>
                        <th className="p-3.5">New Price</th>
                        <th className="p-3.5">Increase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {leaks.priceCreep.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-emerald-50/40 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-slate-900">{item.merchant}</td>
                          <td className="p-3.5 text-slate-500 font-medium">{item.date}</td>
                          <td className="p-3.5 text-slate-600 font-medium">₹{item.old_amount.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 font-bold text-slate-900">₹{item.new_amount.toLocaleString('en-IN')}</td>
                          <td className="p-3.5 font-black text-amber-700">
                            +₹{item.increase.toLocaleString('en-IN')}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

