import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  FUNDED: 'bg-blue-100 text-blue-800 border-blue-200',
  DELIVERED: 'bg-purple-100 text-purple-800 border-purple-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  DISPUTED: 'bg-red-100 text-red-800 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  REFUNDED: 'bg-orange-100 text-orange-800 border-orange-200',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending Funding',
  FUNDED: 'Funded — Awaiting Delivery',
  DELIVERED: 'Delivered — Awaiting Confirmation',
  COMPLETED: 'Completed',
  DISPUTED: 'In Dispute',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const DISPUTE_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED_BUYER: 'bg-blue-100 text-blue-700',
  RESOLVED_SELLER: 'bg-green-100 text-green-700',
};
