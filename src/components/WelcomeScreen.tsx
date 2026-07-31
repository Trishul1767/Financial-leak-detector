import React, { useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface WelcomeScreenProps {
  onSaveName: (name: string) => void;
  initialName?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSaveName, initialName = '' }) => {
  const [nameInput, setNameInput] = useState(initialName);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError(true);
      return;
    }
    onSaveName(nameInput.trim());
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Background Motion Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Brand Tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto w-full flex items-center justify-between z-10"
      >
        <Logo size="lg" showText={true} animated={true} />
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI-Powered Expense Intelligence
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto w-full my-auto py-12 text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-tight">
            Find where your money is{' '}
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-8">
              quietly leaking
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            Uncover forgotten subscriptions, duplicate charges, and hidden price increases in seconds.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, type: 'spring', stiffness: 200 }}
          className="bg-white/80 backdrop-blur-md border border-emerald-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-emerald-900/5 max-w-md mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="userNameInput" className="block text-sm font-extrabold text-emerald-950 mb-2">
                Enter your name
              </label>
              <input
                id="userNameInput"
                type="text"
                autoFocus
                placeholder="e.g. Alex"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full px-4 py-3.5 bg-emerald-50/30 border ${
                  error
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : 'border-emerald-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200'
                } rounded-2xl text-slate-900 placeholder-slate-400 font-semibold text-base outline-none transition-all`}
              />
              {error && (
                <p className="text-xs font-bold text-rose-600 mt-2">Please enter your name to continue.</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600 pt-2"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Private & Local Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 rounded-full border border-emerald-100">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Automated Leak Rules</span>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto w-full text-center text-xs font-medium text-slate-400 z-10"
      >
        Leak Detector &bull; AI Financial Audit Tool
      </motion.div>
    </div>
  );
};

