'use client'

import { useEffect, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { cn } from '@/utils/ui'
import { Product, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductWithPrice, useShopContext } from './shop-provider'
import { Image } from '@/components/ui/image'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import Pagination from '@/components/pagination'
import { useIsMobile } from '@/hooks/mobile'
import { Montserrat } from 'next/font/google'

export interface ProductGridProps {
  products: Product[]
}

// Define types for MetaData
type Maybe<T> = T | null | undefined

interface MetaData {
  key?: Maybe<string>
  value?: Maybe<string>
}

// Update the Product interface to include purchaseCount
interface ProductWithPurchases extends Product {
  purchaseCount?: number
}

const pageSize = 12

// Helper function to get purchase count
const getProductPurchases = (product: Product): number => {
  // If the product has the purchaseCount field directly (from GraphQL)
  if (
    'purchaseCount' in product &&
    typeof (product as ProductWithPurchases).purchaseCount === 'number'
  ) {
    return (product as ProductWithPurchases).purchaseCount || 0
  }

  // Fallback to check in metaData if direct field is not available
  if (Array.isArray(product.metaData)) {
    const purchasesMeta = product.metaData.find((meta) => meta?.key === '_purchase_count')
    if (purchasesMeta && purchasesMeta.value) {
      return parseInt(purchasesMeta.value, 10)
    }
  }
  return 0
}

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Create a separate component for the grid content that uses useSearchParams
function ProductGridContent({ products }: ProductGridProps) {
  const { push } = useRouter()
  const isMobile = useIsMobile()
  const maxPages = isMobile ? 5 : 10
  const { products: filteredProducts, buildUrl, page } = useShopContext()
  const totalProducts = (filteredProducts || products).length
  const pageCount = Math.ceil((filteredProducts || products).length / pageSize)

  // Use Next.js searchParams hook instead of window.location
  const searchParams = useSearchParams()
  const sortOrder = searchParams.get('sort') || ''

  const sortProducts = (productsToSort: Product[]) => {
    return [...productsToSort].sort((a, b) => {
      // Handle different sort options with explicit cases
      switch (sortOrder) {
        case 'popular':
          // Sort by purchase count instead of total_sales
          const aPurchases = getProductPurchases(a)
          const bPurchases = getProductPurchases(b)
          return bPurchases - aPurchases // Higher purchase count first

        case 'latest':
          // Sort by publish date
          const dateA = new Date(a.date || 0).getTime()
          const dateB = new Date(b.date || 0).getTime()
          return dateB - dateA // Newest first

        case 'price_asc':
        case 'price_desc':
          // Price sorting logic
          const getPriceValue = (product: Product) => {
            const stringPrice = (product as ProductWithPrice).rawPrice
            if (!stringPrice) return 0

            if (product.type === ProductTypesEnum.VARIABLE) {
              const prices = stringPrice.split(',').map(Number)
              return prices.sort()[0]
            }
            return Number(stringPrice)
          }

          const priceA = getPriceValue(a)
          const priceB = getPriceValue(b)

          return sortOrder === 'price_desc' ? priceB - priceA : priceA - priceB

        default:
          // Default sorting by date (for empty or unrecognized sort values)
          const defaultDateA = new Date(a.date || 0).getTime()
          const defaultDateB = new Date(b.date || 0).getTime()
          return defaultDateB - defaultDateA
      }
    })
  }

  const handleSort = (value: string) => {
    const url = buildUrl({ sort: value, page: 1 })
    push(url)
  }

  const displayProducts = useMemo(() => {
    let sorted = sortProducts(filteredProducts || products)
    return sorted.slice((page - 1) * pageSize, page * pageSize)
  }, [filteredProducts, products, sortOrder, page])

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalProducts)

  useEffect(() => {
    if (page > pageCount) {
      const url = buildUrl({ page: pageCount })
      push(url, { shallow: true } as any)
    }
  }, [pageCount, page, buildUrl, push])

  return (
    // Responsive ProductGrid component
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 w-full">
        <div className="mb-2 sm:mb-0 text-sm text-gray-600">
          Showing {startIndex}–{endIndex} of {totalProducts} results
        </div>
        <select
          className="border rounded-md p-2 self-end w-full sm:w-auto"
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="">Default sorting</option>
          <option value="popular">Sort by popularity</option>
          <option value="latest">Sort by latest</option>
          <option value="price_asc">Sort by price: low to high</option>
          <option value="price_desc">Sort by price: high to low</option>
        </select>
      </div>

      {/* Product grid with cards that have thin border and shadow - without add to cart button */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {displayProducts.map((product) => {
          const sourceUrl = product.image?.sourceUrl
          const altText = product.image?.altText || ''
          return (
            <Link href={`/products/${product.slug}`} key={product.id} className="group">
              {/* Card container with border and shadow */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                {/* Image container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {sourceUrl && (
                    <Image
                      src={sourceUrl}
                      alt={altText}
                      ratio={1 / 1}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Product info section */}
                <div className="p-3 flex flex-col justify-between flex-grow">
                  {/* Store name/brand badge */}
                  <div>
                    <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem] mb-1">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price section */}
                  <div>
                    {/* Large price display */}
                    <div className="flex items-baseline mb-1">
                      <span
                        className={`text-xl font-semibold text-gray-900 ${montserrat.className}`}
                      >
                        ${(product as SimpleProduct).price?.replace(/[^0-9.]/g, '')}
                      </span>
                      <span className="ml-2 text-gray-500">
                        <span>Was</span>{' '}
                        <span className="line-through">
                          ${(product as SimpleProduct).regularPrice?.replace(/[^0-9.]/g, '')}
                        </span>
                      </span>
                    </div>

                    {/* Free delivery text */}
                    <p className="text-sm font-semibold text-gray-800 uppercase">FREE DELIVERY</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex justify-center items-center gap-3 mt-6 sm:mt-8">
        <Pagination pageCount={pageCount} />
      </div>
    </>
  )
}

// Fallback component for Suspense
function ProductGridSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 w-full">
        <div className="h-4 bg-gray-200 rounded w-48 mb-2 sm:mb-0"></div>
        <div className="h-10 bg-gray-200 rounded w-full sm:w-48"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mt-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main ProductGrid component with Suspense boundary
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductGridContent products={products} />
    </Suspense>
  )
}
