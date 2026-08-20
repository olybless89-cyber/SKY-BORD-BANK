import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import {
  getProfile, getUserAccounts, getUserTransactions, createNotification,
  adminUpdateCredentials, adminSetActive, adminSetRole, adminDeleteUser,
  adminUpdateProfile, adminUpdateAccount, updateTransaction, deleteTransaction,
  getUserSecurityCodes, adminIssueSecurityCode, adminDeleteSecurityCode,
} from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Profile, Account, Transaction, SecurityCode, SecurityCodeType } from '@/types/types';
import { ArrowLeft, DollarSign, Lock, User, Pencil, Trash2, Eye, EyeOff, ShieldCheck, ShieldOff, UserCog, Key, Plus, RefreshCw } from 'lucide-react';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const GOLD = '#c9a84c';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user: adminUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [fundAccountId, setFundAccountId] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [holdAccountId, setHoldAccountId] = useState('');
  const [holdAmount, setHoldAmount] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [holdLoading, setHoldLoading] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [epForm, setEpForm] = useState({ full_name: '', phone: '' });
  const [epSaving, setEpSaving] = useState(false);

  const [editCredOpen, setEditCredOpen] = useState(false);
  const [credForm, setCredForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [credSaving, setCredSaving] = useState(false);

  const [editAccOpen, setEditAccOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [accForm, setAccForm] = useState({ balance: '', available_balance: '', account_type: '', is_active: 'true' });
  const [accSaving, setAccSaving] = useState(false);

  const [editTxOpen, setEditTxOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [txForm, setTxForm] = useState({ transaction_type: '', status: '', amount: '', description: '', reference_number: '' });
  const [txSaving, setTxSaving] = useState(false);

  // Security Codes
  const [securityCodes, setSecurityCodes] = useState<SecurityCode[]>([]);
  const [issueCodeOpen, setIssueCodeOpen] = useState(false);
  const [codeForm, setCodeForm] = useState<{ code_type: SecurityCodeType; code: string; expires_at: string }>({
    code_type: 'PIN', code: '', expires_at: ''
  });
  const [codeSaving, setCodeSaving] = useState(false);

  const reload = () => {
    if (!id) return;
    Promise.all([
      getProfile(id), getUserAccounts(id), getUserTransactions(id, 1, 50), getUserSecurityCodes(id)
    ]).then(([p, accts, txns, codes]) => {
      setProfile(p); setAccounts(accts); setTransactions(txns); setSecurityCodes(codes);
    });
  };
  useEffect(() => { reload(); }, [id]);

  const fundAccount = async () => {
    const amount = parseFloat(fundAmount);
    if (!fundAccountId || isNaN(amount) || amount <= 0) { toast.error('Fill all fields'); return; }
    setFundLoading(true);
    try {
      const { error } = await supabase.functions.invoke('banking-ops', {
        body: { action: 'admin_fund', account_id: fundAccountId, amount, admin_id: adminUser!.id, user_id: id }
      });
      if (error) { const msg = await error?.context?.text(); throw new Error(msg || error.message); }
      await createNotification(id!, 'Account Funded', `Your account has been credited ${fmt(amount)} by the bank.`);
      toast.success('Account funded'); setFundAmount(''); setFundAccountId(''); reload();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setFundLoading(false); }
  };

  const placeHold = async () => {
    const amount = parseFloat(holdAmount);
    if (!holdAccountId || isNaN(amount) || amount <= 0 || !holdReason.trim()) { toast.error('All fields required'); return; }
    setHoldLoading(true);
    try {
      const { error } = await supabase.functions.invoke('banking-ops', {
        body: { action: 'place_hold', account_id: holdAccountId, amount, reason: holdReason, admin_id: adminUser!.id, user_id: id }
      });
      if (error) { const msg = await error?.context?.text(); throw new Error(msg || error.message); }
      await createNotification(id!, 'Fund Hold Placed', `A hold of ${fmt(amount)} has been placed. Reason: ${holdReason}`);
      toast.success('Hold placed'); setHoldAmount(''); setHoldAccountId(''); setHoldReason(''); reload();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setHoldLoading(false); }
  };

  const releaseHold = async (holdId: string, userId: string, amount: number) => {
    const { error } = await supabase.functions.invoke('banking-ops', {
      body: { action: 'release_hold', hold_id: holdId, admin_id: adminUser!.id, user_id: userId }
    });
    if (error) { toast.error('Failed to release hold'); return; }
    await createNotification(userId, 'Hold Released', `A hold of ${fmt(amount)} has been released.`);
    toast.success('Hold released'); reload();
  };

  const openEditProfile = () => {
    setEpForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
    setEditProfileOpen(true);
  };
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setEpSaving(true);
    const r = await adminUpdateProfile(id!, epForm);
    setEpSaving(false);
    if (!r.success) { toast.error(r.error || 'Failed'); return; }
    toast.success('Profile updated'); setEditProfileOpen(false); reload();
  };

  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credForm.email && !credForm.password) { toast.error('Enter email or password to update'); return; }
    setCredSaving(true);
    const r = await adminUpdateCredentials(id!, {
      email: credForm.email || undefined,
      password: credForm.password || undefined,
    });
    setCredSaving(false);
    if (!r.success) { toast.error(r.error || 'Failed'); return; }
    toast.success('Credentials updated'); setEditCredOpen(false); setCredForm({ email: '', password: '' }); reload();
  };

  const toggleActive = async () => {
    const r = await adminSetActive(id!, !profile?.is_active);
    if (!r.success) { toast.error(r.error || 'Failed'); return; }
    await createNotification(id!, profile?.is_active ? 'Account Suspended' : 'Account Reactivated',
      profile?.is_active ? 'Your account has been temporarily suspended. Please contact support.'
        : 'Your account has been reactivated. Welcome back!');
    toast.success(`Account ${profile?.is_active ? 'suspended' : 'activated'}`); reload();
  };

  const toggleRole = async () => {
    const newRole = profile?.role === 'admin' ? 'user' : 'admin';
    const r = await adminSetRole(id!, newRole);
    if (!r.success) { toast.error(r.error || 'Failed'); return; }
    toast.success(`Role changed to ${newRole}`); reload();
  };

  const handleDeleteUser = async () => {
    const r = await adminDeleteUser(id!);
    if (!r.success) { toast.error(r.error || 'Failed to delete user'); return; }
    toast.success('User deleted permanently');
    navigate('/admin/users');
  };

  const openEditAccount = (a: Account) => {
    setEditAcc(a);
    setAccForm({ balance: String(a.balance), available_balance: String(a.available_balance), account_type: a.account_type, is_active: String(a.is_active) });
    setEditAccOpen(true);
  };
  const saveAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setAccSaving(true);
    const r = await adminUpdateAccount(editAcc!.id, {
      balance: parseFloat(accForm.balance),
      available_balance: parseFloat(accForm.available_balance),
      account_type: accForm.account_type,
      is_active: accForm.is_active === 'true',
    });
    setAccSaving(false);
    if (!r.success) { toast.error(r.error || 'Failed'); return; }
    toast.success('Account updated'); setEditAccOpen(false); reload();
  };

  const openEditTx = (tx: Transaction) => {
    setEditTx(tx);
    setTxForm({ transaction_type: tx.transaction_type, status: tx.status, amount: String(tx.amount), description: tx.description || '', reference_number: tx.reference_number || '' });
    setEditTxOpen(true);
  };
  const saveTx = async (e: React.FormEvent) => {
    e.preventDefault(); setTxSaving(true);
    const r = await updateTransaction(editTx!.id, {
      transaction_type: txForm.transaction_type as Transaction['transaction_type'],
      status: txForm.status as Transaction['status'],
      amount: parseFloat(txForm.amount),
      description: txForm.description,
      reference_number: txForm.reference_number,
    });
    setTxSaving(false);
    if (r.error) { toast.error(r.error); return; }
    toast.success('Transaction updated'); setEditTxOpen(false); reload();
  };
  const handleDeleteTx = async (txId: string) => {
    const r = await deleteTransaction(txId);
    if (r.error) { toast.error(r.error); return; }
    toast.success('Transaction deleted'); reload();
  };

  // Security Codes handlers
  function genCode(type: SecurityCodeType): string {
    if (type === 'PIN') return Math.floor(100000 + Math.random() * 900000).toString();
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  const issueCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeForm.code.trim()) { toast.error('Enter a code value'); return; }
    setCodeSaving(true);
    const r = await adminIssueSecurityCode(
      id!, codeForm.code_type, codeForm.code.trim(), adminUser!.id,
      codeForm.expires_at ? new Date(codeForm.expires_at).toISOString() : undefined
    );
    setCodeSaving(false);
    if (!r.success) { toast.error(r.error || 'Failed to issue code'); return; }
    await createNotification(id!,
      `${codeForm.code_type} Code Issued`,
      `Your ${codeForm.code_type} security code has been issued by the bank. Please contact your relationship manager to retrieve it.`
    );
    toast.success(`${codeForm.code_type} code issued`);
    setIssueCodeOpen(false);
    setCodeForm({ code_type: 'PIN', code: '', expires_at: '' });
    reload();
  };

  const deleteCode = async (codeId: string) => {
    const r = await adminDeleteSecurityCode(codeId);
    if (r.error) { toast.error(r.error); return; }
    toast.success('Code deleted'); reload();
  };

  const accountOptions = accounts.map(a => (
    <SelectItem key={a.id} value={a.id}>{a.account_type} — {a.account_number} ({fmt(a.available_balance)})</SelectItem>
  ));

  if (!profile) return (
    <AdminLayout>
      <div className="p-6"><div className="animate-pulse space-y-4">
        {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div></div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <button onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 rounded-full flex items-center justify-center shrink-0 text-xl font-bold"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#06101f' }}>
              {(profile.full_name || profile.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{profile.full_name || '—'}</h1>
              <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={profile.role === 'admin' ? 'default' : 'outline'} className="text-xs capitalize">{profile.role}</Badge>
                <Badge variant={profile.is_active ? 'outline' : 'destructive'} className="text-xs">{profile.is_active ? 'Active' : 'Suspended'}</Badge>
                <span className="text-xs text-muted-foreground">Since {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={openEditProfile}>
              <Pencil className="h-3.5 w-3.5" /> Edit Profile
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setEditCredOpen(true)}>
              <Key className="h-3.5 w-3.5" /> Credentials
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={toggleRole}>
              <UserCog className="h-3.5 w-3.5" /> {profile.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={toggleActive}
              style={{ color: profile.is_active ? '#ef4444' : '#22c55e', borderColor: profile.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)' }}>
              {profile.is_active ? <><ShieldOff className="h-3.5 w-3.5" /> Suspend</> : <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this user permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <strong>{profile.email}</strong>, all their accounts, transactions, holds, and auth credentials. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Yes, Delete Permanently</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Tabs defaultValue="accounts">
          <TabsList className="mb-4">
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="banking">Banking Actions</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Security Codes
              {securityCodes.filter(c => !c.is_used).length > 0 && (
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30 ml-1">
                  {securityCodes.filter(c => !c.is_used).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Accounts */}
          <TabsContent value="accounts" className="space-y-4">
            {accounts.length === 0
              ? <p className="text-sm text-muted-foreground">No accounts</p>
              : accounts.map(a => (
                <Card key={a.id} className="bg-card border-border">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-xs text-muted-foreground">Type</p><p className="text-sm font-medium capitalize">{a.account_type}</p></div>
                        <div><p className="text-xs text-muted-foreground">Balance</p><p className="text-sm font-bold" style={{ color: GOLD }}>{fmt(a.balance)}</p></div>
                        <div><p className="text-xs text-muted-foreground">Available</p><p className="text-sm font-medium">{fmt(a.available_balance)}</p></div>
                        <div>
                          <p className="text-xs text-muted-foreground">Account #</p>
                          <p className="text-xs font-mono text-muted-foreground">{a.account_number}</p>
                          <Badge variant={a.is_active ? 'outline' : 'destructive'} className="text-xs mt-1">{a.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => openEditAccount(a)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-base">Transactions ({transactions.length})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Reference</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0
                        ? <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions</td></tr>
                        : transactions.map(tx => (
                          <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 text-sm capitalize">{tx.transaction_type.replace(/_/g, ' ')}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium">{fmt(tx.amount)}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{tx.status}</Badge></td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{tx.reference_number || '—'}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditTx(tx)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                                      <AlertDialogDescription>Permanently delete this {tx.transaction_type} of {fmt(tx.amount)}. Cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTx(tx.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Actions */}
          <TabsContent value="banking" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-400" /> Fund Account</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2"><Label>Account</Label>
                    <Select value={fundAccountId} onValueChange={setFundAccountId}>
                      <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                      <SelectContent>{accountOptions}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Amount (USD)</Label>
                    <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="px-3" />
                  </div>
                  <Button onClick={fundAccount} disabled={fundLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {fundLoading ? 'Processing…' : 'Fund Account'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-yellow-400" /> Place Hold</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2"><Label>Account</Label>
                    <Select value={holdAccountId} onValueChange={setHoldAccountId}>
                      <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                      <SelectContent>{accountOptions}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Hold Amount (USD)</Label>
                    <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={holdAmount} onChange={e => setHoldAmount(e.target.value)} className="px-3" />
                  </div>
                  <div className="space-y-2"><Label>Reason</Label>
                    <Textarea placeholder="Explain why this hold is being placed…" value={holdReason} onChange={e => setHoldReason(e.target.value)} className="min-h-[80px] px-3" />
                  </div>
                  <Button onClick={placeHold} disabled={holdLoading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    {holdLoading ? 'Placing…' : 'Place Hold'}
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-base">Active Holds</CardTitle></CardHeader>
              <CardContent><ActiveHolds userId={id!} onRelease={releaseHold} /></CardContent>
            </Card>
          </TabsContent>

          {/* Security Codes */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Security Codes
                  </CardTitle>
                  <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => setIssueCodeOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Issue Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {securityCodes.length === 0 ? (
                  <div className="text-center py-10">
                    <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-muted-foreground">No security codes issued yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Issue PIN, IMF, COT or TAC codes to this user</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expires</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issued</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityCodes.map(sc => {
                          const expired = sc.expires_at && new Date(sc.expires_at) < new Date();
                          return (
                            <tr key={sc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3">
                                <Badge className={`text-xs font-bold ${
                                  sc.code_type === 'PIN' ? 'bg-primary/15 text-primary border-primary/30' :
                                  sc.code_type === 'IMF' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                                  sc.code_type === 'COT' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                                  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                }`}>{sc.code_type}</Badge>
                              </td>
                              <td className="px-4 py-3 font-mono text-sm font-semibold tracking-wider">{sc.code}</td>
                              <td className="px-4 py-3">
                                {sc.is_used ? (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">Used</Badge>
                                ) : expired ? (
                                  <Badge variant="destructive" className="text-xs">Expired</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30 bg-emerald-400/10">Active</Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {sc.expires_at ? new Date(sc.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">
                                {new Date(sc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete {sc.code_type} code?</AlertDialogTitle>
                                      <AlertDialogDescription>This will permanently remove this security code. The user will no longer be able to use it.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteCode(sc.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Code type info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { type: 'PIN', color: 'text-primary', bg: 'bg-primary/10', desc: 'Personal transaction authorization PIN' },
                { type: 'IMF', color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'International Monetary Fund clearance' },
                { type: 'COT', color: 'text-orange-400', bg: 'bg-orange-500/10', desc: 'Cost of Transfer fee clearance code' },
                { type: 'TAC', color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: 'Transaction Authorization Code' },
              ] as const).map(({ type, color, bg, desc }) => (
                <Card key={type} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className={`inline-flex h-8 w-8 rounded-lg ${bg} items-center justify-center mb-2`}>
                      <Key className={`h-4 w-4 ${color}`} />
                    </div>
                    <p className={`text-sm font-bold ${color}`}>{type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Edit Profile</DialogTitle></DialogHeader>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5"><Label>Full Name</Label>
              <Input value={epForm.full_name} onChange={e => setEpForm(f => ({ ...f, full_name: e.target.value }))} className="px-3" placeholder="John Doe" />
            </div>
            <div className="space-y-1.5"><Label>Phone</Label>
              <Input value={epForm.phone} onChange={e => setEpForm(f => ({ ...f, phone: e.target.value }))} className="px-3" placeholder="+1 555 000 0000" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={epSaving}>{epSaving ? 'Saving…' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Credentials */}
      <Dialog open={editCredOpen} onOpenChange={v => { setEditCredOpen(v); if (!v) setCredForm({ email: '', password: '' }); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="h-4 w-4" /> Edit Credentials</DialogTitle></DialogHeader>
          <form onSubmit={saveCredentials} className="space-y-4">
            <p className="text-xs text-muted-foreground">Leave a field blank to keep it unchanged.</p>
            <div className="space-y-1.5"><Label>New Email</Label>
              <Input type="email" value={credForm.email} onChange={e => setCredForm(f => ({ ...f, email: e.target.value }))} className="px-3" placeholder={profile.email} />
            </div>
            <div className="space-y-1.5"><Label>New Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={credForm.password} onChange={e => setCredForm(f => ({ ...f, password: e.target.value }))} className="px-3 pr-10" placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditCredOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={credSaving}>{credSaving ? 'Saving…' : 'Update Credentials'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Account */}
      <Dialog open={editAccOpen} onOpenChange={setEditAccOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle>Edit Account — {editAcc?.account_number}</DialogTitle></DialogHeader>
          <form onSubmit={saveAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Balance (USD)</Label>
                <Input type="number" step="0.01" value={accForm.balance} onChange={e => setAccForm(f => ({ ...f, balance: e.target.value }))} className="px-3" />
              </div>
              <div className="space-y-1.5"><Label>Available Balance</Label>
                <Input type="number" step="0.01" value={accForm.available_balance} onChange={e => setAccForm(f => ({ ...f, available_balance: e.target.value }))} className="px-3" />
              </div>
              <div className="space-y-1.5"><Label>Account Type</Label>
                <Select value={accForm.account_type} onValueChange={v => setAccForm(f => ({ ...f, account_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={accForm.is_active} onValueChange={v => setAccForm(f => ({ ...f, is_active: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditAccOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={accSaving}>{accSaving ? 'Saving…' : 'Save Account'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction */}
      <Dialog open={editTxOpen} onOpenChange={setEditTxOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
          <form onSubmit={saveTx} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Type</Label>
                <Select value={txForm.transaction_type} onValueChange={v => setTxForm(f => ({ ...f, transaction_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['deposit','withdrawal','transfer_in','transfer_out','hold','release','admin_credit'].map(t =>
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={txForm.status} onValueChange={v => setTxForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pending','completed','failed','held'].map(s =>
                      <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Amount (USD)</Label>
                <Input type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} className="px-3" />
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Reference Number</Label>
                <Input value={txForm.reference_number} onChange={e => setTxForm(f => ({ ...f, reference_number: e.target.value }))} className="px-3" />
              </div>
              <div className="space-y-1.5 col-span-2"><Label>Description</Label>
                <Textarea value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} className="px-3 min-h-[60px]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTxOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={txSaving}>{txSaving ? 'Saving…' : 'Save Transaction'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Security Code Dialog */}
      <Dialog open={issueCodeOpen} onOpenChange={v => { setIssueCodeOpen(v); if (!v) setCodeForm({ code_type: 'PIN', code: '', expires_at: '' }); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Issue Security Code
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={issueCode} className="space-y-4">
            <div className="space-y-2">
              <Label>Code Type</Label>
              <Select value={codeForm.code_type} onValueChange={v => setCodeForm(f => ({ ...f, code_type: v as SecurityCodeType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIN">PIN — Transaction PIN</SelectItem>
                  <SelectItem value="IMF">IMF — International Monetary Fund Code</SelectItem>
                  <SelectItem value="COT">COT — Cost of Transfer Code</SelectItem>
                  <SelectItem value="TAC">TAC — Transaction Authorization Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Code Value</Label>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1 text-primary"
                  onClick={() => setCodeForm(f => ({ ...f, code: genCode(f.code_type) }))}>
                  <RefreshCw className="h-3 w-3" /> Auto-generate
                </Button>
              </div>
              <Input
                placeholder={codeForm.code_type === 'PIN' ? '6-digit PIN' : '8-character code'}
                value={codeForm.code}
                onChange={e => setCodeForm(f => ({ ...f, code: e.target.value }))}
                className="px-3 font-mono tracking-widest text-center text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Expires At <span className="text-muted-foreground text-xs">(optional — leave blank for no expiry)</span></Label>
              <Input type="datetime-local" value={codeForm.expires_at}
                onChange={e => setCodeForm(f => ({ ...f, expires_at: e.target.value }))} className="px-3" />
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
              The user will receive a notification that a code has been issued. The actual code value is only visible here in the admin panel.
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIssueCodeOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={codeSaving} className="gap-2">
                <Key className="h-3.5 w-3.5" />{codeSaving ? 'Issuing…' : `Issue ${codeForm.code_type} Code`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function ActiveHolds({ userId, onRelease }: { userId: string; onRelease: (id: string, uid: string, amount: number) => void }) {
  const [holds, setHolds] = useState<Array<{ id: string; amount: number; reason: string; placed_at: string }>>([]);
  useEffect(() => {
    supabase.from('holds').select('*').eq('user_id', userId).eq('is_released', false)
      .order('placed_at', { ascending: false })
      .then(({ data }) => setHolds(Array.isArray(data) ? data : []));
  }, [userId]);

  if (holds.length === 0) return <p className="text-sm text-muted-foreground">No active holds</p>;
  return (
    <div className="space-y-3">
      {holds.map(h => (
        <div key={h.id} className="flex items-start justify-between gap-3 p-3 border border-yellow-400/20 rounded-lg bg-yellow-400/5">
          <div>
            <p className="text-sm font-medium text-yellow-400">{fmt(h.amount)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{h.reason}</p>
            <p className="text-xs text-muted-foreground">{new Date(h.placed_at).toLocaleDateString()}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 text-xs border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10">Release</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Release Hold?</AlertDialogTitle>
                <AlertDialogDescription>This will release {fmt(h.amount)} and notify the user.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRelease(h.id, userId, h.amount)} className="bg-emerald-600 hover:bg-emerald-700">Confirm Release</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
