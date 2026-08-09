import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, ArrowLeftRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { getUserTransactions } from '@/services/api';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TYPE_ICONS = { deposit: ArrowDownLeft, withdrawal: ArrowUpRight, transfer: ArrowLeftRight, interest: TrendingUp };
const TYPE_COLORS: Record<string, string> = { deposit: 'text-green-600', withdrawal: 'text-red-500', transfer: 'text-primary', interest: 'text-yellow-400' };
const STATUS_COLORS: Record<string, string> = { completed: 'bg-green-500/10 text-green-600', pending: 'bg-yellow-500/10 text-yellow-400', failed: 'bg-red-500/10 text-red-500', cancelled: 'bg-muted text-muted-foreground' };

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const PAGE = 20;

  useEffect(() => {
    if (!user) return;
    getUserTransactions(user.id, PAGE)
      .then((data) => { setTransactions(data); setHasMore(data.length === PAGE); if (data.length) setCursor(data[data.length - 1].created_at); })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [user]);

  const loadMore = async () => {
    if (!user || !cursor) return;
    const more = await getUserTransactions(user.id, PAGE, cursor);
    setTransactions((p) => [...p, ...more]);
    setHasMore(more.length === PAGE);
    if (more.length) setCursor(more[more.length - 1].created_at);
  };

  const filtered = transactions.filter((t) =>
    !search || (t.description || t.type).toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Transaction History</h1>
        <p className="text-muted-foreground text-sm mt-1">All your account activity in one place</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by description or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-muted border-border" />
      </div>

      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <ArrowLeftRight className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-1">No Transactions Found</h3>
            <p className="text-muted-foreground text-sm">{search ? 'Try a different search term.' : 'Your transaction history will appear here.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {['Type', 'Description', 'Amount', 'Status', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((txn) => {
                    const Icon = TYPE_ICONS[txn.type] || ArrowUpRight;
                    const isCredit = txn.amount > 0;
                    return (
                      <tr key={txn.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isCredit ? 'bg-green-500/10' : 'bg-red-500/10')}>
                            <Icon className={cn('w-4 h-4', TYPE_COLORS[txn.type])} />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-foreground">{txn.description || (txn.type.charAt(0).toUpperCase() + txn.type.slice(1))}</div>
                          <div className="text-xs text-muted-foreground font-mono">{txn.reference}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={cn('font-semibold text-sm', isCredit ? 'text-green-600' : 'text-red-500')}>
                            {isCredit ? '+' : ''}{txn.currency} {Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={cn('text-xs border-0', STATUS_COLORS[txn.status])}>{txn.status}</Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {hasMore && !search && (
              <div className="p-4 text-center border-t border-border">
                <button onClick={loadMore} className="text-sm text-primary hover:underline">Load more</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
