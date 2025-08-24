// components/bundle-pricing.tsx
'use client'

import React, { useState } from 'react'
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

interface BundlePricingProps {
  basePrice: number
  onBundleChange?: (bundle: BundleOption) => void
  className?: string
}

export const BundlePricing: React.FC<BundlePricingProps> = ({
  basePrice,
  onBundleChange,
  className,
}) => {
  // Calculate bundle prices based on base price
  const bundleOptions: BundleOption[] = [
    {
      id: 'single',
      title: 'Single',
      subtitle: 'Buy 1 and save 40% off',
      price: basePrice * 0.6, // 40% off
      originalPrice: basePrice,
      freeGift: true,
      badge: 'Most Popular',
      badgeColor: 'bg-cyan-500',
      quantity: 1,
    },
    {
      id: 'duo',
      title: 'Duo',
      subtitle: 'Buy 2 and save extra 10%',
      price: basePrice * 2 * 0.54, // 60% off + extra 10%
      originalPrice: basePrice * 2,
      freeGift: true,
      quantity: 2,
    },
    {
      id: 'trio',
      title: 'Trio',
      subtitle: 'Buy 3 and save extra 15%',
      price: basePrice * 3 * 0.51, // 60% off + extra 15%
      originalPrice: basePrice * 3,
      freeGift: true,
      badge: 'Best Value',
      badgeColor: 'bg-emerald-500',
      quantity: 3,
    },
  ]

  const [selectedBundle, setSelectedBundle] = useState<string>('single')

  const handleBundleSelect = (bundle: BundleOption) => {
    setSelectedBundle(bundle.id)
    onBundleChange?.(bundle)
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  return (
    <div className={cn('space-y-3 mb-6', className)}>
      {bundleOptions.map((bundle) => (
        <div
          key={bundle.id}
          className={cn(
            'relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200',
            selectedBundle === bundle.id
              ? 'border-cyan-400 bg-cyan-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
          onClick={() => handleBundleSelect(bundle)}
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
                name="bundle"
                checked={selectedBundle === bundle.id}
                onChange={() => handleBundleSelect(bundle)}
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
                  <select className="text-sm border border-gray-300 rounded px-2 py-1 bg-white min-w-[80px]">
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
      ))}
    </div>
  )
}
