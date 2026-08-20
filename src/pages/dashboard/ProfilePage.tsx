import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/api';
import { supabase } from '@/db/supabase';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Calendar, Hash, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // PIN management
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const hasPinSet = !!(profile as (typeof profile & { transaction_pin?: string }) | null)?.transaction_pin;

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ''); setPhone(profile.phone || ''); }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await updateProfile(user.id, { full_name: fullName, phone });
    setLoading(false);
    if (error) { toast.error('Failed to update profile'); return; }
    await refreshProfile();
    toast.success('Profile updated successfully');
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim() || newPin.length < 4 || newPin.length > 8) {
      toast.error('PIN must be 4–8 digits'); return;
    }
    if (!/^\d+$/.test(newPin)) { toast.error('PIN must contain digits only'); return; }
    if (newPin !== confirmPin) { toast.error('PINs do not match'); return; }

    // If user already has a PIN, verify the current one
    if (hasPinSet) {
      if (!currentPin.trim()) { toast.error('Enter your current PIN first'); return; }
      const { data } = await supabase.from('profiles').select('transaction_pin').eq('id', user!.id).maybeSingle();
      if (!data || data.transaction_pin !== currentPin) {
        toast.error('Current PIN is incorrect'); return;
      }
    }

    setPinLoading(true);
    const { error } = await supabase.from('profiles')
      .update({ transaction_pin: newPin })
      .eq('id', user!.id);
    setPinLoading(false);
    if (error) { toast.error('Failed to set PIN'); return; }
    toast.success(hasPinSet ? 'Transaction PIN updated' : 'Transaction PIN set successfully');
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    await refreshProfile();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Profile & Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your personal information and account details</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="John Doe" className="pl-9 px-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" value={profile?.email || ''} disabled className="pl-9 px-9 opacity-60 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900" className="pl-9 px-9" />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Transaction PIN card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" /> Transaction PIN
                  </CardTitle>
                  {hasPinSet && (
                    <Badge className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/25 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> PIN Set
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {hasPinSet
                    ? 'Your PIN is active. You must enter it to authorise any external transfer.'
                    : 'Set a 4–8 digit PIN to secure your outgoing transfers.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSetPin} className="space-y-4">
                  {hasPinSet && (
                    <div className="space-y-2">
                      <Label>Current PIN</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showCurrentPin ? 'text' : 'password'}
                          placeholder="Enter current PIN"
                          value={currentPin}
                          onChange={e => setCurrentPin(e.target.value)}
                          className="pl-9 pr-10 font-mono tracking-widest"
                          maxLength={8}
                          inputMode="numeric"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPin(v => !v)}>
                          {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{hasPinSet ? 'New PIN' : 'Set PIN'}</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showNewPin ? 'text' : 'password'}
                        placeholder="4–8 digits"
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className="pl-9 pr-10 font-mono tracking-widest"
                        maxLength={8}
                        inputMode="numeric"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPin(v => !v)}>
                        {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {newPin.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[4, 5, 6, 7, 8].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${newPin.length >= n ? 'bg-primary' : 'bg-muted'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm PIN</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPin ? 'text' : 'password'}
                        placeholder="Re-enter PIN"
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        className={`pl-9 pr-10 font-mono tracking-widest ${confirmPin && confirmPin !== newPin ? 'border-destructive' : ''}`}
                        maxLength={8}
                        inputMode="numeric"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPin(v => !v)}>
                        {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPin && confirmPin !== newPin && (
                      <p className="text-xs text-destructive">PINs do not match</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={pinLoading}>
                    <KeyRound className="h-3.5 w-3.5" />
                    {pinLoading ? 'Saving…' : hasPinSet ? 'Update PIN' : 'Set Transaction PIN'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Details card */}
            <Card className="bg-card border-border">
              <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Role</p>
                    <Badge className="mt-1 text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                      {profile?.role || 'user'}
                    </Badge>
                  </div>
                </div>
                <Separator className="bg-border" />
                <div className="space-y-0">
                  {[
                    { icon: Hash,     label: 'User ID',       value: user?.id?.slice(0, 16) + '…', mono: true },
                    { icon: Calendar, label: 'Member Since',  value: profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—', mono: false },
                  ].map(({ icon: Icon, label, value, mono }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className={`text-sm ${mono ? 'font-mono text-xs' : 'font-medium'}`}>{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="text-sm">Account Status</span>
                    </div>
                    <Badge variant={profile?.is_active ? 'outline' : 'destructive'}
                      className={`text-xs ${profile?.is_active ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' : ''}`}>
                      {profile?.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

