'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

type FormData = { name: string; email: string; password: string; confirmPassword: string };

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch('password');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.register({ name: data.name, email: data.email, password: data.password });
      toast.success('¡Cuenta creada! Iniciando sesión...');
      await signIn('credentials', { redirect: false, email: data.email, password: data.password });
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-7">
      <h1 className="text-xl font-bold text-white mb-1">Crea tu cuenta</h1>
      <p className="text-gray-500 text-sm mb-6">Empieza a negociar de forma segura hoy</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Juan García"
              className="input-glass pl-9"
              {...register('name', { required: 'El nombre es requerido', maxLength: { value: 100, message: 'Nombre demasiado largo' } })}
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="email"
              placeholder="tu@ejemplo.com"
              className="input-glass pl-9"
              {...register('email', { required: 'El correo es requerido' })}
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="password"
              placeholder="Mín. 8 caracteres"
              className="input-glass pl-9"
              {...register('password', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="password"
              placeholder="Repite tu contraseña"
              className="input-glass pl-9"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (v) => v === password || 'Las contraseñas no coinciden',
              })}
            />
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-glow w-full mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creando cuenta...</> : 'Crear Cuenta Gratis'}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
