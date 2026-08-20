import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, Shield, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Business', href: '#accounts' },
  { label: 'Personal', href: '#features' },
  { label: 'Security', href: '#security' },
  { label: 'Support', href: '#faq' },
];

interface HeaderProps { isLanding?: boolean; }

export function Header({ isLanding = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const dashboardHref = profile?.role === 'admin' ? '/admin' : '/dashboard';

  if (isLanding) {
    // Transparent when at top of page, dark blur on scroll
    const headerBg = scrolled
      ? 'bg-[rgba(13,26,45,0.88)] backdrop-blur-md shadow-lg border-b border-white/10'
      : 'bg-transparent border-b border-white/10';
    const logoTextColor = 'text-white';
    const navLinkColor = 'text-white/85 hover:text-white';
    const signInColor = 'text-white/85 hover:text-white';
    const iconColor = 'text-white';

    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-6">
          {/* Logo */}
          <a
            href="#"
            className={`flex items-center gap-2 ${logoTextColor}`}
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Nova<span className="text-blue-400">Crest</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`relative text-sm font-medium transition-colors ${navLinkColor}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="gap-2 text-white hover:text-white hover:bg-white/10">
                  <Link to={dashboardHref}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                </Button>
                <button
                  onClick={handleSignOut}
                  className={`flex items-center gap-1.5 text-sm font-medium ${signInColor}`}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold mr-1 ${signInColor}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#1d4ed8] transition-all duration-200"
                >
                  Online Banking
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className={iconColor + ' hover:bg-white/10'}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80vw] max-w-xs bg-[#0d1a2d] border-white/10">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-5 pt-8">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNav(link.href)}
                    className="text-left text-base font-medium text-white/80 hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
                <hr className="border-white/10" />
                {user ? (
                  <>
                    <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]" asChild onClick={() => setOpen(false)}>
                      <Link to={dashboardHref}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full text-white border border-white/20 hover:bg-white/10"
                      onClick={() => { setOpen(false); handleSignOut(); }}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="block w-full rounded-lg bg-[#2563eb] py-3 text-center text-sm font-bold text-white hover:bg-[#1d4ed8]"
                    >
                      Online Banking
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block w-full rounded-lg border border-white/30 py-3 text-center text-sm font-semibold text-white/85 hover:bg-white/10"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  // ── Default dark header (used on all non-landing pages) ──
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border' : 'bg-transparent'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <a href="#" className="flex items-center gap-2 text-foreground"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">NovaCrest</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => handleNav(link.href)}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to={dashboardHref}><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-sm font-medium" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="rounded-full px-6 text-sm font-semibold" asChild>
                <Link to="/register">Open Account</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80vw] max-w-xs border-border bg-background">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => handleNav(link.href)}
                  className="text-left text-lg font-medium text-foreground hover:text-primary">
                  {link.label}
                </button>
              ))}
              <hr className="border-border" />
              {user ? (
                <>
                  <Button className="w-full rounded-full" asChild onClick={() => setOpen(false)}>
                    <Link to={dashboardHref}>Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full"
                    onClick={() => { setOpen(false); handleSignOut(); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full rounded-full" asChild onClick={() => setOpen(false)}>
                    <Link to="/register">Open Account</Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full" asChild onClick={() => setOpen(false)}>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
