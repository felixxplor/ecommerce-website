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
import Pagination from '@/components/pagination'

export interface ProductListingProps {
  products: Product[]
}

const pageSize = 12

export function ProductListing({ products }: ProductListingProps) {
  const { push } = useRouter()
  const isMobile = useIsMobile()
  const maxPages = isMobile ? 5 : 10
  const { products: filteredProducts, buildUrl, page } = useShopContext()
  const totalProducts = (filteredProducts || products).length
  const pageCount = Math.ceil((filteredProducts || products).length / pageSize)
  const hasNext = page < pageCount
  const hasPrev = page > 1

  const displayProducts =
    filteredProducts?.slice((page - 1) * pageSize, page * pageSize) ||
    products.slice((page - 1) * pageSize, page * pageSize)

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalProducts)

  useEffect(() => {
    if (page > pageCount) {
      const url = buildUrl({ page: pageCount })
      push(url, { shallow: true } as any)
    }
  }, [pageCount])

  return (
    <>
      <div className="flex items-center justify-between mb-6 w-full">
        <div className="mb-4 text-sm text-gray-600">
          Showing {startIndex}–{endIndex} of {totalProducts} results
        </div>
        <select className="border rounded-md p-2 self-end">
          <option>Sort by latest</option>
          <option>Sort by price: low to high</option>
          <option>Sort by price: high to low</option>
        </select>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
        {displayProducts.map((product) => {
          const sourceUrl = product.image?.sourceUrl
          const altText = product.image?.altText || ''
          return (
            <Link href={`/products/${product.slug}`} key={product.id} className="group">
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                {sourceUrl && (
                  <Image
                    src={sourceUrl}
                    alt={altText}
                    ratio={1 / 1}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <button
                  className="absolute bottom-4 right-4 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Add to cart"
                >
                  Add to cart
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{(product as SimpleProduct).price}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="flex justify-center items-center gap-3 mt-8">
        <Pagination pageCount={pageCount} />
      </div>
    </>
  )
}
