'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

export default function FilterTabs({ options, value, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 p-1 glass-sm rounded-xl mb-5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              active
                ? 'text-brand-300'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            )}
          >
            {active && (
              <motion.span
                layoutId="active-filter"
                className="absolute inset-0 bg-brand-500/20 border border-brand-500/30 rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opt.label}
              {opt.count !== undefined && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  active ? 'bg-brand-500/30 text-brand-300' : 'bg-white/5 text-gray-500'
                )}>
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
