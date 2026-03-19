'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { usersApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import DealCard from '@/components/deals/DealCard';
import StatCard from '@/components/ui/StatCard';
import NotificationItem from '@/components/ui/NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import { TrendingUp, Zap, ShoppingCart, Package, Info, Handshake, Bell, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    usersApi.dashboard()
      .then(setData)
      .catch(() => toast.error('Error al cargar el panel'))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] mb-3" />
              <div className="h-7 w-24 bg-white/[0.05] rounded-lg mb-2" />
              <div className="h-3 w-16 bg-white/[0.03] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const allDeals = [...(data?.buyerDeals || []), ...(data?.sellerDeals || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const notifications = (data?.notifications || []).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Bienvenido, <span className="text-gradient">{session?.user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Aquí tienes el resumen de tus tratos</p>
        </div>
        <Link href="/deals/new" className="btn-glow text-sm px-4 py-2.5 gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />Nuevo Trato
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Volumen Total',    value: formatCurrency(stats.totalVolume || 0), icon: TrendingUp, color: 'emerald' as const },
          { label: 'Tratos Activos',   value: stats.activeDeals || 0,                 icon: Zap,        color: 'cyan' as const },
          { label: 'Como Comprador',   value: stats.buyerDealsCount || 0,             icon: ShoppingCart,color: 'purple' as const },
          { label: 'Como Vendedor',    value: stats.sellerDealsCount || 0,            icon: Package,    color: 'amber' as const },
        ].map((s) => (
          <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Fee Banner */}
      <div className="glass p-4 flex items-center gap-3" style={{ borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
        <div className="p-2 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
          <Info className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Comisión de Plataforma: 5%</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Descontada automáticamente del pago al vendedor en tratos completados.
          </p>
        </div>
      </div>

      {/* Main split */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent deals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Handshake className="w-4 h-4 text-brand-400" />
              Tratos Recientes
            </h2>
            <Link href="/deals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Ver todos →
            </Link>
          </div>
          {allDeals.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="Sin tratos aún"
              description="Crea tu primer trato y empieza a negociar de forma segura."
              action={{ label: '+ Crear Trato', href: '/deals/new' }}
            />
          ) : (
            <div className="space-y-3">
              {allDeals.map((deal: any) => (
                <DealCard key={deal.id} deal={deal} currentUserId={session?.user?.id || ''} />
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              Notificaciones
            </h2>
            <Link href="/notifications" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Ver todas →
            </Link>
          </div>
          {notifications.length === 0 ? (
            <div className="glass p-6 text-center">
              <Bell className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
