import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/services/api';
import { toast } from 'sonner';
import { User, Shield, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
  });

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, form);
      await refreshProfile();
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and settings</p>
      </div>

      {/* Avatar */}
      <div className="glass-card rounded-2xl p-8 border border-border flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-primary">
            {(profile?.first_name?.[0] || profile?.username?.[0] || 'U').toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-bold text-xl text-foreground">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : profile?.username}
          </div>
          <div className="text-muted-foreground text-sm">@{profile?.username}</div>
          <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
            <Shield className="w-3 h-3" /> {profile?.role}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card rounded-2xl p-8 border border-border space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </div>
          {!editing && <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-primary border border-primary/30 hover:bg-primary/10">Edit</Button>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'First Name', key: 'first_name' as const },
            { label: 'Last Name', key: 'last_name' as const },
            { label: 'Phone', key: 'phone' as const },
            { label: 'Country', key: 'country' as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
              {editing ? (
                <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="bg-secondary border-border" />
              ) : (
                <div className="text-foreground text-sm py-2 px-3 rounded-lg bg-secondary">{profile?.[key] || '—'}</div>
              )}
            </div>
          ))}
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          {[
            { label: 'Email', value: profile?.email },
            { label: 'Username', value: profile?.username },
            { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
            { label: 'KYC Status', value: 'Pending Review' },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</label>
              <div className="text-foreground text-sm py-2 px-3 rounded-lg bg-secondary/50 text-muted-foreground">{value || '—'}</div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)} className="border border-border text-muted-foreground">Cancel</Button>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl p-8 border border-border">
        <div className="flex items-center gap-2 font-semibold text-foreground mb-6">
          <CreditCard className="w-4 h-4 text-primary" /> Security
        </div>
        <div className="space-y-4">
          {[
            { label: 'Password', value: '••••••••', action: 'Change' },
            { label: 'Login PIN', value: '••••', action: 'Change' },
            { label: 'Two-Factor Auth', value: 'Not enabled', action: 'Enable' },
          ].map(({ label, value, action }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{value}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {}} className="text-primary hover:bg-primary/10 text-xs">{action}</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
