/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  // Remove swcMinify - it's enabled by default in Next.js 15
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    // Use remotePatterns instead of domains (deprecated)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.gizmooz.com', // This allows any subdomain
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gizmooz.com', // Keep the main domain too
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 60,
    // Remove disableStaticImages - not needed
  },
  // Remove env section - these should be set in Vercel dashboard instead
  // Environment variables starting with NEXT_PUBLIC_ are automatically available
  // Server-side env vars should be added to Vercel dashboard
}

module.exports = nextConfig
