import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cambiado de USD a PEN (soles peruanos) — aplica en toda la app
export function formatCurrency(amount: number, currency = 'PEN') {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formato de fecha con zona horaria de Lima (America/Lima = UTC-5)
export function formatDate(date: string | Date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime()) || d.getFullYear() < 1980) return 'Fecha no disponible';
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatRelative(date: string | Date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime()) || d.getFullYear() < 1980) return 'fecha desconocida';
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  AWAITING_APPROVAL: 'bg-blue-100 text-blue-800 border-blue-200',
  FUNDED: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  DISPUTED: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  REFUNDED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente de Fondeo',
  AWAITING_APPROVAL: 'Esperando Aprobación',
  FUNDED: 'Fondeado — En Entrega',
  DELIVERED: 'Entregado — Confirmar',
  COMPLETED: 'Completado',
  DISPUTED: 'En Disputa',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

export const DISPUTE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED_BUYER: 'bg-blue-100 text-blue-700',
  RESOLVED_SELLER: 'bg-green-100 text-green-700',
};
