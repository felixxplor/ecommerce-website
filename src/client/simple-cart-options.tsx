'use client'

import { FormEvent, useState, useEffect } from 'react'

import { cn } from '@/utils/ui'
import { Product, SimpleProduct, StockStatusEnum } from '@/graphql'

import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProductWithPrice } from './shop-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import InputNumber, { InputNumberProps } from '@/components/input-number'
import { useDrawerStore } from '@/components/cart-drawer'
import { AlertTriangle } from 'lucide-react'
import { useBundleContext } from '@/components/bundle-pricing-wrapper'

interface CartOptionsProps extends InputNumberProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function SimpleCartOptions({ ...props }: CartOptionsProps) {
  const { product, value, onIncrease, onDecrease, onType, onFocusOut, ...rest } = props
  const { toast } = useToast()

  // Always call the hook - it will return null if context is not available
  const bundleContext = useBundleContext()

  // Use bundle quantity if available, otherwise use passed value or default to 1
  const bundleQuantity = bundleContext?.selectedBundle?.quantity || value || 1
  const [localValue, setLocalValue] = useState<number>(bundleQuantity)
  const [executing, setExecuting] = useState<boolean>(false)
  const { rawPrice, databaseId, soldIndividually, stockStatus, stockQuantity } =
    product as ProductWithPrice
  const { fetching, mutate } = useCartMutations(databaseId)
  const { onOpen } = useDrawerStore()

  // Update local value when bundle changes
  useEffect(() => {
    if (bundleContext?.selectedBundle) {
      setLocalValue(bundleContext.selectedBundle.quantity)
    }
  }, [bundleContext?.selectedBundle])

  // Update local value when value prop changes
  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value)
    }
  }, [value, localValue])

  // Check if product is out of stock
  const outOfStock =
    stockStatus === StockStatusEnum.OUT_OF_STOCK ||
    (stockQuantity !== null && stockQuantity !== undefined && stockQuantity <= 0)
  const maxQuantity = stockQuantity ? (stockQuantity as number) : undefined

  const onAddToCart = async (event: FormEvent) => {
    event.preventDefault()

    if (localValue < 1) {
      toast({
        title: 'Invalid quantity',
        description: 'Quantity must be at least 1',
        variant: 'destructive',
        duration: 3000,
      })
      return
    }

    setExecuting(true)
    try {
      await mutate({
        mutation: 'add',
        quantity: localValue,
      })

      const bundleInfo = bundleContext?.selectedBundle
        ? ` (${bundleContext.selectedBundle.title})`
        : ''

      toast({
        title: 'Added to cart',
        description: `${localValue} × ${product.name}${bundleInfo}`,
        duration: 3000,
      })

      onOpen()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        variant: 'destructive',
        duration: 3000,
      })
    } finally {
      setExecuting(false)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let _value = Number(event.target.value)
    if (maxQuantity !== undefined && _value > maxQuantity) {
      _value = maxQuantity
    } else if (_value < 1) {
      _value = 1
    }

    onType && onType(_value)
    setLocalValue(_value)
  }

  const increase = () => {
    let _value = Number(localValue) + 1
    if (maxQuantity !== undefined && _value > maxQuantity) {
      _value = maxQuantity
    }
    onIncrease && onIncrease(_value)
    setLocalValue(_value)
  }

  const decrease = () => {
    let _value = Number(localValue) - 1
    if (_value < 1) {
      _value = 1
    }
    onDecrease && onDecrease(_value)
    setLocalValue(_value)
  }

  // If product is out of stock, only show the out of stock message
  if (outOfStock) {
    return (
      <div className="inline-block">
        <div className="inline-flex items-center gap-2 text-red-700 px-4 py-2 rounded-md whitespace-nowrap">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Out of Stock</span>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onAddToCart} className="w-full">
      {/* Mobile layout (single row) - Only visible on screens below 976px */}
      <div className="flex items-center justify-between gap-2 z-[999] lg:hidden">
        {/* Quantity controls */}
        <div className="flex items-center">
          <button
            className="h-10 w-10 flex items-center justify-center rounded-l-md border border-gray-300 text-gray-600"
            onClick={decrease}
            type="button"
            disabled={fetching || executing}
            aria-label="Decrease quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>

          <InputNumber
            value={localValue}
            className=""
            classNameError="hidden"
            classNameInput="h-10 w-12 border-t border-b border-gray-300 p-1 text-center outline-none"
            onChange={handleChange}
            disabled={fetching || executing}
            {...rest}
          />

          <button
            className="h-10 w-10 flex items-center justify-center rounded-r-md border border-gray-300 text-gray-600"
            onClick={increase}
            type="button"
            disabled={fetching || executing}
            aria-label="Increase quantity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>

        {/* Price - Show bundle price if available */}
        <div>
          <span className="text-lg font-semibold text-gray-900">
            {bundleContext?.selectedBundle
              ? `$${bundleContext.selectedBundle.price.toFixed(2)}`
              : `$${(product as SimpleProduct).price?.replace(/[^0-9.]/g, '')}`}
          </span>
        </div>

        {/* Add button */}
        <Button
          type="submit"
          className={buttonVariants({
            size: 'sm',
            className: 'bg-[#242A2E] border border-white rounded-full font-bold',
          })}
          disabled={fetching || executing}
        >
          Add To Basket
          {(fetching || executing) && <LoadingSpinner noText className="ml-1" />}
        </Button>
      </div>

      {/* Desktop layout (original) - Only visible on lg screens and up (976px+) */}
      <div className="hidden lg:block">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-500 w-20">Quantity</label>
          <div className="flex items-center">
            <button
              className="h-10 w-10 flex items-center justify-center rounded-l-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={decrease}
              type="button"
              disabled={fetching || executing}
              aria-label="Decrease quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
              </svg>
            </button>

            <InputNumber
              value={localValue}
              className=""
              classNameError="hidden"
              classNameInput="h-10 w-16 border-t border-b border-gray-300 p-1 text-center outline-none"
              onChange={handleChange}
              disabled={fetching || executing}
              {...rest}
            />

            <button
              className="h-10 w-10 flex items-center justify-center rounded-r-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={increase}
              type="button"
              disabled={fetching || executing}
              aria-label="Increase quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {/* Bundle quantity indicator */}
          {bundleContext?.selectedBundle && bundleContext.selectedBundle.quantity > 1 && (
            <div className="text-sm text-gray-600">
              ({bundleContext.selectedBundle.title} - {bundleContext.selectedBundle.quantity} items)
            </div>
          )}
        </div>

        <div className="mt-2 sm:mt-4">
          <Button
            type="submit"
            className={buttonVariants({
              size: 'lg',
              className: 'w-full sm:w-auto bg-[#242A2E] border border-white rounded-full font-bold',
            })}
            disabled={fetching || executing}
          >
            <span className="flex items-center justify-center">
              Add To Basket
              {bundleContext?.selectedBundle && bundleContext.selectedBundle.quantity > 1 && (
                <span className="ml-2 text-sm">
                  ({bundleContext.selectedBundle.quantity} items)
                </span>
              )}
              {(fetching || executing) && <LoadingSpinner noText className="ml-2" />}
            </span>
          </Button>
        </div>
      </div>
    </form>
  )
}
