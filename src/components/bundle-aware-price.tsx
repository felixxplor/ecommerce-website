'use client'

import { useBundleContext } from '@/components/bundle-pricing-wrapper'

interface BundleAwarePriceProps {
  basePrice: number
  salePrice: number
  originalRegularPrice: number
}

export function BundleAwarePrice({
  basePrice,
  salePrice,
  originalRegularPrice,
}: BundleAwarePriceProps) {
  const bundleContext = useBundleContext()

  // If no bundle context (shouldn't happen when used correctly), fall back to regular pricing
  if (!bundleContext || !bundleContext.selectedBundle) {
    const currentPrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice
    const hasDiscount = salePrice > 0 && salePrice < originalRegularPrice
    const savingsAmount = hasDiscount ? Math.round(originalRegularPrice - currentPrice) : 0

    return (
      <>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-gray-500">
              <span>Was</span>{' '}
              <span className="line-through">${originalRegularPrice.toFixed(2)}</span>
            </span>
          )}
        </div>
        {savingsAmount > 0 && (
          <div className="flex items-center">
            <span className="bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-sm">
              SAVE ${savingsAmount}
            </span>
          </div>
        )}
      </>
    )
  }

  const { selectedBundle } = bundleContext

  // Get the bundle price directly from the selected bundle
  const bundlePrice = selectedBundle.price
  const bundleOriginalPrice = selectedBundle.originalPrice || selectedBundle.price
  const bundlePriceFormatted = bundlePrice.toFixed(2)

  // Check if there's a discount (bundle price is less than original price)
  const hasBundleDiscount = bundleOriginalPrice > bundlePrice
  const savingsAmount = hasBundleDiscount ? Math.round(bundleOriginalPrice - bundlePrice) : 0

  return (
    <>
      {/* Price line - your exact same structure */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">${bundlePriceFormatted}</span>
        {hasBundleDiscount && (
          <span className="text-gray-500">
            <span>Was</span> <span className="line-through">${bundleOriginalPrice.toFixed(2)}</span>
          </span>
        )}
      </div>

      {/* Savings badge line - your exact same structure */}
      {savingsAmount > 0 && (
        <div className="flex items-center">
          <span className="bg-yellow-400 text-black text-sm font-bold px-3 py-1 rounded-sm">
            SAVE ${savingsAmount}
          </span>
        </div>
      )}
    </>
  )
}
