'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';
import { Users, Mail, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const { status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    usersApi.list().then(setUsers).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <PageHeader title="Usuarios" icon={Users} subtitle={`${users.length} usuarios registrados`} />

      {loading ? (
        <div className="glass animate-pulse h-48" />
      ) : (
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Usuario', 'Correo', 'Rol', 'Registro'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  className="transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <p className="font-medium text-white">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-gray-600" />{user.email}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${user.role === 'ADMIN' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(user.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
