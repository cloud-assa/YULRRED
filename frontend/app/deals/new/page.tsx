'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { dealsApi } from '@/lib/api';
import FeeCalculator from '@/components/ui/FeeCalculator';
import { ArrowLeft, FileText, DollarSign, Calendar, Mail, Link2, Loader2, AlertCircle, FilePlus, ShoppingBag } from 'lucide-react';

type FormData = {
  title: string;
  description: string;
  amount: number;
  sellerEmail: string;
  deadline: string;
  productUrl?: string; // URL para modo "Compra Gestionada"
};

/* Reusable field wrapper -------------------------------------------------- */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* Icon-wrapped input ------------------------------------------------------- */
const inputBase =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white ' +
  'placeholder:text-white/20 outline-none transition-all duration-200 ' +
  'focus:border-[#00D4FF]/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#00D4FF]/10';

function IconInput({
  icon: Icon,
  ...props
}: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <input className={`${inputBase} pl-10 pr-4 py-3`} {...props} />
    </div>
  );
}

export default function NewDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const amount = parseFloat(watch('amount') as any) || 0;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const deal = await dealsApi.create({ ...data, amount: parseFloat(data.amount as any) });
      toast.success('¡Trato creado exitosamente!');
      router.push(`/deals/${deal.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el trato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#00D4FF] transition-colors mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a tratos
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#00D4FF]/10 ring-1 ring-[#00D4FF]/20">
            <FilePlus className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Crear Nuevo Trato
            </h1>
            <p className="text-gray-500 text-sm">Los fondos se mantienen seguros hasta que ambas partes confirmen.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >

          {/* Title */}
          <Field label="Título del trato" error={errors.title?.message}>
            <IconInput
              icon={FileText}
              type="text"
              placeholder="ej. Proyecto de Rediseño Web"
              {...register('title', {
                required: 'El título es requerido',
                maxLength: { value: 200, message: 'Máx. 200 caracteres' },
              })}
            />
          </Field>

          {/* Description */}
          <Field label="Descripción" error={errors.description?.message}>
            <textarea
              rows={4}
              placeholder="Describe el producto/servicio a entregar, incluyendo criterios de aceptación..."
              className={`${inputBase} px-4 py-3 resize-none`}
              {...register('description', {
                required: 'La descripción es requerida',
                maxLength: { value: 2000, message: 'Máx. 2000 caracteres' },
              })}
            />
          </Field>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Amount + Deadline in a responsive grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Monto (PEN — Soles)" error={errors.amount?.message}>
              <IconInput
                icon={DollarSign}
                type="number"
                step="0.01"
                min="1"
                placeholder="1,000.00"
                {...register('amount', {
                  required: 'El monto es requerido',
                  min: { value: 1, message: 'Mínimo S/ 1' },
                })}
              />
            </Field>

            <Field label="Fecha Límite" error={errors.deadline?.message}>
              <IconInput
                icon={Calendar}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('deadline', { required: 'La fecha límite es requerida' })}
              />
            </Field>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Seller email */}
          <Field label="Correo del Vendedor" error={errors.sellerEmail?.message}>
            <IconInput
              icon={Mail}
              type="email"
              placeholder="vendedor@ejemplo.com"
              {...register('sellerEmail', { required: 'El correo del vendedor es requerido' })}
            />
            <p className="text-xs text-gray-600 mt-1">El vendedor debe tener cuenta en KUQMI.</p>
          </Field>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* URL del producto — activa modo "Compra Gestionada" */}
          <Field label="URL del Producto (opcional)" error={errors.productUrl?.message}>
            <IconInput
              icon={Link2}
              type="url"
              placeholder="https://tienda.com/producto-123"
              {...register('productUrl', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Debe ser una URL válida (https://...)',
                },
              })}
            />
            <p className="text-xs text-gray-600 mt-1">
              Si proporcionas una URL, activas el <span className="text-cyan-400 font-semibold">Modo Compra Gestionada</span>: la plataforma adquiere el producto por ti y sube evidencias para tu aprobación antes de proceder.
            </p>
          </Field>

          {/* Banner informativo cuando hay URL */}
          {watch('productUrl') && (
            <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
              <ShoppingBag className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cyan-300">Modo Compra Gestionada activado</p>
                <p className="text-xs text-gray-500 mt-0.5">La plataforma gestionará la compra, inspeccionará el producto y subirá evidencias antes de solicitar tu aprobación.</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee Calculator */}
        <AnimatePresence>
          {amount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FeeCalculator amount={amount} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Creando trato...</>
              : 'Crear Trato'}
          </button>
          <Link href="/deals" className="btn-ghost cursor-pointer">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
