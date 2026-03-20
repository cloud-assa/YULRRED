'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { dealsApi } from '@/lib/api';
import DealCard from '@/components/deals/DealCard';
import FilterTabs from '@/components/ui/FilterTabs';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { Handshake } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  ALL: 'Todos', PENDING: 'Pendiente', FUNDED: 'Fondeado',
  DELIVERED: 'Entregado', COMPLETED: 'Completado', DISPUTED: 'Disputado',
};

export default function DealsPage() {
  const { data: session, status } = useSession();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;
    setLoading(true);
    dealsApi.list()
      .then(setDeals)
      .catch(() => toast.error('Error al cargar los tratos'))
      .finally(() => setLoading(false));
  }, [status, retry]);

  const statuses = ['ALL', 'PENDING', 'FUNDED', 'DELIVERED', 'COMPLETED', 'DISPUTED'];
  const filtered = filter === 'ALL' ? deals : deals.filter((d) => d.status === filter);

  const tabOptions = statuses.map((s) => ({
    value: s,
    label: STATUS_LABELS[s] || s,
    count: s === 'ALL' ? deals.length : deals.filter((d) => d.status === s).length,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-0">
      <PageHeader
        title="Mis Tratos"
        icon={Handshake}
        subtitle={`${deals.length} tratos en total`}
        action={{ label: '+ Nuevo Trato', href: '/deals/new' }}
      />

      <FilterTabs options={tabOptions} value={filter} onChange={setFilter} />

      <div className="flex justify-end mb-1">
        <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors" onClick={() => setRetry((r) => r + 1)}>
          ↻ Actualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No se encontraron tratos"
          description={filter === 'ALL' ? 'Crea tu primer trato para comenzar.' : 'No hay tratos con este estado.'}
          action={filter === 'ALL' ? { label: '+ Crear Trato', href: '/deals/new' } : undefined}
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filtered.map((deal, i) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DealCard deal={deal} currentUserId={session?.user?.id || ''} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
