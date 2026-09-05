import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/layout/FloatingActions'
import MobileCallBar from '@/components/layout/MobileCallBar'
import { site } from '@/lib/site'
import { buildMetadata, localBusinessJsonLd } from '@/lib/seo'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...buildMetadata({
    title: `Water Filter Installation & Service UAE | ${site.name}`,
    description: site.description,
    path: '/',
  }),
  title: {
    default: `Water Filter Installation, Repair & AMC Across the UAE | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  applicationName: site.name,
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  publisher: site.legalName,
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
    'geo.placename': 'Dubai, United Arab Emirates',
  },
}

export const viewport: Viewport = {
  themeColor: '#1d61d8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AE" className={jakarta.variable}>
      <body className="font-sans">
        {/* Local business structured data — drives Google local rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <Header />
        <main id="main">{children}</main>
        <Footer />

        <FloatingActions />
        <MobileCallBar />
      </body>
    </html>
  )
}
