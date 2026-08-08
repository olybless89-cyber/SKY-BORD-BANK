import { Link } from 'react-router-dom';
import { ArrowRight, Percent, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCOUNTS = [
  { name: 'Smart Savings', apy: '4.85%', desc: 'High-yield savings with daily interest accrual and no minimum balance requirement.', features: ['4.85% APY', 'No minimum balance', 'Daily interest credit', 'Instant transfers'], color: 'from-primary to-[#013d36]', featured: true },
  { name: 'Premium Checking', apy: '0.50%', desc: 'Feature-rich checking account with unlimited transactions and premium debit card.', features: ['Unlimited transactions', 'Premium Visa debit', 'Cashback rewards', 'ATM fee rebates'], color: 'from-[#1a3a5c] to-[#0a0f20]' },
  { name: 'Corporate Vanguard', apy: '2.10%', desc: 'Designed for business owners who need multi-user access and advanced reporting.', features: ['Multi-user access', 'Payroll integration', 'Custom reporting', 'Dedicated RM'], color: 'from-[#2d1a5c] to-[#0a0f20]' },
  { name: 'Student Next-Gen', apy: '3.25%', desc: 'Zero-fee banking for students with cashback on educational purchases.', features: ['Zero monthly fees', '3.25% APY', 'Student cashback', 'Free international transfers'], color: 'from-[#1a4a2e] to-[#0a0f20]' },
  { name: 'Joint Dual Checking', apy: '1.50%', desc: 'Shared account for couples and families with individual spending controls.', features: ['2 account holders', 'Individual limits', 'Family spending tracker', 'Joint debit cards'], color: 'from-[#4a2d1a] to-[#0a0f20]' },
  { name: 'Fixed Capital Deposit', apy: '5.40%', desc: 'Highest yield term deposit with guaranteed returns over fixed periods.', features: ['5.40% APY guaranteed', 'Terms: 90 days–5 years', 'Capital protected', 'Auto-renewal option'], color: 'from-[#3d3a02] to-[#0a0f20]', badge: 'Best Rate' },
];

export default function AllBankAccountsPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-[#013d36] via-[#0a0f20] to-[#0a0f20]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Account Portfolio</div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Find Your Perfect Account</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">From everyday checking to premium savings, every account includes our institutional security suite and 24/7 support.</p>
        </div>
      </section>

      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACCOUNTS.map((acc) => (
              <div key={acc.name} className="relative glass-card rounded-2xl overflow-hidden border border-border hover:-translate-y-2 transition-transform duration-300">
                {acc.badge && <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">{acc.badge}</div>}
                <div className={`bg-gradient-to-br ${acc.color} p-6`}>
                  <div className="flex items-end justify-between">
                    <h3 className="font-bold text-white text-xl">{acc.name}</h3>
                    <div className="text-right">
                      <div className="text-white/60 text-xs">APY</div>
                      <div className="text-white font-extrabold text-2xl">{acc.apy}</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{acc.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {acc.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Percent className="w-2.5 h-2.5 text-primary" /></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button className={`w-full ${acc.featured ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'} transition-colors`}>
                      Open Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, label: 'No Hidden Fees', desc: 'Transparent pricing on all accounts' },
              { icon: TrendingUp, label: 'High Yields', desc: 'Competitive rates across all tiers' },
              { icon: Clock, label: 'Instant Setup', desc: 'Open your account in minutes online' },
              { icon: ArrowRight, label: 'Easy Switching', desc: 'Upgrade or change plans anytime' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card rounded-2xl p-6 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-bold text-foreground mb-1">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
