import { ShopProvider } from '@/client/shop-provider'
import { fetchColors, fetchProducts } from '@/graphql'
import { Shop } from '../../../server/product-list'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Metadata } from 'next'

// Updated interface for Next.js 15 - params is now a Promise
export interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export const revalidate = 60

// Generate metadata function for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params

  // Get the formatted category name from the slug
  const categoryName = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `${categoryName} Collection | Gizmooz`,
    description: `Browse our ${categoryName} collection at Gizmooz. Discover the latest tech products and gadgets.`,
    keywords: `${categoryName}, tech, gadgets, electronics, ${category}`,
    alternates: {
      canonical: `https://www.gizmooz.com/collections/${category}`,
    },
    openGraph: {
      title: `${categoryName} Collection | Gizmooz`,
      description: `Browse our ${categoryName} collection at Gizmooz. Discover the latest tech products and gadgets.`,
      url: `https://www.gizmooz.com/collections/${category}`,
      siteName: 'Gizmooz',
      type: 'website',
      locale: 'en_AU',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Collection | Gizmooz`,
      description: `Browse our ${categoryName} collection at Gizmooz. Discover the latest tech products and gadgets.`,
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
      },
    },
  }
}

// Updated main function to await params
export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params in Next.js 15
  const { category } = await params

  const products = await fetchProducts(1, 0, { category: category })
  const colors = (await fetchColors(1)) || []

  // Get the formatted category name from the slug
  const categoryName = category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  if (!products || products.length === 0)
    return (
      <MaxWidthWrapper>
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>

            <h2 className="text-2xl font-semibold">Page not found</h2>

            <p className="text-muted-foreground text-lg">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>

            <div className="flex justify-center gap-2">
              <Button asChild variant="default">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    )

  return (
    <>
      <ShopProvider allProducts={products}>
        <Shop products={products} colors={colors} categoryName={categoryName} />
      </ShopProvider>
    </>
  )
}
