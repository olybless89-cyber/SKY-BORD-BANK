import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, ArrowLeftRight, Download, Upload,
  Lock, Bell, User, LogOut, Shield, Menu,
  ChevronRight, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: FileText },
  { label: 'Transfer', href: '/dashboard/transfer', icon: ArrowLeftRight },
  { label: 'Deposit', href: '/dashboard/deposit', icon: Download },
  { label: 'Withdraw', href: '/dashboard/withdraw', icon: Upload },
  { label: 'Holds', href: '/dashboard/holds', icon: Lock },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const SIDEBAR_BG = '#06101f';
const SIDEBAR_BORDER = 'rgba(201,168,76,0.12)';
const GOLD = '#c9a84c';

interface Props { children: React.ReactNode; notifCount?: number; }

export default function DashboardLayout({ children, notifCount = 0 }: Props) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: SIDEBAR_BG }}>
      {/* Logo + user */}
      <div className="p-6" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}` }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <Shield className="h-5 w-5" style={{ color: GOLD }} />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Nova<span style={{ color: GOLD }}>Crest</span>
          </span>
        </Link>

        <div className="mt-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#06101f' }}>
              {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Account Holder'}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{profile?.email}</p>
            </div>
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
              {label === 'Notifications' && notifCount > 0 && (
                <Badge className="text-xs px-1.5 py-0" style={{ background: GOLD, color: '#06101f' }}>{notifCount}</Badge>
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0" style={{ borderRight: `1px solid ${SIDEBAR_BORDER}` }}>
        <SidebarContent />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}`, background: SIDEBAR_BG }}>
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: GOLD }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: GOLD }}>Crest</span>
            </span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-white hover:bg-white/10">
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

