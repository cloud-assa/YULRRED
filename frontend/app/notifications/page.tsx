'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { notificationsApi } from '@/lib/api';
import NotificationItem from '@/components/ui/NotificationItem';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => notificationsApi.list().then(setNotifications).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Todas marcadas como leídas');
    } catch { toast.error('Error al marcar como leídas'); }
  };

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/20">
            <Bell className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
            {unreadCount > 0 && <p className="text-xs text-gray-500 mt-0.5">{unreadCount} sin leer</p>}
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost py-2 px-3 text-sm gap-1.5">
            <CheckCheck className="w-4 h-4" />Marcar todas leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="glass p-5 animate-pulse h-20" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="Sin notificaciones" description="Aquí aparecerán las actualizaciones de tus tratos." />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onClick={markRead} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
