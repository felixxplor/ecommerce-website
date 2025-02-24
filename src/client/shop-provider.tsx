'use client'

import {
  useEffect,
  useContext,
  useReducer,
  createContext,
  PropsWithChildren,
  useCallback,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import {
  Product,
  ProductCategory,
  PaColor,
  SimpleProduct,
  VariableProduct,
  ProductTypesEnum,
} from '@/graphql'

export type ProductWithPrice =
  | (SimpleProduct & { rawPrice: string })
  | (VariableProduct & { rawPrice: string })

type URLParts = {
  search?: string
  categories?: string[]
  colors?: string[]
  price?: [number, number | null]
  page?: number
  sort?: string
}
export interface ShopContext {
  currentUrl: string
  buildUrl: (params: URLParts) => string
  page: number
  search: string
  selectedCategories: string[]
  selectedColors: string[]
  priceRange: [number] | [number, number] | [number, number | null]
  setPriceRange: (priceRange: [number | null, number | null]) => void
  globalMin: number
  globalMax: number
  products: Product[] | null
  allProducts: Product[] | null
  sort: string
}

export type ShopAction = { type: 'UPDATE_STATE'; payload: Partial<ShopContext> }

const initialState: ShopContext = {
  currentUrl: '',
  buildUrl: () => '',
  page: 1,
  search: '',
  selectedCategories: [],
  selectedColors: [],
  priceRange: [0, null],
  setPriceRange: () => {},
  globalMin: 0,
  globalMax: 100,
  products: null,
  allProducts: null,
  sort: '',
}

const shopContext = createContext<ShopContext>(initialState)

export function useShopContext() {
  return useContext(shopContext)
}

const reducer = (state: ShopContext, action: ShopAction): ShopContext => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

function filterProducts(products: Product[], state: ShopContext) {
  let filteredProducts = products
  if (Object.is(state, initialState)) {
    return filteredProducts
  }

  // Search by category.
  if (state.selectedCategories.length) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.productCategories?.nodes?.some((category: ProductCategory) => {
        return state.selectedCategories.includes(category.slug as string)
      })
    })
  }

  // Search by color.
  if (state.selectedColors.length) {
    filteredProducts = filteredProducts.filter((product) => {
      return product.allPaColor?.nodes?.some((color: PaColor) => {
        return state.selectedColors.includes(color.slug as string)
      })
    })
  }

  // Search by name, description, and short description.
  if (state.search) {
    filteredProducts = filteredProducts.filter((product) => {
      return (
        product.name?.toLowerCase().includes(state.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(state.search.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(state.search.toLowerCase())
      )
    })
  }

  // Calculate global min and max prices before filtering by price range.
  const prices = filteredProducts.map((product) => {
    const stringPrice = (product as ProductWithPrice).rawPrice
    if (stringPrice && product.type === ProductTypesEnum.VARIABLE) {
      let rawPrices = stringPrice.split(',').map((price) => Number(price))
      rawPrices.sort()
      return rawPrices
    }
    if (stringPrice && product.type === ProductTypesEnum.SIMPLE) {
      return Number(stringPrice)
    }
    return 0
  })

  prices.sort((priceA, priceB) => {
    if (Array.isArray(priceA) && Array.isArray(priceB)) {
      return priceA[0] - priceB[0]
    }
    if (Array.isArray(priceA)) {
      return priceA[0] - (priceB as number)
    }
    if (Array.isArray(priceB)) {
      return (priceA as number) - priceB[0]
    }
    return (priceA as number) - (priceB as number)
  })

  const firstPrice = prices.length && prices[0]
  const lastPrice = prices.length && prices.slice(-1)[0]
  const globalMin = (Array.isArray(firstPrice) ? firstPrice[0] : firstPrice) || 0
  const globalMax = Array.isArray(lastPrice) ? lastPrice[0] : lastPrice

  if (state.priceRange[0] || state.priceRange[1]) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = (product as ProductWithPrice).rawPrice
      if (price && product.type === ProductTypesEnum.VARIABLE) {
        const prices = price.split(',')
        const min = prices[0]
        const max = prices.slice(-1)[0]
        return state.priceRange[1]
          ? min && Number(min) >= state.priceRange[0] && max && Number(max) <= state.priceRange[1]
          : min && Number(min) >= state.priceRange[0]
      } else if (price && product.type === ProductTypesEnum.SIMPLE) {
        return state.priceRange[1]
          ? Number(price) >= state.priceRange[0] && Number(price) <= state.priceRange[1]
          : Number(price) >= state.priceRange[0]
      }
      return false
    })
  }

  return {
    allProducts: products,
    products: filteredProducts,
    globalMin,
    globalMax,
    sort: state.sort,
  }
}

const { Provider } = shopContext

export interface ShopProviderProps {
  allProducts: Product[]
}

export function ShopProvider({ allProducts, children }: PropsWithChildren<ShopProviderProps>) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentParams = searchParams.toString()

  useEffect(() => {
    dispatch({
      type: 'UPDATE_STATE',
      payload: {
        search: searchParams.get('search') || '',
        selectedCategories: searchParams.get('categories')?.trim().split('|') || [],
        selectedColors: searchParams.get('colors')?.trim().split('|') || [],
        priceRange: (searchParams
          .get('price')
          ?.trim()
          .split('-')
          .map((p) => Number(p) || 0)
          .reverse() as [number, number | null]) || [0, null],
        page: Number(searchParams.get('page')) || 1,
        sort: searchParams.get('sort') || '', // Add this line
      },
    })
  }, [currentParams])

  const buildUrl = useCallback(
    (params: URLParts) => {
      const urlParts = {
        search: searchParams.get('search'),
        categories: searchParams.get('categories')?.trim().split('|') || [],
        colors: searchParams.get('colors')?.trim().split('|') || [],
        price: searchParams
          .get('price')
          ?.trim()
          .split('-')
          .map((p) => Number(p) || 0) as [number] | [number, number],
        page: Number(searchParams.get('page')),
        sort: searchParams.get('sort'),
        ...params,
      }

      // Create base URL
      const url = new URL(`${process.env.NEXT_PUBLIC_URL}/collections`)

      // Add sort parameter
      if (urlParts.sort) {
        url.searchParams.set('sort', urlParts.sort)
      }

      // Add search parameters
      if (urlParts.search) {
        url.searchParams.set('search', urlParts.search)
      } else {
        url.pathname = pathname
      }

      // Add other parameters
      if (urlParts.categories.length) {
        url.searchParams.set('categories', urlParts.categories.join('|'))
      }
      if (urlParts.colors.length) {
        url.searchParams.set('colors', urlParts.colors.join('|'))
      }

      const price = urlParts.price
      if (price) {
        // Handle case where min price is 0
        if (price[1] === 0 && price[0] > 0) {
          url.searchParams.set('price', `${price[0]}-0`)
        }
        // Handle case where max price is null
        else if (price[0] > 0 && !price[1]) {
          url.searchParams.set('price', `${price[0]}`)
        }
        // Handle normal price range cases
        else if (
          (price[0] !== 0 && state.globalMin !== price[0]) ||
          (price[1] && state.globalMax !== price[1])
        ) {
          url.searchParams.set('price', price.filter((p) => p !== undefined).join('-'))
        }
      }

      // Handle pagination
      if (urlParts.page && urlParts.page !== 1) {
        url.searchParams.set('page', urlParts.page.toString())
      }

      return `${url.pathname}${url.search}`
    },
    [searchParams, pathname]
  )

  const store = {
    ...state,
    currentUrl: `${pathname}${searchParams.toString()}`,
    buildUrl,
    ...filterProducts(allProducts, state),
    sort: state.sort,
  }

  return <Provider value={store}>{children}</Provider>
}
