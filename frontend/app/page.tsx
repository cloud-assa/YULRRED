'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, CreditCard,
  Package, PenLine, Lock, Scale, Star,
  Menu, X, ArrowRight, Zap,
} from 'lucide-react';

const sg = { fontFamily: "'Space Grotesk', sans-serif" };

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const navLinks = [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Beneficios',    href: '#beneficios' },
    { label: 'Precios',       href: '#precios' },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-5xl" aria-label="Navegación">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: 'rgba(10,10,15,0.90)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo */}
          <Link href="/" className="text-lg font-extrabold tracking-tight text-gradient" style={sg}>
            YULRRED
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"    className="btn-ghost py-2 px-5 text-sm">Entrar</Link>
            <Link href="/register" className="btn-glow py-2 px-5 text-sm">Crear cuenta</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div
            className="mt-2 rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'rgba(10,10,15,0.96)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
          >
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-gray-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-1">
              <Link href="/login"    className="btn-ghost py-3 text-sm text-center" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link href="/register" className="btn-glow py-3 text-sm text-center"  onClick={() => setMenuOpen(false)}>Crear cuenta gratis</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6" aria-labelledby="hero-h">
        {/* Background orb */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] pointer-events-none blur-3xl animate-orb"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,212,255,0.09), rgba(139,92,246,0.07), transparent)' }}
          aria-hidden="true"
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 dot-grid pointer-events-none"
          style={{ opacity: 0.3, maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 glass-sm px-4 py-2 mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse-dot shrink-0" style={{ boxShadow: '0 0 8px #00D4FF' }} aria-hidden="true" />
            <span className="text-sm text-[#00D4FF] font-semibold">Plataforma activa · 100% online</span>
          </div>

          {/* Heading */}
          <h1
            id="hero-h"
            className="font-extrabold leading-[1.08] mb-6 animate-fade-up"
            style={{ ...sg, fontSize: 'clamp(38px, 6.5vw, 76px)', letterSpacing: '-0.03em', animationDelay: '0.1s' }}
          >
            Tu dinero, seguro<br />
            <span className="text-gradient">hasta que todo esté listo</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            YULRRED guarda el dinero mientras se completa el trato.
            El comprador paga, el vendedor entrega — nadie pierde.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/register" className="btn-glow w-full sm:w-auto px-8 py-4 text-base">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Empezar gratis
            </Link>
            <a href="#como-funciona" className="btn-ghost w-full sm:w-auto px-8 py-4 text-base">
              Ver cómo funciona
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              'Sin tarjeta para registrarse',
              '5% de comisión transparente',
              'Dinero protegido en todo momento',
            ].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00D4FF] shrink-0" aria-hidden="true" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────── */}
      <section aria-label="Estadísticas" className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass reveal" style={{ overflow: 'hidden' }}>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { num: '$2.4M+', label: 'en tratos protegidos' },
                { num: '99.9%',  label: 'disponibilidad' },
                { num: '<2 min', label: 'para crear un trato' },
                { num: 'Solo 5%', label: 'de comisión, sin más' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="text-center py-8 px-4"
                  style={{
                    borderRight:  i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <span
                    className="block font-extrabold text-gradient mb-1"
                    style={{ ...sg, fontSize: 'clamp(22px, 4vw, 34px)', letterSpacing: '-0.02em' }}
                  >
                    {s.num}
                  </span>
                  <span className="text-sm text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-20 px-6 scroll-mt-20" id="como-funciona" aria-labelledby="steps-h">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-cyan mb-4">Cómo funciona</div>
            <h2
              className="font-extrabold mb-3"
              id="steps-h"
              style={{ ...sg, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Tres pasos. Sin complicaciones.
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              No necesitas saber nada de tecnología. Solo seguir los pasos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                num: '1', icon: PenLine, color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',
                title: 'El comprador crea el trato',
                desc: 'Describe qué se va a comprar o contratar, el monto y el plazo. Listo en 2 minutos.',
                chip: <span className="chip-pending">Pendiente</span>,
              },
              {
                num: '2', icon: CreditCard, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',
                title: 'El dinero queda en custodia',
                desc: 'El comprador paga y el dinero queda bloqueado en YULRRED. El vendedor sabe que el pago está garantizado.',
                chip: <span className="chip-funded">Fondos guardados</span>,
              },
              {
                num: '3', icon: Package, color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',
                title: 'Se entrega y se libera el pago',
                desc: 'El vendedor entrega. El comprador confirma. El dinero llega automáticamente al vendedor.',
                chip: <span className="chip-completed">Completado</span>,
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <article
                  key={i}
                  className={`glass p-7 reveal delay-${i + 1} hover:-translate-y-1 transition-all duration-300`}
                  aria-labelledby={`step-${i}`}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: step.bg }}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <div className="mb-3">{step.chip}</div>
                  <h3 id={`step-${i}`} className="font-bold text-base mb-2" style={sg}>{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </article>
              );
            })}
          </div>

          {/* Dispute note */}
          <div className="mt-6 glass-sm px-6 py-4 flex items-start gap-3 reveal delay-4">
            <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              <strong className="text-white">¿Hay un problema?</strong> Si no hay acuerdo, un administrador de YULRRED revisa el caso y decide quién tiene razón. Siempre imparcial.
            </p>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────── */}
      <section
        className="py-20 px-6 scroll-mt-20"
        id="beneficios"
        aria-labelledby="benefits-h"
        style={{ background: 'rgba(13,13,22,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-purple mb-4">Por qué YULRRED</div>
            <h2
              className="font-extrabold mb-3"
              id="benefits-h"
              style={{ ...sg, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Confía en cada trato
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Para compradores, vendedores y freelancers que quieren hacer negocios sin riesgos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, color: '#00D4FF', bg: 'rgba(0,212,255,0.10)', title: 'Tu dinero está protegido',      desc: 'Nadie toca el dinero hasta que el trato se complete. Ni el comprador ni el vendedor.' },
              { icon: CheckCircle2, color: '#4ADE80', bg: 'rgba(74,222,128,0.10)', title: 'Sin estafas',                   desc: 'El vendedor no puede desaparecer con el dinero. El comprador no puede negar un servicio entregado.' },
              { icon: Zap,          color: '#FCD34D', bg: 'rgba(251,191,36,0.10)', title: 'Rápido y sin trámites',          desc: 'Crea un trato en menos de 2 minutos. Sin papeles, sin abogados, sin burocracia.' },
              { icon: CreditCard,   color: '#635BFF', bg: 'rgba(99,91,255,0.10)',  title: 'Pago seguro con tarjeta',       desc: 'Tu información de pago nunca la tocamos. Usamos Stripe, el estándar más seguro del mundo.' },
              { icon: Scale,        color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', title: 'Resolución de conflictos',      desc: 'Si algo sale mal, un mediador humano revisa el caso y toma una decisión justa.' },
              { icon: Lock,         color: '#F87171', bg: 'rgba(248,113,113,0.10)', title: 'Acceso solo para ti',           desc: 'Tu cuenta está protegida con contraseña cifrada y sesiones seguras.' },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <article
                  key={b.title}
                  className={`glass p-6 reveal delay-${(i % 3) + 1} hover:-translate-y-1 transition-all duration-300`}
                  aria-labelledby={`ben-${i}`}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: b.bg }} aria-hidden="true">
                    <Icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <h3 id={`ben-${i}`} className="font-bold text-sm mb-2" style={sg}>{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────── */}
      <section className="py-20 px-6" aria-labelledby="roles-h">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <h2
              className="font-extrabold mb-3"
              id="roles-h"
              style={{ ...sg, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              ¿Quién usa YULRRED?
            </h2>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Cualquier persona que quiera hacer una transacción segura online.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                color: '#00D4FF', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)',
                title: 'Comprador',
                subtitle: 'Paga con seguridad',
                points: ['Crea el trato', 'Paga y espera la entrega', 'Confirma y el vendedor cobra'],
              },
              {
                color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.35)',
                title: 'Vendedor / Freelancer',
                subtitle: 'Cobra sin riesgo',
                points: ['Acepta el trato', 'Entrega tu producto o servicio', 'Recibe el pago automáticamente'],
              },
              {
                color: '#4ADE80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)',
                title: 'Ambas partes ganan',
                subtitle: 'Nadie pierde',
                points: ['El comprador no paga por nada', 'El vendedor siempre cobra', 'Conflictos resueltos con imparcialidad'],
              },
            ].map((r, i) => (
              <div
                key={r.title}
                className={`glass p-7 reveal delay-${i + 1} hover:-translate-y-1 transition-all duration-300`}
                style={{ borderLeft: `3px solid ${r.border}`, background: r.bg }}
              >
                <p className="font-extrabold mb-1" style={{ ...sg, color: r.color }}>{r.title}</p>
                <p className="text-xs text-gray-500 mb-5">{r.subtitle}</p>
                <ul className="space-y-3">
                  {r.points.map((p, j) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}>{j + 1}</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section
        className="py-20 px-6 scroll-mt-20"
        id="precios"
        aria-labelledby="pricing-h"
        style={{ background: 'rgba(13,13,22,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-cyan mb-4">Precios</div>
            <h2
              className="font-extrabold mb-3"
              id="pricing-h"
              style={{ ...sg, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Sin sorpresas
            </h2>
            <p className="text-gray-400 text-lg">Un precio. Simple. Solo pagas si el trato se cierra.</p>
          </div>

          <div
            className="glass p-8 md:p-12 reveal"
            style={{ borderColor: 'rgba(0,212,255,0.20)', boxShadow: '0 0 60px rgba(0,212,255,0.06)' }}
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <div
                  className="inline-block font-extrabold text-gradient mb-2"
                  style={{ ...sg, fontSize: 'clamp(64px,10vw,96px)', letterSpacing: '-0.04em', lineHeight: 1 }}
                  aria-label="5 por ciento"
                >
                  5%
                </div>
                <p className="text-gray-400 mb-2 text-lg">por trato completado</p>
                <p className="text-sm text-gray-600 mb-8">Si el trato no se cierra, no cobras nada.</p>

                <div className="glass-sm px-5 py-4 text-sm text-gray-400 mb-8" role="note">
                  Ejemplo: trato de <strong className="text-white">$1,000</strong> →
                  el vendedor recibe <strong className="text-[#4ADE80]">$950</strong>
                </div>

                <Link href="/register" className="btn-glow w-full md:w-auto px-8 py-4 text-base justify-center">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  Empezar gratis
                </Link>
              </div>

              <ul className="space-y-4" role="list">
                {[
                  'Tratos ilimitados',
                  'Pago seguro incluido',
                  'Notificaciones en tiempo real',
                  'Resolución de disputas',
                  'Panel de control completo',
                  'Sin mensualidad ni contrato',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300" role="listitem">
                    <CheckCircle2 className="w-4 h-4 text-[#00D4FF] shrink-0" aria-hidden="true" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section className="py-20 px-6" aria-labelledby="testi-h">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-purple mb-4">Testimonios</div>
            <h2
              className="font-extrabold mb-3"
              id="testi-h"
              style={{ ...sg, fontSize: 'clamp(26px, 4vw, 44px)', letterSpacing: '-0.025em' }}
            >
              Lo que dicen quienes ya lo usan
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: 'Pagué a un diseñador por primera vez sin miedo. El dinero quedó bloqueado hasta que me entregó todo. Exactamente como prometió.',
                name: 'María A.', role: 'Dueña de negocio', initials: 'MA',
              },
              {
                quote: 'Como freelancer, siempre temía que no me pagaran. Con YULRRED el dinero ya está listo antes de empezar. Total tranquilidad.',
                name: 'Carlos R.', role: 'Desarrollador independiente', initials: 'CR',
              },
              {
                quote: 'Hubo un malentendido con un proveedor. El mediador de YULRRED lo resolvió en 24 horas, de forma justa. Muy profesional.',
                name: 'Laura V.', role: 'Gerente de tienda online', initials: 'LV',
              },
            ].map((t, i) => (
              <article
                key={t.name}
                className={`glass p-6 flex flex-col justify-between reveal delay-${i + 1} hover:-translate-y-1 transition-all duration-300`}
              >
                <div>
                  <div className="flex gap-1 mb-4" aria-label="5 estrellas">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  </blockquote>
                </div>
                <footer className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)', color: '#000' }}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center" aria-labelledby="cta-h">
        <div className="max-w-2xl mx-auto reveal">
          <div
            className="glass p-10 md:p-16 relative overflow-hidden"
            style={{ borderColor: 'rgba(0,212,255,0.18)', boxShadow: '0 0 80px rgba(0,212,255,0.06)' }}
          >
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,212,255,0.06)' }} aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} aria-hidden="true" />
            <div className="relative z-10">
              <h2
                className="font-extrabold mb-4"
                id="cta-h"
                style={{ ...sg, fontSize: 'clamp(24px, 4.5vw, 46px)', letterSpacing: '-0.025em' }}
              >
                ¿Listo para hacer<br />
                <span className="text-gradient">tratos sin riesgos?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Crea tu cuenta en menos de 2 minutos. Gratis para empezar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register" className="btn-glow w-full sm:w-auto px-10 py-4 text-base">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  Crear cuenta gratis
                </Link>
                <Link href="/login" className="btn-ghost w-full sm:w-auto px-10 py-4 text-base">
                  Ya tengo cuenta
                </Link>
              </div>
              <p className="text-gray-600 text-xs mt-5">Demo: buyer@example.com · Buyer@123</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer
        className="border-t py-12 px-6"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        role="contentinfo"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            {/* Brand */}
            <div className="max-w-xs">
              <Link href="/" className="text-xl font-extrabold tracking-tight text-gradient" style={sg}>
                YULRRED
              </Link>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Plataforma de custodia online para que compradores y vendedores hagan tratos seguros, sin importar dónde estén.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-10">
              <nav aria-label="Plataforma">
                <h4 className="text-sm font-bold text-white mb-4" style={sg}>Plataforma</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Cómo funciona', href: '#como-funciona' },
                    { label: 'Beneficios',    href: '#beneficios' },
                    { label: 'Precios',       href: '#precios' },
                  ].map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="Mi cuenta">
                <h4 className="text-sm font-bold text-white mb-4" style={sg}>Mi cuenta</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Registrarse',   href: '/register' },
                    { label: 'Iniciar sesión', href: '/login' },
                    { label: 'Mis tratos',    href: '/deals' },
                    { label: 'Dashboard',     href: '/dashboard' },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span>© {new Date().getFullYear()} YULRRED. Todos los derechos reservados.</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} aria-hidden="true" />
              <span>Sistemas en línea</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
