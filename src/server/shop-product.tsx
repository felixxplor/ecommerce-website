import { ProductImage } from '@/client/product-image'
import { Product, SimpleProduct, VariationAttribute } from '@/graphql'
import { CartOptions } from './cart-options'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ProductWithPrice } from '@/client/shop-provider'
import { ReviewsSection } from '@/components/review-section'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Truck, Star, AlertTriangle } from 'lucide-react'
import { getClient } from '@/graphql'
import { print } from 'graphql'
import {
  GetProductReviewsDocument,
  GetProductReviewsQuery,
  GetRelatedProductsByCategoryDocument,
  GetRelatedProductsByCategoryQuery,
} from '@/graphql/generated'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/ui'

// Import our components
import { SecurePaymentInfo } from '@/components/secure-payment-info'
import { RelatedProducts } from '@/components/related-products'
import MobileBottomCart from '@/components/mobile-bottom-cart'

export interface ShopProductProps {
  product: Product
  tab?: string
}

interface ProductCategory {
  id: string
  name: string
  slug: string
  databaseId: number
  count: number
  description: string | null
  image: {
    sourceUrl: string
    altText: string
  } | null
}

async function getProductReviews(productId: string) {
  try {
    const client = getClient()

    let globalId: string
    try {
      const decoded = atob(productId)
      const [type, idStr] = decoded.split(':')
      const id = parseInt(idStr, 10)
      globalId = id ? productId : btoa(`product:${productId}`)
    } catch {
      globalId = btoa(`product:${productId}`)
    }

    const response = await client.request<GetProductReviewsQuery>(
      print(GetProductReviewsDocument),
      { id: globalId }
    )

    if (response.product?.reviews?.edges) {
      const edges = response.product.reviews.edges || []
      const totalRating = edges.reduce((acc, edge) => acc + (edge?.rating || 0), 0)
      const avgRating = edges.length > 0 ? totalRating / edges.length : 0

      return {
        reviewCount: edges.length,
        averageRating: avgRating,
      }
    }

    return {
      reviewCount: 0,
      averageRating: 0,
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return {
      reviewCount: 0,
      averageRating: 0,
    }
  }
}

async function getRelatedProducts(
  productId: string,
  categories: ProductCategory[],
  limit: number = 6
) {
  // If there are no categories, return empty array
  if (!categories || categories.length === 0) {
    return []
  }

  try {
    // Extract category IDs (databaseId is more reliable for WooCommerce)
    const categoryIds = categories
      .map((category) => parseInt(String(category.databaseId), 10))
      .filter((id) => !isNaN(id))

    // Check if we have valid category IDs
    if (!categoryIds.length) {
      return []
    }

    // Extract product database ID from global ID
    let productDatabaseId: number
    try {
      const decoded = atob(productId)
      const [type, idStr] = decoded.split(':')
      productDatabaseId = parseInt(idStr, 10)

      // If we couldn't parse a valid number, try using the ID directly
      if (isNaN(productDatabaseId)) {
        productDatabaseId = parseInt(productId, 10)
      }
    } catch (error) {
      // If decoding fails, try using the ID directly
      productDatabaseId = parseInt(productId, 10)
    }

    // If we still don't have a valid ID, return empty array
    if (isNaN(productDatabaseId)) {
      console.error('Could not determine product database ID for related products')
      return []
    }

    const client = getClient()

    // Try each category individually and collect all related products
    let allRelatedProducts: any[] = []

    // Process categories one at a time to find related products
    for (const categoryId of categoryIds) {
      const response = await client.request<GetRelatedProductsByCategoryQuery>(
        print(GetRelatedProductsByCategoryDocument),
        {
          categoryId,
          excludeId: productDatabaseId,
          first: Math.min(limit, 20), // Limit per category
        }
      )

      if (response.products?.nodes && response.products.nodes.length > 0) {
        allRelatedProducts = [...allRelatedProducts, ...response.products.nodes]
      }
    }

    // Remove duplicates (in case a product belongs to multiple categories)
    const uniqueProducts = allRelatedProducts.reduce((acc: any[], product: any) => {
      if (!acc.some((p) => p.id === product.id)) {
        acc.push(product)
      }
      return acc
    }, [])

    // If we have more products than needed, randomly select 'limit' products
    if (uniqueProducts.length > limit) {
      const shuffled = [...uniqueProducts].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, limit)
    }

    return uniqueProducts
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function ShopProduct({ product, tab = 'description' }: ShopProductProps) {
  const { rawPrice } = product as ProductWithPrice
  const categories = product.productCategories?.nodes || []

  // Hard-coded free shipping badge
  const hasFreeShipping = true

  // Check if product has 'Sales' category specifically
  const hasSalesCategory = categories.some(
    (category) => (category as ProductCategory).name === 'Sales'
  )

  // Get reviews data server-side
  const { reviewCount, averageRating } = await getProductReviews(product.id)

  // Get related products based on categories
  const relatedProducts = await getRelatedProducts(product.id, categories as ProductCategory[])

  // Check product stock status
  const stockStatus = (product as SimpleProduct).stockStatus
  const stockQuantity = (product as SimpleProduct).stockQuantity
  const isOutOfStock =
    stockStatus === 'OUT_OF_STOCK' || (stockQuantity !== null && (stockQuantity as number) <= 0)

  const attributes: Record<string, string[]> =
    (product as SimpleProduct).defaultAttributes?.nodes?.reduce((attributesList, attribute) => {
      const { value, label } = attribute as VariationAttribute

      const currentAttributes = attributesList[label as string] || []
      return {
        ...attributesList,
        [label as string]: [...currentAttributes, value as string],
      }
    }, {} as Record<string, string[]>) || {}

  return (
    <div className="bg-[#f6f5f2]">
      <MaxWidthWrapper className="py-6 sm:py-12 mb-12 sm:mb-20 lg:mb-0">
        {/* Single white background container for both columns */}
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm mb-8 sm:mb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
            {/* Left column: Image and tabs (scrolls normally) - 2/3 width on md+ screens */}
            <div className="lg:col-span-2">
              <div className="max-w-full mx-auto md:max-w-lg">
                <ProductImage product={product} />
              </div>

              {/* Small screen product header section - All elements consolidated here for screens below 976px (lg breakpoint) */}
              <div className="lg:hidden mt-6 space-y-4">
                <h1 className="text-3xl font-medium mb-2">{product.name}</h1>

                {/* Review Count Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <a
                    href="#reviews"
                    className="text-sm cursor-pointer hover:text-primary transition-colors underline"
                  >
                    {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                  </a>
                </div>

                {/* Product Badges Section - Small screen version */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Sales badge if category is specifically "Sales" */}
                  {hasSalesCategory && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 h-8">
                      Sale
                    </Badge>
                  )}

                  {/* Free shipping badge */}
                  {hasFreeShipping && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 px-3 py-1 h-8">
                      <Truck className="h-3 w-3" />
                      Free Shipping
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline mb-4">
                  <span className="text-2xl font-semibold text-gray-900">
                    ${(product as SimpleProduct).price?.replace(/[^0-9.]/g, '')}
                  </span>
                </div>

                {/* Small screen shipping information */}
                <div className="flex items-center gap-2 mt-6 text-gray-700">
                  <Truck className="h-4 w-4" />
                  <p className="text-sm">
                    Leave warehouses in <b>1-2 business days</b>
                  </p>
                </div>

                {/* Small screen payment info */}
                <div className="mt-4">
                  <SecurePaymentInfo />
                </div>
              </div>

              {/* Tabs section in left column */}
              <Tabs defaultValue={tab} className="w-full mt-8">
                <TabsList className="border-b border-gray-200 w-full flex gap-4 sm:gap-8 h-auto bg-transparent mb-6 overflow-x-auto scrollbar-hide">
                  <TabsTrigger
                    value="description"
                    className="px-2 sm:px-4 py-3 text-sm sm:text-base font-semibold data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-gray-600 hover:text-black rounded-none border-b-2 border-transparent whitespace-nowrap"
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="additional"
                    className="px-2 sm:px-4 py-3 text-sm sm:text-base font-semibold data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-gray-600 hover:text-black rounded-none border-b-2 border-transparent whitespace-nowrap"
                  >
                    Additional Info
                  </TabsTrigger>
                </TabsList>

                <div>
                  <TabsContent value="description">
                    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium wp-content">
                      <div dangerouslySetInnerHTML={{ __html: product.description as string }} />
                    </div>
                  </TabsContent>

                  <TabsContent value="additional">
                    <div className="space-y-6">
                      {Object.entries(attributes).map(([label, values]) => (
                        <div key={label} className="border-l-4 border-gray-200 pl-4">
                          <h3 className="font-serif font-medium text-base sm:text-lg mb-2">
                            {label}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {values.map((value) => (
                              <Badge
                                key={value}
                                variant="outline"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 sm:px-3 py-1 h-7 sm:h-8 text-xs sm:text-sm"
                              >
                                {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div
                        dangerouslySetInnerHTML={{ __html: product.shortDescription as string }}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Right column: Product info and cart options (sticky) - hidden below 976px (lg breakpoint) */}
            <div className="hidden lg:flex lg:col-span-1 lg:sticky lg:top-24 lg:self-start flex-col h-fit">
              <h1 className="font-serif text-4xl lg:text-5xl font-medium mb-2">{product.name}</h1>

              {/* Review Count Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <a
                  href="#reviews"
                  className="text-sm cursor-pointer hover:text-primary transition-colors underline"
                >
                  {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                </a>
              </div>

              {/* Product Badges Section */}
              <div className="flex flex-wrap gap-2 mb-6">
                {/* Sales badge if category is specifically "Sales" */}
                {hasSalesCategory && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 h-8">
                    Sale
                  </Badge>
                )}

                {/* Free shipping badge */}
                {hasFreeShipping && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 px-3 py-1 h-8">
                    <Truck className="h-3 w-3" />
                    Free Shipping
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-semibold text-gray-900">
                  ${(product as SimpleProduct).price?.replace(/[^0-9.]/g, '')}
                </span>
              </div>

              {/* Conditionally render CartOptions or Out of Stock message */}
              {isOutOfStock ? (
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">Out of Stock</span>
                </div>
              ) : (
                <CartOptions product={product} />
              )}

              {/* Shipping Information */}
              <div className="flex items-center gap-2 mt-4 text-gray-700">
                <Truck className="h-4 w-4" />
                <p className="text-sm">
                  Leave warehouses in <b>1-2 business days</b>
                </p>
              </div>

              {/* Add the SecurePaymentInfo component below */}
              <div className="mt-4">
                <SecurePaymentInfo />
              </div>
            </div>
          </div>
        </div>

        {/* Add the MobileBottomCart component which handles showing only below 976px */}
        <MobileBottomCart product={product} isOutOfStock={isOutOfStock} />

        {relatedProducts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-medium mb-4 sm:mb-6 px-1 sm:px-0">
              You May Also Like
            </h2>
            <div className="bg-white rounded-lg p-4 sm:p-8 shadow-sm overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {relatedProducts.map((relatedProduct) => {
                  const sourceUrl = relatedProduct.image?.sourceUrl
                  const altText = relatedProduct.image?.altText || relatedProduct.name || ''
                  return (
                    <Link
                      href={`/products/${relatedProduct.slug}`}
                      key={relatedProduct.id}
                      className="group"
                    >
                      <div className="relative aspect-square mb-2 overflow-hidden rounded-md bg-gray-100">
                        {sourceUrl && (
                          <div className="h-full w-full relative">
                            <img
                              src={sourceUrl}
                              alt={altText}
                              className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 px-1">
                        <h3 className="text-xs sm:text-sm font-medium line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {(relatedProduct as SimpleProduct).price}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews section with improved responsive design */}
        <div id="reviews" className="scroll-mt-16 sm:scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-serif font-medium mb-4 sm:mb-6 px-1 sm:px-0">
            Customer Reviews ({reviewCount})
          </h2>
          <div className="bg-white rounded-lg p-4 sm:p-8 shadow-sm">
            <ReviewsSection product={product} />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

export default ShopProduct
