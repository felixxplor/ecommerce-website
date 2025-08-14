'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Loader2, AlertTriangle } from 'lucide-react'
import { Product, ProductCategory, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { getClient } from '@/graphql'
import { print } from 'graphql'
import {
  GetProductReviewsDocument,
  GetProductReviewsQuery,
  StockStatusEnum,
} from '@/graphql/generated'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { ProductWithPrice } from './shop-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import { useDrawerStore } from '@/components/cart-drawer'

// Product interfaces
interface ProductWithPurchases extends Product {
  purchaseCount?: number
}

interface ReviewData {
  averageRating: number
  reviewCount: number
  ratingCounts: number[] // [5★, 4★, 3★, 2★, 1★]
}

interface ProductWithReviews extends Product {
  reviewData?: ReviewData
  isLoadingReviews?: boolean
}

// Helper function to check if product belongs to 'misc' category
const isProductHidden = (product: Product): boolean => {
  if (!product.productCategories?.nodes) {
    return false
  }

  return product.productCategories.nodes.some((category) => {
    const categoryNode = category as any
    return categoryNode?.name?.toLowerCase() === 'misc'
  })
}

// Helper function to filter products by category
const filterProductsByCategory = (products: Product[], categorySlug: string): Product[] => {
  if (categorySlug === 'all') {
    return products.filter((product) => !isProductHidden(product))
  }

  return products.filter((product) => {
    if (isProductHidden(product)) return false

    return product.productCategories?.nodes?.some((category) => {
      const categoryNode = category as any
      return categoryNode?.slug === categorySlug
    })
  })
}

// Helper to encode/decode IDs
function encodeId(type: string, id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format')
  }
  return btoa(`${type}:${numericId}`)
}

function decodeId(globalId: string): { type: string; id: number } {
  try {
    const decoded = atob(globalId)
    const [type, idStr] = decoded.split(':')
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      throw new Error('Invalid ID format')
    }
    return { type, id }
  } catch (error) {
    return { type: '', id: 0 }
  }
}

// Helper function to get purchase count
const getProductPurchases = (product: Product): number => {
  if (
    'purchaseCount' in product &&
    typeof (product as ProductWithPurchases).purchaseCount === 'number'
  ) {
    return (product as ProductWithPurchases).purchaseCount || 0
  }

  if (Array.isArray(product.metaData)) {
    const purchasesMeta = product.metaData.find((meta) => meta?.key === '_purchase_count')
    if (purchasesMeta && purchasesMeta.value) {
      return parseInt(purchasesMeta.value, 10)
    }
  }
  return 0
}

// Function to fetch and process reviews for a product
async function fetchAndProcessReviews(
  productId: string,
  rating?: number
): Promise<ReviewData | null> {
  try {
    const client = getClient()
    const wooSession = sessionStorage.getItem('woo-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', `Session ${wooSession}`)
    }

    let globalId: string
    try {
      const decodedId = decodeId(productId)
      globalId = decodedId.id ? productId : encodeId('product', productId)
    } catch {
      globalId = encodeId('product', productId)
    }

    const response = await client.request<GetProductReviewsQuery>(
      print(GetProductReviewsDocument),
      {
        id: globalId,
        rating: rating || null,
      }
    )

    if (!response.product?.reviews?.edges) {
      return null
    }

    const counts = [0, 0, 0, 0, 0] // [5★, 4★, 3★, 2★, 1★]

    const edges = response.product.reviews.edges || []
    edges.forEach((edge) => {
      if (edge?.rating && edge.rating >= 1 && edge.rating <= 5) {
        counts[5 - edge.rating]++
      }
    })

    const totalRating = edges.reduce((acc, edge) => acc + (edge?.rating || 0), 0)
    const avgRating = edges.length > 0 ? totalRating / edges.length : 0

    return {
      averageRating: avgRating,
      reviewCount: edges.length,
      ratingCounts: counts,
    }
  } catch (error) {
    return null
  }
}

// Individual product card component
function ProductCard({ product }: { product: ProductWithReviews }) {
  const { toast } = useToast()
  const [executing, setExecuting] = useState<boolean>(false)
  const { rawPrice, databaseId, soldIndividually, stockStatus, stockQuantity } =
    product as ProductWithPrice
  const { fetching, mutate } = useCartMutations(databaseId)
  const { onOpen } = useDrawerStore()

  const outOfStock =
    stockStatus === StockStatusEnum.OUT_OF_STOCK ||
    (stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0)

  const isOnSale = product.onSale
  let price = ''
  let regularPrice = ''

  const simpleProduct = product as SimpleProduct
  if (simpleProduct.price) {
    price = simpleProduct.price
  }

  if (simpleProduct.regularPrice) {
    regularPrice = simpleProduct.regularPrice
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (executing || fetching) return

    setExecuting(true)
    try {
      await mutate({
        mutation: 'add',
        quantity: 1,
      })

      toast({
        title: 'Added to cart',
        description: `1 × ${product.name}`,
        duration: 3000,
      })

      onOpen()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setExecuting(false)
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Sale badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Sale
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-50">
          {product.image?.sourceUrl && (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name || ''}
              width={300}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.isLoadingReviews ? (
            <div className="flex items-center justify-center py-1 mb-2">
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      product.reviewData &&
                      product.reviewData.averageRating &&
                      i < Math.round(product.reviewData.averageRating)
                        ? 'fill-current'
                        : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.reviewData?.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            {isOnSale && regularPrice ? (
              <>
                <span className="text-sm font-semibold text-red-600">{price}</span>
                <span className="text-xs text-gray-500 line-through">{regularPrice}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-gray-900">{price}</span>
            )}
          </div>

          {/* Add to Cart Button */}
          {outOfStock ? (
            <div className="text-center py-2 text-red-600 text-xs font-medium">Out of Stock</div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={executing || fetching}
              className="w-full bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {executing || fetching ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner className="w-3 h-3 mr-1" noText />
                  Adding...
                </div>
              ) : (
                'Add to Cart'
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

// Shuffle array function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Props interface for HomepageGridClient
interface HomepageGridClientProps {
  products: Product[]
  categories?: ProductCategory[]
  title?: string
}

export default function HomepageGridClient({
  products,
  categories = [],
  title = 'Featured Products',
}: HomepageGridClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('recommend')
  const [productsWithReviews, setProductsWithReviews] = useState<ProductWithReviews[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Prepare category options - First 4 categories plus "Recommend"
  const categoryOptions = [
    { name: 'Recommend', slug: 'recommend' },
    ...categories.slice(0, 3).map((cat) => ({ name: cat.name || '', slug: cat.slug || '' })),
  ]

  useEffect(() => {
    const prepareProducts = async () => {
      if (!products || products.length === 0) {
        setIsLoading(false)
        return
      }

      let filteredProducts: Product[] = []

      if (selectedCategory === 'recommend') {
        // For "Recommend", show random products from all categories
        const visibleProducts = products.filter((product) => !isProductHidden(product))
        filteredProducts = shuffleArray(visibleProducts).slice(0, 8)
      } else {
        // Filter by specific category
        filteredProducts = filterProductsByCategory(products, selectedCategory).slice(0, 8)
      }

      const productsWithLoadingState = filteredProducts.map((product) => ({
        ...product,
        isLoadingReviews: true,
      }))

      setProductsWithReviews(productsWithLoadingState)
      setIsLoading(false)

      // Fetch reviews for each product
      const updatedProducts = await Promise.all(
        productsWithLoadingState.map(async (product) => {
          const reviewData = await fetchAndProcessReviews(product.id)
          return {
            ...product,
            reviewData: reviewData || undefined,
            isLoadingReviews: false,
          }
        })
      )

      setProductsWithReviews(updatedProducts)
    }

    prepareProducts()
  }, [products, selectedCategory])

  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full py-6">
      <MaxWidthWrapper className="px-4 sm:px-5">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {categoryOptions.map((category) => (
            <button
              key={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                selectedCategory === category.slug
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {productsWithReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {productsWithReviews.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </MaxWidthWrapper>
    </div>
  )
}
