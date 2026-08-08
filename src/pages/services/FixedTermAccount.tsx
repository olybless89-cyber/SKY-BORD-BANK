import { Link } from 'react-router-dom';
import { ArrowRight, Clock, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRODUCTS = [
  { term: '3 Months', rate: '3.80%', min: '$1,000', desc: 'Short-term deposit with guaranteed returns and full capital protection at maturity.' },
  { term: '6 Months', rate: '4.25%', min: '$1,000', desc: 'Balanced short-term savings with enhanced yield over standard savings accounts.' },
  { term: '12 Months', rate: '4.85%', min: '$2,500', desc: 'Our most popular term—excellent yield with single annual interest payment.' },
  { term: '24 Months', rate: '5.10%', min: '$5,000', desc: 'Lock in today\'s high rates for a 2-year period with monthly interest credit.' },
  { term: '36 Months', rate: '5.30%', min: '$5,000', desc: 'Long-term committed savings with the highest guaranteed returns available.' },
  { term: '60 Months', rate: '5.40%', min: '$10,000', desc: 'Maximum yield for 5-year capital commitment. Ideal for retirement planning.' },
];

export default function FixedTermAccountPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-[#013d36] via-[#0a0f20] to-[#0a0f20]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Fixed Deposit</div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Guaranteed Returns, Zero Risk</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">Lock in high-yield rates for a fixed period. Your capital is 100% protected and your returns are guaranteed from day one.</p>
          <Link to="/register"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Open Fixed Account <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>
      <section className="py-12 bg-gradient-to-r from-primary to-[#013d36]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['5.40%', 'Max APY'], ['100%', 'Capital Protected'], ['$1,000', 'Min Deposit'], ['FSCS', 'Protected']].map(([v, l]) => (
            <div key={l}><div className="text-white text-2xl font-extrabold">{v}</div><div className="text-white/60 text-sm">{l}</div></div>
          ))}
        </div>
      </section>
      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PRODUCTS.map((p, i) => (
              <div key={p.term} className={`rounded-2xl p-8 border transition-all hover:-translate-y-2 duration-300 ${i === 5 ? 'bg-gradient-to-br from-primary to-[#013d36] border-primary teal-glow' : 'glass-card border-border'}`}>
                <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${i === 5 ? 'text-white/70' : 'text-primary'}`}>
                  <Clock className="inline w-3 h-3 mr-1" />{p.term} Term
                </div>
                <div className={`text-4xl font-extrabold mb-1 ${i === 5 ? 'text-white' : 'text-foreground'}`}>{p.rate}</div>
                <div className={`text-sm mb-4 ${i === 5 ? 'text-white/70' : 'text-muted-foreground'}`}>Annual Percentage Yield</div>
                <p className={`text-sm mb-6 leading-relaxed ${i === 5 ? 'text-white/70' : 'text-muted-foreground'}`}>{p.desc}</p>
                <div className={`text-xs mb-4 ${i === 5 ? 'text-white/60' : 'text-muted-foreground'}`}>Min: {p.min}</div>
                <Link to="/register">
                  <Button className={`w-full ${i === 5 ? 'bg-white text-primary hover:bg-white/90' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors'}`}>
                    Open Account
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Capital Protected', desc: '100% principal guaranteed at maturity' },
              { icon: TrendingUp, title: 'Rate Locked', desc: 'Locked-in rate from account opening' },
              { icon: DollarSign, title: 'Interest Options', desc: 'Monthly, quarterly, or at maturity' },
              { icon: ArrowRight, title: 'Auto-Renewal', desc: 'Optional auto-renew at maturity' },
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
