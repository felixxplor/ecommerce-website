'use client'

import { AlertTriangle } from 'lucide-react'
import { Product, SimpleProduct } from '@/graphql'
import { useEffect, useState } from 'react'
import { SimpleCartOptions } from '@/client/simple-cart-options'

interface MobileBottomCartProps {
  product: Product
  isOutOfStock: boolean
  bundlePrice?: number
  bundleQuantity?: number
  bundleTitle?: string
}

export function MobileBottomCart({
  product,
  isOutOfStock,
  bundlePrice,
  bundleQuantity,
  bundleTitle,
}: MobileBottomCartProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 976)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Only render on mobile
  if (!isMobile) return null

  // Use bundle price if provided, otherwise fallback to regular price
  const displayPrice = bundlePrice
    ? bundlePrice.toFixed(2)
    : (product as SimpleProduct).price?.replace(/[^0-9.]/g, '') || '0.00'

  const displayQuantity = bundleQuantity || 1

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-screen-xl mx-auto">
        {isOutOfStock ? (
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-700">Out of Stock</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {/* Price and bundle info */}
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">${displayPrice}</span>
              {bundleTitle && displayQuantity > 1 && (
                <span className="text-xs text-gray-600">
                  {bundleTitle} - {displayQuantity} items
                </span>
              )}
            </div>

            {/* Quantity display and add to cart */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-50 rounded px-2 py-1">
                <span className="text-sm text-gray-600 mr-1">Qty:</span>
                <span className="font-medium">{displayQuantity}</span>
              </div>

              <SimpleCartOptions
                product={product}
                value={displayQuantity}
                bundleContext={
                  bundlePrice
                    ? {
                        selectedBundle: {
                          id: bundleTitle?.toLowerCase() || 'bundle',
                          title: bundleTitle || 'Bundle',
                          quantity: displayQuantity,
                          price: bundlePrice,
                        },
                      }
                    : null
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileBottomCart
