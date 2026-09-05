import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { getServices, getProducts } from '@/lib/content'

/**
 * Derived from content, never hand-listed. A hardcoded sitemap silently omits
 * every page added after it was written — the pages exist, rank for nothing,
 * and nobody notices. Add a service to content/services.json and it appears
 * here automatically.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const [services, products] = await Promise.all([getServices(), getProducts()])

  return [
    { url: `${site.url}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/products`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${site.url}/about`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${site.url}/products/${p.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
