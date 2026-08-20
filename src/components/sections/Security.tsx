import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Lock, ShieldCheck, Fingerprint, Scan, AlertTriangle } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'Bank-grade encryption',
    description: 'All data is encrypted in transit and at rest with AES-256 and TLS 1.3.',
  },
  {
    icon: ShieldCheck,
    title: 'FDIC insured',
    description: 'Deposits are insured up to $250,000 through our partner banks.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric login',
    description: 'Unlock your account with Face ID, Touch ID, or your device PIN.',
  },
  {
    icon: AlertTriangle,
    title: 'Fraud protection',
    description: 'AI-powered monitoring flags suspicious activity in real time.',
  },
];

export function Security() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="security" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">Security</span>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Your money, protected around the clock
            </h2>
            <p className="mt-4 max-w-lg text-muted-foreground text-pretty">
              Security is not an afterthought at NovaCrest. It is built into every layer of our platform, from the app on your phone to the vaults that hold your deposits.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  ref={index === 0 ? ref : null}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl border border-border bg-card overflow-hidden"
          >
            {/* Premium vault/security image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_242eeddc-bc76-4fb3-83d4-4a204406d1bb.jpg"
                alt="Bank vault security encryption abstract technology"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/90" />
            </div>
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Scan className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Security scan</p>
                    <p className="text-xs text-muted-foreground">Active monitoring</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <span className="text-sm text-muted-foreground">Encrypted sessions</span>
                  <span className="font-heading text-sm font-semibold text-foreground">100%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <span className="text-sm text-muted-foreground">Fraud blocked today</span>
                  <span className="font-heading text-sm font-semibold text-foreground">$0</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="font-heading text-sm font-semibold text-foreground">99.99%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
