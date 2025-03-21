import { type ClassValue, clsx } from 'clsx'
import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  })

  return formatter.format(price)
}

export function constructMetadata({
  title = 'Gizmooz - Unlock the next level in tech and innovation',
  description = 'Get the latest tech at Gizmooz – innovative gadgets for a modern lifestyle. High-quality electronics, smart home devices, and cutting-edge technology for everyday use.',
  image = '/og-image.jpg',
  icons = '/favicon.ico',
  keywords = 'tech, gadgets, innovation, electronics, smart devices, technology store, smart home, wearables, tech accessories',
  canonical = '',
  type = 'website',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  keywords?: string
  canonical?: string
  type?: 'website' | 'article'
} = {}): Metadata {
  return {
    metadataBase: new URL('https://www.gizmooz.com'),
    title,
    description,
    keywords: keywords,

    // Canonical URL
    alternates: {
      canonical: canonical || undefined,
    },

    openGraph: {
      type: type,
      locale: 'en_AU',
      url: canonical || 'https://www.gizmooz.com/',
      siteName: 'Gizmooz',
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@gizmooz',
      site: '@gizmooz',
    },

    icons: {
      icon: icons,
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon-32x32.png',
        },
      ],
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}
