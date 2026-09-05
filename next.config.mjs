/** @type {import('next').NextConfig} */
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
  // Local dev is sometimes reached as 127.0.0.1 rather than localhost; naming
  // both keeps Next from warning about a cross-origin dev asset request.
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
}

export default nextConfig
