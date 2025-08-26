// components/bundle-pricing-wrapper.tsx
'use client'

import React, { useState, createContext, useContext, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/ui'

interface BundleOption {
  id: string
  title: string
  subtitle: string
  price: number
  originalPrice?: number
  savings?: string
  freeGift?: boolean
  badge?: string
  badgeColor?: string
  quantity: number
}

interface BundleContextType {
  selectedBundle: BundleOption | null
  setSelectedBundle: (bundle: BundleOption) => void
}

const BundleContext = createContext<BundleContextType | null>(null)

// Safe hook that returns null if context is not available
export const useBundleContext = () => {
  return useContext(BundleContext)
}

// Hook that checks if we're inside a bundle context
export const useHasBundleContext = () => {
  const context = useContext(BundleContext)
  return context !== null
}

interface BundlePricingWrapperProps {
  basePrice: number
  salePrice: number
  className?: string
  children?: React.ReactNode
}

export const BundlePricingWrapper: React.FC<BundlePricingWrapperProps> = ({
  basePrice,
  salePrice,
  className,
  children,
}) => {
  // Use salePrice as the customer-facing price for single item
  const singlePrice = salePrice
  const duoPrice = salePrice * 2 * 0.9 // 10% discount on duo
  const trioPrice = salePrice * 3 * 0.85 // 15% discount on trio

  // Calculate original prices (what they would pay without bundle deals)
  const singleOriginalPrice = basePrice
  const duoOriginalPrice = basePrice * 2
  const trioOriginalPrice = basePrice * 3

  // Calculate savings percentages
  const singleSavings = Math.round(
    ((singleOriginalPrice - singlePrice) / singleOriginalPrice) * 100
  )
  const duoSavings = Math.round(((duoOriginalPrice - duoPrice) / duoOriginalPrice) * 100)
  const trioSavings = Math.round(((trioOriginalPrice - trioPrice) / trioOriginalPrice) * 100)

  const bundleOptions: BundleOption[] = [
    {
      id: 'single',
      title: 'Single',
      subtitle: `Buy 1 and save ${singleSavings}% off`,
      price: singlePrice,
      originalPrice: singleOriginalPrice,
      freeGift: true,
      badge: 'Most Popular',
      badgeColor: 'bg-cyan-500',
      quantity: 1,
    },
    {
      id: 'duo',
      title: 'Duo',
      subtitle: `Buy 2 and save ${duoSavings}% off`,
      price: duoPrice,
      originalPrice: duoOriginalPrice,
      freeGift: true,
      quantity: 2,
    },
    {
      id: 'trio',
      title: 'Trio',
      subtitle: `Buy 3 and save ${trioSavings}% off`,
      price: trioPrice,
      originalPrice: trioOriginalPrice,
      freeGift: true,
      badge: 'Best Value',
      badgeColor: 'bg-emerald-500',
      quantity: 3,
    },
  ]

  // Initialize with null first, then set in useEffect to avoid hydration issues
  const [selectedBundle, setSelectedBundle] = useState<BundleOption | null>(null)

  // Set default selection after component mounts
  useEffect(() => {
    if (!selectedBundle) {
      const defaultBundle =
        bundleOptions.find((option) => option.id === 'single') || bundleOptions[0]
      setSelectedBundle(defaultBundle)
    }
  }, [bundleOptions, selectedBundle])

  const handleBundleSelect = (bundle: BundleOption) => {
    setSelectedBundle(bundle)
    console.log('Bundle selected:', bundle)
  }

  const contextValue: BundleContextType = {
    selectedBundle,
    setSelectedBundle: handleBundleSelect,
  }

  // Don't render until we have a selected bundle
  if (!selectedBundle) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
  }

  return (
    <BundleContext.Provider value={contextValue}>
      <div className={cn('space-y-3 mb-6', className)}>
        <BundlePricingOptions
          bundleOptions={bundleOptions}
          selectedBundle={selectedBundle}
          onBundleSelect={handleBundleSelect}
        />
      </div>
      {children}
    </BundleContext.Provider>
  )
}

interface BundlePricingOptionsProps {
  bundleOptions: BundleOption[]
  selectedBundle: BundleOption
  onBundleSelect: (bundle: BundleOption) => void
}

const BundlePricingOptions: React.FC<BundlePricingOptionsProps> = ({
  bundleOptions,
  selectedBundle,
  onBundleSelect,
}) => {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  return (
    <>
      {bundleOptions.map((bundle) => {
        const isSelected = selectedBundle.id === bundle.id

        return (
          <div
            key={bundle.id}
            className={cn(
              'relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200',
              isSelected
                ? 'border-cyan-400 bg-cyan-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
            onClick={() => onBundleSelect(bundle)}
          >
            {/* Badge */}
            {bundle.badge && (
              <div className="absolute -top-2 right-4">
                <Badge className={cn('text-white text-xs font-bold px-2 py-1', bundle.badgeColor)}>
                  {bundle.badge}
                </Badge>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {/* Radio Button */}
              <div className="flex-shrink-0">
                <input
                  type="radio"
                  id={bundle.id}
                  name="bundle-selection"
                  checked={isSelected}
                  onChange={() => onBundleSelect(bundle)}
                  className="w-5 h-5 text-cyan-600 border-2 border-gray-300 focus:ring-cyan-500"
                />
              </div>

              {/* Bundle Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{bundle.title}</h3>
                  {bundle.freeGift && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-0.5"
                    >
                      + Free Gift
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{bundle.subtitle}</p>

                {/* Size selector for single item */}
                {bundle.id === 'single' && (
                  <div className="mt-2">
                    <label className="text-xs text-gray-500 block mb-1">Size</label>
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white min-w-[80px]"
                      onClick={(e) => e.stopPropagation()} // Prevent triggering bundle selection
                    >
                      <option value="small">Small</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-900">{formatPrice(bundle.price)}</div>
                {bundle.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatPrice(bundle.originalPrice)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
