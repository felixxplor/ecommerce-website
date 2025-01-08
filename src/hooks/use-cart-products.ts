import { useSession } from '@/client/session-provider'

// Define Maybe type for GraphQL nullable fields
type Maybe<T> = T | null

interface ProductNode {
  __typename?: 'SimpleProduct' | 'VariableProduct'
  name?: string | null
  price?: string | null
  image?: {
    sourceUrl: string | null
    altText: string | null
  } | null
}

interface CartProduct {
  key: string
  name: string
  quantity: number
  price: string
  total: string
  image: {
    sourceUrl: string
    altText: string
  }
  variation?: {
    attributes: Array<{
      name: string
      value: string
    }>
  }
}

export const useCartProducts = () => {
  const { cart } = useSession()

  const getProducts = (): CartProduct[] => {
    if (!cart?.contents?.nodes) {
      return []
    }

    return cart.contents.nodes.map((item): CartProduct => {
      const productNode = item.product?.node as ProductNode

      return {
        key: item.key || '',
        name: productNode?.name || '',
        quantity: item.quantity || 0,
        price: productNode?.price || '',
        total: item.total || '',
        image: {
          sourceUrl: productNode?.image?.sourceUrl || '',
          altText: productNode?.image?.altText || '',
        },
        variation: item.variation?.attributes
          ? {
              attributes: item.variation.attributes.map((attr) => ({
                name: attr?.name || '',
                value: attr?.value || '',
              })),
            }
          : undefined,
      }
    })
  }

  const getTotalItems = (): number => {
    return cart?.contents?.itemCount ?? 0
  }

  const getCartTotal = (): string => {
    return cart?.total ?? '0'
  }

  return {
    products: getProducts(),
    totalItems: getTotalItems(),
    cartTotal: getCartTotal(),
  }
}
