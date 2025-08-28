import { NextResponse } from 'next/server'
import { print } from 'graphql'

import {
  GetSessionDocument,
  GetSessionQuery,
  RefreshAuthTokenDocument,
  RefreshAuthTokenMutation,
  getClient,
} from '@/graphql'

export async function GET(request: Request) {
  try {
    console.log('[GET /api/auth] Handler invoked - generating new session token')

    const client = getClient()

    // Make GraphQL request WITHOUT any session headers to get a fresh session
    console.log('[GET /api/auth] Making GraphQL request for new session...')
    const { data, headers } = await client.rawRequest<GetSessionQuery>(print(GetSessionDocument))
    console.log('[GET /api/auth] GraphQL response received')

    const cart = data?.cart
    const customer = data?.customer

    // Try to get session token from response headers first (WooGraphQL priority)
    let sessionToken = headers.get('woocommerce-session')
    console.log(
      '[GET /api/auth] Session token from headers:',
      sessionToken?.substring(0, 20) + '...'
    )

    // Fallback to customer sessionToken if headers don't have it
    if (!sessionToken && customer?.sessionToken) {
      sessionToken = customer.sessionToken
      console.log(
        '[GET /api/auth] Using session token from customer object:',
        sessionToken?.substring(0, 20) + '...'
      )
    }

    // If still no token, generate a fallback (this should rarely happen)
    if (!sessionToken) {
      sessionToken = `guest_${Date.now()}_${crypto.randomUUID()}`
      console.log(
        '[GET /api/auth] Generated fallback session token:',
        sessionToken.substring(0, 20) + '...'
      )
    }

    if (!cart || !customer) {
      console.error('[GET /api/auth] Missing data:', { hasCart: !!cart, hasCustomer: !!customer })
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve session credentials.' } },
        { status: 500 }
      )
    }

    console.log('[GET /api/auth] Returning session token:', sessionToken.substring(0, 20) + '...')
    return NextResponse.json({ sessionToken })
  } catch (err) {
    console.error('[GET /api/auth] Caught error:', err)

    // Even on error, try to provide a fallback session token
    const fallbackToken = `guest_${Date.now()}_${crypto.randomUUID()}`
    console.log(
      '[GET /api/auth] Returning fallback token due to error:',
      fallbackToken.substring(0, 20) + '...'
    )

    return NextResponse.json({
      sessionToken: fallbackToken,
    })
  }
}

export async function POST(request: Request) {
  try {
    console.log('[POST /api/auth] Handler invoked')
    const client = getClient()

    const body = await request.json()
    console.log('[POST /api/auth] Processing refresh token request')

    let authToken = body.authToken
    const refreshToken = body.refreshToken

    if (!authToken && !refreshToken) {
      console.error('[POST /api/auth] No authToken or refreshToken provided')
      return NextResponse.json(
        { errors: { message: 'No refresh token provided' } },
        { status: 500 }
      )
    }

    if (!authToken && refreshToken) {
      console.log('[POST /api/auth] Using refreshToken to get new authToken')
      client.setHeaders({})
      const results = await client.request<RefreshAuthTokenMutation>(RefreshAuthTokenDocument, {
        refreshToken,
      })
      console.log('[POST /api/auth] Refresh token request completed')

      authToken = results?.refreshJwtAuthToken?.authToken
      console.log('[POST /api/auth] New authToken obtained:', !!authToken)

      if (!authToken) {
        console.error('[POST /api/auth] Failed to retrieve auth token from refresh')
        return NextResponse.json(
          { errors: { message: 'Failed to retrieve auth token.' } },
          { status: 500 }
        )
      }
    }

    console.log('[POST /api/auth] Setting Authorization header and fetching session...')
    client.setHeaders({ Authorization: `Bearer ${authToken}` })
    const { data: sessionData, headers } = await client.rawRequest<GetSessionQuery>(
      print(GetSessionDocument)
    )
    console.log('[POST /api/auth] Authenticated session data received')

    // For authenticated users, prefer session token from response data
    let sessionToken = sessionData?.customer?.sessionToken

    // Fallback to response headers if not in data
    if (!sessionToken) {
      sessionToken = headers.get('woocommerce-session')
      console.log(
        '[POST /api/auth] Using session token from headers:',
        sessionToken?.substring(0, 20) + '...'
      )
    } else {
      console.log(
        '[POST /api/auth] Using session token from customer data:',
        sessionToken?.substring(0, 20) + '...'
      )
    }

    if (!sessionToken) {
      console.error('[POST /api/auth] Failed to obtain session token for authenticated user')
      return NextResponse.json(
        { errors: { message: 'Failed to validate auth token.' } },
        { status: 500 }
      )
    }

    console.log('[POST /api/auth] Returning authenticated session')
    return NextResponse.json({ authToken, sessionToken })
  } catch (err) {
    console.error('[POST /api/auth] Caught error:', err)
    return NextResponse.json(
      { errors: { message: 'Sorry, something went wrong' } },
      { status: 500 }
    )
  }
}
