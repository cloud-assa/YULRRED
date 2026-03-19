'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

type FormData = { email: string; password: string };

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

const fieldWrap: React.CSSProperties = {
  position: 'relative',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '12px',
  transition: 'border-color 0.2s',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'white',
  fontSize: '14px',
  padding: '13px 14px 13px 40px',
  fontFamily: 'Inter, sans-serif',
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '13px',
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: 'rgba(255,255,255,0.3)',
};

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
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '32px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 glass-sm px-3 py-1.5 mb-6">
        <ShieldCheck className="w-3.5 h-3.5 text-[#00D4FF]" aria-hidden="true" />
        <span className="text-xs font-semibold text-[#00D4FF]">Acceso seguro</span>
      </div>

      <h1
        className="font-extrabold text-white mb-1"
        style={{ ...sg, fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: '-0.025em' }}
      >
        Bienvenido de nuevo
      </h1>
      <p className="text-sm text-gray-500 mb-8">Inicia sesión para gestionar tus tratos</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Correo electrónico
          </label>
          <div style={fieldWrap}>
            <Mail style={{ ...iconStyle, width: 16, height: 16 }} aria-hidden="true" />
            <input
              type="email"
              placeholder="tu@ejemplo.com"
              style={inputStyle}
              {...register('email', { required: 'El correo es requerido' })}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Contraseña
          </label>
          <div style={fieldWrap}>
            <Lock style={{ ...iconStyle, width: 16, height: 16 }} aria-hidden="true" />
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              {...register('password', { required: 'La contraseña es requerida' })}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-glow w-full py-3.5 text-sm mt-2"
          style={{ justifyContent: 'center', gap: '8px' }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Iniciando sesión...</>
            : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="font-semibold transition-opacity hover:opacity-80"
          style={{ color: '#00D4FF' }}
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
