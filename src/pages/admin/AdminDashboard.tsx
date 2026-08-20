import { useEffect, useState } from 'react';
import { getAllProfiles, getAllAccounts, getAllDepositRequests, getAllWithdrawalRequests } from '@/services/api';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Download, Upload, TrendingUp } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalBalance: 0, pendingDeposits: 0, pendingWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProfiles(), getAllAccounts(), getAllDepositRequests(), getAllWithdrawalRequests()])
      .then(([profiles, accounts, deposits, withdrawals]) => {
        setStats({
          totalUsers: profiles.filter(p => p.role === 'user').length,
          totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
          pendingDeposits: deposits.filter(d => d.status === 'pending').length,
          pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
        });
      }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Platform Balance', value: fmt(stats.totalBalance), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Pending Deposits', value: stats.pendingDeposits.toString(), icon: Download, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals.toString(), icon: Upload, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
                {loading ? <div className="h-8 bg-muted rounded animate-pulse" />
                  : <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Platform Status
          </CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All systems operational. Use the sidebar to manage users, transactions, holds, and requests.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">Platform Online</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
