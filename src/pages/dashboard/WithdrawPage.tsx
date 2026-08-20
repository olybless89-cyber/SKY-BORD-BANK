import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts, submitWithdrawalRequest, getUserWithdrawalRequests } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Account, WithdrawalRequest } from '@/types/types';
import { ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock; label: string; cls: string }> = {
  pending:  { variant: 'secondary',   icon: Clock,        label: 'Pending',  cls: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  approved: { variant: 'outline',     icon: CheckCircle2, label: 'Approved', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' },
  rejected: { variant: 'destructive', icon: XCircle,      label: 'Rejected', cls: '' },
};

export default function WithdrawPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const reload = () => {
    if (!user) return;
    Promise.all([getUserAccounts(user.id), getUserWithdrawalRequests(user.id)])
      .then(([accts, reqs]) => { setAccounts(accts); setRequests(reqs); });
  };
  useEffect(() => { reload(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!accountId || isNaN(amt) || amt <= 0) { toast.error('Please fill all fields'); return; }
    const acct = accounts.find(a => a.id === accountId);
    if (acct && acct.available_balance < amt) { toast.error('Insufficient available balance'); return; }
    setLoading(true);
    const { error } = await submitWithdrawalRequest(user!.id, accountId, amt);
    setLoading(false);
    if (error) { toast.error('Failed: ' + error.message); return; }
    toast.success('Withdrawal request submitted — admin will review shortly.');
    setAmount(''); setAccountId(''); reload();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Withdraw Funds</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit a withdrawal request for admin approval</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle>New Withdrawal Request</CardTitle>
                </div>
              </div>
              <CardDescription>Requests are reviewed by admin before funds are released</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Source Account</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)} — {a.account_number} ({fmt(a.available_balance)} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input type="number" min="1" step="0.01" placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)} className="px-3" />
                </div>
                <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Withdrawal Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>My Withdrawal Requests</CardTitle>
              <CardDescription>{requests.length} total request{requests.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {requests.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <ArrowUpRight className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm text-muted-foreground">No withdrawal requests yet</p>
                </div>
              ) : (
                <div>
                  {requests.map(r => {
                    const s = statusConfig[r.status] || statusConfig.pending;
                    const SIcon = s.icon;
                    return (
                      <div key={r.id} className="flex items-center justify-between px-6 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <SIcon className={`h-4 w-4 ${r.status === 'approved' ? 'text-emerald-400' : r.status === 'rejected' ? 'text-destructive' : 'text-yellow-400'}`} />
                          <div>
                            <p className="text-sm font-semibold">{fmt(r.amount)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <Badge variant={s.variant} className={`text-xs ${s.cls}`}>{s.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
