import { Nav } from '@/components/landing/Nav';
import { Hero } from '@/components/landing/Hero';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { ProcessSection } from '@/components/landing/ProcessSection';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main style={{ background: '#050607' }}>
      <Nav />
      <Hero />
      <ProcessSection />
      <FeatureGrid />
      <CTA />
      <Footer />
    </main>
  );
}
