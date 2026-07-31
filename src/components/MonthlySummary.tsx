import React from 'react';
import { Sparkles, FileText, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface MonthlySummaryProps {
  summary: string;
  poweredByAI: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  summary,
  poweredByAI,
  isLoading,
  onRefresh,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-emerald-100/90 shadow-xs rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-extrabold text-emerald-950">Monthly Summary</h3>
          {poweredByAI && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Gemini AI Powered
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-emerald-700 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          title="Regenerate summary"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-2xl p-4 text-sm text-slate-800 leading-relaxed font-medium">
        {isLoading ? (
          <div className="flex items-center gap-2 text-emerald-800 py-2 font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            Analyzing statement and generating intelligence summary...
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {summary}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

