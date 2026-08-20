import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProfiles, adminCreateUser } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Profile } from '@/types/types';
import { Search, User, ExternalLink, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface CreateForm {
  email: string; password: string; full_name: string; phone: string; role: 'user' | 'admin';
}
const EMPTY_FORM: CreateForm = { email: '', password: '', full_name: '', phone: '', role: 'user' };

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllProfiles().then(setProfiles).finally(() => setLoading(false));
  }, []);

  const filtered = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  function field(k: keyof CreateForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    const result = await adminCreateUser(form);
    setSaving(false);
    if (!result.success) { toast.error(result.error || 'Failed to create user'); return; }
    toast.success(`User ${form.email} created successfully`);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    // Refresh list
    setLoading(true);
    getAllProfiles().then(setProfiles).finally(() => setLoading(false));
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Users</h1>
            <p className="text-muted-foreground text-sm mt-1">{profiles.filter(p => p.role === 'user').length} registered users</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
            <UserPlus className="h-4 w-4" /> Create User
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 px-9" />
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">All Users ({filtered.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      {Array(5).fill(0).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 bg-muted rounded w-24" /></td>
                      ))}
                    </tr>
                  )) : filtered.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.role === 'admin' ? 'default' : 'outline'} className="text-xs capitalize">{p.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.is_active ? 'outline' : 'destructive'} className="text-xs">
                          {p.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                          <Link to={`/admin/users/${p.id}`}><ExternalLink className="h-3 w-3" /> Manage</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Create User Dialog ── */}
      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) setForm(EMPTY_FORM); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Create New User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <Label>Email Address *</Label>
                  <Input type="email" placeholder="user@example.com" required
                    value={form.email} onChange={e => field('email', e.target.value)} className="px-3" />
                </div>
                <div className="space-y-1.5 col-span-2 relative">
                  <Label>Password * (min. 8 chars)</Label>
                  <div className="relative">
                    <Input type={showPw ? 'text' : 'password'} placeholder="Set a secure password" required
                      value={form.password} onChange={e => field('password', e.target.value)} className="px-3 pr-10" />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" value={form.full_name}
                    onChange={e => field('full_name', e.target.value)} className="px-3" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+1 555 000 0000" value={form.phone}
                    onChange={e => field('phone', e.target.value)} className="px-3" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => field('role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User — standard banking access</SelectItem>
                      <SelectItem value="admin">Admin — full platform access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                A checking account will be created automatically. You can fund it from the user detail page.
              </p>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg> Creating…</>
                ) : (<><UserPlus className="h-4 w-4" /> Create User</>)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
