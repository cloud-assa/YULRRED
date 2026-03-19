'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function GlowButton({
  variant = 'primary',
  loading,
  children,
  fullWidth,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  const base = variant === 'primary' ? 'btn-glow'
    : variant === 'ghost' ? 'btn-ghost'
    : 'btn-danger-glass';

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, fullWidth && 'w-full', className)}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
