// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/checkout/',
        '/cart/',
        '/login/',
        '/register/',
        '/account/',
        '/reset-password/',
        '/*.json',
        '/*.php',
      ],
    },
    sitemap: 'https://www.gizmooz.com/sitemap.xml',
    host: 'https://www.gizmooz.com',
  }
}
