'use client';
import { motion } from 'framer-motion';
import { Bell, BellRing, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  dealId?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onClick?: (id: string) => void;
}

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { id, title, message, read, createdAt, dealId } = notification;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => !read && onClick?.(id)}
      className={`glass p-4 cursor-pointer transition-all duration-200 hover:border-white/20 ${
        !read ? 'border-l-2 border-l-brand-500/60 bg-brand-500/[0.03]' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${!read ? 'bg-brand-500/20' : 'bg-white/[0.04]'}`}>
          {!read
            ? <BellRing className="w-3.5 h-3.5 text-brand-400" />
            : <Bell className="w-3.5 h-3.5 text-gray-500" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${!read ? 'text-white' : 'text-gray-400'}`}>{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-600">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
            </span>
            {dealId && (
              <Link
                href={`/deals/${dealId}`}
                className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                Ver trato <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
        {!read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1" />}
      </div>
    </motion.div>
  );
}
