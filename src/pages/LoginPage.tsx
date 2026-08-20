import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Lock, Globe, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

const BG_IMAGE = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_51267c2d-04ad-443a-8e83-5d92996d344a.jpg';

const TRUST_ITEMS = [
  { icon: Lock, label: '256-bit SSL Encryption' },
  { icon: Globe, label: 'Available in 190+ Countries' },
  { icon: TrendingUp, label: '$2.4 Billion in Assets Managed' },
];

const STATS = [
  { value: '18.5M+', label: 'Active Clients' },
  { value: '99.98%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'App Rating' },
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error('Login failed: ' + error.message);
      return;
    }
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Hero Image + Brand ── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_IMAGE})` }}
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,15,35,0.88) 0%, rgba(10,25,60,0.75) 50%, rgba(5,15,35,0.92) 100%)' }} />
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, transparent, #c9a84c, transparent)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 justify-between">
          {/* Top: Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Shield className="h-7 w-7" style={{ color: '#c9a84c' }} />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: '#c9a84c' }}>Crest</span>
            </span>
          </div>

          {/* Middle: Headline */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#c9a84c' }}>
                Private Banking Excellence
              </p>
              <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Where wealth<br />meets wisdom.
              </h1>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Experience banking reimagined — secure, intelligent, and built for those who demand more.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {STATS.map(s => (
                <div key={s.value} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-lg font-bold" style={{ color: '#c9a84c', fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Trust badges */}
          <div className="space-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: '#c9a84c' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                <CheckCircle2 className="h-4 w-4 ml-auto flex-shrink-0" style={{ color: '#c9a84c' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen" style={{ background: '#0a0f1e' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-5 w-5" style={{ color: '#c9a84c' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: '#c9a84c' }}>Crest</span>
            </span>
          </div>
          <div className="hidden md:block" />
          <Link to="/" className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Back to website
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-0.5 w-6 rounded" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#c9a84c' }}>
                  Secure Portal
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Welcome back
              </h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Sign in to your NovaCrest account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 h-12 text-white placeholder:text-white/25 border-white/10 focus:border-yellow-600/60 focus:ring-yellow-600/20"
                  style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Password
                  </Label>
                  <span className="text-xs cursor-pointer" style={{ color: '#c9a84c' }}>Forgot password?</span>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="px-4 h-12 pr-12 text-white placeholder:text-white/25 border-white/10 focus:border-yellow-600/60 focus:ring-yellow-600/20"
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: loading ? 'rgba(201,168,76,0.5)' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                  color: '#0a0f1e',
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: loading ? 'none' : '0 4px 24px rgba(201,168,76,0.3)',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Authenticating…
                  </span>
                ) : (
                  <>
                    Access My Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>New to NovaCrest?</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <Link
              to="/register"
              className="flex items-center justify-center gap-2 w-full h-12 text-sm font-medium rounded-xl transition-all"
              style={{
                border: '1px solid rgba(201,168,76,0.3)',
                color: '#c9a84c',
                borderRadius: '10px',
              }}
            >
              Open a NovaCrest Account
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Lock className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Protected by 256-bit SSL · Bank-grade Security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
