/**
 * Visual QA harness — development aid only.
 *
 * Renders a single section at the top of the page so it can be inspected
 * without scrolling. Excluded from the sitemap and marked noindex.
 * Usage: /qa?s=featured
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Manifesto from '@/components/home/Manifesto';
import DevelopmentsSection from '@/components/home/DevelopmentsSection';
import ValuationCTA from '@/components/home/ValuationCTA';
import USAFSection from '@/components/home/USAFSection';
import ProcessSection from '@/components/home/ProcessSection';
import AboutSection from '@/components/home/AboutSection';
import Testimonials from '@/components/home/Testimonials';
import FinalCTA from '@/components/home/FinalCTA';

export const metadata: Metadata = { robots: { index: false, follow: false } };

const SECTIONS: Record<string, React.ComponentType> = {
  manifesto: Manifesto,
  developments: DevelopmentsSection,
  valuation: ValuationCTA,
  usaf: USAFSection,
  process: ProcessSection,
  about: AboutSection,
  testimonials: Testimonials,
  final: FinalCTA,
};

export default async function QAPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  if (process.env.NODE_ENV === 'production') notFound();

  const { s = 'manifesto' } = await searchParams;
  const Section = SECTIONS[s];
  if (!Section) notFound();

  return (
    <div style={{ paddingTop: 'var(--header-h)' }}>
      <Section />
    </div>
  );
}
