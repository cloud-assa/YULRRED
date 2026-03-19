import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass border-dashed border-2 border-white/[0.06] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
      <div className="p-4 rounded-2xl bg-brand-500/10 ring-1 ring-brand-500/20 mb-4">
        <Icon className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-5">{description}</p>
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-glow text-sm px-4 py-2.5">{action.label}</Link>
        ) : (
          <button onClick={action.onClick} className="btn-glow text-sm px-4 py-2.5">{action.label}</button>
        )
      )}
    </div>
  );
}
