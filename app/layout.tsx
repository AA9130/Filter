import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/layout/FloatingActions'
import MobileCallBar from '@/components/layout/MobileCallBar'
import { site } from '@/lib/site'
import { getBusiness, getServices, getEmirates } from '@/lib/content'
import { buildMetadata, localBusinessJsonLd } from '@/lib/seo'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusiness()

  return {
    metadataBase: new URL(site.url),
    ...buildMetadata({
      title: `Water Filter Installation & Service UAE | ${business.name}`,
      description: business.description,
      path: '/',
    }),
    title: {
      default: `Water Filter Installation, Repair & AMC Across the UAE | ${business.name}`,
      template: `%s | ${business.name}`,
    },
    applicationName: business.name,
    authors: [{ name: business.legalName }],
    creator: business.legalName,
    publisher: business.legalName,
    category: 'Home Services',
    formatDetection: { telephone: true, address: true, email: true },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    icons: {
      icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/favicon.svg' }],
    },
    other: {
      'geo.region': 'AE',
      'geo.placename': `${business.address.city}, ${business.address.countryName}`,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#1d61d8',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read once here and pass down — components never reach into the content layer
  const [business, services, emirates] = await Promise.all([
    getBusiness(),
    getServices(),
    getEmirates(),
  ])

  return (
    <html lang="en-AE" className={jakarta.variable}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(business)) }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer
          business={business}
          services={services.map(({ slug, title }) => ({ slug, title }))}
          emirates={emirates.map(({ name }) => ({ name }))}
        />

        <FloatingActions />
        <MobileCallBar />
      </body>
    </html>
  )
}
