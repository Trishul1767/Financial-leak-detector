import React, { useState } from 'react';
import { Search, ArrowUpDown, Tag } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: string[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'date') {
      return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    } else {
      return sortAsc ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-emerald-950">All Transactions ({sorted.length})</h3>
          <p className="text-xs text-emerald-700/80">Search and filter parsed statement data</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant or memo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-emerald-50/50 border border-emerald-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50/50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-emerald-900">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-white text-slate-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-slate-900">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-emerald-100 max-h-96 overflow-y-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-emerald-50/90 sticky top-0 text-emerald-900 uppercase tracking-wider font-semibold border-b border-emerald-100 z-10">
            <tr>
              <th className="p-3 cursor-pointer hover:text-emerald-950" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-1">
                  Date <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                </div>
              </th>
              <th className="p-3">Merchant</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-right cursor-pointer hover:text-emerald-950" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-end gap-1">
                  Amount <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  No matching transactions found.
                </td>
              </tr>
            ) : (
              sorted.map((t) => (
                <tr key={t.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="p-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                  <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">{t.merchant}</td>
                  <td className="p-3 text-slate-600 truncate max-w-xs">{t.description}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                      {t.category || 'Other'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                    ₹{t.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
