import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecureDeal — Plataforma de Pagos en Garantía',
  description: 'Plataforma segura de depósito en garantía que protege a compradores y vendedores del fraude.',
  icons: { icon: '/favicon.ico' },
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
              style: { borderRadius: '12px', background: '#13131f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
