import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import {
  BadgePercent,
  Banknote,
  Clock,
  CreditCard,
  Headphones,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: BadgePercent,
    title: 'Zero fees',
    description: 'No monthly maintenance, overdraft, or minimum balance fees. Your money stays yours.',
  },
  {
    icon: Banknote,
    title: 'Instant transfers',
    description: 'Send and receive money in seconds, day or night, with real-time notifications.',
  },
  {
    icon: CreditCard,
    title: 'High-yield savings',
    description: 'Earn more with a competitive APY that compounds daily and pays monthly.',
  },
  {
    icon: Clock,
    title: '24/7 support',
    description: 'Talk to a real human anytime via chat, phone, or email — no bots required.',
  },
  {
    icon: ShieldCheck,
    title: 'FDIC insured',
    description: 'Your deposits are insured up to $250,000 through our partner banks.',
  },
  {
    icon: Headphones,
    title: 'Smart debit card',
    description: 'Lock, unlock, and set spending limits instantly from your phone.',
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Why NovaCrest</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Built for how you bank today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            Every feature is designed to save you time, cut unnecessary costs, and keep your money working for you.
          </p>
        </div>

        {/* Premium fintech/banking hero banner for features section */}
        <div className="mb-12 relative rounded-3xl overflow-hidden border border-primary/20 shadow-xl">
          <img
            src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c76b06f4-0159-40d4-9176-6e2384413ef1.jpg"
            alt="Premium digital banking fintech abstract technology"
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent flex items-center">
            <div className="px-8 md:px-12">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2">Technology</p>
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-balance">
                Next-generation financial infrastructure
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md text-pretty">
                Built on enterprise-grade systems with real-time processing, AI fraud detection, and 99.99% uptime.
              </p>
            </div>
          </div>
        </div>

        <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
