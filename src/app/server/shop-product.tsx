import { ProductImage } from '@/client/product-image'
import { Product, SimpleProduct, VariationAttribute } from '@/graphql'
import { CartOptions } from './cart-options'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ProductWithPrice } from '@/client/shop-provider'
import { Star } from 'lucide-react'

export interface ShopProductProps {
  product: Product
}

export function ShopProduct(props: ShopProductProps) {
  const { product } = props
  const { rawPrice } = product as ProductWithPrice

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
      <MaxWidthWrapper className="flex flex-wrap p-12 gap-4 mb-36 lg:mb-0">
        <div className="grid grid-cols-12 gap-9">
          <div className="col-span-5">
            <ProductImage product={product} />
          </div>
          <div className="col-span-7 basis-full md:basis-1/2 pt-4 px-4 flex flex-col">
            <h1 className="font-serif text-5xl font-medium mb-2">{product.name}</h1>
            <div className="text-2xl py-4">${rawPrice}</div>
            <p className="text-base mb-4">{product.shortDescription}</p>
            <CartOptions product={product} />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="w-full border-b border-gray-200 sticky top-0 bg-[#f6f5f2] z-10">
          <div className="flex gap-8">
            <a
              href="#description"
              className="px-4 py-4 font-medium text-gray-600 hover:text-black border-b-2 border-transparent hover:border-black transition-colors"
            >
              Description
            </a>
            <a
              href="#attributes"
              className="px-4 py-4 font-medium text-gray-600 hover:text-black border-b-2 border-transparent hover:border-black transition-colors"
            >
              Attributes
            </a>
            <a
              href="#reviews"
              className="px-4 py-4 font-medium text-gray-600 hover:text-black border-b-2 border-transparent hover:border-black transition-colors"
            >
              Reviews
            </a>
          </div>
        </div>

        {/* Content Sections */}
        <div className="w-full space-y-16">
          {/* Description Section */}
          <div id="description" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium mb-6">Product Description</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div
                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-medium"
                dangerouslySetInnerHTML={{ __html: product.description as string }}
              />
            </div>
          </div>

          {/* Attributes Section */}
          <div id="attributes" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium mb-6">Product Attributes</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(attributes).map(([label, values]) => (
                  <div key={label} className="border-l-4 border-gray-200 pl-4">
                    <h3 className="font-serif font-medium text-lg mb-2">{label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <span
                          key={value}
                          className="inline-block bg-gray-100 rounded-full px-4 py-1 text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div id="reviews" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {/* Reviews Summary */}
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-medium mb-2">4.8</div>
                    <div className="flex text-yellow-400 justify-center mb-1">
                      {Array(5)
                        .fill(null)
                        .map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    <div className="text-sm text-gray-600">Based on 24 reviews</div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <div className="text-sm text-gray-600 w-3">{rating}</div>
                        <Star className="w-4 h-4 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width:
                                rating === 5
                                  ? '70%'
                                  : rating === 4
                                  ? '20%'
                                  : rating === 3
                                  ? '5%'
                                  : rating === 2
                                  ? '3%'
                                  : '2%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {[
                  {
                    name: 'Sarah M.',
                    rating: 5,
                    date: '2 months ago',
                    review:
                      'Absolutely love this product! The quality is exceptional and it looks even better in person. Would definitely recommend to anyone looking to upgrade their space.',
                  },
                  {
                    name: 'James R.',
                    rating: 4,
                    date: '1 month ago',
                    review:
                      'Great product overall. The design is modern and sleek, exactly what I was looking for. Shipping was quick and the packaging was secure.',
                  },
                ].map((review, index) => (
                  <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-medium mb-1">{review.name}</div>
                        <div className="flex text-yellow-400 mb-2">
                          {Array(5)
                            .fill(null)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                              />
                            ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{review.date}</div>
                    </div>
                    <p className="text-gray-700">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

export default ShopProduct
