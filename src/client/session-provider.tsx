'use client'

import { createContext, PropsWithChildren, useContext, useReducer, useEffect } from 'react'

import { Customer, Cart, CartItem, MetaData, VariationAttribute } from '@/graphql'
import {
  hasCredentials,
  deleteCredentials,
  getSession as getSessionApiCall,
  FetchSessionResponse as Session,
  FetchAuthURLResponse as AuthUrls,
  fetchAuthURLs,
  login as loginApiCall,
  register as registerApiCall,
  updateCart as updateCartApiCall,
  changePassword as changePasswordApiCall,
  CartAction,
} from '@/utils/session'
import { deleteClientCredentials } from '@/utils/client'
import { useToast } from '@/hooks/use-toast'

export interface SessionContext {
  isAuthenticated: boolean
  hasCredentials: boolean
  cart: Cart | null
  customer: Customer | null
  cartUrl: string
  checkoutUrl: string
  accountUrl: string
  fetching: boolean
  logout: (message?: string) => void
  login: (username: string, password: string, successMessage?: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  updateCart: (action: CartAction) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  refetch: () => Promise<boolean>
  refreshCart: () => Promise<boolean>
  findInCart: (
    productId: number,
    variationId?: number,
    variation?: {
      attributeName: string
      attributeValue: string
    }[],
    extraData?: string
  ) => CartItem | undefined
}

const initialContext: SessionContext = {
  isAuthenticated: false,
  hasCredentials: false,
  cart: null,
  customer: null,
  cartUrl: '',
  checkoutUrl: '',
  accountUrl: '',
  fetching: false,
  logout: (message?: string) => null,
  login: (username: string, password: string) =>
    new Promise((resolve) => {
      resolve(false)
    }),
  register: (username: string, email: string, password: string) =>
    new Promise((resolve) => {
      resolve(false)
    }),
  updateCart: (action: CartAction) =>
    new Promise((resolve) => {
      resolve(false)
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    new Promise((resolve) => {
      resolve(false)
    }),
  refreshCart: () =>
    new Promise((resolve) => {
      resolve(false)
    }),
  refetch: () =>
    new Promise((resolve) => {
      resolve(false)
    }),
  findInCart: (
    productId: number,
    variationId?: number,
    variation?: {
      attributeName: string
      attributeValue: string
    }[],
    extraData?: string
  ) => undefined,
}

export const sessionContext = createContext<SessionContext>(initialContext)

type SessionAction =
  | {
      type: 'UPDATE_STATE'
      payload: SessionContext
    }
  | {
      type: 'LOGOUT'
    }

const reducer = (state: SessionContext, action: SessionAction): SessionContext => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload,
      }
    case 'LOGOUT':
      return {
        ...state,
        customer: null,
        cart: null,
      }
    default:
      throw new Error('Invalid action dispatched to session data reducer')
  }
}

/**
 * Checks if product matches the provided cart/registry item.
 *
 * @param {number} productId Item product ID.
 * @param {number} variationId Item variation ID.
 * @param {string} extraData Item metadata JSON string.
 * @returns
 */
const cartItemSearch =
  (
    productId: number,
    variationId?: number,
    variationData?: {
      attributeName: string
      attributeValue: string
    }[],
    extraData?: string,
    skipMeta = false
  ) =>
  ({ product, variation, extraData: existingExtraData = [] }: CartItem) => {
    if (product?.node?.databaseId && productId !== product.node.databaseId) {
      return false
    }

    if (variation?.node?.databaseId && variationId !== variation.node.databaseId) {
      return false
    }

    if (variationData?.length && !variation?.attributes?.length) {
      return false
    }

    if (variationData?.length && variation?.attributes?.length) {
      const variationAttributes = variation.attributes as VariationAttribute[]
      const found = variationData.filter(
        ({ attributeName, attributeValue }) =>
          !!variationAttributes?.find(
            ({ label, value }) =>
              (label as string).toLowerCase() === attributeName && value === attributeValue
          )
      ).length

      if (!found) return false
    }

    if (skipMeta) {
      return true
    }

    if (existingExtraData?.length && !extraData) {
      return false
    }

    if (!!extraData && typeof extraData === 'string') {
      const decodeMeta = JSON.parse(extraData)
      let found = false
      Object.entries(decodeMeta).forEach(([targetKey]) => {
        found = !!(existingExtraData as MetaData[])?.find(
          ({ key, value }) => key === targetKey && value === `${decodeMeta[targetKey]}`
        )
      })

      if (!found) {
        return false
      }
    }

    return true
  }

const { Provider } = sessionContext

export function SessionProvider({ children }: PropsWithChildren) {
  const { toast } = useToast()
  const [state, dispatch] = useReducer(reducer, initialContext)

  // Process session fetch request response.
  const setSession = (session: Session | string, authUrls: AuthUrls | string) => {
    if (typeof session === 'string') {
      toast({
        title: 'Fetch Session Error',
        description: 'Failed to fetch session.',
        variant: 'destructive',
        style: { color: '#000' },
      })
    }
    if (typeof authUrls === 'string') {
      toast({
        title: 'Session Error',
        description: 'Failed to generate session URLs. Please refresh the page.',
        variant: 'destructive',
        style: { color: '#000' },
      })
    }

    if (typeof session === 'string' || typeof authUrls === 'string') {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { fetching: false } as SessionContext,
      })
      return false
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        ...session,
        ...authUrls,
        fetching: false,
      } as SessionContext,
    })

    return true
  }

  // Process cart action response.
  const setCart = (cart: Cart | string) => {
    if (typeof cart === 'string') {
      toast({
        title: 'Cart Action Error',
        description: 'Cart mutation failed.',
        variant: 'destructive',
        style: { color: '#000' },
      })

      dispatch({
        type: 'UPDATE_STATE',
        payload: { fetching: false } as SessionContext,
      })
      return false
    }

    dispatch({
      type: 'UPDATE_STATE',
      payload: { cart, fetching: false } as SessionContext,
    })

    return true
  }

  // Change password
  const changePassword = (currentPassword: string, newPassword: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })

    return changePasswordApiCall(currentPassword, newPassword).then((success) => {
      if (typeof success === 'string') {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { fetching: false } as SessionContext,
        })
        return false
      }

      return fetchSession()
    })
  }

  // Fetch customer data.
  const fetchSession = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })

    // Check if we've just returned from a payment redirect
    const params = new URLSearchParams(window.location.search)
    const isPaymentReturn = params.has('payment_intent') || params.has('redirect_status')

    if (isPaymentReturn) {
      // Force refresh the session after payment return
      return getSessionApiCall(true).then(async (sessionPayload) => {
        const authUrlPayload = await fetchAuthURLs()
        return setSession(sessionPayload, authUrlPayload)
      })
    }

    return getSessionApiCall().then(async (sessionPayload) => {
      const authUrlPayload = await fetchAuthURLs()
      return setSession(sessionPayload, authUrlPayload)
    })
  }

  const refreshCart = () => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })

    return getSessionApiCall(true).then(async (sessionPayload) => {
      // We only need the cart data, no need to fetch auth URLs again
      if (typeof sessionPayload === 'string') {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { fetching: false } as SessionContext,
        })
        return false
      }

      dispatch({
        type: 'UPDATE_STATE',
        payload: {
          cart: sessionPayload.cart,
          fetching: false,
        } as SessionContext,
      })

      return true
    })
  }

  const login = (username: string, password: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })
    return loginApiCall(username, password).then((success) => {
      if (typeof success === 'string') {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { fetching: false } as SessionContext,
        })
        return false
      }

      return fetchSession()
    })
  }

  const register = (username: string, email: string, password: string) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })

    return registerApiCall(username, email, password).then((success) => {
      if (typeof success === 'string') {
        dispatch({
          type: 'UPDATE_STATE',
          payload: { fetching: false } as SessionContext,
        })
        return false
      }

      return fetchSession()
    })
  }

  // Delete logout state and creds store locally.
  const logout = () => {
    // Clear the auth token
    sessionStorage.removeItem('woo-auth-token')
    dispatch({ type: 'LOGOUT' })
    deleteCredentials()
    deleteClientCredentials()
    fetchSession()
  }

  const updateCart = (action: CartAction) => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: { fetching: true } as SessionContext,
    })
    return updateCartApiCall(action).then(setCart)
  }

  const findInCart = (
    productId: number,
    variationId?: number,
    variation?: {
      attributeName: string
      attributeValue: string
    }[],
    extraData?: string
  ) => {
    const items = state?.cart?.contents?.nodes as CartItem[]
    if (!items) {
      return undefined
    }
    return (
      items.find(cartItemSearch(productId, variationId, variation, extraData, true)) || undefined
    )
  }

  useEffect(() => {
    if (state.fetching) {
      return
    }

    if (!state.customer || !state.cart) {
      fetchSession()
    }
  }, [])

  const store: SessionContext = {
    ...state,
    isAuthenticated: !!state.customer?.id && 'guest' !== state.customer.id,
    hasCredentials: hasCredentials(),
    logout,
    updateCart,
    refetch: fetchSession,
    findInCart,
    login,
    register,
    changePassword,
    refreshCart,
  }
  return <Provider value={store}>{children}</Provider>
}

export const useSession = () => useContext(sessionContext)
