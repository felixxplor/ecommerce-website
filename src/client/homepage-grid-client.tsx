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

// Individual product card component with matching style
function ProductCard({ product }: { product: ProductWithReviews }) {
  const { toast } = useToast()
  const [executing, setExecuting] = useState<boolean>(false)
  const { rawPrice, databaseId, soldIndividually, stockStatus, stockQuantity } =
    product as ProductWithPrice
  const { fetching, mutate } = useCartMutations(databaseId)
  const { onOpen } = useDrawerStore()

  // Check if product is out of stock
  const outOfStock =
    stockStatus === StockStatusEnum.OUT_OF_STOCK ||
    (stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0)

  // Display price information
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

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent multiple clicks
    if (executing || fetching) return

    setExecuting(true)
    try {
      await mutate({
        mutation: 'add',
        quantity: 1, // Default to 1 for quick add
      })

      toast({
        title: 'Added to cart',
        description: `1 × ${product.name}`,
        duration: 3000,
      })

      onOpen() // Open the cart drawer
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
    <div className="flex-shrink-0 w-full border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow duration-300">
      {/* Product Image with Sale Badge */}
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="relative">
          {isOnSale && (
            <div className="absolute top-0 left-0 z-10">
              <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-br-lg">
                Sale
              </span>
            </div>
          )}

          <div className="aspect-square overflow-hidden relative rounded-t-lg">
            {product.image?.sourceUrl && (
              <>
                <Image
                  src={product.image.sourceUrl}
                  alt={product.image.altText || product.name || ''}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 flex flex-col">
        <Link href={`/products/${product.slug}`} className="block group">
          <h3 className="mb-1 text-sm font-semibold truncate">
            <span className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black group-hover:after:w-full after:transition-all after:duration-300">
              {product.name}
            </span>
          </h3>
        </Link>

        {/* Price */}
        {isOnSale && regularPrice ? (
          <div className="mb-2">
            <div className="text-sm font-semibold text-red-600">{price}</div>
            <div className="text-xs text-gray-500">
              <span>Was </span>
              <span className="line-through">{regularPrice}</span>
            </div>
          </div>
        ) : (
          <div className="mb-2 text-sm font-medium">{price}</div>
        )}

        {/* Ratings Section */}
        {product.isLoadingReviews ? (
          <div className="flex items-center justify-center py-1 mb-2">
            <Loader2 className="w-3 h-3 animate-spin" />
          </div>
        ) : (
          <div className="mb-2">
            <div className="flex items-center gap-1">
              <div className="text-xs font-medium">
                {product.reviewData && product.reviewData.averageRating
                  ? product.reviewData.averageRating.toFixed(1)
                  : '0.0'}
              </div>
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
              <p className="text-xs">
                (
                {product.reviewData && product.reviewData.reviewCount
                  ? product.reviewData.reviewCount
                  : 0}
                )
              </p>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        {outOfStock ? (
          <div className="inline-flex items-center gap-1 text-red-700 py-1 rounded-md whitespace-nowrap text-xs">
            <AlertTriangle className="h-3 w-3" />
            <span className="font-medium">Out of Stock</span>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={executing || fetching}
            className="w-full text-xs font-medium px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-1 min-h-[32px]"
          >
            {executing || fetching ? (
              <>
                <LoadingSpinner className="h-3 w-3" noText />
                <span>Adding...</span>
              </>
            ) : (
              'Add to cart'
            )}
          </button>
        )}
      </div>
    </div>
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

  // Debug: Log categories to see what we're getting
  console.log('Categories received:', categories)
  console.log('Categories length:', categories?.length)

  // Filter categories to exclude 'misc' and get visible ones
  const visibleCategories =
    categories?.filter((cat) => {
      const categoryName = cat.name?.toLowerCase() || ''
      return categoryName !== 'misc' && cat.name && cat.slug
    }) || []

  console.log('Visible categories after filtering:', visibleCategories)

  // Prepare category options - Show more categories if available
  const categoryOptions = [
    { name: 'Recommend', slug: 'recommend' },
    // Take up to 5 visible categories instead of 3
    ...visibleCategories.slice(0, 5).map((cat) => ({
      name: cat.name || '',
      slug: cat.slug || '',
    })),
  ]

  console.log('Final category options:', categoryOptions)

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
        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <p>Debug: Categories count: {categories?.length || 0}</p>
            <p>Debug: Visible categories: {visibleCategories.length}</p>
            <p>Debug: Category options: {categoryOptions.length}</p>
            {categoryOptions.map((cat) => (
              <span key={cat.slug} className="inline-block mr-2 mb-1 px-2 py-1 bg-white rounded">
                {cat.name}
              </span>
            ))}
          </div>
        )}

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

        {/* Show message if no categories are available */}
        {categoryOptions.length === 1 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            No product categories found. Only showing recommended products.
          </div>
        )}

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
