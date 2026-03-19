'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-2 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/20">
              <Icon className="w-5 h-5 text-brand-400" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-gray-400 mt-1 ml-1">{subtitle}</p>}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-glow text-sm px-4 py-2.5">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-glow text-sm px-4 py-2.5">
            {action.label}
          </button>
        )
      )}
    </motion.div>
  );
}
