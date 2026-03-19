import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'YULRRED — Escrow Seguro para el Mundo Digital',
  description: 'Plataforma escrow SaaS con SpacetimeDB y Stripe. Custodia inteligente de fondos entre compradores y vendedores. 5% de comisión transparente.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'YULRRED — Escrow Seguro',
    description: 'Custodia inteligente de fondos entre compradores y vendedores.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#13131f',
                color: '#fff',
                border: '1px solid rgba(0,212,255,0.15)',
                fontFamily: "'Inter', sans-serif",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
