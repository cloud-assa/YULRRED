import Link from 'next/link';
import {
  ShieldCheck, CheckCircle2, Zap, Lock,
  Scale, CreditCard, Package, PenLine,
  Globe, Bell, Users, Github, Star,
  Briefcase,
} from 'lucide-react';

const spaceGrotesk = { fontFamily: "'Space Grotesk', sans-serif" };
const headingLg = { ...spaceGrotesk, fontSize: 'clamp(30px, 5vw, 52px)', letterSpacing: '-0.025em' };
const headingXl = { ...spaceGrotesk, fontSize: 'clamp(44px, 7vw, 80px)', letterSpacing: '-0.03em' };

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-6xl"
        aria-label="Navegación principal"
      >
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{
            background: 'rgba(10,10,15,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
        >
          <Link href="/" className="text-xl font-extrabold tracking-tight text-gradient" style={spaceGrotesk}>
            YULRRED
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Características', href: '#features' },
              { label: 'Precios', href: '#precios' },
              { label: 'API Docs', href: 'https://yulrred-api.vercel.app/api/docs', external: true },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost py-2 px-4 text-sm hidden sm:inline-flex">Iniciar Sesión</Link>
            <Link href="/register" className="btn-glow py-2 px-4 text-sm gap-2">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-36 pb-24 overflow-hidden" aria-labelledby="hero-heading">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none blur-3xl animate-orb"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(0,212,255,0.10), rgba(139,92,246,0.08), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none blur-3xl"
          style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.07), transparent)' }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 dot-grid pointer-events-none"
          style={{
            opacity: 0.35,
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2.5 glass-sm px-4 py-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse-dot" style={{ boxShadow: '0 0 8px #00D4FF' }} aria-hidden="true" />
            <span className="text-sm font-semibold text-[#00D4FF]">Plataforma activa en producción</span>
            <span className="text-gray-600" aria-hidden="true">·</span>
            <span className="text-sm text-gray-500">SpacetimeDB + Stripe</span>
          </div>
          <h1 className="font-extrabold leading-[1.06] mb-6" id="hero-heading" style={headingXl}>
            Cada trato,<br />
            <span className="text-gradient">protegido por código</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            YULRRED es la plataforma escrow SaaS que custodia tu dinero hasta que ambas partes cumplan. Sin intermediarios incómodos. Solo confianza automatizada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-glow px-8 py-4 text-base gap-2.5">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Crear cuenta gratis
            </Link>
            <a href="https://yulrred-api.vercel.app/api/docs" target="_blank" rel="noopener noreferrer" className="btn-ghost px-8 py-4 text-base gap-2.5">
              <Globe className="w-5 h-5" aria-hidden="true" />
              Ver API Docs
            </a>
          </div>
          <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-3 glass-sm px-8 py-4" role="list">
            {[
              { icon: ShieldCheck, text: 'Sin tarjeta para registrarse', color: 'text-[#00D4FF]' },
              { icon: CreditCard,  text: '5% de comisión transparente',  color: 'text-[#8B5CF6]' },
              { icon: Scale,       text: 'Disputas resueltas por admin', color: 'text-emerald-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-400" role="listitem">
                <Icon className={`w-4 h-4 ${color} shrink-0`} aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section aria-label="Estadísticas" className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass grid grid-cols-2 md:grid-cols-4">
            {[
              { num: '$2.4M+', label: 'en tratos custodiados' },
              { num: '99.9%',  label: 'uptime en producción' },
              { num: '3',      label: 'roles: Buyer · Seller · Admin' },
              { num: '5%',     label: 'comisión plana, sin sorpresas' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-8 px-4 border-b md:border-b-0 border-r last:border-r-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="block font-extrabold text-gradient mb-1" style={{ ...spaceGrotesk, fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.02em' }}>
                  {stat.num}
                </span>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6" id="como-funciona" aria-labelledby="steps-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-cyan mb-5">Flujo escrow</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="steps-heading" style={headingLg}>
              Cómo funciona YULRRED
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              Un proceso claro y transparente que protege a compradores y vendedores en cada paso.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 relative">
            <div
              className="absolute hidden md:block top-[54px] left-[12.5%] right-[12.5%] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), rgba(139,92,246,0.4), transparent)' }}
              aria-hidden="true"
            />
            {[
              { num: '1', icon: PenLine,      chipClass: 'chip-pending',   chip: 'PENDING',   title: 'Buyer crea el trato',    desc: 'Define título, monto y descripción. YULRRED calcula el 5% de comisión automáticamente.' },
              { num: '2', icon: CreditCard,   chipClass: 'chip-funded',    chip: 'FUNDED',    title: 'Buyer deposita fondos',  desc: 'Pago seguro con Stripe. Los fondos quedan en custodia. El seller no recibe nada aún.' },
              { num: '3', icon: Package,      chipClass: 'chip-delivered', chip: 'DELIVERED', title: 'Seller entrega',         desc: 'El vendedor completa el trabajo y marca el trato como entregado en el dashboard.' },
              { num: '4', icon: CheckCircle2, chipClass: 'chip-completed', chip: 'COMPLETED', title: 'Fondos liberados',       desc: 'El buyer confirma el recibo. Los fondos se liberan automáticamente al seller.' },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.num} className="glass p-6 relative z-10 text-center hover:-translate-y-1.5 transition-all duration-300" aria-labelledby={`step${step.num}-title`}>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                    style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(0,212,255,0.3)', ...spaceGrotesk }}
                    aria-hidden="true"
                  >
                    {step.num}
                  </div>
                  <h3 id={`step${step.num}-title`} className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{step.desc}</p>
                  <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${step.chipClass}`}>{step.chip}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="py-24 px-6" id="features" aria-labelledby="features-heading" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.02) 50%, transparent 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-purple mb-5">Características</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="features-heading" style={headingLg}>
              Todo lo que necesitas<br />para confiar en cada deal
            </h2>
            <p className="text-gray-400 text-lg">Construido con el stack más fiable del ecosistema cloud moderno.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <article className="glass p-8 md:col-span-7 md:row-span-2 hover:-translate-y-1 transition-all duration-300" aria-labelledby="feat-custody">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(0,212,255,0.12)' }} aria-hidden="true">
                <ShieldCheck className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <h3 id="feat-custody" className="text-2xl font-bold mb-3">Custodia inteligente de fondos</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Los fondos no se mueven hasta que ambas partes estén de acuerdo. Stripe PaymentIntents garantiza que el dinero esté siempre asegurado durante todo el ciclo de vida del trato.
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-6" aria-label="Estados del deal">
                {(['PENDING', 'FUNDED', 'DELIVERED', 'COMPLETED'] as const).map((state, i, arr) => (
                  <span key={state} className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full chip-${state.toLowerCase()}`}>{state}</span>
                    {i < arr.length - 1 && <span className="text-gray-600 font-bold" aria-hidden="true">→</span>}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2" aria-label="Tecnologías">
                {[{ label: 'SpacetimeDB', color: '#00D4FF' }, { label: 'Stripe', color: '#635BFF' }, { label: 'NestJS', color: '#E0234E' }, { label: 'Next.js 14', color: '#ffffff' }].map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} aria-hidden="true" />
                    {t.label}
                  </span>
                ))}
              </div>
            </article>
            {[
              { icon: Scale,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', cols: 'md:col-span-5', title: 'Resolución de disputas',  desc: '¿Conflicto? El admin revisa evidencias y decide si reembolsar o liberar fondos.' },
              { icon: Bell,      color: '#00D4FF', bg: 'rgba(0,212,255,0.12)',  cols: 'md:col-span-5', title: 'Notificaciones real-time', desc: 'Email + in-app alerts en cada cambio de estado. Nunca te perderás un hito.' },
              { icon: Lock,      color: '#FCD34D', bg: 'rgba(251,191,36,0.12)', cols: 'md:col-span-4', title: 'Auth JWT seguro',           desc: 'bcrypt + tokens de 7 días. Roles diferenciados: Buyer, Seller y Admin.' },
              { icon: Zap,       color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', cols: 'md:col-span-4', title: 'Fee transparente',          desc: 'Solo 5% del monto, calculado antes de confirmar. Sin letra pequeña.' },
              { icon: Briefcase, color: '#F87171', bg: 'rgba(248,113,113,0.12)', cols: 'md:col-span-4', title: 'API REST completa',         desc: 'Swagger Docs en vivo. Integra YULRRED en tu app con pocos endpoints.' },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <article key={feat.title} className={`glass p-6 ${feat.cols} hover:-translate-y-1 transition-all duration-300`} aria-labelledby={`feat-${feat.title.replace(/\s+/g, '-')}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: feat.bg }} aria-hidden="true">
                    <Icon className="w-5 h-5" style={{ color: feat.color }} />
                  </div>
                  <h3 id={`feat-${feat.title.replace(/\s+/g, '-')}`} className="font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* BEFORE/AFTER */}
      <section className="py-24 px-6" style={{ background: 'rgba(13,13,22,0.7)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }} aria-labelledby="compare-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-cyan mb-5">Comparación</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="compare-heading" style={headingLg}>
              Tú solo haces clic.<br /><span className="text-gradient">Nosotros hacemos el resto.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass p-7 space-y-3" style={{ borderLeft: '3px solid rgba(239,68,68,0.45)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)' }}><Scale className="w-5 h-5 text-red-400" aria-hidden="true" /></div>
                <div><p className="font-bold text-white" style={spaceGrotesk}>Sin YULRRED</p><p className="text-xs text-gray-500">El caos de siempre</p></div>
              </div>
              {['Contratos PDF de 20 páginas', 'Transferencias sin garantía', 'Sin verificación del producto', 'Fraudes y estafas sin resolver', 'Meses esperando resolución legal', 'Cada parte por su cuenta'].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />{item}
                </div>
              ))}
            </div>
            <div className="glass p-7 space-y-3" style={{ borderLeft: '3px solid rgba(0,212,255,0.5)', background: 'rgba(0,212,255,0.02)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.12)' }}><ShieldCheck className="w-5 h-5 text-[#00D4FF]" aria-hidden="true" /></div>
                <div><p className="font-bold text-white" style={spaceGrotesk}>Con YULRRED</p><p className="text-xs text-[#00D4FF]">Simple y seguro</p></div>
              </div>
              {['Acuerdo creado en 2 minutos', 'Fondos protegidos en custodia Stripe', 'Verificación de entrega incluida', 'Resolución de disputas por admin', 'Decisiones en horas, no meses', 'Todo gestionado en un solo lugar'].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00D4FF] shrink-0" aria-hidden="true" />{item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { role: 'Comprador (Buyer)', color: '#00D4FF', bg: 'rgba(0,212,255,0.10)', border: 'rgba(0,212,255,0.3)', icon: CreditCard, steps: ['Crea el trato en minutos', 'Fondea el pago con Stripe', 'Confirma recepción del producto'] },
              { role: 'Admin YULRRED', color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.4)', icon: Users, steps: ['Supervisa la plataforma', 'Verifica entregas en disputa', 'Resuelve conflictos imparcialmente'], highlight: true },
              { role: 'Vendedor (Seller)', color: '#4ADE80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.3)', icon: Package, steps: ['Acepta el trato seguro', 'Entrega el producto/servicio', 'Recibe el pago automático'] },
            ].map(({ role, color, bg, border, icon: Icon, steps, highlight }) => (
              <div key={role} className={`glass p-6 space-y-4 ${highlight ? 'shadow-glow-sm' : ''}`} style={{ borderLeft: `3px solid ${border}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}><Icon className="w-5 h-5" style={{ color }} aria-hidden="true" /></div>
                <div><p className="font-bold text-sm" style={{ ...spaceGrotesk, color }}>{role}</p>{highlight && <p className="text-[10px] text-gray-500 mt-0.5">Gestiona todo el proceso</p>}</div>
                <ul className="space-y-2">{steps.map((s, i) => (<li key={s} className="flex items-start gap-2 text-sm text-gray-400"><span className="text-[10px] font-bold mt-0.5 shrink-0" style={{ color }}>{i + 1}.</span>{s}</li>))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="py-24 px-6" aria-labelledby="security-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-cyan mb-5">Infraestructura</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="security-heading" style={headingLg}>Seguridad que no se negocia</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">Construido sobre los pilares más confiables del ecosistema cloud moderno.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Globe,      color: '#00D4FF', bg: 'rgba(0,212,255,0.10)',   title: 'SpacetimeDB Cloud',     desc: 'Base de datos real-time con módulo C# WASM. Reducers atómicos garantizan consistencia en cada transacción.' },
              { icon: CreditCard, color: '#635BFF', bg: 'rgba(99,91,255,0.10)',   title: 'Stripe PaymentIntents', desc: 'Estándar PCI-DSS. Números de tarjeta nunca tocan nuestros servidores. Webhooks con firma HMAC.' },
              { icon: Lock,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.10)',  title: 'JWT + bcrypt',          desc: 'Tokens firmados con 256-bit secret. Contraseñas con hash bcrypt. Guardias de ruta por rol.' },
              { icon: Zap,        color: '#4ADE80', bg: 'rgba(74,222,128,0.10)',  title: 'Vercel Edge Network',   desc: 'Frontend y backend en la CDN de Vercel. SSL automático, serverless functions escalables a cero.' },
              { icon: Scale,      color: '#FCD34D', bg: 'rgba(251,191,36,0.10)',  title: 'Disputas supervisadas', desc: 'Resolución siempre por un humano. El admin puede reembolsar o liberar fondos con evidencia verificada.' },
              { icon: Github,     color: '#E0E0E0', bg: 'rgba(224,224,224,0.06)', title: 'Open Source',           desc: 'Código público en GitHub. Auditable por la comunidad. Sin cajas negras ni procesos ocultos.' },
            ].map((sec) => {
              const Icon = sec.icon;
              return (
                <article key={sec.title} className="glass p-6 flex gap-4 items-start hover:-translate-y-1 transition-all duration-300" aria-labelledby={`sec-${sec.title.replace(/\s+/g, '-')}`}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: sec.bg }} aria-hidden="true">
                    <Icon className="w-6 h-6" style={{ color: sec.color }} />
                  </div>
                  <div>
                    <h3 id={`sec-${sec.title.replace(/\s+/g, '-')}`} className="font-bold text-sm mb-1.5">{sec.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{sec.desc}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6" id="precios" aria-labelledby="pricing-heading" style={{ background: 'rgba(13,13,22,0.65)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-cyan mb-5">Precios</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="pricing-heading" style={headingLg}>Simple, justo, transparente</h2>
            <p className="text-gray-400 text-lg">Sin planes confusos. Un único modelo de comisión por éxito.</p>
          </div>
          <div className="glass p-8 md:p-12 relative overflow-hidden" style={{ borderColor: 'rgba(0,212,255,0.22)', boxShadow: '0 0 60px rgba(0,212,255,0.08)' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 text-xs font-bold uppercase tracking-widest" style={{ background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)', borderRadius: '100px', color: '#000' }}>
              Único modelo disponible
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,212,255,0.05)' }} aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.05)' }} aria-hidden="true" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="text-center md:text-left">
                <div className="inline-block font-extrabold text-gradient mb-3" style={{ ...spaceGrotesk, fontSize: '88px', letterSpacing: '-0.04em', lineHeight: 1 }} aria-label="5 por ciento de comisión">5%</div>
                <p className="text-gray-400 mb-4 leading-relaxed">por deal completado<br />Solo pagas si el trato se cierra</p>
                <div className="glass-sm px-5 py-4 text-sm text-gray-400 mb-8" role="note">
                  Deal de <strong className="text-white">$1,000</strong> → Seller recibe <strong className="text-[#4ADE80]">$950</strong> · YULRRED gana <strong className="text-[#00D4FF]">$50</strong>
                </div>
                <Link href="/register" className="btn-glow px-8 py-4 text-base gap-2.5">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />Comenzar gratis
                </Link>
              </div>
              <ul className="space-y-3.5" role="list">
                {['Deals ilimitados', 'Stripe PaymentIntents incluido', 'Notificaciones email + in-app', 'Resolución de disputas por admin', 'API REST + Swagger Docs', 'Dashboard con estadísticas en tiempo real', 'Código open source — auditable'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300" role="listitem">
                    <CheckCircle2 className="w-4 h-4 text-[#00D4FF] shrink-0" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6" aria-labelledby="testimonials-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-purple mb-5">Testimonios</div>
            <h2 className="font-extrabold mb-4 tracking-tight" id="testimonials-heading" style={headingLg}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { quote: 'Pagué a un freelancer internacional por primera vez sin miedo. YULRRED retuvo los fondos hasta que entregó el diseño. Exactamente como prometido.', name: 'María A.', role: 'Fundadora · AgenciaCreativa.co', initials: 'MA' },
              { quote: 'Como developer freelance, siempre temía los no-pagos. Con YULRRED sé que los fondos ya están bloqueados antes de empezar a trabajar. Un cambio total.', name: 'Carlos R.', role: 'Fullstack Developer · Freelance', initials: 'CR' },
              { quote: 'Tuvimos una disputa y el admin resolvió en menos de 24 horas con total transparencia. El proceso fue justo y documentado. Confianza total en la plataforma.', name: 'Laura V.', role: 'E-commerce Manager · TiendaOnline.mx', initials: 'LV' },
            ].map((t) => (
              <article key={t.name} className="glass p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300" aria-labelledby={`testi-${t.initials}`}>
                <div>
                  <div className="flex gap-1 mb-4" aria-label="5 estrellas">
                    {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />))}
                  </div>
                  <blockquote><p className="text-gray-400 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p></blockquote>
                </div>
                <footer className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #00D4FF, #8B5CF6)', color: '#000' }} aria-hidden="true">{t.initials}</div>
                  <div><p id={`testi-${t.initials}`} className="text-sm font-bold">{t.name}</p><p className="text-xs text-gray-500 mt-0.5">{t.role}</p></div>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto">
          <div className="glass p-12 md:p-16 relative overflow-hidden" style={{ borderColor: 'rgba(0,212,255,0.20)', boxShadow: '0 0 80px rgba(0,212,255,0.07)' }}>
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(0,212,255,0.07)' }} aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.07)' }} aria-hidden="true" />
            <div className="relative z-10">
              <div className="badge badge-purple mx-auto mb-6">Empieza hoy</div>
              <h2 className="font-extrabold mb-4 tracking-tight" id="cta-heading" style={{ ...spaceGrotesk, fontSize: 'clamp(28px, 5vw, 50px)', letterSpacing: '-0.025em' }}>
                Tu próximo trato,<br /><span className="text-gradient">custodiado por código</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Crea tu cuenta en menos de 2 minutos. Protege tus transacciones con la misma tecnología que usan los equipos de Silicon Valley.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="btn-glow px-10 py-4 text-base gap-2.5">
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />Crear cuenta gratis
                </Link>
                <Link href="/login" className="btn-ghost px-10 py-4 text-base">Iniciar sesión</Link>
              </div>
              <p className="text-gray-600 text-sm mt-6">Demo: buyer@example.com / Buyer@123</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }} role="contentinfo">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient" style={spaceGrotesk}>YULRRED</Link>
              <p className="text-gray-500 text-sm mt-3 mb-4 max-w-xs leading-relaxed">
                Plataforma escrow SaaS para transacciones seguras entre compradores y vendedores en el mundo digital.
              </p>
              <div className="flex flex-wrap gap-2">
                {[{ label: 'NestJS', color: '#E0234E' }, { label: 'Next.js 14', color: '#ffffff' }, { label: 'SpacetimeDB', color: '#00D4FF' }, { label: 'Stripe', color: '#635BFF' }].map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-xs text-gray-500 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} aria-hidden="true" />{t.label}
                  </span>
                ))}
              </div>
            </div>
            <nav aria-label="Recursos">
              <h4 className="text-sm font-bold text-white mb-4" style={spaceGrotesk}>Recursos</h4>
              <ul className="space-y-2.5">
                {[{ label: 'Cómo funciona', href: '#como-funciona' }, { label: 'Características', href: '#features' }, { label: 'Precios', href: '#precios' }, { label: 'API Docs', href: 'https://yulrred-api.vercel.app/api/docs', external: true }, { label: 'GitHub', href: 'https://github.com/cloud-assa/YULRRED', external: true }].map((link) => (
                  <li key={link.label}><a href={link.href} className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors" {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Cuenta">
              <h4 className="text-sm font-bold text-white mb-4" style={spaceGrotesk}>Cuenta</h4>
              <ul className="space-y-2.5">
                {[{ label: 'Registrarse', href: '/register' }, { label: 'Iniciar sesión', href: '/login' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Mis deals', href: '/deals' }, { label: 'Notificaciones', href: '/notifications' }].map((link) => (
                  <li key={link.label}><Link href={link.href} className="text-sm text-gray-500 hover:text-[#00D4FF] transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-600" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span>© {new Date().getFullYear()} YULRRED. Todos los derechos reservados.</span>
            <div className="flex items-center gap-2" role="status" aria-live="polite">
              <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} aria-hidden="true" />
              <span>Todos los sistemas operativos</span>
            </div>
            <span>NestJS · Next.js 14 · SpacetimeDB · Vercel · Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
