'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { TextShimmer } from '@/components/ui/text-shimmer';

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
  const [redirecting, setRedirecting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

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
        setRedirecting(true);
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1900);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
            style={{ background: '#07070f' }}
          >
            {/* Dot grid */}
            <div
              className="absolute inset-0 dot-grid pointer-events-none"
              style={{ opacity: 0.12 }}
              aria-hidden="true"
            />

            {/* Shield icon */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-7 relative"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{ boxShadow: ['0 0 24px rgba(0,212,255,0.15)', '0 0 48px rgba(0,212,255,0.30)', '0 0 24px rgba(0,212,255,0.15)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center relative z-10"
                style={{
                  background: 'rgba(0,212,255,0.10)',
                  border: '1px solid rgba(0,212,255,0.28)',
                  boxShadow: '0 0 32px rgba(0,212,255,0.18)',
                }}
              >
                <ShieldCheck className="w-10 h-10 text-[#00D4FF]" />
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="text-2xl font-extrabold tracking-tight mb-5 text-gradient"
              style={sg}
            >
              KUQMI
            </motion.p>

            {/* TextShimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <TextShimmer
                className="text-sm font-medium [--base-color:#4b5563] [--base-gradient-color:#00D4FF] dark:[--base-color:#6b7280] dark:[--base-gradient-color:#00D4FF]"
                duration={1.4}
                spread={3}
              >
                Cargando tu panel...
              </TextShimmer>
            </motion.div>

            {/* Animated progress dots */}
            <motion.div
              className="flex gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00D4FF' }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Login card ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: redirecting ? 0 : 1,
          pointerEvents: redirecting ? 'none' : undefined,
          transition: 'opacity 0.2s',
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
            disabled={loading || redirecting}
            className="btn-glow w-full py-3.5 text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ justifyContent: 'center', gap: '8px' }}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Iniciando sesión...</>
              : 'Ingresar'}
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
    </>
  );
}
