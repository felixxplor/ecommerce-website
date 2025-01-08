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

interface CartOptionsProps extends InputNumberProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function SimpleCartOptions(props: CartOptionsProps) {
  const { product, value, onIncrease, onDecrease, onType, onFocusOut, ...rest } = props
  const { toast } = useToast()
  const [localValue, setLocalValue] = useState<number>(Number(value) || 1)
  // const [quantity, setQuantity] = useState(1)
  const [executing, setExecuting] = useState<'add' | 'update' | 'remove' | null>(null)
  const { rawPrice, databaseId, soldIndividually, stockStatus, stockQuantity, manageStock } =
    product as ProductWithPrice
  const { fetching, mutate, quantityFound } = useCartMutations(databaseId)

  const outOfStock = stockStatus === StockStatusEnum.OUT_OF_STOCK

  const mutation = quantityFound ? 'update' : 'add'
  let submitButtonText = quantityFound ? 'Update' : 'Add To Basket'
  if (outOfStock) {
    submitButtonText = 'Out of Stock'
  }

  const maxQuantity = stockQuantity ? (stockQuantity as number) : undefined

  const onAddOrUpdate = async (event: FormEvent) => {
    event.preventDefault()

    setExecuting(mutation)
    await mutate({ mutation, localValue })

    if (mutation === 'add') {
      toast({
        title: 'Added to cart',
        description: `${localValue} × ${product.name}`,
      })
    } else {
      toast({
        title: 'Updated cart',
        description: `${localValue} × ${product.name}`,
      })
    }
  }

  const onRemove = async () => {
    setExecuting('remove')
    await mutate({ mutation: 'remove' })

    toast({
      title: 'Removed from cart',
      description: `${localValue} × ${product.name}`,
    })
  }

  useEffect(() => {
    if (!fetching) {
      setExecuting(null)
    }
  }, [fetching])

  // useEffect(() => {
  //   if (quantityFound) {
  //     setQuantity(quantityFound)
  //   }
  // }, [quantityFound])

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

  const handleBlur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    onFocusOut && onFocusOut(Number(event.target.value))
  }

  return (
    <>
      <form
        onSubmit={onAddOrUpdate}
        className="flex flex-col flex-wrap gap-x-2 gap-y-8 items-center"
      >
        {/* {(!soldIndividually || outOfStock) && (
          <Input
            className="basis-1/2 shrink"
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            disabled={fetching}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        )} */}
        <div className="flex items-center self-start">
          <div className="capitalize text-gray-500 mr-10">Quantity</div>
          <button
            className="h-8 w-8 flex items-center justify-center rounded-l-sm border border-gray-300 text-gray-600"
            onClick={decrease}
            type="button"
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
            value={value || localValue}
            className=""
            classNameError="hidden"
            classNameInput="h-8 w-14 border-t border-b border-gray-300 p-1 text-center outline-none"
            onChange={handleChange}
            onBlur={handleBlur}
            {...rest}
          />
          <button
            className="h-8 w-8 flex items-center justify-center rounded-r-sm border border-gray-300 text-gray-600"
            onClick={increase}
            type="button"
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
              className:
                'mx-auto bg-[#242A2E] border border-white !rounded-full mt-auto !font-bold',
            })}
            disabled={fetching || outOfStock}
          >
            {submitButtonText}
            {fetching && executing !== 'remove' && <LoadingSpinner noText />}
          </Button>
          {!!quantityFound && (
            <Button
              type="button"
              className={buttonVariants({
                size: 'xl',
                className:
                  'mx-auto bg-red-500 border border-white !rounded-full mt-auto !font-bold',
              })}
              onClick={onRemove}
              disabled={fetching}
            >
              Remove
              {fetching && executing === 'remove' && <LoadingSpinner noText />}
            </Button>
          )}
        </div>
      </form>
    </>
  )
}
