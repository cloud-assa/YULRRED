'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className, hover, gradient, onClick }: GlassCardProps) {
  if (gradient) {
    return (
      <div
        className={cn('relative rounded-2xl p-px', className)}
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.4))' }}
        onClick={onClick}
      >
        <div className="bg-[#0f0f1a] rounded-[calc(1rem-1px)] h-full w-full p-6">
          {children}
        </div>
      </div>
    );
  }

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 0 30px rgba(124,58,237,0.15)' }}
        className={cn('glass transition-all duration-200 hover:border-brand-500/30', className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn('glass', className)} onClick={onClick}>
      {children}
    </div>
  );
}
