import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Heart, Home, Car, Umbrella } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRODUCTS = [
  { icon: Heart, title: 'Life Assurance', desc: 'Comprehensive life coverage with lump-sum payouts, ensuring your family is protected through any life event.' },
  { icon: Home, title: 'Property Insurance', desc: 'Full protection for your home and belongings against theft, damage, natural disasters, and liability.' },
  { icon: Car, title: 'Auto Insurance', desc: 'Comprehensive vehicle coverage including collision, liability, and uninsured motorist protection.' },
  { icon: Umbrella, title: 'Umbrella Policy', desc: 'An extra layer of liability protection that kicks in when other policies reach their limits.' },
  { icon: Shield, title: 'Business Continuity', desc: 'Keep your business running with coverage for revenue loss, cyber incidents, and professional liability.' },
  { icon: Heart, title: 'Health & Critical Illness', desc: 'Lump-sum payouts on diagnosis of over 50 critical conditions including cancer, stroke, and heart attack.' },
];

export default function InsurancePoliciesPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-[#0a1c50] via-[#0f172a] to-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Protection Suite</div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Comprehensive Insurance Policies</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">Protect what matters most with our institutional-grade insurance products, tailored to your unique lifestyle and assets.</p>
          <Link to="/contact"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get a Quote <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>
      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {PRODUCTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-8 border border-border hover:-translate-y-2 transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{desc}</p>
                <Link to="/contact" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  Learn More <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
