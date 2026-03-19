'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (result?.error) {
        toast.error('Correo o contraseña incorrectos');
      } else {
        toast.success('¡Bienvenido de nuevo!');
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-7">
      <h1 className="text-xl font-bold text-white mb-1">Bienvenido de nuevo</h1>
      <p className="text-gray-500 text-sm mb-6">Inicia sesión en tu cuenta</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {errors.email && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="password"
              placeholder="••••••••"
              className="input-glass pl-9"
              {...register('password', { required: 'La contraseña es requerida' })}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{errors.password.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-glow w-full mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Iniciando sesión...</> : 'Iniciar Sesión'}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Regístrate gratis
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-5 pt-5 border-t border-white/[0.06]">
        <p className="text-gray-600 text-xs text-center mb-3">Cuentas de demostración</p>
        <div className="space-y-1.5">
          {[
            { role: 'Comprador', email: 'buyer@example.com', pass: 'Buyer@123' },
            { role: 'Vendedor',  email: 'seller@example.com', pass: 'Seller@123' },
            { role: 'Admin',     email: 'admin@securedeal.com', pass: 'Admin@123' },
          ].map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => { setValue('email', d.email); setValue('password', d.pass); }}
              className="w-full flex items-center justify-between glass-sm px-3 py-2 text-xs text-gray-400 hover:text-white hover:border-brand-500/30 transition-all"
            >
              <span className="font-medium text-gray-300">{d.role}</span>
              <span className="text-gray-500">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
