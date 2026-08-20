import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { UserPlus, ScanFace, Banknote } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Sign up',
    description: 'Download the app or sign up online in under 3 minutes with just your email and phone number.',
  },
  {
    icon: ScanFace,
    number: '02',
    title: 'Verify identity',
    description: 'Snap a photo of your ID and take a quick selfie. Our secure system verifies you in minutes.',
  },
  {
    icon: Banknote,
    number: '03',
    title: 'Start banking',
    description: 'Fund your account, order your card, and send your first payment the same day.',
  },
];

function StepCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return (
    <span ref={ref} className="font-heading text-4xl font-bold text-foreground">
      {count}{suffix}
    </span>
  );
}

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">How it works</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Open an account in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            We have stripped away the paperwork and long waits so you can start banking today.
          </p>
        </div>

        {/* Banking building / mobile app images */}
        <div className="mb-12 grid md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden border border-border h-48">
            <img
              src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_e2967863-4360-4c49-8808-2ff007804cd8.jpg"
              alt="Modern bank building exterior architecture"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Established Presence</p>
                <p className="text-xs text-muted-foreground">Licensed in 50 states</p>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-border h-48">
            <img
              src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_a3ad6145-c2e6-4e98-a9c0-762fb08d1ba9.jpg"
              alt="Mobile banking app interface on phone screen"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-5">
              <div>
                <p className="text-sm font-semibold text-foreground">Banking On-the-Go</p>
                <p className="text-xs text-muted-foreground">iOS & Android available</p>
              </div>
            </div>
          </div>
        </div>

        <div ref={ref} className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary ring-1 ring-border">
                <step.icon className="h-7 w-7" />
              </div>
              <span className="font-heading text-sm font-bold text-accent">{step.number}</span>
              <h3 className="mt-2 font-heading text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <StepCounter value={3} suffix=" min" />
            <p className="mt-1 text-sm text-muted-foreground">Average sign-up time</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <StepCounter value={99} suffix="%" />
            <p className="mt-1 text-sm text-muted-foreground">Identity approval rate</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <StepCounter value={0} suffix=" fees" />
            <p className="mt-1 text-sm text-muted-foreground">On personal accounts</p>
          </div>
        </div>
      </div>
    </section>
  );
}
