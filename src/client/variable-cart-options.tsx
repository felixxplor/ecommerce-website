'use client'

import { FormEvent, useState, useEffect, CSSProperties } from 'react'

import { cn } from '@/utils/ui'
import {
  Product,
  VariableProduct,
  StockStatusEnum,
  GlobalProductAttribute,
  TermNode,
  VariationAttribute,
  ProductVariation,
} from '@/graphql'
import { useToast } from '@/hooks/use-toast'
import { useProductContext } from './product-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import InputNumber, { InputNumberProps } from '@/components/input-number'

function ucfirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

type SelectedProductAttributes = { [key: string]: string }

interface CartOptionsProps extends InputNumberProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function VariableCartOptions({
  product,
  value,
  onIncrease,
  onDecrease,
  onType,
  onFocusOut,
  ...rest
}: CartOptionsProps) {
  const { toast } = useToast()
  const [localValue, setLocalValue] = useState<number>(Number(value) || 1)
  const [executing, setExecuting] = useState<'add' | 'update' | 'remove' | null>(null)
  const { get, selectVariation, hasSelectedVariation, selectedVariation } = useProductContext()

  const rawPrice = get('rawPrice' as keyof Product) as string
  const soldIndividually = get('soldIndividually') as boolean
  const stockStatus = get('stockStatus') as StockStatusEnum
  const stockQuantity = get('stockQuantity') as number
  const manageStock = get('manageStock') as boolean

  const attributes = product.attributes?.nodes || []
  const variations = ((product as VariableProduct).variations?.nodes || []) as ProductVariation[]

  const defaultAttributes = (product as VariableProduct).defaultAttributes?.nodes || []

  const [selectedAttributes, selectAttributes] = useState<SelectedProductAttributes>(
    (defaultAttributes || []).reduce((results, attribute) => {
      const { value, label } = attribute as VariationAttribute
      return {
        ...results,
        [label as string]: value as string,
      }
    }, {})
  )

  useEffect(() => {
    const variation =
      variations &&
      variations.find(({ attributes: variationAttributes }) =>
        ((variationAttributes?.nodes as VariationAttribute[]) || [])?.every(({ value, label }) => {
          const index = ucfirst((label as string).replace(/_|-/g, ' '))
          return !value || selectedAttributes[index] === value
        })
      )
    selectVariation(variation)
  }, [selectedAttributes, product])

  const productId = product.databaseId
  const variationId = hasSelectedVariation ? (get('databaseId') as number) : undefined
  // Add any attributes not on the variation.
  const variationAttributes = selectedVariation?.attributes?.nodes || []
  const variation = Object.entries(selectedAttributes)
    .filter(([attributeName, attributeValue]) => {
      return !!variationAttributes.find((variationAttribute) => {
        const { value, label } = variationAttribute as VariationAttribute
        return !value && label === attributeName
      })
    })
    .map(([attributeName, attributeValue]) => ({
      attributeName: attributeName.toLowerCase(),
      attributeValue,
    }))
  const { fetching, mutate, quantityFound } = useCartMutations(productId, variationId, variation)

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
  //   } else {
  //     setQuantity(1)
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
      <form onSubmit={onAddOrUpdate} className="flex flex-wrap gap-x-2 gap-y-4 items-center">
        <div className="w-full">
          {(attributes || []).map((attribute) => {
            const {
              id,
              name,
              label,
              options,
              variation: isVariationAttribute,
              terms,
            } = attribute as GlobalProductAttribute

            if (!isVariationAttribute) {
              return null
            }

            return (
              <div key={id} className="w-full flex gap-x-4">
                <p className="text-lg font-serif font-medium">{label || name}</p>
                <RadioGroup
                  className="flex gap-2"
                  name={name as string}
                  onValueChange={(value) => {
                    selectAttributes({
                      ...selectedAttributes,
                      [name as string]: value,
                    })
                  }}
                >
                  {(terms?.nodes || options)?.map((option) => {
                    let value: string
                    let buttonLabel: string
                    let style: CSSProperties | undefined
                    let id
                    if (typeof option !== 'object') {
                      id = `${name}-${option}`
                      value = option as string
                      buttonLabel = option.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())
                    } else {
                      const { id: globalId, name: termName, slug } = option as TermNode
                      id = globalId
                      value = termName as string
                      buttonLabel = termName as string
                      if (name?.toLowerCase() === 'color') {
                        style = {
                          backgroundColor: slug as string,
                        }
                      }
                    }

                    return (
                      <div key={id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          id={id}
                          className="w-6 h-6 text-lg"
                          value={value}
                          checked={selectedAttributes[name as string] === value}
                          style={style}
                        />
                        <Label htmlFor={id}>{buttonLabel}</Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            )
          })}
        </div>
        {hasSelectedVariation ? (
          <>
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
            <div className="flex items-center ">
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
            <p className="basis-auto grow text-center font-serif text-lg">
              {outOfStock && 'Out Of Stock'}
              {(!soldIndividually || outOfStock) && `× $${rawPrice} = `}
              {!outOfStock && <strong>{`$${Number(rawPrice) * localValue}`}</strong>}
            </p>
            <div className="basis-full md:basis-auto flex gap-x-2">
              <Button
                type="submit"
                className={cn('basis-full md:basis-auto inline-flex gap-2')}
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
          </>
        ) : (
          <p className="basis-full md:basis-auto text-center font-serif text-lg">
            This product is not available at this time. Sorry, for the inconvenience.
          </p>
        )}
      </form>
    </>
  )
}
