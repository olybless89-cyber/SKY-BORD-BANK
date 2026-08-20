import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is NovaCrest a real bank?',
    answer: 'NovaCrest is a financial technology company, not a bank. Banking services are provided by our partner banks, which are FDIC insured.',
  },
  {
    question: 'Are there any monthly fees?',
    answer: 'Personal Checking and Savings accounts have no monthly fees, no minimum balance fees, and no overdraft fees. Our Business account has a simple $15/month fee.',
  },
  {
    question: 'How long does it take to open an account?',
    answer: 'Most customers are approved and can start banking within 3 minutes. In some cases, additional identity verification may take a little longer.',
  },
  {
    question: 'Can I transfer money to other banks?',
    answer: 'Yes. You can link external accounts, send wire transfers, and use peer-to-peer payments instantly.',
  },
  {
    question: 'Is my money insured?',
    answer: 'Yes. Deposits are FDIC insured up to $250,000 per depositor through our partner banks.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <span className="text-xs font-semibold tracking-wider text-primary uppercase">FAQ</span>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
            Questions you might have
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
              <AccordionTrigger className="py-5 text-left font-heading text-base font-medium text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
