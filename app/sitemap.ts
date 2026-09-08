import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { getServices, getProducts, getLocations, getGuides } from '@/lib/content'

/**
 * Derived from content, never hand-listed. A hardcoded sitemap silently omits
 * every page added after it was written — the pages exist, rank for nothing,
 * and nobody notices. Add a service to content/services.json and it appears
 * here automatically.
 *
 * `lastModified` is honest where honesty is available: guides carry a real
 * `updated` date, so they use it. Everything else uses the build date, which is
 * genuinely when it last changed, since content ships with the build. Setting
 * every URL to "today" on every deploy would be the lie — it tells a crawler
 * the whole site changed when it did not, and it stops being believed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const built = new Date()
  const [services, products, locations, guides] = await Promise.all([
    getServices(), getProducts(), getLocations(), getGuides(),
  ])

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    lastModified: Date = built,
  ) => ({ url: absoluteUrl(path), lastModified, changeFrequency, priority })

  return [
    entry('/', 1, 'weekly'),

    // Hubs — the pages a crawler uses to reach everything else
    entry('/services', 0.9, 'monthly'),
    entry('/products', 0.9, 'monthly'),
    entry('/locations', 0.9, 'monthly'),
    entry('/guides', 0.8, 'weekly'),
    entry('/faqs', 0.8, 'monthly'),
    entry('/contact', 0.8, 'yearly'),
    entry('/about', 0.7, 'yearly'),

    ...services.map((s) => entry(`/services/${s.slug}`, 0.9, 'monthly')),
    ...locations.map((l) => entry(`/locations/${l.slug}`, 0.85, 'monthly')),
    ...products.map((p) => entry(`/products/${p.slug}`, 0.7, 'monthly')),
    ...guides.map((g) => entry(`/guides/${g.slug}`, 0.7, 'monthly', new Date(g.updated))),
  ]
}
