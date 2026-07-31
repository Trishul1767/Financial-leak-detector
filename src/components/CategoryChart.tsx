import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryTotal } from '../types';

interface CategoryChartProps {
  categories: CategoryTotal[];
}

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  return (
    <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-5 flex flex-col h-[380px]">
      <h3 className="text-base font-bold text-emerald-950 mb-4">Spending by Category</h3>
      {categories.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-emerald-700/60 text-sm">
          No category data
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="amount"
                nameKey="category"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#a7f3d0', borderRadius: '12px', color: '#064e3b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs font-medium text-slate-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
