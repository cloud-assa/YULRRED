'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { disputesApi } from '@/lib/api';
import { formatCurrency, formatRelative } from '@/lib/utils';
import { DealStatusBadge, DisputeStatusBadge } from '@/components/ui/StatusBadge';
import FilterTabs from '@/components/ui/FilterTabs';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import { Scale, AlertCircle, Clock, UserCheck, Briefcase, AlertTriangle, Eye, Loader2 } from 'lucide-react';

function ResolveModal({ dispute, onResolved, onClose }: { dispute: any; onResolved: () => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<{ resolution: string; resolutionNote: string }>();

  const onSubmit = async (data: any) => {
    if (!decision) { toast.error('Selecciona una decisión'); return; }
    setLoading(true);
    try {
      await disputesApi.resolve(dispute.id, { ...data, resolution: decision });
      toast.success('Disputa resuelta exitosamente');
      onResolved(); onClose();
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={!!dispute} onClose={onClose} title="Resolver Disputa">
      <div className="space-y-4">
        <div className="glass-sm p-3 space-y-1.5 text-sm">
          <p className="text-gray-400">Trato: <span className="text-white font-medium">{dispute.deal.title}</span> · <span className="text-emerald-400">{formatCurrency(dispute.deal.amount)}</span></p>
          <p className="text-gray-400">Presentada por: <span className="text-white">{dispute.raisedBy.name}</span></p>
        </div>
        <div className="glass-sm p-3 space-y-2" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Motivo</p>
          <p className="text-sm text-gray-300">{dispute.reason}</p>
          {dispute.evidence && <><p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Evidencia</p><p className="text-sm text-gray-400">{dispute.evidence}</p></>}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-2">Decisión</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'RESOLVED_BUYER',  label: 'Reembolsar Comprador', sub: `${formatCurrency(dispute.deal.amount)} devueltos`, color: 'border-cyan-500/50 bg-cyan-500/10' },
              { value: 'RESOLVED_SELLER', label: 'Liberar al Vendedor',  sub: `${formatCurrency(dispute.deal.netAmount)} pagados`, color: 'border-emerald-500/50 bg-emerald-500/10' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDecision(opt.value)}
                className={`p-3 rounded-xl border text-left transition-all ${decision === opt.value ? opt.color : 'border-white/[0.08] hover:border-white/20'}`}
              >
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Nota de Resolución</label>
          <textarea rows={3} placeholder="Explica tu decisión (visible para ambas partes)..." className="input-glass resize-none"
            {...register('resolutionNote', { required: 'La nota es requerida' })} />
          {errors.resolutionNote && <p className="text-red-400 text-xs mt-1">{errors.resolutionNote.message}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={handleSubmit(onSubmit)} disabled={loading} className="btn-glow flex-1">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Resolviendo...</> : 'Enviar Resolución'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
        </div>
      </div>
    </Modal>
  );
}

const FILTER_LABELS: Record<string, string> = { ALL: 'Todos', OPEN: 'Abierta', UNDER_REVIEW: 'En Revisión', RESOLVED_BUYER: 'Ganó Comprador', RESOLVED_SELLER: 'Ganó Vendedor' };

export default function AdminDisputesPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken as string | null | undefined;
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('OPEN');

  const load = () => disputesApi.list().then(setDisputes).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false));
  useEffect(() => {
    // accessToken guard: evita 401 cuando el token de sesión aún no se ha cargado
    if (status !== 'authenticated' || !accessToken) return;
    load();
  }, [status, accessToken]);

  const markUnderReview = async (id: string) => {
    try { await disputesApi.markReview(id); toast.success('Marcada en revisión'); load(); }
    catch (err: any) { toast.error(err.message); }
  };

  const filtered = filter === 'ALL' ? disputes : disputes.filter((d) => d.status === filter);
  const tabs = ['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER'].map((s) => ({
    value: s, label: FILTER_LABELS[s], count: s === 'ALL' ? disputes.length : disputes.filter((d) => d.status === s).length,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <PageHeader title="Panel de Disputas" icon={Scale} subtitle="Revisar y resolver disputas entre partes" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Abiertas"        value={disputes.filter((d) => d.status === 'OPEN').length}           icon={AlertCircle} color="amber" />
        <StatCard label="En Revisión"     value={disputes.filter((d) => d.status === 'UNDER_REVIEW').length}   icon={Clock}       color="purple" />
        <StatCard label="Ganó Comprador"  value={disputes.filter((d) => d.status === 'RESOLVED_BUYER').length} icon={UserCheck}   color="cyan" />
        <StatCard label="Ganó Vendedor"   value={disputes.filter((d) => d.status === 'RESOLVED_SELLER').length}icon={Briefcase}   color="emerald" />
      </div>

      <FilterTabs options={tabs} value={filter} onChange={setFilter} />

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass p-6 animate-pulse h-36" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Scale} title="Sin disputas" description="No hay disputas en esta categoría." />
      ) : (
        <div className="space-y-4">
          {filtered.map((dispute) => (
            <motion.div key={dispute.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{dispute.deal.title}</h3>
                    <DisputeStatusBadge status={dispute.status} />
                    <DealStatusBadge status={dispute.deal.status} />
                  </div>
                  <p className="text-xs text-gray-500">Presentada por <span className="text-gray-300">{dispute.raisedBy.name}</span> · {formatRelative(dispute.createdAt)}</p>
                </div>
                <p className="text-xl font-bold text-white flex-shrink-0">{formatCurrency(dispute.deal.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[{ role: 'Comprador', user: dispute.deal.buyer }, { role: 'Vendedor', user: dispute.deal.seller }].map(({ role, user }) => (
                  <div key={role} className="glass-sm p-3 flex items-center gap-2.5">
                    <Avatar name={user.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{role}</p>
                      <p className="text-sm text-white truncate">{user.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-sm p-3 space-y-1" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <p className="text-xs text-red-400 font-semibold uppercase tracking-wider">Motivo</p>
                </div>
                <p className="text-sm text-gray-300">{dispute.reason}</p>
                {dispute.evidence && <p className="text-xs text-gray-500 pt-1">{dispute.evidence}</p>}
              </div>

              {dispute.resolution && (
                <div className="glass-sm p-3" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
                  <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Resolución</p>
                  <p className="text-sm text-gray-300">{dispute.resolution}</p>
                </div>
              )}

              {['OPEN', 'UNDER_REVIEW'].includes(dispute.status) && (
                <div className="flex gap-2 pt-1">
                  {dispute.status === 'OPEN' && (
                    <button onClick={() => markUnderReview(dispute.id)} className="btn-ghost py-2 px-3 text-sm gap-1.5">
                      <Eye className="w-3.5 h-3.5" />Marcar En Revisión
                    </button>
                  )}
                  <button onClick={() => setSelected(dispute)} className="btn-glow py-2 px-4 text-sm gap-1.5">
                    <Scale className="w-3.5 h-3.5" />Resolver Disputa
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {selected && <ResolveModal dispute={selected} onResolved={load} onClose={() => setSelected(null)} />}
    </div>
  );
}
