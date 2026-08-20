import { Shield, Mail, Phone } from 'lucide-react';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Checking', href: '#accounts' },
      { label: 'Savings', href: '#accounts' },
      { label: 'Business', href: '#accounts' },
      { label: 'Security', href: '#security' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Disclosures', href: '#' },
      { label: 'Licenses', href: '#' },
    ],
  },
];

export function Footer() {
  const handleClick = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer style={{ backgroundColor: '#0d1a2d', color: '#e2e8f0' }} className="py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb]">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Nova<span className="text-[#60a5fa]">Crest</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
              Modern banking for modern lives. Secure, simple, and designed to help your money grow.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm" style={{ color: '#94a3b8' }}>
              <a href="mailto:support@novacrestbk.online" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                support@novacrestbk.online
              </a>
              <a href="tel:+18005551234" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                1-800-555-1234
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white">{group.title}</h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleClick(link.href)}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: '#94a3b8' }}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-16 flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs" style={{ color: '#64748b' }}>
            © {new Date().getFullYear()} NovaCrest Financial Technologies. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
