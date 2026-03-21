'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { usersApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';
import { Users, Mail, Calendar, Trash2, Pencil, X, Loader2, AlertTriangle } from 'lucide-react';

// ── Edit Credentials Modal ────────────────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSaved,
}: {
  user: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{
    name: string;
    email: string;
    password: string;
  }>({
    defaultValues: { name: user.name, email: user.email, password: '' },
  });

  const onSubmit = async (data: { name: string; email: string; password: string }) => {
    const payload: any = {};
    if (data.name !== user.name) payload.name = data.name;
    if (data.email !== user.email) payload.email = data.email;
    if (data.password) payload.password = data.password;

    if (Object.keys(payload).length === 0) {
      toast('Sin cambios.');
      onClose();
      return;
    }

    setLoading(true);
    try {
      await usersApi.updateCredentials(user.id, payload);
      toast.success('Credenciales actualizadas');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        className="glass max-w-md w-full p-6 space-y-5"
        style={{ borderLeft: '3px solid rgba(0,212,255,0.4)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/20">
              <Pencil className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Editar Usuario</h3>
              <p className="text-xs text-gray-500">Deja la contraseña vacía para no cambiarla</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 uppercase tracking-wider">Nombre</label>
            <input
              type="text"
              className="input-glass"
              {...register('name', { required: 'El nombre es requerido' })}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 uppercase tracking-wider">Correo electrónico</label>
            <input
              type="email"
              className="input-glass"
              {...register('email', { required: 'El correo es requerido' })}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs text-gray-500 uppercase tracking-wider">Nueva contraseña (opcional)</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-glass"
              {...register('password', {
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-glow flex-1">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteModal({
  user,
  onClose,
  onDeleted,
}: {
  user: any;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await usersApi.deleteUser(user.id);
      toast.success(`Usuario "${user.name}" eliminado`);
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
        className="glass max-w-sm w-full p-6 space-y-4"
        style={{ borderLeft: '3px solid rgba(239,68,68,0.5)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/15 ring-1 ring-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Eliminar Usuario</h3>
            <p className="text-xs text-gray-500">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          ¿Estás seguro de que deseas eliminar la cuenta de{' '}
          <span className="text-white font-semibold">{user.name}</span>?
          Se eliminarán todos sus datos.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} disabled={loading} className="btn-danger-glass flex-1">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Eliminando...</> : <><Trash2 className="w-4 h-4" />Eliminar</>}
          </button>
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken as string | null | undefined;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);

  const loadUsers = () => {
    setLoading(true);
    usersApi.list()
      .then(setUsers)
      .catch(() => toast.error('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // accessToken guard: previene la llamada sin token cuando la sesión está caducada
    if (status !== 'authenticated' || !accessToken) return;
    loadUsers();
  }, [status, accessToken]);

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
                {['Usuario', 'Correo', 'Rol', 'Registro', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
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
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-cyan-500/15 text-gray-500 hover:text-cyan-400 ring-1 ring-white/[0.08] hover:ring-cyan-500/30 transition-all"
                        title="Editar credenciales"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => setDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/15 text-gray-500 hover:text-red-400 ring-1 ring-white/[0.08] hover:ring-red-500/30 transition-all"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {editUser && (
          <EditModal user={editUser} onClose={() => setEditUser(null)} onSaved={loadUsers} />
        )}
        {deleteUser && (
          <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={loadUsers} />
        )}
      </AnimatePresence>
    </div>
  );
}
