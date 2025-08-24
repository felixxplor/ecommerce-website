// components/cart-options-with-bundles.tsx
'use client'

import { PropsWithChildren } from 'react'
import { Product, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { cn } from '@/utils/ui'
import { SimpleCartOptions } from '@/client/simple-cart-options'
import { VariableCartOptions } from '@/client/variable-cart-options'
import { AlertTriangle } from 'lucide-react'
import { useBundleContext } from '@/components/bundle-pricing-wrapper'

function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        className && className,
        'flex fixed inset-x-0 mx-auto p-4',
        'lg:relative lg:inset-auto lg:mx-0 lg:p-0',
        'bg-white bottom-0 z-30 w-screen',
        'lg:bg-inherit lg:bottom-auto lg:z-auto lg:w-auto'
      )}
    >
      {children}
    </div>
  )
}

export interface CartOptionsWithBundlesProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function CartOptionsWithBundles(props: CartOptionsWithBundlesProps) {
  const { product, className } = props
  const { type, stockStatus, stockQuantity } = product as SimpleProduct

  // This is now safe because this is a client component
  const bundleContext = useBundleContext()

  // Check if product is out of stock
  const isOutOfStock =
    stockStatus === 'OUT_OF_STOCK' || (stockQuantity !== null && (stockQuantity as number) <= 0)

  // If out of stock, show a message instead of the cart options
  if (isOutOfStock) {
    return (
      <Container className={className}>
        <div className="inline-block">
          <div className="inline-flex items-center gap-2 text-red-700 px-4 py-2 rounded-md whitespace-nowrap">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Out of Stock</span>
          </div>
        </div>
      </Container>
    )
  }

  // Get the quantity from bundle selection, default to 1
  const bundleQuantity = bundleContext?.selectedBundle?.quantity || 1

  let Component: (props: any) => JSX.Element | null = () => null
  if (type === ProductTypesEnum.SIMPLE) {
    Component = SimpleCartOptions
  } else if (type === ProductTypesEnum.VARIABLE) {
    Component = VariableCartOptions
  }

  return (
    <Container className={className}>
      <Component {...props} value={bundleQuantity} bundleContext={bundleContext} />
    </Container>
  )
}
