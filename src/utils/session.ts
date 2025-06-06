import { GraphQLError } from 'graphql/error'

import {
  Customer,
  Cart,
  getClient,
  UpdateCustomerDocument,
  GetCustomerDetailsQuery,
  GetCustomerDetailsDocument,
  UpdateCustomerMutation,
  VerifyPasswordMutation,
  VerifyPasswordDocument,
} from '@/graphql'
import { isSSR } from '@/utils/ssr'
import { getClientSessionId } from '@/utils/client'
import { MINUTE_IN_SECONDS, time } from '@/utils/nonce'
import { NextRequest } from 'next/server'
import { ClientError } from 'graphql-request'

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
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...input,
    })

    const json: T & ResponseErrors = await response.json()

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

  // Only store auth token in sessionStorage, nothing else
  sessionStorage.setItem(process.env.AUTH_TOKEN_SS_KEY as string, authToken)

  // Store refresh token if provided
  if (refreshToken) {
    localStorage.setItem(process.env.REFRESH_TOKEN_LS_KEY as string, refreshToken)
  }

  // Store session token if provided
  if (sessionToken) {
    localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
    // Set WooCommerce session
  }
}

function saveSessionToken(sessionToken: string) {
  localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
}

export function hasCredentials() {
  if (isSSR()) {
    return false
  }
  const sessionToken = localStorage.getItem('woo-session-token')
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
  try {
    const sessionResponse = await fetch('/api/auth', { method: 'GET' })
    const sessionData = await sessionResponse.json()
    if (sessionData.sessionToken) {
      localStorage.setItem('woo-session', sessionData.sessionToken)
    }
  } catch (error) {
    console.error('Failed to get new session:', error)
  }

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

/**
 * Change password for logged in customer.
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<true | string> => {
  try {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)
    if (!authToken) {
      return 'No authentication token found'
    }

    const client = getClient()
    client.setHeader('Authorization', `Bearer ${authToken}`)

    // Verify current password
    const verifyResponse = await client.request<VerifyPasswordMutation>(VerifyPasswordDocument, {
      password: currentPassword,
    })

    // Check for errors in the response
    if (!verifyResponse.verifyCustomerPassword?.success) {
      // Return the error message from the GraphQL response
      return verifyResponse.verifyCustomerPassword?.message || 'Current password is incorrect'
    }

    // Get customer ID
    const { customer } = await client.request<GetCustomerDetailsQuery>(GetCustomerDetailsDocument)

    if (!customer?.id) {
      return 'Customer not found'
    }

    // Update to new password
    const response = await client.request<UpdateCustomerMutation>(UpdateCustomerDocument, {
      input: {
        id: customer.id,
        password: newPassword,
      },
    })

    if (!response.updateCustomer?.customer) {
      return 'Failed to update password'
    }

    return true
  } catch (error) {
    // This catches GraphQL errors
    if (error instanceof ClientError) {
      const graphqlError = error.response?.errors?.[0]
      return graphqlError?.message || 'Failed to change password'
    }

    return 'An unknown error occurred'
  }
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
  let sessionToken = localStorage.getItem('woo-session-token')
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
export async function getSession(forceRefresh = false): Promise<FetchSessionResponse | string> {
  const authToken = await getAuthToken()

  // If forceRefresh is true, fetch a new session token instead of using the stored one
  let sessionToken: string | null
  if (forceRefresh) {
    sessionToken = await fetchSessionToken()
  } else {
    sessionToken = await getSessionToken()
  }

  // Check for a backup session from payment redirects
  const backupSession = localStorage.getItem('woo-session-backup')
  if (backupSession && !sessionToken) {
    sessionToken = backupSession
    localStorage.removeItem('woo-session-backup') // Clean up after use
  }

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

export function deleteCredentials() {
  if (isSSR()) {
    return
  }

  if (tokenSetter) {
    clearInterval(tokenSetter)
  }

  // Clear tokens
  localStorage.removeItem(process.env.SESSION_TOKEN_LS_KEY as string)
  sessionStorage.removeItem(process.env.AUTH_TOKEN_SS_KEY as string)
  localStorage.removeItem(process.env.REFRESH_TOKEN_LS_KEY as string)
  localStorage.removeItem('woo-session')
  sessionStorage.removeItem(process.env.AUTH_TOKEN_EXPIRY_SS_KEY as string)
}
