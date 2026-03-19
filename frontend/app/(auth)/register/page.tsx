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
        <User className="w-3.5 h-3.5 text-[#8B5CF6]" aria-hidden="true" />
        <span className="text-xs font-semibold text-[#8B5CF6]">Nueva cuenta</span>
      </div>

      <h1
        className="font-extrabold text-white mb-1"
        style={{ ...sg, fontSize: 'clamp(20px, 4vw, 26px)', letterSpacing: '-0.025em' }}
      >
        Crea tu cuenta gratis
      </h1>
      <p className="text-sm text-gray-500 mb-8">Empieza a comprar y vender con seguridad</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Nombre completo
          </label>
          <div style={fieldWrap}>
            <User style={{ ...iconStyle, width: 16, height: 16 }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Juan García"
              style={inputStyle}
              {...register('name', {
                required: 'El nombre es requerido',
                maxLength: { value: 100, message: 'Nombre demasiado largo' },
              })}
            />
          </div>
          {errors.name && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.name.message}
            </p>
          )}
        </div>

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
              placeholder="Mínimo 8 caracteres"
              style={inputStyle}
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Repetir contraseña
          </label>
          <div style={fieldWrap}>
            <Lock style={{ ...iconStyle, width: 16, height: 16 }} aria-hidden="true" />
            <input
              type="password"
              placeholder="Repite tu contraseña"
              style={inputStyle}
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (v) => v === password || 'Las contraseñas no coinciden',
              })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />{errors.confirmPassword.message}
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
            ? <><Loader2 className="w-4 h-4 animate-spin" />Creando cuenta...</>
            : 'Crear cuenta gratis'}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-semibold transition-opacity hover:opacity-80"
          style={{ color: '#00D4FF' }}
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
