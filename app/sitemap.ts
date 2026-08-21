import type { MetadataRoute } from 'next';

import { projects } from '@/data/projects';
import { properties } from '@/data/properties';
import { site } from '@/data/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: '/', priority: 1 },
    { path: '/immobili', priority: 0.9 },
    { path: '/vendi-affitta', priority: 0.9 },
    { path: '/locazioni-americani', priority: 0.8 },
    { path: '/chi-siamo', priority: 0.7 },
    { path: '/contatti', priority: 0.6 },
    { path: '/privacy-policy', priority: 0.2 },
    { path: '/cookie-policy', priority: 0.2 },
  ];

  return [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority,
    })),
    ...properties.map((p) => ({
      url: `${site.url}/immobili/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...projects.map((p) => ({
      url: `${site.url}/progetti/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
