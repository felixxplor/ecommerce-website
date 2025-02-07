'use client'

import { FormEvent, useState, useEffect } from 'react'

import { cn } from '@/utils/ui'
import { Product, StockStatusEnum } from '@/graphql'

import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProductWithPrice } from './shop-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import InputNumber, { InputNumberProps } from '@/components/input-number'
import { useDrawerStore } from '@/components/cart-drawer'

interface CartOptionsProps extends InputNumberProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function SimpleCartOptions({
  cartRef,
  ...props
}: CartOptionsProps & { cartRef: React.RefObject<HTMLButtonElement> }) {
  const { product, value, onIncrease, onDecrease, onType, onFocusOut, ...rest } = props
  const { toast } = useToast()
  const [localValue, setLocalValue] = useState<number>(Number(value) || 1)
  const [executing, setExecuting] = useState<boolean>(false)
  const { rawPrice, databaseId, soldIndividually, stockStatus, stockQuantity } =
    product as ProductWithPrice
  const { fetching, mutate } = useCartMutations(databaseId)
  const { onOpen } = useDrawerStore()

  const outOfStock = stockStatus === StockStatusEnum.OUT_OF_STOCK
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

      toast({
        title: 'Added to cart',
        description: `${localValue} × ${product.name}`,
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
    let _value = Number(value || localValue) + 1
    if (maxQuantity !== undefined && _value > maxQuantity) {
      _value = maxQuantity
    }
    onIncrease && onIncrease(_value)
    setLocalValue(_value)
  }

  const decrease = () => {
    let _value = Number(value || localValue) - 1
    if (_value < 1) {
      _value = 1
    }
    onDecrease && onDecrease(_value)
    setLocalValue(_value)
  }

  return (
    <form onSubmit={onAddToCart} className="flex flex-col flex-wrap gap-x-2 gap-y-8 items-center">
      <div className="flex items-center self-start">
        <div className="capitalize text-gray-500 mr-10">Quantity</div>
        <button
          className="h-8 w-8 flex items-center justify-center rounded-l-sm border border-gray-300 text-gray-600"
          onClick={decrease}
          type="button"
          disabled={fetching || executing}
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
          classNameInput="h-8 w-14 border-t border-b border-gray-300 p-1 text-center outline-none"
          onChange={handleChange}
          disabled={fetching || executing}
          {...rest}
        />
        <button
          className="h-8 w-8 flex items-center justify-center rounded-r-sm border border-gray-300 text-gray-600"
          onClick={increase}
          type="button"
          disabled={fetching || executing}
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

      <div className="basis-full md:basis-auto flex gap-x-2 self-start">
        <Button
          type="submit"
          className={buttonVariants({
            size: 'xl',
            className: 'mx-auto bg-[#242A2E] border border-white !rounded-full mt-auto !font-bold',
          })}
          disabled={fetching || executing || outOfStock}
        >
          {outOfStock ? 'Out of Stock' : 'Add To Basket'}
          {(fetching || executing) && <LoadingSpinner noText />}
        </Button>
      </div>
    </form>
  )
}
