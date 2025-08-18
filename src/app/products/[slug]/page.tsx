import { ShopProduct } from '@/server/shop-product'
import { ProductProvider } from '@/client/product-provider'
import MainPolicies from '@/components/main-policies'
import { fetchProductBy, ProductIdTypeEnum } from '@/graphql'
import Navbar from '@/components/navbar'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Metadata } from 'next'

// Updated interface for Next.js 15 - params is now a Promise
export interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 60

// generateMetadata function is already correct for Next.js 15
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const product = await fetchProductBy(slug, ProductIdTypeEnum.SLUG)

    if (!product) {
      return {
        title: 'Product Not Found | Gizmooz',
        description: 'Sorry, the requested product could not be found.',
      }
    }

    // Create clean description without HTML tags
    const cleanDescription = product.shortDescription
      ? String(product.shortDescription).replace(/<[^>]*>/g, '')
      : 'Discover the latest in tech innovation with this product from Gizmooz'

    // Safely access product properties
    // Assuming SimpleProduct or VariableProduct has the specific properties
    const productPrice = 'price' in product ? product.price : undefined
    const productStockStatus = 'stockStatus' in product ? product.stockStatus : undefined
    const productSku = 'sku' in product ? product.sku : undefined
    const reviewCount = 'reviewCount' in product ? product.reviewCount : undefined
    const averageRating = 'averageRating' in product ? product.averageRating : undefined

    // Use productCategories instead of categories
    const categories = product.productCategories?.nodes || []
    const categoryNames = categories
      .map((cat) => {
        // Type assertion to access category name
        // Cast to any or a more specific type if you have one
        return (cat as any)?.name
      })
      .filter(Boolean)
      .join(', ')

    // Create structured data object
    const structuredData: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: cleanDescription,
      image: product.image?.sourceUrl,
      sku: productSku || undefined,
      mpn: productSku || undefined,
      brand: {
        '@type': 'Brand',
        name: 'Gizmooz',
      },
      offers: {
        '@type': 'Offer',
        price: productPrice ? String(productPrice).replace(/[^\d.]/g, '') : undefined,
        priceCurrency: 'AUD',
        availability:
          productStockStatus === 'IN_STOCK'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        url: `https://gizmooz.com/products/${slug}`,
      },
    }

    // Add aggregate rating if available
    if (averageRating && reviewCount) {
      structuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: reviewCount,
      }
    }

    return {
      title: `${product.name || 'Product'} | Gizmooz`,
      description: cleanDescription,
      openGraph: {
        title: product.name || 'Product',
        description: cleanDescription,
        images: product.image?.sourceUrl ? [{ url: product.image.sourceUrl }] : undefined,
        type: 'website',
        siteName: 'Gizmooz',
        locale: 'en_AU',
        url: `https://gizmooz.com/products/${slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name || 'Product',
        description: cleanDescription,
        images: product.image?.sourceUrl ? [product.image.sourceUrl] : undefined,
      },
      // Use alternates for canonical URL
      alternates: {
        canonical: `https://gizmooz.com/products/${slug}`,
      },
      // Keywords and robots data
      keywords: categoryNames || 'tech, gadgets, electronics',
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
      // Add structured data script
      other: {
        'script:ld+json': JSON.stringify(structuredData),
      },
    }
  } catch (error) {
    // console.error('Error generating metadata:', error)
    return {
      title: 'Product | Gizmooz',
      description: 'Explore our tech products at Gizmooz',
    }
  }
}

// Updated main function to await params
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await fetchProductBy(slug, ProductIdTypeEnum.SLUG)

  if (!slug || !product)
    return (
      <MaxWidthWrapper>
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>

            <h2 className="text-2xl font-semibold">Page not found</h2>

            <p className="text-muted-foreground text-lg">
              Sorry, we couldn't find the page you're looking for.
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
      <ProductProvider product={product}>
        <ShopProduct product={product} />
        <MainPolicies />
      </ProductProvider>
    </>
  )
}
