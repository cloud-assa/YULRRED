'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils';
import { DealStatusBadge } from '@/components/ui/StatusBadge';

interface Deal {
  id: string;
  title: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  status: string;
  deadline: string;
  createdAt: string;
  buyer: { name: string; email: string };
  seller: { name: string; email: string };
}

export default function DealCard({ deal }: { deal: Deal; currentUserId?: string }) {
  return (
    <Link href={`/deals/${deal.id}`} className="block group">
      <motion.div
        whileHover={{ y: -2 }}
        className="glass p-5 transition-all duration-200 group-hover:border-brand-500/30 group-hover:shadow-glow-sm"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
              {deal.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <span>{deal.buyer?.name}</span>
              <ArrowRight className="w-3 h-3 text-gray-600" />
              <span>{deal.seller?.name}</span>
            </div>
          </div>
          <DealStatusBadge status={deal.status} />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{formatCurrency(deal.amount)}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {formatDate(deal.deadline)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">{formatRelative(deal.createdAt)}</p>
            {deal.status === 'COMPLETED' && (
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                Recibió {formatCurrency(deal.netAmount)}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
