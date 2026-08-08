import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Search, UserCog, Ban, CheckCircle, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface UserWithAccounts extends Profile {
  account_count: number;
  total_balance: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'first_name'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order(sortField, { ascending: sortDir === 'asc' });

    if (!profiles) { setLoading(false); return; }

    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const { data: accs } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('user_id', p.id);
        const account_count = accs?.length || 0;
        const total_balance = accs?.reduce((s, a) => s + a.balance, 0) || 0;
        return { ...p, account_count, total_balance };
      })
    );
    setUsers(enriched);
    setLoading(false);
  }, [sortField, sortDir]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) { toast.error('Failed to update role'); }
    else { toast.success(`Role updated to ${newRole}`); await loadUsers(); }
    setActionLoading(null);
  };

  const sendEmail = async (user: UserWithAccounts) => {
    const email = user.email;
    if (!email) { toast.error('No email on file for this user'); return; }
    setActionLoading(user.id + '_email');
    try {
      const res = await supabase.functions.invoke('send-email', {
        body: {
          type: 'login_alert',
          to: email,
          user_id: user.id,
          data: { first_name: user.first_name || user.username },
        },
      });
      if (res.error) throw res.error;
      toast.success(`Test email sent to ${email}`);
    } catch {
      toast.error('Failed to send test email');
    }
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const SortBtn = ({ field, label }: { field: typeof sortField; label: string }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => { setSortField(field); setSortDir((d) => field === sortField ? (d === 'asc' ? 'desc' : 'asc') : 'desc'); }}
    >
      {label}
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total registered users</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, username, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/30">
                <th className="text-left px-6 py-3"><SortBtn field="first_name" label="User" /></th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Country</th>
                <th className="text-left px-6 py-3">Accounts</th>
                <th className="text-left px-6 py-3">Balance (USD)</th>
                <th className="text-left px-6 py-3">Role</th>
                <th className="text-left px-6 py-3"><SortBtn field="created_at" label="Joined" /></th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>)}
                  </tr>
                ))
                : filtered.length === 0
                  ? <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">No users found</td></tr>
                  : filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-foreground">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-muted-foreground">@{u.username || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{u.country || '—'}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{u.account_count}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">${u.total_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-border text-xs h-8 px-2"
                            onClick={() => toggleRole(u.id, u.role)}
                            disabled={actionLoading === u.id}
                          >
                            {u.role === 'admin' ? <><Ban className="w-3 h-3 mr-1" />Demote</> : <><UserCog className="w-3 h-3 mr-1" />Promote</>}
                          </Button>
                          {u.email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="border border-border text-xs h-8 px-2"
                              onClick={() => sendEmail(u)}
                              disabled={actionLoading === u.id + '_email'}
                            >
                              <Mail className="w-3 h-3 mr-1" />Email
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {users.length} users
        </div>
      )}
    </div>
  );
}
