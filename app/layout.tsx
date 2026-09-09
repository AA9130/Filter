import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/layout/FloatingActions'
import MobileCallBar from '@/components/layout/MobileCallBar'
import { site } from '@/lib/site'
import { getBusiness, getServices, getLocations, getSocialProfiles, getCredentials } from '@/lib/content'
import { buildMetadata, organizationJsonLd, websiteJsonLd, jsonLdGraph } from '@/lib/seo'

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
      title: 'Water Filter Installation & Service UAE',
      description: business.shortDescription,
      path: '/',
    }),
    title: {
      default: `Water Filter Installation & Service UAE | ${site.name}`,
      // Page titles pass a short subject and the brand is appended here, so
      // every title is consistent and none of them repeat the brand twice.
      template: `%s | ${site.name}`,
    },
    applicationName: site.name,
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
    // Verification tokens belong in the environment, not in the repository.
    // Google Search Console accepts this meta tag as a verification method;
    // see docs/DEPLOYMENT.md for the exact step.
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  }
}

export const viewport: Viewport = {
  themeColor: '#1d61d8',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read once here and pass down — components never reach into the content layer
  const [business, services, locations, social, credentials] = await Promise.all([
    getBusiness(),
    getServices(),
    getLocations(),
    getSocialProfiles(),
    getCredentials(),
  ])

  return (
    <html lang={site.lang} className={jakarta.variable}>
      <body className="font-sans">
        {/*
          Opt into the scroll-reveal animations, and guarantee they cannot hide
          the page.

          The reveal CSS starts elements at `opacity: 0` and JavaScript reveals
          them. That is fine as decoration and unacceptable as a dependency —
          81 elements on the homepage carry [data-reveal], including five of the
          six images, so a blocked or broken script turns the site blank rather
          than merely static.

          So the hiding is opt-in, twice over:
            1. This script sets `data-js`, which is the only thing that arms the
               CSS. No JavaScript, blocked JavaScript, a CSP violation, or a
               failed chunk → the attribute is never set and nothing is hidden.
            2. If the attribute IS set but React never hydrates — the chunk
               404s, hydration throws — no Reveal ever mounts, so
               `data-reveal-ready` is never set and the timeout below disarms
               the CSS, showing everything.

          It is inline and first in <body> so it runs during parse, before any
          revealed content paints. An external or deferred script would flash.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.setAttribute('data-js','');setTimeout(function(){if(!d.hasAttribute('data-reveal-ready'))d.removeAttribute('data-js')},2500)})()`,
          }}
        />

        {/*
          The organisation and the website, once, site-wide. Every page's own
          schema references `#organization` by @id rather than restating the
          business — so a crawler accumulates evidence about one entity instead
          of reconciling forty descriptions of it.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdGraph(organizationJsonLd(business, social), websiteJsonLd()),
          }}
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
          locations={locations.map(({ name, slug }) => ({ name, slug }))}
          credentials={credentials}
        />

        <FloatingActions />
        <MobileCallBar />
      </body>
    </html>
  )
}
