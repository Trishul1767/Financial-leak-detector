import React, { useRef } from 'react';
import { Upload, FileText, Database, ShieldAlert, FileCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  onUseSampleData: () => void;
  isUsingSample: boolean;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onFileUpload,
  onUseSampleData,
  isUsingSample,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-emerald-100/80 shadow-xs p-6 flex flex-col gap-6 shrink-0">
      <div className="pb-2 border-b border-emerald-100/60">
        <Logo size="md" showText={true} animated={true} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-800/90 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-emerald-600" />
          Data Input
        </label>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 text-center cursor-pointer transition-colors group shadow-2xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.pdf"
            className="hidden"
          />
          <motion.div
            animate={isLoading ? { rotate: 360 } : { y: [0, -3, 0] }}
            transition={isLoading ? { repeat: Infinity, duration: 1, ease: 'linear' } : { repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Upload className="w-8 h-8 mx-auto text-emerald-600 group-hover:text-emerald-700 mb-2" />
          </motion.div>
          <p className="text-sm font-bold text-emerald-950">
            Upload CSV or PDF statement
          </p>
          <p className="text-xs text-emerald-700/70 font-medium mt-1">Drag & drop or click to browse</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUseSampleData}
          disabled={isLoading}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
            isUsingSample
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          {isUsingSample ? 'Using Sample Data' : 'Load Built-in Sample Data'}
        </motion.button>
      </div>

      <div className="bg-emerald-50/60 border border-emerald-100/90 rounded-2xl p-4 text-xs text-emerald-800/90 space-y-2.5 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <FileCode className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950 block mb-0.5 font-bold">CSV Auto-Mapping</strong>
            Normalizes Date, Merchant, Description, Amount columns automatically.
          </div>
        </div>
        <div className="flex items-start gap-2.5 border-t border-emerald-200/60 pt-2.5">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950 block mb-0.5 font-bold">PDF Statement Parser</strong>
            Extracts transaction tables and statement lines from bank PDFs.
          </div>
        </div>
      </div>
    </aside>
  );
};

