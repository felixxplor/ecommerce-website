'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { getClient } from '@/graphql'
import { print } from 'graphql'
import {
  GetProductReviewsDocument,
  GetProductReviewsQuery,
  StockStatusEnum,
} from '@/graphql/generated'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { buttonVariants } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { ProductWithPrice } from './shop-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import { useDrawerStore } from '@/components/cart-drawer'
import { cn } from '@/utils/ui'

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
  // Check if product has categories
  if (!product.productCategories?.nodes) {
    return false
  }

  // Check if any category has name 'misc' (case-insensitive)
  return product.productCategories.nodes.some((category) => {
    // Cast to the proper category type or check if it has the name property
    const categoryNode = category as any
    return categoryNode?.name?.toLowerCase() === 'misc'
  })
}

// Helper function to filter out hidden products
const filterVisibleProducts = (products: Product[]): Product[] => {
  return products.filter((product) => !isProductHidden(product))
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
    // console.error('Error decoding ID:', error)
    return { type: '', id: 0 }
  }
}

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

    // Calculate rating counts
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
    // console.error('Error fetching reviews:', error)
    return null
  }
}

// Individual product card component with border
function ProductCard({ product }: { product: ProductWithReviews }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
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

  // Handle rating filter
  const handleRatingFilter = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating)
  }

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()

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

export default function TopSellingProductsClient({
  products,
  title = 'Top Picks',
}: {
  products: Product[]
  title?: string
}) {
  const [productsWithReviews, setProductsWithReviews] = useState<ProductWithReviews[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Touch handling states
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  // Responsive configuration
  const [itemsPerSlide, setItemsPerSlide] = useState(4)
  const [totalSlides, setTotalSlides] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      let visibleItems
      if (window.innerWidth < 640) {
        visibleItems = 3.3 // 3.3 items visible on mobile (showing partial fourth)
      } else if (window.innerWidth < 1024) {
        visibleItems = 3.3 // 3.3 items visible on tablet (showing partial fourth)
      } else {
        visibleItems = 4.5 // 4.5 items visible on desktop (showing partial fifth)
      }

      setItemsPerSlide(Math.floor(visibleItems))

      // Calculate total slides - subtract the visible items and add 1
      if (productsWithReviews.length > 0) {
        const maxSlides = Math.max(0, productsWithReviews.length - Math.floor(visibleItems))
        setTotalSlides(maxSlides + 1)
      }
    }

    handleResize() // Initial call
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [productsWithReviews.length])

  useEffect(() => {
    const prepareProducts = async () => {
      if (!products || products.length === 0) {
        setIsLoading(false)
        return
      }

      // Filter out hidden products first, then sort by purchase count and get top 8
      const visibleProducts = filterVisibleProducts(products)
      const topSellingProducts = [...visibleProducts]
        .sort((a, b) => getProductPurchases(b) - getProductPurchases(a))
        .slice(0, 8)
        .map((product) => ({
          ...product,
          isLoadingReviews: true,
        }))

      setProductsWithReviews(topSellingProducts)
      setIsLoading(false)

      // Calculate total slides based on number of products
      setTotalSlides(Math.ceil(topSellingProducts.length / itemsPerSlide))

      // Fetch reviews for each product
      const updatedProducts = await Promise.all(
        topSellingProducts.map(async (product) => {
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
  }, [products, itemsPerSlide])

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      goToNextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      goToPrevSlide()
    }
  }

  // Slide navigation functions
  const goToSlide = (index: number) => {
    setCurrentSlide(Math.min(index, totalSlides - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0))
  }

  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (productsWithReviews.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-full py-8 sm:py-14 text-xl sm:text-2xl text-balance leading-normal">
      <MaxWidthWrapper>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-extrabold">{title}</h2>
          <Link href="/collections?sort=popular" className="flex items-center">
            <span className="text-sm font-medium underline underline-offset-2">See all</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 ml-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
              />
            </svg>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons - Hidden on mobile */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute -left-4 top-1/3 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 hidden sm:block"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute -right-4 top-1/3 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 hidden sm:block"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Products Carousel with Touch Support */}
          <div
            ref={carouselRef}
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex gap-2 sm:gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / itemsPerSlide)}%)`,
                width: `${(productsWithReviews.length / itemsPerSlide) * 100}%`,
              }}
            >
              {/* Display all products in a single row */}
              {productsWithReviews.map((product) => (
                <div
                  key={product.id}
                  className="flex-none"
                  style={{
                    width: `calc(${100 / itemsPerSlide}% - ${
                      (itemsPerSlide - 1) *
                      (itemsPerSlide === 2 ? 0.5 : itemsPerSlide === 3 ? 0.67 : 0.75)
                    }rem / ${itemsPerSlide})`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={currentSlide === index ? 'true' : 'false'}
                />
              ))}
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
