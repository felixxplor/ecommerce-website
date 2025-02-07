'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { cn } from '@/utils/ui'
import { Product, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductWithPrice, useShopContext } from './shop-provider'
import { Image } from '@/components/ui/image'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import Pagination from '@/components/pagination'
import { useIsMobile } from '@/hooks/mobile'

export interface ProductGridProps {
  products: Product[]
}

const pageSize = 12

export function ProductGrid({ products }: ProductGridProps) {
  const { push } = useRouter()
  const isMobile = useIsMobile()
  const maxPages = isMobile ? 5 : 10
  const { products: filteredProducts, buildUrl, page } = useShopContext()
  const totalProducts = (filteredProducts || products).length
  const pageCount = Math.ceil((filteredProducts || products).length / pageSize)
  const searchParams = new URLSearchParams(window.location.search)
  const sortOrder = searchParams.get('sort') || ''

  const sortProducts = (productsToSort: Product[]) => {
    return [...productsToSort].sort((a, b) => {
      if (!sortOrder || sortOrder === '') {
        // Sort by publish date for "latest"
        const dateA = new Date(a.date || 0).getTime()
        const dateB = new Date(b.date || 0).getTime()
        return dateB - dateA
      }

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
    })
  }

  const handleSort = (value: string) => {
    const url = buildUrl({ sort: value, page: 1 })
    push(url)
  }

  const displayProducts = useMemo(() => {
    let sorted = sortOrder
      ? sortProducts(filteredProducts || products)
      : filteredProducts || products
    return sorted.slice((page - 1) * pageSize, page * pageSize)
  }, [filteredProducts, products, sortOrder, page])

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
        <select
          className="border rounded-md p-2 self-end"
          value={sortOrder}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="">Default sorting</option>
          <option value="latest">Sort by latest</option>
          <option value="price_asc">Sort by price: low to high</option>
          <option value="price_desc">Sort by price: high to low</option>
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
