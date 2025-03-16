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
  description = 'Get the latest tech at Gizmooz – innovative gadgets for a modern lifestyle',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@nhtuuu',
    },
    icons: {
      icon: icons,
    },
    metadataBase: new URL('https://www.gizmooz.com/'),
  }
}
