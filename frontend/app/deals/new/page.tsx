'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import { dealsApi } from '@/lib/api';
import FeeCalculator from '@/components/ui/FeeCalculator';
import { ArrowLeft, FileText, DollarSign, Calendar, Mail, Loader2, AlertCircle, FilePlus } from 'lucide-react';

type FormData = {
  title: string;
  description: string;
  amount: number;
  sellerEmail: string;
  deadline: string;
};

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
      <div>
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />Volver a tratos
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/20">
            <FilePlus className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear Nuevo Trato</h1>
            <p className="text-gray-500 text-sm">Los fondos se mantienen seguros hasta que ambas partes confirmen.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="glass p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Título del Trato</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                placeholder="ej. Proyecto de Rediseño Web"
                className="input-glass pl-9"
                {...register('title', { required: 'El título es requerido', maxLength: { value: 200, message: 'Máx. 200 caracteres' } })}
              />
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
            <textarea
              rows={4}
              placeholder="Describe el producto/servicio a entregar, incluyendo criterios de aceptación..."
              className="input-glass resize-none"
              {...register('description', { required: 'La descripción es requerida', maxLength: { value: 2000, message: 'Máx. 2000 caracteres' } })}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description.message}</p>}
          </div>

          {/* Amount + Deadline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Monto (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="1000.00"
                  className="input-glass pl-9"
                  {...register('amount', { required: 'El monto es requerido', min: { value: 1, message: 'Mínimo $1' } })}
                />
              </div>
              {errors.amount && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha Límite</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="date"
                  className="input-glass pl-9"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('deadline', { required: 'La fecha límite es requerida' })}
                />
              </div>
              {errors.deadline && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.deadline.message}</p>}
            </div>
          </div>

          {/* Seller Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo del Vendedor</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="email"
                placeholder="vendedor@ejemplo.com"
                className="input-glass pl-9"
                {...register('sellerEmail', { required: 'El correo del vendedor es requerido' })}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">El vendedor debe tener cuenta en YULRRED.</p>
            {errors.sellerEmail && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sellerEmail.message}</p>}
          </div>
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
          <button type="submit" disabled={loading} className="btn-glow flex-1">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creando trato...</> : 'Crear Trato'}
          </button>
          <Link href="/deals" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
