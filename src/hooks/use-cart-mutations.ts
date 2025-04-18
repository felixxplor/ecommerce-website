import { useSession } from '@/client/session-provider'
import { useEffect, useMemo, useState } from 'react'

export interface CartMutationInput {
  mutation?: 'add' | 'update' | 'remove'
  quantity?: number
  all?: boolean
  variation?: {
    attributeName: string
    attributeValue: string
  }[]
}

const useCartMutations = (
  productId: number,
  variationId?: number,
  variation?: {
    attributeName: string
    attributeValue: string
  }[],
  extraData?: string
) => {
  const { cart, updateCart, findInCart, fetching } = useSession()
  const [quantityFound, setQuantityInCart] = useState(
    (findInCart(productId, variationId, variation, extraData)?.quantity as number) || 0
  )
  const itemKey = useMemo(
    () => findInCart(productId, variationId, variation, extraData)?.key,
    [findInCart, productId, variationId, variation, extraData]
  )

  useEffect(() => {
    setQuantityInCart(findInCart(productId, variationId, variation, extraData)?.quantity || 0)
  }, [findInCart, productId, variationId, variation, extraData, cart?.contents?.nodes])

  async function mutate<T extends CartMutationInput>(values: T) {
    const { quantity = 1, all = false, mutation = 'update' } = values

    if (!cart) {
      return
    }

    if (!productId) {
      throw new Error('No item provided.')
    }

    try {
      switch (mutation) {
        case 'remove': {
          if (!quantityFound) {
            throw new Error('Provided item not in cart')
          }

          if (!itemKey) {
            throw new Error('Failed to find item in cart.')
          }

          await updateCart({
            mutation: 'remove',
            keys: [itemKey],
            all,
          })
          break
        }
        case 'update': {
          if (!quantityFound) {
            throw new Error('Failed to find item in cart.')
          }

          if (!itemKey) {
            throw new Error('Failed to find item in cart.')
          }

          await updateCart({
            mutation: 'update',
            items: [{ key: itemKey, quantity }],
          })
          break
        }
        case 'add': {
          // Explicitly handle add case instead of using default
          await updateCart({
            mutation: 'add',
            quantity, // Pass the quantity directly here
            productId,
            variationId,
            variation,
            extraData,
          })
          break
        }
      }
    } catch (error) {
      console.error('Cart mutation error:', error)
      throw error
    }
  }

  const store = {
    fetching,
    quantityFound,
    mutate,
  }

  return store
}

export default useCartMutations
