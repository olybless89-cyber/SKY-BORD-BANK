import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Daniel R.',
    role: 'Small business owner',
    quote: 'NovaCrest cut our banking fees to zero and gave us instant insight into cash flow. I cannot imagine switching back.',
    rating: 5,
  },
  {
    name: 'Amara K.',
    role: 'Freelance designer',
    quote: 'Opening an account took five minutes. The app is beautiful, fast, and the savings rate actually matters.',
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Software engineer',
    quote: 'I love the real-time transfers and the biometric login. It feels like banking from the future.',
    rating: 5,
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">Testimonials</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Trusted by thousands of customers
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-pretty">
            See why people are choosing NovaCrest for their everyday banking.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden"
            >
              {index === 0 && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0dd9a66d-6dc6-4d71-be26-ad412e895b56.jpg"
                    alt="Professional banker smiling in office"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
                </div>
              )}
              {index === 1 && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c33cd66c-8181-4ed0-ade4-3ac94c4de4ca.jpg"
                    alt="Happy banking customer using mobile app"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
                </div>
              )}
              {index === 2 && (
                <div className="relative h-36 overflow-hidden">
                  <img
                    src="https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b0d09678-2fbf-452d-bf98-7b971bf60c94.jpg"
                    alt="Premium black gold credit card macro"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-foreground text-pretty">
                  "{item.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
