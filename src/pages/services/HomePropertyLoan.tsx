import { Link } from 'react-router-dom';
import { ArrowRight, Home, Building, DollarSign, Clock, Percent, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOANS = [
  { title: 'First-Time Buyer Mortgage', rate: '3.49%', term: '25 years', maxLoan: '$800,000', desc: 'Tailored for first-time homeowners with low down payments and competitive fixed rates.' },
  { title: 'Remortgage & Refinance', rate: '3.79%', term: '30 years', maxLoan: '$2,000,000', desc: 'Reduce your monthly payments or release equity from your existing property.' },
  { title: 'Buy-to-Let Property Loan', rate: '4.25%', term: '20 years', maxLoan: '$1,500,000', desc: 'Finance investment properties with flexible terms and rental income consideration.' },
  { title: 'Commercial Real Estate', rate: '5.10%', term: '15 years', maxLoan: '$10,000,000', desc: 'Large-scale commercial financing for office buildings, retail spaces, and mixed-use developments.' },
];

export default function HomePropertyLoanPage() {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-br from-[#0a1c50] via-[#0f172a] to-[#0f172a]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Property Finance</div>
          <h1 className="text-5xl font-extrabold text-white mb-6">Your Dream Home Starts Here</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">Competitive mortgage rates, flexible terms, and expert guidance from our property finance specialists.</p>
          <Link to="/contact"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Apply Now <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
        </div>
      </section>
      <section className="py-12 bg-gradient-to-r from-primary to-[#0a1c50]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['3.49%', 'From Rate'], ['25 Years', 'Max Term'], ['95%', 'LTV Available'], ['48hrs', 'Decision Time']].map(([v, l]) => (
            <div key={l}><div className="text-white text-2xl font-extrabold">{v}</div><div className="text-white/60 text-sm">{l}</div></div>
          ))}
        </div>
      </section>
      <section className="py-20 section-muted">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {LOANS.map((loan) => (
              <div key={loan.title} className="glass-card rounded-2xl p-8 border border-border hover:-translate-y-1 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Home className="w-6 h-6 text-primary" /></div>
                  <div className="text-right"><div className="text-primary text-2xl font-extrabold">{loan.rate}</div><div className="text-muted-foreground text-xs">p.a. fixed</div></div>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{loan.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{loan.desc}</p>
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" />{loan.term}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-4 h-4 text-primary" />Up to {loan.maxLoan}</div>
                </div>
                <Link to="/contact" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  Apply <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
