'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { cn } from '@/utils/ui'
import { Product, SimpleProduct } from '@/graphql'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useShopContext } from './shop-provider'
import { Image } from '@/components/ui/image'
import { useIsMobile } from '@/app/hooks/mobile'
import MaxWidthWrapper from '@/components/max-width-wrapper'

export interface ProductListingProps {
  products: Product[]
}

const pageSize = 12

export function ProductListing({ products }: ProductListingProps) {
  const { push } = useRouter()
  const isMobile = useIsMobile()
  const maxPages = isMobile ? 5 : 10
  const { products: filteredProducts, buildUrl, page } = useShopContext()
  const pageCount = Math.floor((filteredProducts || products).length / pageSize)
  const hasNext = page < pageCount
  const hasPrev = page > 1

  const displayProducts =
    filteredProducts?.slice((page - 1) * pageSize, page * pageSize) ||
    products.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (page > pageCount) {
      const url = buildUrl({ page: pageCount })
      push(url, { shallow: true } as any)
    }
  }, [pageCount])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* <p className="font-semibold mb-4">
        Showing {displayProducts.length} of {(filteredProducts || products).length} items
      </p> */}
        {displayProducts.map((product) => {
          const sourceUrl = product.image?.sourceUrl
          const altText = product.image?.altText || ''
          return (
            <Link href={`/product/${product.slug}`} key={product.id} className="col-span-1">
              <Card className="bg-white shadow rounded-sm hover:translate-y-[-0.04rem] hover:shadow-md duration-100 transition-transform overflow-hidden h-full">
                <CardHeader className="p-4">
                  <CardTitle className="font-serif whitespace-nowrap truncate w-full">
                    {product.name}
                  </CardTitle>
                  {sourceUrl && (
                    <Image
                      className="w-full"
                      src={sourceUrl}
                      alt={altText}
                      ratio={1 / 1}
                      fill
                      object-cover
                    />
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm truncate">{product.shortDescription}</p>
                </CardContent>
                <CardFooter className="p-4">
                  <p className="font-serif font-bold">{(product as SimpleProduct).price}</p>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="flex justify-center my-4 gap-x-2 text-sm">
        <Link
          href={buildUrl({ page: Math.max(page - 1, 1) })}
          role="button"
          className={cn(
            hasPrev ? 'text-primary-foreground' : 'text-gray-400 opacity-50 pointer-events-none',
            'self-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'bg-primary shadow hover:bg-primary/90 h-9 px-4 py-2'
          )}
          aria-label="Previous page"
          shallow
        >
          <i className="fa-solid fa-chevron-left leading-[0.95]" aria-hidden />
        </Link>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: Math.min(pageCount, maxPages) }).map((_, index) => {
            const pageNumber =
              page > Math.floor(maxPages / 2) ? page - Math.floor(maxPages / 2) + index : index + 1
            return (
              <Link
                key={index}
                href={buildUrl({ page: pageNumber })}
                role="button"
                className={cn(
                  page !== pageNumber
                    ? 'text-primary-foreground'
                    : 'text-gray-400 opacity-50 pointer-events-none',
                  'rounded-md text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                  'bg-primary shadow hover:bg-primary/90 h-9 px-4 py-2'
                )}
                aria-label={`Page ${pageNumber}`}
                shallow
              >
                {pageNumber}
              </Link>
            )
          })}
        </div>
        <Link
          href={buildUrl({ page: Math.min(page + 1, pageCount) })}
          role="button"
          className={cn(
            hasNext ? 'text-primary-foreground' : 'text-gray-400 opacity-50 pointer-events-none',
            'self-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'bg-primary shadow hover:bg-primary/90 h-9 px-4 py-2'
          )}
          aria-label="Next page"
          shallow
        >
          <i className="fa-solid fa-chevron-right" aria-hidden />
        </Link>
      </div>
    </>
  )
}
