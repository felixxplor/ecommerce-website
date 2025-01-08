import { GraphQLError } from 'graphql/error'

import { Customer, Cart } from '@/graphql'
import { isSSR } from '@/utils/ssr'
import { getClientSessionId } from '@/utils/client'
import { MINUTE_IN_SECONDS, time } from '@/utils/nonce'
import { NextRequest } from 'next/server'

export const isDev = () => !!process.env.WEBPACK_DEV_SERVER

// Fetch
type ResponseErrors = {
  errors?: {
    message: string
    data?: unknown
  }
}
async function apiCall<T>(url: string, input: globalThis.RequestInit) {
  try {
    console.log('Making API call to:', url, 'with input:', input)

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...input,
    })

    console.log('Response status:', response.status)

    const json: T & ResponseErrors = await response.json()
    console.log('Response json:', json)

    if (json?.errors || response.status !== 200) {
      if (isDev()) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          errors: json?.errors,
          url,
        })
      }
      throw new Error(json.errors?.message || `Failed to fetch: ${url}`)
    }

    return json
  } catch (error) {
    console.error('API Call Error:', {
      url,
      error,
      input,
    })
    throw error
  }
}

// Auth management.
function saveCredentials(authToken: string, sessionToken?: string, refreshToken?: string) {
  if (isSSR()) {
    return
  }

  sessionStorage.setItem(process.env.AUTH_TOKEN_SS_KEY as string, authToken)
  if (!!sessionToken) {
    localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
    // Set secure cookie with proper attributes
    document.cookie = `woocommerce-session=${sessionToken}; path=/; secure; samesite=strict`
  }
  if (refreshToken) {
    localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY as string, refreshToken)
  }
}

function saveSessionToken(sessionToken: string) {
  localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
}

export function hasCredentials() {
  if (isSSR()) {
    return false
  }
  const sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
  const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string)

  if (!!sessionToken && !!authToken && !!refreshToken) {
    return true
  }

  return false
}

function setAuthTokenExpiry() {
  const authTimeout = time() + 15 * MINUTE_IN_SECONDS
  sessionStorage.setItem(process.env.AUTH_TOKEN_EXPIRY_SS_KEY as string, `${authTimeout}`)
}

function authTokenIsExpired() {
  const authTimeout = sessionStorage.getItem(process.env.AUTH_TOKEN_EXPIRY_SS_KEY as string)
  if (!authTimeout || Number(authTimeout) < time()) {
    return true
  }
}

type FetchAuthTokenResponse = {
  authToken: string
  sessionToken: string
}

async function fetchAuthToken() {
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string)
  if (!refreshToken) {
    // eslint-disable-next-line no-console
    isDev() && console.error('Unauthorized')
    return null
  }

  const json = await apiCall<FetchAuthTokenResponse>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })

  const { authToken, sessionToken } = json
  saveCredentials(authToken, sessionToken)
  setAuthTokenExpiry()

  return authToken
}

let tokenSetter: ReturnType<typeof setInterval>
function setAutoFetcher() {
  if (tokenSetter) {
    clearInterval(tokenSetter)
  }
  tokenSetter = setInterval(async () => {
    if (!hasCredentials()) {
      clearInterval(tokenSetter)
      return
    }
    fetchAuthToken()
  }, Number(process.env.AUTH_KEY_TIMEOUT || 30000))
}

type LoginResponse = {
  authToken: string
  refreshToken: string
  sessionToken: string
}
export async function login(username: string, password: string): Promise<boolean | string> {
  let json: LoginResponse
  try {
    json = await apiCall<LoginResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  } catch (error) {
    return (error as GraphQLError)?.message || (error as string)
  }

  const { authToken, refreshToken, sessionToken } = json
  saveCredentials(authToken, sessionToken, refreshToken)
  setAutoFetcher()

  return true
}

interface RegisterResponse {
  authToken: string
  refreshToken: string
  sessionToken: string
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<boolean | string> {
  let json: RegisterResponse
  try {
    json = await apiCall<RegisterResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    })
  } catch (error) {
    return (error as GraphQLError)?.message || (error as string)
  }

  const { authToken, refreshToken, sessionToken } = json
  saveCredentials(authToken, sessionToken, refreshToken)
  setAutoFetcher()

  return true
}

export async function getAuthToken() {
  let authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)
  if (!authToken || authTokenIsExpired()) {
    authToken = await fetchAuthToken()
  }

  if (authToken && !tokenSetter) {
    setAutoFetcher()
  }
  return authToken
}

type FetchSessionTokenResponse = {
  sessionToken: string
}

async function fetchSessionToken() {
  const json = await apiCall<FetchSessionTokenResponse>('/api/auth', { method: 'GET' })

  const { sessionToken } = json

  sessionToken && saveSessionToken(sessionToken)
  return sessionToken
}

async function getSessionToken() {
  let sessionToken = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
  if (!sessionToken) {
    sessionToken = await fetchSessionToken()
  }
  return sessionToken
}

export function hasRefreshToken() {
  const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string)

  return !!refreshToken
}

export function hasAuthToken() {
  const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

  return !!authToken
}

export type FetchSessionResponse = {
  customer: Customer
  cart: Cart
}
export async function getSession(): Promise<FetchSessionResponse | string> {
  const authToken = await getAuthToken()
  const sessionToken = await getSessionToken()
  let json: FetchSessionResponse
  try {
    json = await apiCall<FetchSessionResponse>('/api/session', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        authToken,
      }),
    })
  } catch (error) {
    return (error as GraphQLError)?.message || (error as string)
  }

  const { customer } = json
  saveSessionToken(customer.sessionToken as string)

  return json
}

type FetchCartResponse = {
  cart: Cart
  sessionToken: string
}
export type CartAction =
  | {
      mutation: 'add'
      productId: number
      quantity: number
      variationId?: number
      variation?: {
        attributeName: string
        attributeValue: string
      }[]
      extraData?: string
    }
  | {
      mutation: 'update'
      items: { key: string; quantity: number }[]
    }
  | {
      mutation: 'remove'
      keys: string[]
      all?: boolean
    }

export async function updateCart(input: CartAction): Promise<Cart | string> {
  const sessionToken = await getSessionToken()
  const authToken = await getAuthToken()
  let json: FetchCartResponse
  try {
    json = await apiCall<FetchCartResponse>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        authToken,
        input,
      }),
    })
  } catch (error) {
    return (error as GraphQLError)?.message || (error as string)
  }

  const { cart } = json
  saveSessionToken(json.sessionToken)

  return cart
}

export type FetchAuthURLResponse = {
  cartUrl: string
  checkoutUrl: string
  accountUrl: string
}
export async function fetchAuthURLs(): Promise<FetchAuthURLResponse | string> {
  const authToken = await getAuthToken()
  const sessionToken = await getSessionToken()
  const { clientSessionId, timeout } = await getClientSessionId()
  let json: FetchAuthURLResponse
  try {
    json = await apiCall<FetchAuthURLResponse>('/api/nonce', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        authToken,
        clientSessionId,
        timeout,
      }),
    })
  } catch (error) {
    return (error as GraphQLError)?.message || (error as string)
  }

  return json
}

export function hasTokens(request: NextRequest) {
  const sessionToken = request.cookies.get('woocommerce-session')
  // Check if there's a value and it's not "null" string
  return !!sessionToken?.value && sessionToken.value !== 'null'
}

export function deleteCredentials() {
  if (isSSR()) {
    return
  }

  if (tokenSetter) {
    clearInterval(tokenSetter)
  }
  localStorage.removeItem(process.env.SESSION_TOKEN_LS_KEY as string)
  sessionStorage.removeItem(process.env.AUTH_TOKEN_SS_KEY as string)
  localStorage.removeItem(process.env.REFRESH_TOKEN_LS_KEY as string)
}
