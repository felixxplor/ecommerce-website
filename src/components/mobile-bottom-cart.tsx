'use client'

import { AlertTriangle } from 'lucide-react'
import { Product, SimpleProduct } from '@/graphql'
import { useEffect, useState } from 'react'
import { CartOptionsWithBundles } from '@/components/cart-options-with-bundles'
import { useBundleContext } from '@/components/bundle-pricing-wrapper'

interface MobileBottomCartProps {
  product: Product
  isOutOfStock: boolean
}

export function MobileBottomCart({ product, isOutOfStock }: MobileBottomCartProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Get bundle context to show updated pricing and quantity
  const bundleContext = useBundleContext()

  useEffect(() => {
    // Function to handle resize event and check if screen is mobile
    // Using 976px (lg breakpoint) as defined in your Tailwind config
    const handleResize = () => {
      setIsMobile(window.innerWidth < 976)
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Clean up
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Only render on mobile
  if (!isMobile) return null

  // Show the updated bundle price in mobile bottom bar
  const displayPrice = bundleContext?.selectedBundle
    ? `${bundleContext.selectedBundle.price.toFixed(2)}`
    : `${(product as SimpleProduct).price?.replace(/[^0-9.]/g, '') || '0'}`

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
            {/* Bundle info and price */}
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">{displayPrice}</span>
              {bundleContext?.selectedBundle && bundleContext.selectedBundle.quantity > 1 && (
                <span className="text-xs text-gray-600">
                  {bundleContext.selectedBundle.title} - {bundleContext.selectedBundle.quantity}{' '}
                  items
                </span>
              )}
            </div>

            {/* Cart options */}
            <CartOptionsWithBundles product={product} />
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileBottomCart
