import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { Accounts } from '@/components/sections/Accounts';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Security } from '@/components/sections/Security';
import { Testimonials } from '@/components/sections/Testimonials';
import { FAQ } from '@/components/sections/FAQ';
import { Footer } from '@/components/sections/Footer';
import { LiveChat } from '@/components/common/LiveChat';

export default function LandingPage() {
  return (
    <>
      <Header isLanding />
      <main className="landing-light">
        <Hero />
        <Features />
        <Accounts />
        <HowItWorks />
        <Security />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <LiveChat />
    </>
  );
}
