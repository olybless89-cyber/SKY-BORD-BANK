import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAccounts, getUserTransactions, getUserNotifications } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { Account, Transaction, Notification } from '@/types/types';
import { Building2, Landmark, Briefcase, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingUp, Wallet, Bell } from 'lucide-react';

const accountIcons: Record<string, typeof Building2> = { checking: Landmark, savings: TrendingUp, business: Briefcase };
const accountColors: Record<string, string> = { checking: 'text-primary', savings: 'text-emerald-400', business: 'text-yellow-400' };
const accountBg: Record<string, string> = { checking: 'bg-primary/10', savings: 'bg-emerald-400/10', business: 'bg-yellow-400/10' };

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
function txIcon(type: string) {
  if (type.includes('in') || type === 'deposit' || type === 'admin_credit') return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
  if (type.includes('out') || type === 'withdrawal') return <ArrowUpRight className="h-4 w-4 text-destructive" />;
  return <ArrowLeftRight className="h-4 w-4 text-primary" />;
}
function txColor(type: string) {
  if (type.includes('in') || type === 'deposit' || type === 'admin_credit') return 'text-emerald-400';
  if (type.includes('out') || type === 'withdrawal') return 'text-destructive';
  return 'text-muted-foreground';
}

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getUserAccounts(user.id),
      getUserTransactions(user.id, 1, 5),
      getUserNotifications(user.id),
    ]).then(([accts, txns, notifs]) => {
      setAccounts(accts);
      setTransactions(txns);
      setNotifications(notifs.filter(n => !n.is_read).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [user]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const unreadCount = notifications.length;

  return (
    <DashboardLayout notifCount={unreadCount}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your financial summary for today</p>
          </div>
          {unreadCount > 0 && (
            <Link to="/dashboard/notifications">
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <Bell className="h-3.5 w-3.5" />
                {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
              </Button>
            </Link>
          )}
        </div>

        {/* Total Balance hero */}
        <Card className="bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Total Portfolio Balance</p>
            </div>
            <p className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {loading ? <span className="animate-pulse inline-block w-48 h-9 bg-muted rounded" /> : fmt(totalBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>

        {/* Account Cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Your Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading
              ? Array(3).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse bg-card border-border">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-7 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-40" />
                  </CardContent>
                </Card>
              ))
              : accounts.length === 0
                ? <Card className="col-span-3 bg-card border-border">
                  <CardContent className="p-8 text-center text-muted-foreground text-sm">No accounts yet</CardContent>
                </Card>
                : accounts.map(acct => {
                  const Icon = accountIcons[acct.account_type] || Building2;
                  const col = accountColors[acct.account_type] || 'text-muted-foreground';
                  const bg = accountBg[acct.account_type] || 'bg-muted/50';
                  return (
                    <Card key={acct.id} className="bg-card border-border hover:border-primary/40 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                            <Icon className={`h-4 w-4 ${col}`} />
                          </div>
                          <Badge variant="outline" className={`text-xs ${acct.is_active ? 'border-emerald-400/40 text-emerald-400 bg-emerald-400/5' : 'border-destructive/40 text-destructive'}`}>
                            {acct.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground capitalize font-medium mb-1">{acct.account_type} Account</p>
                        <p className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          {fmt(acct.balance)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-mono">{acct.account_number}</p>
                        {acct.available_balance !== acct.balance && (
                          <p className="text-xs text-yellow-400 mt-1">{fmt(acct.available_balance)} available</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Transfer', href: '/dashboard/transfer', icon: ArrowLeftRight, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Deposit', href: '/dashboard/deposit', icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Withdraw', href: '/dashboard/withdraw', icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-destructive/10' },
              { label: 'History', href: '/dashboard/transactions', icon: Landmark, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            ].map(({ label, href, icon: Icon, color, bg }) => (
              <Link key={href} to={href}>
                <Card className="bg-card border-border hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group">
                  <CardContent className="p-4 text-center">
                    <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <p className="text-xs font-semibold">{label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
              <Link to="/dashboard/transactions">View all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 border-b border-border last:border-0 animate-pulse">
                    <div className="h-9 w-9 bg-muted rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5"><div className="h-3 bg-muted rounded w-3/4" /><div className="h-2.5 bg-muted rounded w-1/2" /></div>
                    <div className="h-4 bg-muted rounded w-20 shrink-0" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10">
                <ArrowLeftRight className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div>
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 px-6 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      {txIcon(tx.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate capitalize">
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${txColor(tx.transaction_type)}`}>
                        {tx.transaction_type.includes('out') || tx.transaction_type === 'withdrawal' ? '−' : '+'}
                        {fmt(tx.amount)}
                      </p>
                      <Badge variant={tx.status === 'completed' ? 'outline' : 'secondary'} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unread Notifications */}
        {notifications.length > 0 && (
          <Card className="border-yellow-400/30 bg-yellow-400/5">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base text-yellow-400 flex items-center gap-2">
                <Bell className="h-4 w-4" /> New Notifications
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-yellow-400 hover:text-yellow-300 text-xs">
                <Link to="/dashboard/notifications">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="text-sm border-b border-yellow-400/10 pb-2 last:border-0 last:pb-0">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
