import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${site.url}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/services`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/products`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/about`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${site.url}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.8 },
  ]
}
