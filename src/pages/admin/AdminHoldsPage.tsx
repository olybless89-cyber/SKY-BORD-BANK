import { useEffect, useState } from 'react';
import { getAllHolds } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Hold } from '@/types/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AdminHoldsPage() {
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllHolds().then(setHolds).finally(() => setLoading(false)); }, []);

  const active = holds.filter(h => !h.is_released);
  const released = holds.filter(h => h.is_released);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Fund Holds</h1>
          <p className="text-muted-foreground text-sm mt-1">{active.length} active holds</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Active Holds</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Account</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      {Array(6).fill(0).map((__, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-muted rounded w-20" /></td>)}
                    </tr>
                  )) : active.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No active holds</td></tr>
                  ) : active.map(h => (
                    <tr key={h.id} className="border-b border-border">
                      <td className="px-4 py-3 text-sm">{(h.profile as { email?: string })?.email || h.user_id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{(h.account as { account_number?: string })?.account_number || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-yellow-400">{fmt(h.amount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{h.reason}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(h.placed_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild className="text-xs text-primary">
                          <Link to={`/admin/users/${h.user_id}`}>Manage →</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Released Holds</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Released</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {released.length === 0
                    ? <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">No released holds</td></tr>
                    : released.slice(0, 20).map(h => (
                      <tr key={h.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 text-sm">{(h.profile as { email?: string })?.email || h.user_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-right text-sm">{fmt(h.amount)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{h.reason}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{h.released_at ? new Date(h.released_at).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">Released</Badge></td>
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
