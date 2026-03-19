'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { dealsApi, paymentsApi, disputesApi } from '@/lib/api';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils';
import { DealStatusBadge, DisputeStatusBadge } from '@/components/ui/StatusBadge';
import ProgressStepper from '@/components/ui/ProgressStepper';
import FeeCalculator from '@/components/ui/FeeCalculator';
import Avatar from '@/components/ui/Avatar';
import {
  ArrowLeft, Wallet, Package, CheckCircle2, Clock, Lock, Loader2,
  ShoppingCart, AlertTriangle, PartyPopper, Scale, Calendar, XCircle
} from 'lucide-react';

function PaymentSection({ deal, onFunded }: { deal: any; onFunded: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleFund = async () => {
    setLoading(true);
    try {
      await paymentsApi.confirmFunding(deal.id);
      toast.success('¡Trato fondeado! Los fondos están en garantía.');
      onFunded();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="glass p-5 space-y-4" style={{ borderLeft: '3px solid rgba(245,158,11,0.5)' }}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-500/15 ring-1 ring-amber-500/20">
          <Wallet className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="font-semibold text-white">Fondear este Trato</h3>
      </div>
      <p className="text-sm text-gray-400">
        Tu pago se mantiene en garantía. Los fondos solo se liberan cuando confirmas la entrega.
      </p>
      <FeeCalculator amount={deal.amount} />
      <button onClick={handleFund} disabled={loading} className="btn-glow w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando...</> : `Pagar ${formatCurrency(deal.amount)} — Fondear`}
      </button>
      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Asegurado por Stripe
      </p>
    </div>
  );
}

function DeliverSection({ deal, onDelivered }: { deal: any; onDelivered: () => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ deliveryNote: string }>();
  const onSubmit = async (data: { deliveryNote: string }) => {
    setLoading(true);
    try {
      await dealsApi.deliver(deal.id, data.deliveryNote);
      toast.success('¡Marcado como entregado!');
      onDelivered();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="glass p-5 space-y-4" style={{ borderLeft: '3px solid rgba(168,85,247,0.5)' }}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-purple-500/15 ring-1 ring-purple-500/20">
          <Package className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="font-semibold text-white">Marcar como Entregado</h3>
      </div>
      <p className="text-sm text-gray-400">Proporciona los detalles de entrega. El comprador revisará y confirmará.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <textarea rows={3} placeholder="Nota de entrega: enlaces, archivos, instrucciones..." className="input-glass resize-none" {...register('deliveryNote')} />
        <button type="submit" disabled={loading} className="btn-glow w-full">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Marcar como Entregado'}
        </button>
      </form>
    </div>
  );
}

function ConfirmSection({ deal, onConfirmed }: { deal: any; onConfirmed: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const { register, handleSubmit } = useForm<{ reason: string; evidence: string }>();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await paymentsApi.releaseFunds(deal.id);
      toast.success('¡Recepción confirmada! Fondos liberados al vendedor.');
      onConfirmed();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const onDispute = async (data: { reason: string; evidence: string }) => {
    setLoading(true);
    try {
      await disputesApi.raise(deal.id, data);
      toast.success('Disputa abierta. Nuestro equipo la revisará.');
      onConfirmed();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <div className="glass p-5 space-y-4" style={{ borderLeft: '3px solid rgba(16,185,129,0.5)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white">Confirmar Recepción</h3>
        </div>
        {deal.deliveryNote && (
          <div className="glass-sm p-3">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Nota del Vendedor</p>
            <p className="text-sm text-gray-300">{deal.deliveryNote}</p>
          </div>
        )}
        <p className="text-sm text-gray-400">
          Si estás satisfecho, confirma para liberar <span className="text-emerald-400 font-semibold">{formatCurrency(deal.netAmount)}</span> al vendedor.
        </p>
        <button onClick={handleConfirm} disabled={loading} className="btn-glow w-full" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando...</> : `Confirmar y Liberar ${formatCurrency(deal.netAmount)}`}
        </button>
      </div>

      {!showDispute ? (
        <button onClick={() => setShowDispute(true)} className="btn-danger-glass w-full">
          <AlertTriangle className="w-4 h-4" /> Abrir una Disputa
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass p-5 space-y-3"
            style={{ borderLeft: '3px solid rgba(239,68,68,0.5)' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/15 ring-1 ring-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Abrir una Disputa</h3>
            </div>
            <p className="text-sm text-gray-400">Nuestro equipo revisará la evidencia de ambas partes.</p>
            <form onSubmit={handleSubmit(onDispute)} className="space-y-3">
              <textarea rows={3} placeholder="Motivo de la disputa (requerido)..." className="input-glass resize-none" style={{ borderColor: 'rgba(239,68,68,0.3)' }} {...register('reason', { required: true })} />
              <textarea rows={2} placeholder="Evidencia (opcional — enlaces, capturas...)" className="input-glass resize-none" style={{ borderColor: 'rgba(239,68,68,0.2)' }} {...register('evidence')} />
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn-danger-glass flex-1">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : 'Enviar Disputa'}
                </button>
                <button type="button" onClick={() => setShowDispute(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function CancelButton({ dealId, onCancelled }: { dealId: string; onCancelled: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar este trato?')) return;
    setLoading(true);
    try {
      await dealsApi.cancel(dealId);
      toast.success('Trato cancelado');
      onCancelled();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };
  return (
    <button onClick={handleCancel} disabled={loading} className="btn-danger-glass w-full">
      {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Cancelando...</> : <><XCircle className="w-4 h-4" />Cancelar Trato</>}
    </button>
  );
}

const STEPS = [
  { key: 'PENDING',   label: 'Pendiente',  icon: Clock },
  { key: 'FUNDED',    label: 'Fondeado',   icon: Wallet },
  { key: 'DELIVERED', label: 'Entregado',  icon: Package },
  { key: 'COMPLETED', label: 'Completado', icon: CheckCircle2 },
];

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDeal = async () => {
    try { setDeal(await dealsApi.get(id)); }
    catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDeal(); }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="glass p-6 animate-pulse h-24" />
      <div className="glass p-5 animate-pulse h-16" />
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="glass p-6 animate-pulse h-48" />
          <div className="glass p-6 animate-pulse h-32" />
        </div>
        <div className="lg:col-span-2"><div className="glass p-5 animate-pulse h-48" /></div>
      </div>
    </div>
  );
  if (!deal) return <div className="text-center py-20 text-gray-500">Trato no encontrado</div>;

  const isBuyer = deal.buyer?.id === session?.user?.id;
  const isSeller = deal.seller?.id === session?.user?.id;
  const currentStepIdx = STEPS.findIndex((s) => s.key === deal.status);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-3">
          <ArrowLeft className="w-4 h-4" />Volver a tratos
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
            <p className="text-gray-500 text-sm mt-1">Creado {formatRelative(deal.createdAt)}</p>
          </div>
          <DealStatusBadge status={deal.status} />
        </div>
      </motion.div>

      {/* Progress stepper */}
      {!['DISPUTED', 'CANCELLED', 'REFUNDED'].includes(deal.status) && (
        <div className="glass p-5">
          <ProgressStepper steps={STEPS} currentStep={currentStepIdx} />
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left */}
        <div className="lg:col-span-3 space-y-4">
          {/* Info */}
          <div className="glass p-5 space-y-4">
            <h2 className="font-semibold text-white">Información del Trato</h2>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{deal.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              {[
                { label: 'Monto', value: formatCurrency(deal.amount), color: 'text-white', large: true },
                { label: 'Fecha Límite', value: formatDate(deal.deadline), color: 'text-white' },
                { label: 'Comisión (5%)', value: formatCurrency(deal.feeAmount), color: 'text-amber-300' },
                { label: 'Vendedor Recibe', value: formatCurrency(deal.netAmount), color: 'text-emerald-400' },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">{m.label}</p>
                  <p className={`font-bold mt-0.5 ${m.large ? 'text-xl' : 'text-base'} ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Parties */}
          <div className="glass p-5">
            <h2 className="font-semibold text-white mb-4">Partes Involucradas</h2>
            <div className="space-y-3">
              {[
                { role: 'Comprador', user: deal.buyer,  icon: ShoppingCart, color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    ring: 'ring-cyan-500/20' },
                { role: 'Vendedor',  user: deal.seller, icon: Package,      color: 'text-purple-400',  bg: 'bg-purple-500/15',  ring: 'ring-purple-500/20' },
              ].map(({ role, user, icon: Icon, color, bg, ring }) => (
                <div key={role} className="flex items-center gap-3">
                  <Avatar name={user?.name || '?'} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${bg} ${color} ring-1 ${ring}`}>
                    <Icon className="w-3 h-3" />{role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispute */}
          {deal.dispute && (
            <div className="glass p-5 space-y-3" style={{ borderLeft: '3px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.03)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-red-400" />
                  <h3 className="font-semibold text-white">Detalles de la Disputa</h3>
                </div>
                <DisputeStatusBadge status={deal.dispute.status} />
              </div>
              <p className="text-xs text-gray-500">Presentada por <span className="text-white">{deal.dispute.raisedBy?.name}</span></p>
              <div className="glass-sm p-3" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-1">Motivo</p>
                <p className="text-sm text-gray-300">{deal.dispute.reason}</p>
              </div>
              {deal.dispute.evidence && (
                <div className="glass-sm p-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Evidencia</p>
                  <p className="text-sm text-gray-400">{deal.dispute.evidence}</p>
                </div>
              )}
              {deal.dispute.resolution && (
                <div className="glass-sm p-3" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Resolución del Administrador</p>
                  <p className="text-sm text-gray-300">{deal.dispute.resolution}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-2 space-y-4">
          {deal.status === 'PENDING' && isBuyer && <PaymentSection deal={deal} onFunded={loadDeal} />}
          {deal.status === 'FUNDED' && isSeller && <DeliverSection deal={deal} onDelivered={loadDeal} />}
          {deal.status === 'DELIVERED' && isBuyer && <ConfirmSection deal={deal} onConfirmed={loadDeal} />}
          {deal.status === 'COMPLETED' && (
            <div className="glass p-6 text-center space-y-2" style={{ borderLeft: '3px solid rgba(16,185,129,0.5)' }}>
              <div className="p-3 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-500/20 w-fit mx-auto">
                <PartyPopper className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="font-bold text-white">¡Trato Completado!</p>
              <p className="text-sm text-emerald-400">{formatCurrency(deal.netAmount)} liberados al vendedor.</p>
              {deal.completedAt && <p className="text-xs text-gray-600">{formatDate(deal.completedAt)}</p>}
            </div>
          )}

          {/* Reference */}
          <div className="glass-sm p-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />Referencia del Trato
            </p>
            <p className="font-mono text-xs text-gray-500 break-all">{deal.id}</p>
          </div>

          {deal.status === 'PENDING' && (isBuyer || isSeller) && (
            <CancelButton dealId={deal.id} onCancelled={loadDeal} />
          )}
        </div>
      </div>
    </div>
  );
}
