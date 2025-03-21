// app/layout.tsx
import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/footer'
import { SessionProvider } from '@/client/session-provider'
import NavbarWrapper from '@/components/navbar-wrapper'
import Script from 'next/script'

const quicksand = Quicksand({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gizmooz.com'),
  title: 'Gizmooz | Unlock the next level in tech and innovation',
  description:
    'Get the latest tech at Gizmooz – innovative gadgets, smart home devices, and cutting-edge technology for a modern lifestyle. Free shipping on select items.',
  keywords:
    'tech, gadgets, innovation, electronics, smart devices, technology store, ecommerce, online shopping, tech accessories',
  applicationName: 'Gizmooz Tech Store',
  authors: [{ name: 'Gizmooz Team' }],
  generator: 'Next.js',
  creator: 'Gizmooz',
  publisher: 'Gizmooz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://www.gizmooz.com',
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
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://www.gizmooz.com',
    siteName: 'Gizmooz',
    title: 'Gizmooz | Unlock the next level in tech and innovation',
    description:
      'Get the latest tech at Gizmooz – innovative gadgets, smart home devices, and cutting-edge technology for a modern lifestyle. Free shipping on select items.',
    images: [
      {
        url: 'https://www.gizmooz.com/thumbnail.png',
        alt: 'Gizmooz - Tech & Innovation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gizmooz | Unlock the next level in tech and innovation',
    description:
      'Get the latest tech at Gizmooz – innovative gadgets, smart home devices, and cutting-edge technology for a modern lifestyle.',
    images: ['https://www.gizmooz.com/thumbnail.png'],
    creator: '@gizmooz',
    site: '@gizmooz',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-96x96.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-96x96.png',
      },
    ],
  },
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'e-commerce',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={quicksand.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to important third-party domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Organization Schema */}
        <Script id="organization-schema" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Gizmooz",
              "url": "https://www.gizmooz.com",
              "logo": "https://www.gizmooz.com/logo.png",
              "sameAs": [
                "https://www.facebook.com/gizmooz",
                "https://www.instagram.com/gizmooz",
                "https://twitter.com/gizmooz"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+61-000-000-000",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            }
          `}
        </Script>

        {/* Website Schema */}
        <Script id="website-schema" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Gizmooz",
              "url": "https://www.gizmooz.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.gizmooz.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </Script>
      </head>
      <body className={`${quicksand.className} min-h-screen flex flex-col`}>
        <SessionProvider>
          <header>
            <NavbarWrapper />
          </header>
          <main className="flex grainy-light flex-col mx-5 flex-grow">
            <div className="flex-1 flex flex-col h-full">{children}</div>
          </main>
          <Footer />
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
