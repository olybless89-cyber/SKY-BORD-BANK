import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Check, Wallet, PiggyBank, Building2 } from 'lucide-react';

const accounts = [
  {
    icon: Wallet,
    name: 'Checking',
    tagline: 'Spend freely, with no surprises.',
    price: '$0',
    period: '/mo',
    benefits: [
      'No monthly fees or minimums',
      'Free ATM withdrawals nationwide',
      'Instant peer-to-peer payments',
      'Virtual + physical debit card',
    ],
    cta: 'Open Checking',
  },
  {
    icon: PiggyBank,
    name: 'Savings',
    tagline: 'Watch your money grow faster.',
    price: '4.50%',
    period: ' APY',
    benefits: [
      'High-yield rate on every dollar',
      'Daily compounding interest',
      'Automated savings rules',
      'No withdrawal penalties',
    ],
    cta: 'Open Savings',
    featured: true,
  },
  {
    icon: Building2,
    name: 'Business',
    tagline: 'Banking built for founders.',
    price: '$15',
    period: '/mo',
    benefits: [
      'Unlimited transactions',
      'Multi-user account access',
      'Integrated invoicing tools',
      'Priority support line',
    ],
    cta: 'Open Business',
  },
];

export function Accounts() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="accounts" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Accounts</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Choose the account that fits you
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            Whether you are managing daily spending, building savings, or running a business, NovaCrest has an account for you.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 lg:grid-cols-3">
          {accounts.map((account, index) => (
            <motion.div
              key={account.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-3xl border p-6 md:p-8 ${
                account.featured
                  ? 'border-primary/40 bg-secondary/50 shadow-2xl'
                  : 'border-border bg-card'
              }`}
            >
              {account.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <account.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">{account.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{account.tagline}</p>
              <div className="mt-4 flex items-baseline">
                <span className="font-heading text-4xl font-bold text-foreground">{account.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">{account.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {account.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full rounded-full"
                variant={account.featured ? 'default' : 'outline'}
                asChild
              >
                <a href="/register">{account.cta}</a>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
