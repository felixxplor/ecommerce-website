'use client'

import { AlertTriangle } from 'lucide-react'
import { Product, SimpleProduct } from '@/graphql'
import { useEffect, useState } from 'react'
import { CartOptionsWithBundles } from '@/components/cart-options-with-bundles'

interface MobileBottomCartProps {
  product: Product
  isOutOfStock: boolean
}

export function MobileBottomCart({ product, isOutOfStock }: MobileBottomCartProps) {
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-screen-xl mx-auto">
        {isOutOfStock ? (
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-700">Out of Stock</span>
          </div>
        ) : (
          <CartOptionsWithBundles product={product} />
        )}
      </div>
    </div>
  )
}

export default MobileBottomCart
