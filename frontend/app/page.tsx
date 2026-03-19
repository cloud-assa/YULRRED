import Link from 'next/link';
import { ShieldCheck, PenLine, CreditCard, Package, CheckCircle2, Scale, Mail, BarChart3, Lock, Zap, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-gradient">Secure</span>
              <span className="text-white">Deal</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost py-2 px-4 text-sm">Iniciar Sesión</Link>
            <Link href="/register" className="btn-glow py-2 px-4 text-sm">Comenzar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative">
        {/* Glow orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30 pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(ellipse, #7c3aed, transparent)' }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 glass-sm px-4 py-1.5 text-sm text-brand-300 mb-8 border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Confiado por +2,000 usuarios — 100% seguro
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Negocia con{' '}
            <span className="text-gradient">confianza</span>.<br />
            Paga con{' '}
            <span className="text-gradient">seguridad</span>.
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            SecureDeal retiene los fondos en garantía hasta que confirmes la entrega —
            protegiendo a compradores y vendedores del fraude en cada transacción.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-glow px-8 py-4 text-base gap-2">
              Crear un Trato Gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-ghost px-8 py-4 text-base">
              Iniciar Sesión
            </Link>
          </div>

          {/* Floating stat pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {[
              { label: '5% comisión fija', color: 'text-emerald-400' },
              { label: 'Pagos Stripe seguros', color: 'text-cyan-400' },
              { label: 'Resolución de disputas', color: 'text-brand-400' },
            ].map((pill) => (
              <div key={pill.label} className="glass-sm px-4 py-2 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: pill.color.replace('text-', '') }} />
                <span className={`${pill.color} font-medium`}>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cómo Funciona SecureDeal</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Un proceso simple de 4 pasos diseñado para eliminar el fraude en pagos.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: '01', icon: PenLine,     title: 'Crea un Trato',    desc: 'El comprador crea un trato con título, monto e invita al vendedor por correo.' },
            { step: '02', icon: CreditCard,  title: 'Fondear Garantía', desc: 'El comprador paga mediante Stripe. Los fondos quedan en custodia segura.' },
            { step: '03', icon: Package,     title: 'Entregar Trabajo',  desc: 'El vendedor entrega el servicio y marca el trato como entregado.' },
            { step: '04', icon: CheckCircle2, title: 'Liberar Pago',    desc: 'El comprador confirma. Los fondos se liberan al vendedor de inmediato.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass p-6 relative overflow-hidden hover:border-brand-500/30 transition-all duration-300 group"
              >
                <div className="absolute top-3 right-3 text-6xl font-black leading-none"
                  style={{ color: 'rgba(255,255,255,0.03)' }}>
                  {item.step}
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/15 ring-1 ring-brand-500/20 w-fit mb-4 group-hover:bg-brand-500/25 transition-colors">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-y border-white/[0.06]" style={{ background: 'rgba(15,15,26,0.6)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 mb-4">
                Precios transparentes
              </div>
              <h2 className="text-3xl font-bold mb-4">Solo pagas cuando funciona</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                SecureDeal cobra una <span className="text-brand-400 font-semibold">comisión plana del 5%</span> únicamente
                en transacciones completadas. Sin suscripciones ni sorpresas.
              </p>
              <ul className="space-y-2.5">
                {[
                  'Sin suscripción mensual',
                  'Sin tarifas de configuración',
                  'Comisión solo en tratos exitosos',
                  'Reembolso completo si la disputa favorece al comprador',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass p-6" style={{ borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Ejemplo de trato</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Monto del Trato</span>
                  <span className="text-white font-semibold">$1,000.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Comisión (5%)</span>
                  <span className="text-amber-300 font-medium">−$50.00</span>
                </div>
                <div className="border-t border-white/[0.08] pt-3 flex justify-between">
                  <span className="text-gray-300 font-medium text-sm">El vendedor recibe</span>
                  <span className="text-emerald-400 font-bold text-xl">$950.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que Necesitas</h2>
          <p className="text-gray-400">Diseñado para transacciones serias entre desconocidos.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Scale,     color: 'text-brand-400',   bg: 'bg-brand-500/15',   ring: 'ring-brand-500/20',   title: 'Resolución de Disputas',       desc: 'Panel de administración revisa la evidencia y toma decisiones vinculantes.' },
            { icon: Mail,      color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    ring: 'ring-cyan-500/20',    title: 'Notificaciones por Correo',    desc: 'Correos automáticos en cada hito del trato.' },
            { icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/20', title: 'Historial Completo',           desc: 'Panel con historial, estados y registros de pagos.' },
            { icon: Lock,      color: 'text-amber-400',   bg: 'bg-amber-500/15',   ring: 'ring-amber-500/20',   title: 'Pagos Seguros con Stripe',     desc: 'Procesamiento PCI. Sin datos de tarjeta en nuestros servidores.' },
            { icon: Zap,       color: 'text-purple-400',  bg: 'bg-purple-500/15',  ring: 'ring-purple-500/20',  title: 'Estado en Tiempo Real',        desc: 'PENDIENTE → FONDEADO → ENTREGADO → COMPLETADO.' },
            { icon: Briefcase, color: 'text-rose-400',    bg: 'bg-rose-500/15',    ring: 'ring-rose-500/20',    title: 'Para Cualquier Negocio',       desc: 'Freelance, bienes, software, inmobiliaria — cualquier trato.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass p-6 hover:border-brand-500/30 hover:shadow-glow-sm transition-all duration-300 group">
                <div className={`p-2.5 rounded-xl ${item.bg} ring-1 ${item.ring} w-fit mb-4`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-bold text-base mb-2 text-white">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
        <h2 className="text-4xl font-extrabold mb-4">¿Listo para negociar de forma segura?</h2>
        <p className="text-purple-200 mb-8 text-lg max-w-xl mx-auto">
          Únete a miles de usuarios que confían en SecureDeal para transacciones seguras.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-10 py-4 rounded-xl text-base hover:bg-gray-50 transition-all shadow-glass"
        >
          Crear tu Cuenta <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 text-center text-gray-600 text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-white">SecureDeal</span>
        </div>
        <p>© {new Date().getFullYear()} SecureDeal. Construido para la confianza.</p>
      </footer>
    </div>
  );
}
