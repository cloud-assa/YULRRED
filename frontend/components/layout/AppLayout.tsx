'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Handshake, Plus, Bell, Scale,
  ClipboardList, Users, Menu, X, ShieldCheck, LogOut
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const navItems = [
  { href: '/dashboard',      label: 'Panel',          icon: LayoutDashboard },
  { href: '/deals',          label: 'Mis Tratos',     icon: Handshake },
  { href: '/deals/new',      label: 'Nuevo Trato',    icon: Plus },
  { href: '/notifications',  label: 'Notificaciones', icon: Bell },
];

const adminNavItems = [
  { href: '/admin/disputes', label: 'Disputas',        icon: Scale },
  { href: '/admin/deals',    label: 'Todos los Tratos', icon: ClipboardList },
  { href: '/admin/users',    label: 'Usuarios',         icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = session?.user?.role === 'ADMIN';

  const NavLink = ({ href, label, icon: Icon, exact }: { href: string; label: string; icon: React.ElementType; exact?: boolean }) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          active
            ? 'bg-brand-500/15 text-brand-300 border-r-2 border-brand-500/60'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
        )}
      >
        <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-brand-400' : '')} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-30 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: '#0f0f1a',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-xl" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)' }}>
              <ShieldCheck className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <span className="text-lg font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              YULRRED
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold px-3 py-2">
            Principal
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} exact={item.href === '/deals'} />
          ))}

          {isAdmin && (
            <>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold px-3 py-2 mt-4">
                Administración
              </p>
              {adminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-all">
            <Avatar name={session?.user?.name || 'U'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10"
          style={{
            background: 'rgba(15,15,26,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-all"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {isAdmin && (
              <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Admin
              </span>
            )}
            <Link
              href="/notifications"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
