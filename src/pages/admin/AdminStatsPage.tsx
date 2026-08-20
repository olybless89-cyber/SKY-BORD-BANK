import { useEffect, useState } from 'react';
import { getAllProfiles, getAllAccounts, getAllTransactions, getAllDepositRequests, getAllWithdrawalRequests } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, ArrowLeftRight, Download, Upload, TrendingUp } from 'lucide-react';
import type { Transaction } from '@/types/types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, activeUsers: 0, totalBalance: 0,
    totalTransactions: 0, totalDeposited: 0, totalWithdrawn: 0,
    pendingDeposits: 0, pendingWithdrawals: 0,
    recentTxns: [] as Transaction[],
  });

  useEffect(() => {
    Promise.all([
      getAllProfiles(), getAllAccounts(), getAllTransactions(1, 100),
      getAllDepositRequests(), getAllWithdrawalRequests()
    ]).then(([profiles, accounts, txns, deposits, withdrawals]) => {
      const users = profiles.filter(p => p.role === 'user');
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
        totalTransactions: txns.length,
        totalDeposited: deposits.filter(d => d.status === 'approved').reduce((s, d) => s + d.amount, 0),
        totalWithdrawn: withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0),
        pendingDeposits: deposits.filter(d => d.status === 'pending').length,
        pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
        recentTxns: txns.slice(0, 10),
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), sub: `${stats.activeUsers} active`, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Platform Balance', value: fmt(stats.totalBalance), sub: 'All accounts combined', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Total Transactions', value: stats.totalTransactions.toString(), sub: 'Last 100 loaded', icon: ArrowLeftRight, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Deposited', value: fmt(stats.totalDeposited), sub: 'Approved deposits', icon: Download, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Total Withdrawn', value: fmt(stats.totalWithdrawn), sub: 'Approved withdrawals', icon: Upload, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Pending Actions', value: `${stats.pendingDeposits + stats.pendingWithdrawals}`, sub: `${stats.pendingDeposits} dep · ${stats.pendingWithdrawals} wdr`, icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Platform Statistics</h1>
          <p className="text-muted-foreground text-sm mt-1">Live overview of all banking activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                {loading
                  ? <div className="h-8 bg-muted rounded animate-pulse" />
                  : <>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  </>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTxns.length === 0 && !loading
                    ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet</td></tr>
                    : stats.recentTxns.map(tx => (
                      <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.reference_number}</td>
                        <td className="px-4 py-3 text-sm capitalize">{tx.transaction_type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{fmt(tx.amount)}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : tx.status === 'failed' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-400/10 text-yellow-400'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
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
