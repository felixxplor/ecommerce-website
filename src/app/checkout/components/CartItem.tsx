import Image from 'next/image'
import { CartItem as CartItemType } from '@/graphql/generated'

export function CartItem({ item }: { item: CartItemType }) {
  const { product, variation, quantity, subtotal } = item
  const productNode = product?.node
  const image = productNode?.image
  const name = productNode?.name ?? ''
  const qty = quantity ?? 0

  // Calculate if bulk discount is applied
  const hasBulkDiscount = qty >= 2
  let discountPercent = 0

  if (qty >= 3) {
    discountPercent = 15
  } else if (qty === 2) {
    discountPercent = 10
  }

  // Parse current price (after discount)
  const currentSubtotal = parseFloat(subtotal?.replace(/[^\d.-]/g, '') || '0')
  const currentPriceEach = qty > 0 ? currentSubtotal / qty : 0

  // Calculate original price (before bulk discount)
  const originalPriceEach =
    discountPercent > 0 ? currentPriceEach / (1 - discountPercent / 100) : currentPriceEach

  const savingsPerItem = originalPriceEach - currentPriceEach

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={image?.sourceUrl || '/product-placeholder.png'}
          alt={image?.altText ?? name ?? ''}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm truncate">{name}</h3>

        {/* Variation attributes */}
        {variation?.attributes?.map(
          (attr) =>
            attr && (
              <p key={attr.name ?? ''} className="text-xs text-gray-500">
                {attr.name ?? ''}: {attr.value ?? ''}
              </p>
            )
        )}

        {/* Price display with bulk discount info */}
        <div className="mt-2">
          {hasBulkDiscount ? (
            <div className="space-y-1">
              {/* Original vs Discounted Price */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 line-through text-xs">
                  ${originalPriceEach.toFixed(2)} each
                </span>
                <span className="text-green-600 font-medium text-sm">
                  ${currentPriceEach.toFixed(2)} each
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Savings info */}
              <div className="text-xs text-green-600">
                Save ${savingsPerItem.toFixed(2)} per item
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">${currentPriceEach.toFixed(2)} each</div>
          )}
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">Qty: {qty}</p>
          </div>

          <div className="text-right">
            <p className="font-medium text-sm">{subtotal}</p>
            {hasBulkDiscount && (
              <p className="text-xs text-green-600">(${(savingsPerItem * qty).toFixed(2)} saved)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
