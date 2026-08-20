import { useEffect, useState } from 'react';
import { getAllDepositRequests, createNotification } from '@/services/api';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { DepositRequest } from '@/types/types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AdminDepositsPage() {
  const { user: adminUser } = useAuth();
  const [requests, setRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => getAllDepositRequests().then(setRequests).finally(() => setLoading(false));
  useEffect(() => { reload(); }, []);

  const handle = async (req: DepositRequest, approve: boolean) => {
    try {
      if (approve) {
        const { error } = await supabase.functions.invoke('banking-ops', {
          body: { action: 'approve_deposit', deposit_request_id: req.id, account_id: req.account_id, amount: req.amount, admin_id: adminUser!.id, user_id: req.user_id }
        });
        if (error) { const msg = await error?.context?.text(); throw new Error(msg || error.message); }
        await createNotification(req.user_id, 'Deposit Approved', `Your deposit of ${fmt(req.amount)} has been approved and credited.`);
        toast.success('Deposit approved');
      } else {
        await supabase.from('deposit_requests').update({ status: 'rejected', reviewed_by: adminUser!.id, updated_at: new Date().toISOString() }).eq('id', req.id);
        await createNotification(req.user_id, 'Deposit Request Rejected', `Your deposit request of ${fmt(req.amount)} was not approved.`);
        toast.success('Deposit rejected');
      }
      reload();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Action failed'); }
  };

  const pending = requests.filter(r => r.status === 'pending');
  const processed = requests.filter(r => r.status !== 'pending');

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Deposit Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">{pending.length} pending approval</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Pending Requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Account</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      {Array(5).fill(0).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-muted rounded w-20" /></td>)}
                    </tr>
                  )) : pending.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No pending deposit requests</td></tr>
                  ) : pending.map(r => (
                    <tr key={r.id} className="border-b border-border">
                      <td className="px-4 py-3 text-sm">{(r.profile as { email?: string })?.email || r.user_id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{(r.account as { account_number?: string })?.account_number || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400">{fmt(r.amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handle(r, true)} className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handle(r, false)} className="h-7 text-xs border-destructive text-destructive hover:bg-destructive/10">Reject</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Processed Requests</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processed.length === 0
                    ? <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">No processed requests</td></tr>
                    : processed.slice(0, 20).map(r => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm">{(r.profile as { email?: string })?.email || r.user_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{fmt(r.amount)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={r.status === 'approved' ? 'outline' : 'destructive'} className="text-xs">{r.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
