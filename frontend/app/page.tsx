'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, CreditCard,
  Package, PenLine, Scale, Star,
  Menu, X, ArrowRight, Lock, Bell,
} from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

const sg  = { fontFamily: "'Space Grotesk', sans-serif" };
const pjs = { fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif" };

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    { label: 'Precio',        href: '#precio' },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-5xl" aria-label="Navegación">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <Link href="/" className="text-lg font-extrabold tracking-tight text-gradient" style={sg}>
            KUQMI
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/login"    className="btn-ghost py-2 px-5 text-sm">Entrar</Link>
            <Link href="/register" className="btn-glow  py-2 px-5 text-sm">Empezar gratis</Link>
          </div>

          <button
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="mt-2 rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: 'rgba(10,10,15,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
          >
            {navLinks.map((l) => (
              <a
                key={l.label} href={l.href}
                className="text-sm text-gray-300 py-2.5 px-4 rounded-xl hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-white/10">
              <Link href="/login"    className="btn-ghost py-3 text-sm text-center" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link href="/register" className="btn-glow  py-3 text-sm text-center" onClick={() => setMenuOpen(false)}>Empezar gratis</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <AuroraBackground
        className="!h-auto min-h-screen !bg-[#0a0a0f] px-6 pt-28 pb-20"
        showRadialGradient
        aria-labelledby="hero-h"
      >
        <div
          className="absolute inset-0 dot-grid pointer-events-none"
          style={{
            opacity: 0.18,
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 40%, black 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 40%, black 20%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 animate-fade-up rounded-full"
            style={{
              background: 'rgba(0,212,255,0.07)',
              border: '1px solid rgba(0,212,255,0.22)',
              boxShadow: '0 0 20px rgba(0,212,255,0.10)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse-dot shrink-0" style={{ boxShadow: '0 0 10px #22D3EE' }} aria-hidden="true" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#22D3EE]">Compras seguras · 100% online</span>
          </div>

          <h1
            id="hero-h"
            className="font-black leading-[1.04] mb-6 animate-fade-up"
            style={{
              ...pjs,
              fontSize: 'clamp(40px, 6.5vw, 80px)',
              letterSpacing: '-0.04em',
              animationDelay: '0.1s',
            }}
          >
            Compra y vende online<br />
            <span className="text-white">sin arriesgar tu dinero</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: '0.2s', color: 'rgba(156,163,175,0.9)', lineHeight: 1.7, letterSpacing: '-0.01em' }}
          >
            Dinos qué quieres comprar. Nosotros guardamos tu dinero y solo lo liberamos cuando hayas recibido lo que pediste.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Link href="/register" className="btn-glow w-full sm:w-auto px-8 py-4 text-base">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Quiero comprar seguro
            </Link>
            <a href="#como-funciona" className="btn-ghost w-full sm:w-auto px-8 py-4 text-base">
              Ver cómo funciona
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>

          <div
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            {['Sin tarjeta para registrarse', 'Solo 5% de comisión', 'Si algo falla, te devolvemos el dinero'].map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(156,163,175,0.75)' }}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22D3EE' }} aria-hidden="true" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </AuroraBackground>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-20 px-6 scroll-mt-20" id="como-funciona" aria-labelledby="steps-h">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-cyan mb-4">Cómo funciona</div>
            <h2
              id="steps-h"
              className="font-black mb-3"
              style={{ ...pjs, fontSize: 'clamp(28px, 4.5vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
            >
              Simple como <span className="text-white">1, 2, 3</span>
            </h2>
            <p className="text-lg max-w-sm mx-auto" style={{ color: 'rgba(156,163,175,0.85)', lineHeight: 1.65 }}>
              No necesitas saber nada especial. Solo seguir los pasos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: PenLine, color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',
                step: '1',
                title: 'Crea el trato',
                desc: 'Describe qué quieres comprar o contratar, el monto y el plazo acordado. Listo en 2 minutos.',
              },
              {
                icon: CreditCard, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',
                step: '2',
                title: 'Tu dinero queda protegido',
                desc: 'Pagas y el dinero queda en custodia con KUQMI. El vendedor sabe que el pago está garantizado antes de empezar.',
              },
              {
                icon: Package, color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',
                step: '3',
                title: 'Recibes y liberamos el pago',
                desc: 'Cuando confirmas que recibiste lo que pediste, el dinero llega automáticamente al vendedor. Si no, te lo devolvemos.',
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  key={i}
                  className={`glass p-7 reveal delay-${i + 1} hover:-translate-y-1 transition-all duration-300`}
                  aria-labelledby={`step-${i}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: s.bg }}
                      aria-hidden="true"
                    >
                      <Icon className="w-6 h-6" style={{ color: s.color }} />
                    </div>
                    <span
                      className="text-3xl font-extrabold opacity-20"
                      style={{ ...sg, color: s.color }}
                      aria-hidden="true"
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3 id={`step-${i}`} className="font-bold text-base mb-2" style={pjs}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(107,114,128,1)' }}>{s.desc}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 glass-sm px-6 py-4 flex items-start gap-3 reveal delay-4">
            <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              <strong className="text-white">¿Hay un problema?</strong>{' '}
              Si comprador y vendedor no se ponen de acuerdo, un mediador de KUQMI revisa el caso y decide de forma imparcial.
            </p>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ───────────────────────────────────── */}
      <section
        className="py-20 px-6 scroll-mt-20"
        id="beneficios"
        aria-labelledby="benefits-h"
        style={{ background: 'rgba(13,13,22,0.65)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-purple mb-4">Por qué elegirnos</div>
            <h2
              id="benefits-h"
              className="font-black mb-3"
              style={{ ...pjs, fontSize: 'clamp(28px, 4.5vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
            >
              Tu tranquilidad,{' '}
              <span className="text-white">nuestra prioridad</span>
            </h2>
            <p className="text-lg max-w-sm mx-auto" style={{ color: 'rgba(156,163,175,0.85)', lineHeight: 1.65 }}>
              Diseñado para que cualquier persona pueda comprar y vender con confianza.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: ShieldCheck, color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',
                title: 'Dinero 100% protegido',
                desc: 'Tu pago no va al vendedor hasta que confirmes que recibiste lo que pediste. Siempre.',
              },
              {
                icon: CheckCircle2, color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',
                title: 'Sin estafas posibles',
                desc: 'El vendedor no puede desaparecer con tu dinero. Y tú no puedes negarte a pagar un trabajo entregado.',
              },
              {
                icon: CreditCard, color: '#635BFF', bg: 'rgba(99,91,255,0.10)',
                title: 'Pago fácil y seguro',
                desc: 'Pagá con tarjeta o transferencia. Tu información de pago está cifrada y nunca la guardamos.',
              },
              {
                icon: Scale, color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',
                title: 'Alguien te respalda',
                desc: 'Si algo no sale como esperabas, un mediador real revisa el caso y toma una decisión justa.',
              },
              {
                icon: Bell, color: '#FCD34D', bg: 'rgba(251,191,36,0.10)',
                title: 'Siempre al tanto',
                desc: 'Recibís un aviso en cada paso del proceso. Nada ocurre sin que lo sepas.',
              },
              {
                icon: Lock, color: '#F87171', bg: 'rgba(248,113,113,0.10)',
                title: 'Tu cuenta, solo tuya',
                desc: 'Acceso protegido con contraseña cifrada. Solo vos podés ver tus tratos y movimientos.',
              },
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
                  <h3 id={`ben-${i}`} className="font-bold text-sm mb-2" style={pjs}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(107,114,128,1)' }}>{b.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section className="py-20 px-6 scroll-mt-20" id="precio" aria-labelledby="pricing-h">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="badge badge-cyan mb-4">Precio</div>
            <h2
              id="pricing-h"
              className="font-black mb-3"
              style={{ ...pjs, fontSize: 'clamp(28px, 4.5vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.1 }}
            >
              Sin letra <span className="text-white">pequeña</span>
            </h2>
            <p className="text-lg" style={{ color: 'rgba(156,163,175,0.85)' }}>Solo pagas si el trato se completa con éxito.</p>
          </div>

          <div
            className="glass p-8 md:p-12 reveal"
            style={{ borderColor: 'rgba(0,212,255,0.18)', boxShadow: '0 0 60px rgba(0,212,255,0.05)' }}
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="text-center md:text-left">
                <div
                  className="font-black text-white mb-2"
                  style={{ ...pjs, fontSize: 'clamp(64px, 10vw, 100px)', letterSpacing: '-0.05em', lineHeight: 1 }}
                  aria-label="5 por ciento de comisión"
                >
                  5%
                </div>
                <p className="text-gray-400 mb-1 text-lg">por trato completado</p>
                <p className="text-sm text-gray-600 mb-8">Si el trato no se cierra, no cobras nada.</p>

                <div className="glass-sm px-5 py-4 text-sm text-gray-400 mb-8" role="note">
                  Si comprás algo de <strong className="text-white">$1,000</strong> →
                  el vendedor recibe <strong className="text-[#4ADE80]">$950</strong> ·
                  KUQMI cobra <strong className="text-[#00D4FF]">$50</strong>
                </div>

                <Link href="/register" className="btn-glow w-full md:w-auto px-8 py-4 text-base justify-center">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  Empezar gratis
                </Link>
              </div>

              <ul className="space-y-4" role="list">
                {[
                  'Tratos ilimitados',
                  'Sin mensualidad ni contrato',
                  'Pago con tarjeta incluido',
                  'Notificaciones en cada paso',
                  'Mediación de conflictos incluida',
                  'Panel de control fácil de usar',
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

      {/* ── CTA ────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        aria-labelledby="cta-h"
        style={{ background: 'rgba(13,13,22,0.65)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-2xl mx-auto reveal">
          <div
            className="glass p-10 md:p-16 relative overflow-hidden"
            style={{ borderColor: 'rgba(0,212,255,0.18)', boxShadow: '0 0 80px rgba(0,212,255,0.06)' }}
          >
            <div className="absolute top-0 left-0 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,212,255,0.06)' }} aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} aria-hidden="true" />
            <div className="relative z-10">
              <h2
                id="cta-h"
                className="font-black mb-4"
                style={{ ...pjs, fontSize: 'clamp(26px, 4.5vw, 48px)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
              >
                ¿Listo para comprar<br />
                <span className="text-white">sin riesgos?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                Crea tu cuenta en menos de 2 minutos. Completamente gratis para empezar.
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
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }} role="contentinfo">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <Link href="/" className="text-xl font-extrabold tracking-tight text-gradient" style={sg}>
                KUQMI
              </Link>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Plataforma de compras seguras. Tu dinero queda protegido hasta que recibas lo que compraste.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <nav aria-label="Plataforma">
                <h4 className="text-sm font-bold text-white mb-4" style={sg}>Plataforma</h4>
                <ul className="space-y-3">
                  {[
                    { label: 'Cómo funciona', href: '#como-funciona' },
                    { label: 'Beneficios',    href: '#beneficios' },
                    { label: 'Precio',        href: '#precio' },
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
                    { label: 'Crear cuenta',   href: '/register' },
                    { label: 'Iniciar sesión', href: '/login' },
                    { label: 'Mis tratos',     href: '/deals' },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span>© {new Date().getFullYear()} KUQMI. Todos los derechos reservados.</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} aria-hidden="true" />
              <span>Servicio activo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
