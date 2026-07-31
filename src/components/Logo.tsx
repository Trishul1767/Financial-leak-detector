import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', svg: 'w-4 h-4', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', svg: 'w-5 h-5', text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-12 h-12', svg: 'w-6 h-6', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', svg: 'w-8 h-8', text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  const IconGraphic = (
    <div className={`relative flex items-center justify-center ${dim.icon} rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/20 ring-1 ring-emerald-300/40 shrink-0`}>
      {/* Animated subtle background glow */}
      {animated && (
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-2xl bg-emerald-400/40 blur-md -z-10"
        />
      )}

      {/* SVG Shield & Leaking Coin Radar */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${dim.svg} text-white drop-shadow-xs`}
      >
        {/* Shield outline */}
        <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.5 5.25-1.35 9-6.25 9-11.5V7l-9-5z" fill="rgba(255,255,255,0.12)" />
        {/* Rupee/Dollar Coin symbol with liquid drop */}
        <circle cx="12" cy="11" r="4" className="stroke-white" strokeWidth="1.75" />
        <path d="M11 9.5h2M11 11h2.2M12 9.5v3" className="stroke-white" strokeWidth="1.5" />
        {/* Leak droplet at bottom of shield */}
        <path d="M12 15.5c-0.8 0-1.5.7-1.5 1.5 0 1.2 1.5 2.5 1.5 2.5s1.5-1.3 1.5-2.5c0-.8-.7-1.5-1.5-1.5z" fill="currentColor" className="text-emerald-200" />
      </svg>
    </div>
  );

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.06, rotate: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {IconGraphic}
        </motion.div>
      ) : (
        IconGraphic
      )}

      {showText && (
        <div>
          <div className={`font-black ${dim.text} text-emerald-950 tracking-tight leading-none flex items-center gap-1.5`}>
            <span>Leak Detector</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className={`${dim.sub} text-emerald-700/80 font-medium tracking-normal mt-0.5`}>
            Financial Intelligence & Audit
          </p>
        </div>
      )}
    </div>
  );
};
