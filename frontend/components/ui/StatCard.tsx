'use client';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'purple' | 'cyan' | 'emerald' | 'amber';
}

const colorMap = {
  purple:  { bg: 'bg-brand-500/15',   icon: 'text-brand-400',   ring: 'ring-brand-500/20' },
  cyan:    { bg: 'bg-cyan-500/15',    icon: 'text-cyan-400',    ring: 'ring-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/15', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/15',   icon: 'text-amber-400',   ring: 'ring-amber-500/20' },
};

export default function StatCard({ label, value, icon: Icon, trend, color = 'purple' }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass p-5 flex items-center gap-4"
    >
      <div className={cn('p-3 rounded-xl ring-1', colors.bg, colors.ring)}>
        <Icon className={cn('w-5 h-5', colors.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
}
