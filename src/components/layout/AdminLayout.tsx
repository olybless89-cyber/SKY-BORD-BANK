import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, Users, ArrowLeftRight, Download, Upload,
  Lock, Bell, Mail, LogOut, Shield, Menu,
  ChevronRight, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
  { label: 'Deposit Requests', href: '/admin/deposits', icon: Download },
  { label: 'Withdrawal Requests', href: '/admin/withdrawals', icon: Upload },
  { label: 'Holds', href: '/admin/holds', icon: Lock },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Webmail', href: '/admin/webmail', icon: Mail },
  { label: 'Statistics', href: '/admin/stats', icon: BarChart3 },
];

const SIDEBAR_BG = '#06101f';
const SIDEBAR_BORDER = 'rgba(201,168,76,0.12)';
const GOLD = '#c9a84c';

interface Props { children: React.ReactNode; unreadMail?: number; }

export default function AdminLayout({ children, unreadMail = 0 }: Props) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR_BG }}>
      {/* Logo + admin badge */}
      <div className="p-6" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <Shield className="h-5 w-5" style={{ color: GOLD }} />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Nova<span style={{ color: GOLD }}>Crest</span>
          </span>
        </Link>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full tracking-widest uppercase"
            style={{ background: 'rgba(201,168,76,0.15)', color: GOLD, border: '1px solid rgba(201,168,76,0.3)' }}>
            Admin
          </span>
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#06101f' }}>
              {(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}
            </div>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = location.pathname === href;
          return (
            <Link key={href} to={href} onClick={() => setMobileOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all')}
              style={active
                ? { background: 'rgba(201,168,76,0.12)', color: GOLD, border: '1px solid rgba(201,168,76,0.25)' }
                : { color: 'rgba(255,255,255,0.45)', border: '1px solid transparent' }
              }
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Webmail' && unreadMail > 0 && (
                <Badge className="text-xs px-1.5 py-0" style={{ background: GOLD, color: '#06101f' }}>{unreadMail}</Badge>
              )}
              {active && <ChevronRight className="h-3 w-3 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full" style={{ background: '#080e1c' }}>
      <aside className="hidden md:flex flex-col w-64 shrink-0" style={{ borderRight: `1px solid ${SIDEBAR_BORDER}` }}>
        <SidebarContent />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}`, background: SIDEBAR_BG }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: GOLD }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: GOLD }}>Crest</span>
              <span className="text-xs font-normal ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin</span>
            </span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-0" style={{ background: SIDEBAR_BG }}>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
