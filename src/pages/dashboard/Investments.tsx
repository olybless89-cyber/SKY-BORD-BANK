import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInvestments, createInvestment, getUserAccounts } from '@/services/api';
import type { Investment, BankAccount } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/db/supabase';

const PLANS = [
  { name: 'Starter', roi: 150, roi_type: 'total', duration: 5, min: 500, max: 2999, tag: 'Entry Level' },
  { name: 'Beginner Growth', roi: 16, roi_type: 'daily', duration: 60, min: 100, max: 25000, tag: 'Popular', featured: true },
  { name: 'Standard Alpha', roi: 2.5, roi_type: 'daily', duration: 60, min: 25000, max: 100000, tag: 'Institutional' },
  { name: 'Gold Premium', roi: 5, roi_type: 'daily', duration: 90, min: 100000, max: 500000, tag: 'Elite' },
];

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState<string | null>(null);
  const [amount, setAmount] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([getUserInvestments(user.id), getUserAccounts(user.id)])
      .then(([inv, acc]) => { setInvestments(inv); setAccounts(acc); })
      .finally(() => setLoading(false));
  }, [user]);

  const handleInvest = async (plan: typeof PLANS[0]) => {
    const amt = parseFloat(amount[plan.name] || '0');
    if (amt < plan.min || amt > plan.max) { toast.error(`Amount must be between $${plan.min} and $${plan.max}`); return; }
    const account = accounts[0];
    if (!account) { toast.error('No account found'); return; }
    if (account.balance < amt) { toast.error('Insufficient funds'); return; }
    setInvesting(plan.name);
    try {
      // Deduct from account
      await supabase.from('bank_accounts').update({ balance: account.balance - amt }).eq('id', account.id);
      await supabase.from('transactions').insert({ account_id: account.id, type: 'withdrawal', amount: -amt, currency: account.currency, description: `Investment: ${plan.name}`, status: 'completed' });
      await createInvestment({ user_id: user!.id, plan_name: plan.name, amount: amt, roi_percent: plan.roi, roi_type: plan.roi_type, duration_days: plan.duration });
      const [inv, acc] = await Promise.all([getUserInvestments(user!.id), getUserAccounts(user!.id)]);
      setInvestments(inv); setAccounts(acc);
      toast.success(`Invested $${amt.toLocaleString()} in ${plan.name}!`);
      setAmount((a) => ({ ...a, [plan.name]: '' }));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Investment failed');
    } finally {
      setInvesting(null);
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-64 rounded-2xl" /></div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Investment Plans</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose a plan and start growing your wealth today</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.name} className={cn('rounded-2xl p-8 border transition-all', plan.featured ? 'bg-gradient-to-br from-primary to-[#013d36] border-primary teal-glow' : 'glass-card border-border')}>
            <div className={cn('text-xs font-semibold uppercase tracking-wider mb-2', plan.featured ? 'text-white/70' : 'text-primary')}>{plan.tag}</div>
            <div className={cn('text-4xl font-extrabold mb-1', plan.featured ? 'text-white' : 'text-foreground')}>
              {plan.roi}{plan.roi_type === 'daily' ? '%' : '%'}
            </div>
            <div className={cn('text-sm mb-4', plan.featured ? 'text-white/70' : 'text-muted-foreground')}>
              {plan.roi_type === 'daily' ? 'Daily ROI' : 'Total Return'} · {plan.duration} Days
            </div>
            <h3 className={cn('font-bold text-xl mb-4', plan.featured ? 'text-white' : 'text-foreground')}>{plan.name}</h3>
            <div className={cn('text-sm mb-6 space-y-1', plan.featured ? 'text-white/70' : 'text-muted-foreground')}>
              <div>Min: ${plan.min.toLocaleString()} · Max: ${plan.max.toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <input
                type="number" placeholder={`$${plan.min}`} min={plan.min} max={plan.max}
                value={amount[plan.name] || ''}
                onChange={(e) => setAmount((a) => ({ ...a, [plan.name]: e.target.value }))}
                className={cn('flex-1 h-10 px-3 rounded-lg text-sm border outline-none', plan.featured ? 'bg-white/20 border-white/30 text-white placeholder:text-white/50' : 'bg-secondary border-border text-foreground')}
              />
              <Button
                onClick={() => handleInvest(plan)}
                disabled={!!investing}
                className={cn('shrink-0', plan.featured ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90')}
              >
                {investing === plan.name ? '...' : <><Plus className="w-4 h-4 mr-1" />Invest</>}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Active investments */}
      {investments.length > 0 && (
        <div className="glass-card rounded-2xl border border-border">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold text-foreground">Active Investments</h3>
          </div>
          <div className="divide-y divide-border">
            {investments.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm">{inv.plan_name}</div>
                  <div className="text-xs text-muted-foreground">{inv.roi_percent}% {inv.roi_type} · {inv.duration_days} days</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-foreground text-sm">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <Badge className={cn('text-xs border-0', inv.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground')}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
