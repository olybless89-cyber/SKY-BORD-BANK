import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Search, UserCog, Ban, Mail, ChevronDown, ChevronUp, PlusCircle, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface UserWithAccounts extends Profile {
  account_count: number;
  total_balance: number;
}

interface BankAccount {
  id: string;
  account_number: string;
  account_type: string;
  currency: string;
  balance: number;
}

// ─── Add Funds Modal ─────────────────────────────────────────────────────────

function AddFundsModal({
  user,
  onClose,
  onSuccess,
}: {
  user: UserWithAccounts;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Admin deposit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('bank_accounts')
      .select('id, account_number, account_type, currency, balance')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const list = data || [];
        setAccounts(list);
        if (list.length > 0) setSelectedAccountId(list[0].id);
        setLoadingAccounts(false);
      });
  }, [user.id]);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!selectedAccountId) { toast.error('Select an account'); return; }
    if (Number.isNaN(parsed) || parsed <= 0) { toast.error('Enter a valid positive amount'); return; }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('admin_add_funds', {
        p_account_id: selectedAccountId,
        p_amount: parsed,
        p_note: note || 'Admin deposit',
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; new_balance?: number; currency?: string };
      if (!result.success) throw new Error(result.error || 'Unknown error');
      toast.success(
        `$${parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} added successfully. New balance: ${result.currency} ${result.new_balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to add funds');
    }
    setSubmitting(false);
  };

  const selectedAcc = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-muted-foreground">@{user.username || user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Add Funds to Account
          </h2>

          {/* Account selector */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Destination Account
            </label>
            {loadingAccounts ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : accounts.length === 0 ? (
              <p className="text-sm text-destructive">This user has no bank accounts.</p>
            ) : (
              <select
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_number} — {a.account_type} ({a.currency}) · Balance: {a.currency} {a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Amount {selectedAcc ? `(${selectedAcc.currency})` : ''}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-muted border-border"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Note / Description
            </label>
            <Input
              placeholder="Admin deposit"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          {/* Quick amounts */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick amounts</p>
            <div className="flex gap-2 flex-wrap">
              {[100, 500, 1000, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${amount === String(v) ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                >
                  ${v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end bg-muted/20">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="border border-border">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || loadingAccounts || accounts.length === 0}
            className="bg-primary text-white hover:bg-primary/90 gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'Processing…' : 'Add Funds'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'first_name'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addFundsUser, setAddFundsUser] = useState<UserWithAccounts | null>(null);

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
    <>
      {addFundsUser && (
        <AddFundsModal
          user={addFundsUser}
          onClose={() => setAddFundsUser(null)}
          onSuccess={loadUsers}
        />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Users</h1>
            <p className="text-muted-foreground text-sm mt-1">{users.length} total registered users</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, username, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted border-border" />
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
                              className="border border-border text-xs h-8 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => setAddFundsUser(u)}
                              title="Add funds to this user's account"
                            >
                              <PlusCircle className="w-3 h-3 mr-1" />Add Funds
                            </Button>
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
    </>
  );
}
