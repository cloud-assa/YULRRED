import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">

      {/* Dot grid */}
      <div
        className="absolute inset-0 dot-grid pointer-events-none"
        style={{
          opacity: 0.18,
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Orbs */}
      <div
        className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07), transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07), transparent)' }}
        aria-hidden="true"
      />

      <div className="w-full max-w-[440px] relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(0,212,255,0.10)',
                border: '1px solid rgba(0,212,255,0.25)',
                boxShadow: '0 0 24px rgba(0,212,255,0.12)',
              }}
            >
              <ShieldCheck className="w-7 h-7 text-[#00D4FF]" />
            </div>
            <span
              className="text-2xl font-extrabold tracking-tight text-gradient"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              KUQMI
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Compras seguras · 100% online</p>
        </div>

        {children}
      </div>
    </div>
  );
}
