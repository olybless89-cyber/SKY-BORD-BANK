import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, TrendingDown, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRODUCTS = [
  { title: 'Personal Overdraft', rate: '14.9%', max: '$25,000', term: 'Revolving', desc: 'Flexible credit line attached to your current account, available when you need it most.' },
  { title: 'Personal Loan', rate: '9.5%', max: '$100,000', term: '1–7 Years', desc: 'Fixed-rate unsecured personal loans with fast approval and no hidden fees.' },
  { title: 'Business Line of Credit', rate: '11.2%', max: '$500,000', term: 'Revolving', desc: 'Revolving business credit for working capital, cash flow gaps, and growth opportunities.' },
  { title: 'Consolidation Loan', rate: '8.9%', max: '$75,000', term: '2–10 Years', desc: 'Merge high-interest debts into one low-rate monthly payment and save on interest.' },
];

export default function BorrowingAccountPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-[#013d36] via-[#0a0f20] to-[#0a0f20]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Lending Solutions</div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Borrow With Confidence</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">Competitive rates, fast approvals, and flexible repayment options—designed to meet your financial needs without compromise.</p>
          <Link to="/contact"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Apply for Credit <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>
      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {PRODUCTS.map((p) => (
              <div key={p.title} className="glass-card rounded-2xl p-8 border border-border">
                <div className="flex items-start justify-between mb-4">
                  <CreditCard className="w-10 h-10 text-primary" />
                  <div className="text-right"><div className="text-primary text-xl font-extrabold">{p.rate} APR</div><div className="text-muted-foreground text-xs">{p.term}</div></div>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{p.desc}</p>
                <div className="text-sm text-muted-foreground mb-4">Up to <span className="text-foreground font-semibold">{p.max}</span></div>
                <Link to="/contact"><Button className="w-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">Apply Now <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {[
              { icon: TrendingDown, title: 'Low Rates', desc: 'Starting from 8.9% APR' },
              { icon: Clock, title: 'Fast Approval', desc: 'Decision within 24 hours' },
              { icon: Shield, title: 'No Hidden Fees', desc: 'Transparent terms always' },
              { icon: CreditCard, title: 'Flexible Terms', desc: 'Up to 10-year repayment' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-6 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="font-bold text-foreground mb-1">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
