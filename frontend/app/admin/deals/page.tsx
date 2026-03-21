'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { dealsApi } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DealStatusBadge } from '@/components/ui/StatusBadge';
import FilterTabs from '@/components/ui/FilterTabs';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { ClipboardList, CheckCircle2, TrendingUp, DollarSign, ArrowRight, Calendar, ExternalLink } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Todos', PENDING: 'Pendiente', FUNDED: 'Fondeado', DELIVERED: 'Entregado',
  COMPLETED: 'Completado', DISPUTED: 'Disputado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
};

export default function AdminDealsPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken as string | null | undefined;
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    // accessToken guard: evita llamada sin token cuando sesión está caducada
    if (status !== 'authenticated' || !accessToken) return;
    dealsApi.allAdmin().then(setDeals).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false));
  }, [status, accessToken]);

  const statuses = ['ALL', 'PENDING', 'FUNDED', 'DELIVERED', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED'];
  const filtered = filter === 'ALL' ? deals : deals.filter((d) => d.status === filter);
  const completed = deals.filter((d) => d.status === 'COMPLETED');
  const totalVolume = completed.reduce((s, d) => s + d.amount, 0);
  const totalFees = completed.reduce((s, d) => s + d.feeAmount, 0);

  const tabs = statuses.map((s) => ({
    value: s, label: STATUS_LABELS[s] || s, count: s === 'ALL' ? deals.length : deals.filter((d) => d.status === s).length,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader title="Todos los Tratos" icon={ClipboardList} subtitle="Gestión de tratos de la plataforma" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tratos"     value={deals.length}             icon={ClipboardList} color="purple" />
        <StatCard label="Completados"      value={completed.length}         icon={CheckCircle2}  color="emerald" />
        <StatCard label="Volumen Total"    value={formatCurrency(totalVolume)} icon={TrendingUp}  color="cyan" />
        <StatCard label="Ingresos Plataforma" value={formatCurrency(totalFees)} icon={DollarSign} color="amber" />
      </div>

      <FilterTabs options={tabs} value={filter} onChange={setFilter} />

      {loading ? (
        <div className="glass animate-pulse h-48" />
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Trato', 'Partes', 'Monto', 'Estado', 'Fecha Límite', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: 'none' }}>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No se encontraron tratos</td></tr>
                ) : filtered.map((deal) => (
                  <tr key={deal.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white truncate max-w-[200px]">{deal.title}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{deal.id.slice(0, 12)}…</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="text-white">{deal.buyer?.name}</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span>{deal.seller?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-white">{formatCurrency(deal.amount)}</p>
                      {deal.status === 'COMPLETED' && (
                        <p className="text-[10px] text-emerald-400 mt-0.5">+{formatCurrency(deal.feeAmount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4"><DealStatusBadge status={deal.status} /></td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(deal.deadline)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/deals/${deal.id}`} className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">
                        Ver <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
