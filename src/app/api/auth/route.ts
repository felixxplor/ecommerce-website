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
    console.log('📡 [GET /api/auth] Handler invoked')
    const client = getClient()
    console.log('📡 [GET /api/auth] Calling GraphQL endpoint…')

    const { data, headers } = await client.rawRequest<GetSessionQuery>(print(GetSessionDocument))
    console.log('📡 [GET /api/auth] GraphQL response data:', JSON.stringify(data))

    const cart = data?.cart
    const customer = data?.customer
    const sessionToken = headers.get('woocommerce-session') || customer?.sessionToken
    console.log('📡 [GET /api/auth] Extracted sessionToken:', sessionToken)

    if (!cart || !customer || !sessionToken) {
      console.error(
        '📡 [GET /api/auth] Missing data:',
        JSON.stringify({ cart, customer, sessionToken })
      )
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve session credentials.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ sessionToken })
  } catch (err) {
    console.error('📡 [GET /api/auth] Caught error:', err)
    return NextResponse.json(
      { errors: { message: 'Sorry, something went wrong' } },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('📡 [POST /api/auth] Handler invoked')
    const client = getClient()

    const body = await request.json()
    console.log('📡 [POST /api/auth] Incoming body:', JSON.stringify(body))
    let authToken = body.authToken
    const refreshToken = body.refreshToken

    if (!authToken && !refreshToken) {
      console.error('📡 [POST /api/auth] No authToken or refreshToken provided')
      return NextResponse.json(
        { errors: { message: 'No refresh token provided' } },
        { status: 500 }
      )
    }

    if (!authToken && refreshToken) {
      console.log('📡 [POST /api/auth] Using refreshToken to get a new authToken')
      client.setHeaders({})
      const results = await client.request<RefreshAuthTokenMutation>(RefreshAuthTokenDocument, {
        refreshToken,
      })
      console.log('📡 [POST /api/auth] Refresh results:', JSON.stringify(results))

      authToken = results?.refreshJwtAuthToken?.authToken
      console.log('📡 [POST /api/auth] New authToken:', authToken)

      if (!authToken) {
        console.error('📡 [POST /api/auth] Failed to retrieve auth token.')
        return NextResponse.json(
          { errors: { message: 'Failed to retrieve auth token.' } },
          { status: 500 }
        )
      }
    }

    console.log('📡 [POST /api/auth] Setting Authorization header and calling GraphQL…')
    client.setHeaders({ Authorization: `Bearer ${authToken}` })
    const { data: cartData, headers } = await client.rawRequest<GetSessionQuery>(
      print(GetSessionDocument)
    )
    console.log('📡 [POST /api/auth] GraphQL session data:', JSON.stringify(cartData))

    const newSessionToken = cartData?.customer?.sessionToken
    console.log('📡 [POST /api/auth] Extracted newSessionToken:', newSessionToken)

    if (!newSessionToken) {
      console.error('📡 [POST /api/auth] Failed to validate auth token.')
      return NextResponse.json(
        { errors: { message: 'Failed to validate auth token.' } },
        { status: 500 }
      )
    }

    const sessionToken = headers.get('woocommerce-session') || newSessionToken
    console.log('📡 [POST /api/auth] Final sessionToken to return:', sessionToken)

    return NextResponse.json({ authToken, sessionToken })
  } catch (err) {
    console.error('📡 [POST /api/auth] Caught error:', err)
    return NextResponse.json(
      { errors: { message: 'Sorry, something went wrong' } },
      { status: 500 }
    )
  }
}
