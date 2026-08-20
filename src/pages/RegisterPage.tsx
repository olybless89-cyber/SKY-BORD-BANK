import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Lock, Star, Users, Award, ArrowRight } from 'lucide-react';

const BG_IMAGE = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_ebb56e82-3bd9-4aec-8df6-b720cba0d9d2.jpg';

const PERKS = [
  { icon: Shield, text: 'FDIC-Insured Accounts up to $250,000' },
  { icon: Star, text: 'Zero Monthly Fees on All Accounts' },
  { icon: Users, text: 'Dedicated Relationship Manager' },
  { icon: Award, text: 'Award-Winning Customer Service' },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please agree to the Terms and Privacy Policy'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (error) { toast.error('Registration failed: ' + error.message); return; }
    toast.success('Account created! Welcome to NovaCrest.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden md:flex md:w-1/2 relative flex-col overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMAGE})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(5,15,35,0.90) 0%, rgba(10,30,70,0.78) 50%, rgba(5,15,35,0.93) 100%)' }} />
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, transparent, #c9a84c, transparent)' }} />

        <div className="relative z-10 flex flex-col h-full p-10 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Shield className="h-7 w-7" style={{ color: '#c9a84c' }} />
            </div>
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: '#c9a84c' }}>Crest</span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: '#c9a84c' }}>
                Join 18.5 Million Members
              </p>
              <h1 className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Your financial<br />future starts here.
              </h1>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Open your NovaCrest account today and access a full suite of premium banking services built for modern life.
              </p>
            </div>
            {/* Perks */}
            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.15)' }}>
                    <Icon className="h-4 w-4" style={{ color: '#c9a84c' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom quote */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
              "NovaCrest transformed how I manage my finances. The platform is intuitive, secure, and the team is exceptional."
            </p>
            <p className="text-xs mt-2 font-medium" style={{ color: '#c9a84c' }}>— James Whitmore, Business Client</p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="w-full md:w-1/2 flex flex-col min-h-screen" style={{ background: '#0a0f1e' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 md:hidden">
            <Shield className="h-5 w-5" style={{ color: '#c9a84c' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Nova<span style={{ color: '#c9a84c' }}>Crest</span>
            </span>
          </div>
          <div className="hidden md:block" />
          <Link to="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back to website</Link>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 flex items-center justify-center px-8 py-10 overflow-y-auto">
          <div className="w-full max-w-sm space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-0.5 w-6 rounded" style={{ background: '#c9a84c' }} />
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#c9a84c' }}>New Account</span>
              </div>
              <h2 className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Open an Account</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Join NovaCrest in under 2 minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', field: 'fullName' },
                { id: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', field: 'email' },
              ].map(({ id, label, type, placeholder, field }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id} className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</Label>
                  <Input id={id} type={type} placeholder={placeholder}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => handleChange(field, e.target.value)} required
                    className="px-4 h-12 text-white placeholder:text-white/25 border-white/10 focus:border-yellow-600/60"
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={(e) => handleChange('password', e.target.value)} required
                    className="px-4 h-12 pr-12 text-white placeholder:text-white/25 border-white/10 focus:border-yellow-600/60"
                    style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)} required
                  className="px-4 h-12 text-white placeholder:text-white/25 border-white/10 focus:border-yellow-600/60"
                  style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
              </div>

              <div className="flex items-start gap-3 pt-1">
                <Checkbox id="terms" checked={agreed} onCheckedChange={(v) => setAgreed(!!v)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600" />
                <label htmlFor="terms" className="text-sm leading-snug cursor-pointer" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  I agree to the{' '}
                  <span style={{ color: '#c9a84c' }}>Terms of Service</span> and{' '}
                  <span style={{ color: '#c9a84c' }}>Privacy Policy</span>
                </label>
              </div>

              <Button type="submit" disabled={loading || !agreed}
                className="w-full h-12 font-semibold text-sm flex items-center justify-center gap-2"
                style={{
                  background: loading || !agreed ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #c9a84c, #e8c96a)',
                  color: '#0a0f1e', borderRadius: '10px', border: 'none',
                  boxShadow: !loading && agreed ? '0 4px 24px rgba(201,168,76,0.3)' : 'none',
                }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating Account…
                  </span>
                ) : (<>Create My Account <ArrowRight className="h-4 w-4" /></>)}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Already a member?</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <Link to="/login"
              className="flex items-center justify-center gap-2 w-full h-12 text-sm font-medium"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', borderRadius: '10px' }}>
              Sign In to NovaCrest <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-center gap-2">
              <Lock className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                256-bit SSL Encryption · Your data is always protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
