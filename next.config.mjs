/** @type {import('next').NextConfig} */

/**
 * Service slugs were renamed to put the search term in the URL
 * (`/services/ro-water-purifiers` → `/services/ro-water-purifier`). Old URLs
 * redirect permanently rather than 404: a 301 passes on whatever equity the old
 * URL had and keeps any existing link working. Removing these later, once the
 * old URLs have dropped out of every index, is safe — leaving them costs
 * nothing.
 */
const renamedServices = [
  ['ro-water-purifiers', 'ro-water-purifier'],
  ['whole-house-filtration', 'whole-house-water-filtration'],
  ['water-softeners', 'water-softener'],
  ['uv-sterilizer-systems', 'uv-water-purification'],
  ['filter-replacement', 'water-filter-replacement'],
  ['amc-annual-maintenance', 'water-filter-amc'],
  ['repair-troubleshooting', 'water-filter-repair'],
]

const nextConfig = {
  // `next dev` and `next build` write incompatible output. Sharing one folder
  // means a build — or a second dev server — can leave the other reading a
  // stale chunk manifest, which surfaces as "Cannot find module './611.js'".
  // Separate directories remove the whole failure mode. `next build` and
  // `next start` both run as production and still use `.next`, so deployment
  // is unaffected.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',

  reactStrictMode: true,
  poweredByHeader: false,

  // One canonical URL shape. Next's default already 308s `/services/` to
  // `/services`, which is the half of trailing-slash canonicalisation that can
  // be solved in the app. The other half — www vs non-www, and the
  // *.vercel.app preview domain — has to be solved at the DNS and hosting
  // layer, because a request that never reaches this app cannot be redirected
  // by it. See docs/DEPLOYMENT.md.
  trailingSlash: false,

  allowedDevOrigins: ['localhost', '127.0.0.1'],

  images: {
    // Images are served from /public — no remote host, so nothing here breaks
    // behind a corporate firewall or offline. Add a hostname only when you
    // start serving real photography from a CDN.
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  async redirects() {
    return [
      ...renamedServices.map(([from, to]) => ({
        source: `/services/${from}`,
        destination: `/services/${to}`,
        permanent: true,
      })),
      // The homepage used to be the only place these sections existed. They are
      // now pages, and the anchors should land on them.
      { source: '/emirates', destination: '/locations', permanent: true },
      { source: '/faq', destination: '/faqs', permanent: true },
      { source: '/blog', destination: '/guides', permanent: true },
      { source: '/blog/:slug', destination: '/guides/:slug', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Referrer policy and nosniff are the two security headers that also
          // matter for analytics fidelity and for how a crawler treats assets.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // Generated text endpoints are cheap to serve and stable between
        // deploys; letting a CDN hold them keeps crawler traffic off the origin.
        source: '/(robots.txt|llms.txt)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
      },
    ]
  },
}

export default nextConfig
