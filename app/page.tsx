import type { Metadata } from 'next';

import ScrollZoomHero from '@/components/home/ScrollZoomHero';
import SpecBand from '@/components/home/SpecBand';
import ServiceGrid from '@/components/home/ServiceGrid';
import CircularProjectsShowcase from '@/components/home/CircularProjectsShowcase';
import ValuationCTA from '@/components/home/ValuationCTA';
import USAFSection from '@/components/home/USAFSection';
import FinalCTA from '@/components/home/FinalCTA';
import { contact, site, socials } from '@/data/site';
import { getI18n } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.homeTitle,
    description: t.meta.description,
    alternates: { canonical: '/' },
  };
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: site.name,
  url: site.url,
  description: site.description,
  telephone: contact.phone.label,
  email: contact.email.label,
  vatID: contact.vat,
  address: {
    '@type': 'PostalAddress',
    streetAddress: contact.address.street,
    addressLocality: contact.address.city,
    postalCode: contact.address.postalCode,
    addressRegion: contact.address.province,
    addressCountry: 'IT',
  },
  hasMap: contact.maps.href,
  sameAs: socials.map((s) => s.href),
  areaServed: 'Pordenone',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <ScrollZoomHero />
      <CircularProjectsShowcase />
      <SpecBand />
      <ServiceGrid />
      <ValuationCTA />
      <USAFSection />
      <FinalCTA />
    </>
  );
}
