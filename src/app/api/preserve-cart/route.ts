// app/api/preserve-cart/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'

export async function POST(request: Request) {
  try {
    const { wooSession } = await request.json()

    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    // Set up GraphQL client with woocommerce session
    const graphQLClient = getClient()
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    // Simply log that we want to preserve the cart for this session
    // console.log('Cart preserved for session:', wooSession)

    // Store this in localStorage as well to be double-sure
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cart-preserved', 'true')
    }

    return NextResponse.json({ success: true, cartPreserved: true })
  } catch (error) {
    // console.error('Error preserving cart:', error)
    return NextResponse.json(
      {
        error: 'Failed to preserve cart',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
