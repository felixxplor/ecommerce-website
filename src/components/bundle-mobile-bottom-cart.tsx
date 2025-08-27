'use client'

import { useBundleContext } from '@/components/bundle-pricing-wrapper'
import MobileBottomCart from '@/components/mobile-bottom-cart'
import { Product } from '@/graphql'

interface BundleMobileBottomCartProps {
  product: Product
  isOutOfStock: boolean
}

export function BundleMobileBottomCart({ product, isOutOfStock }: BundleMobileBottomCartProps) {
  const bundleContext = useBundleContext()

  return (
    <MobileBottomCart
      product={product}
      isOutOfStock={isOutOfStock}
      bundlePrice={bundleContext?.selectedBundle?.price}
      bundleQuantity={bundleContext?.selectedBundle?.quantity}
      bundleTitle={bundleContext?.selectedBundle?.title}
    />
  )
}
