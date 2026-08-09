import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Globe, Shield, Star, Phone, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SERVICES = [
  { icon: Crown, title: 'Dedicated Relationship Manager', desc: 'A dedicated private banker available around the clock for all your financial needs and questions.' },
  { icon: TrendingUp, title: 'Bespoke Investment Portfolios', desc: 'Tailor-made investment strategies built around your risk profile, goals, and timeline.' },
  { icon: Globe, title: 'Global Wealth Management', desc: 'Multi-jurisdiction asset management, tax optimization, and global estate planning services.' },
  { icon: Shield, title: 'Trust & Estate Services', desc: 'Comprehensive trust structures and estate planning to preserve and transfer your legacy.' },
  { icon: Star, title: 'Exclusive Banking Privileges', desc: 'Priority access to IPOs, pre-market opportunities, and exclusive investment products.' },
  { icon: Phone, title: 'Concierge Lifestyle Services', desc: 'Beyond finance—travel arrangements, event access, and premium lifestyle management.' },
];

export default function PrivateBankingPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-24 bg-gradient-to-br from-[#0a1c50] via-[#0f172a] to-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full border-2 border-primary animate-spin" style={{ animationDuration: '60s' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-4">
            <Crown className="w-3 h-3" /> By Invitation or Qualifying Deposit
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Private Banking Excellence</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">Exclusive wealth management for clients with $250,000+ in assets. Experience banking reimagined for the world's most discerning individuals.</p>
          <Link to="/contact"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Request Private Consultation <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-primary to-[#0a1c50]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['$250K+', 'Minimum Assets'], ['24/7', 'Dedicated Support'], ['120+', 'Global Markets'], ['0.5%', 'Mgmt Fee p.a.']].map(([v, l]) => (
            <div key={l}><div className="text-white text-2xl font-extrabold">{v}</div><div className="text-white/60 text-sm">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Exclusive Private Banking Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-8 border border-border group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
