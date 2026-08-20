import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactions, getUserAccounts } from '@/services/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Transaction, Account } from '@/types/types';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Receipt } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}
const typeColors: Record<string, string> = {
  deposit: 'text-emerald-400', admin_credit: 'text-emerald-400', transfer_in: 'text-emerald-400', release: 'text-emerald-400',
  withdrawal: 'text-destructive', transfer_out: 'text-destructive',
  hold: 'text-yellow-400',
};
const statusCls: Record<string, string> = {
  completed: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  pending:   'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  failed:    '',
  held:      'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
};
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'outline', pending: 'secondary', failed: 'destructive', held: 'secondary',
};

function txIcon(type: string, isCredit: boolean) {
  if (isCredit) return <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />;
  if (type === 'hold') return <ArrowLeftRight className="h-3.5 w-3.5 text-yellow-400" />;
  return <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getUserTransactions(user.id, page, 20), getUserAccounts(user.id)])
      .then(([txns, accts]) => { setTransactions(txns); setAccounts(accts); })
      .finally(() => setLoading(false));
  }, [user, page]);

  const filtered = typeFilter === 'all' ? transactions : transactions.filter(t => t.transaction_type === typeFilter);
  const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.account_number]));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Transaction History</h1>
          <p className="text-muted-foreground text-sm mt-1">All your account activity in one place</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="transfer_in">Transfer In</SelectItem>
              <SelectItem value="transfer_out">Transfer Out</SelectItem>
              <SelectItem value="admin_credit">Admin Credit</SelectItem>
              <SelectItem value="hold">Hold</SelectItem>
              <SelectItem value="release">Release</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" /> Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accounts</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-border animate-pulse">
                      {Array(6).fill(0).map((__, j) => (
                        <td key={j} className="px-4 py-3.5"><div className="h-3 bg-muted rounded w-20" /></td>
                      ))}
                    </tr>
                  )) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                        <p className="text-muted-foreground text-sm">No transactions found</p>
                      </td>
                    </tr>
                  ) : filtered.map(tx => {
                    const isCredit = ['deposit', 'admin_credit', 'transfer_in', 'release'].includes(tx.transaction_type);
                    return (
                      <tr key={tx.id} className="border-b border-border hover:bg-muted/20 transition-colors last:border-0">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {txIcon(tx.transaction_type, isCredit)}
                            <span className={`text-sm capitalize font-medium ${typeColors[tx.transaction_type] || 'text-foreground'}`}>
                              {tx.transaction_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{tx.reference_number || '—'}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[180px]">
                          <span className="truncate block">
                            {tx.from_account_id ? (accountMap[tx.from_account_id] || 'External') : '—'}
                            {tx.to_account_id ? ` → ${accountMap[tx.to_account_id] || 'External'}` : ''}
                          </span>
                        </td>
                        <td className={`px-4 py-3.5 text-right font-semibold tabular-nums ${typeColors[tx.transaction_type] || 'text-foreground'}`}>
                          {isCredit ? '+' : '−'}{fmt(tx.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={statusVariant[tx.status] || 'outline'} className={`text-xs ${statusCls[tx.status] || ''}`}>
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 20 && (
              <div className="flex justify-center p-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} className="text-primary hover:text-primary">
                  Load more →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
