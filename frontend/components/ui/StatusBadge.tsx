import { cn } from '@/lib/utils';
import {
  Clock, Wallet, Package, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  AlertCircle, Eye, UserCheck, Briefcase
} from 'lucide-react';

const DEAL_STATUS_MAP: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  PENDING:   { label: 'Pendiente',   className: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',   Icon: Clock },
  FUNDED:    { label: 'Fondeado',    className: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',       Icon: Wallet },
  DELIVERED: { label: 'Entregado',   className: 'bg-purple-500/15 text-purple-300 border border-purple-500/20', Icon: Package },
  COMPLETED: { label: 'Completado',  className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20', Icon: CheckCircle2 },
  DISPUTED:  { label: 'Disputado',   className: 'bg-red-500/15 text-red-300 border border-red-500/20',          Icon: AlertTriangle },
  CANCELLED: { label: 'Cancelado',   className: 'bg-white/5 text-gray-400 border border-white/10',             Icon: XCircle },
  REFUNDED:  { label: 'Reembolsado', className: 'bg-orange-500/15 text-orange-300 border border-orange-500/20', Icon: RefreshCw },
};

const DISPUTE_STATUS_MAP: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  OPEN:             { label: 'Abierta',             className: 'bg-red-500/15 text-red-300 border border-red-500/20',       Icon: AlertCircle },
  UNDER_REVIEW:     { label: 'En Revisión',          className: 'bg-amber-500/15 text-amber-300 border border-amber-500/20', Icon: Eye },
  RESOLVED_BUYER:   { label: 'Resuelta: Comprador',  className: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',   Icon: UserCheck },
  RESOLVED_SELLER:  { label: 'Resuelta: Vendedor',   className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20', Icon: Briefcase },
};

export function DealStatusBadge({ status }: { status: string }) {
  const config = DEAL_STATUS_MAP[status] ?? { label: status, className: 'bg-white/5 text-gray-400 border border-white/10', Icon: Clock };
  const { label, className, Icon } = config;
  return (
    <span className={cn('badge', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function DisputeStatusBadge({ status }: { status: string }) {
  const config = DISPUTE_STATUS_MAP[status] ?? { label: status, className: 'bg-white/5 text-gray-400 border border-white/10', Icon: AlertCircle };
  const { label, className, Icon } = config;
  return (
    <span className={cn('badge', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default DealStatusBadge;
