import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DailySpend } from '../types';

interface SpendingOverTimeChartProps {
  data: DailySpend[];
}

export const SpendingOverTimeChart: React.FC<SpendingOverTimeChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-emerald-100 shadow-sm rounded-2xl p-5 flex flex-col h-[380px]">
      <h3 className="text-base font-bold text-emerald-950 mb-4">Spending Over Time</h3>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-emerald-700/60 text-sm">
          No time data
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#a7f3d0"
                tick={{ fill: '#047857', fontSize: 11 }}
                tickFormatter={(dateStr) => dateStr.substring(5)}
              />
              <YAxis
                stroke="#a7f3d0"
                tick={{ fill: '#047857', fontSize: 11 }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Daily Total']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#a7f3d0', borderRadius: '12px', color: '#064e3b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
