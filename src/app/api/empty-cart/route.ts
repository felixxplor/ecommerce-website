// app/api/empty-cart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { gql } from 'graphql-request'

// Define a type for the expected response
interface EmptyCartResponse {
  emptyCart: {
    clientMutationId: string
    cart: {
      contents: {
        itemCount: number
      }
      total: string
    }
  }
}

const EmptyCartMutation = gql`
  mutation EmptyCart($input: EmptyCartInput!) {
    emptyCart(input: $input) {
      clientMutationId
      cart {
        contents {
          itemCount
        }
        total
      }
    }
  }
`

export async function POST(request: NextRequest) {
  // Check if delay is requested
  const { searchParams } = new URL(request.url)
  const delayMs = parseInt(searchParams.get('delay') || '0', 10)
  const transactionId = searchParams.get('transaction_id')

  if (delayMs > 0) {
    // Wait for specified milliseconds
    await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5000))) // Max 5 seconds
    // console.log(`Delayed empty cart operation by ${delayMs}ms`)
  }

  // Try to get wooSession from multiple locations for secure operation
  let wooSession: string | undefined

  // 1. First check in headers
  const wooSessionHeader = request.headers.get('woocommerce-session')
  if (wooSessionHeader) {
    // Remove 'Session ' prefix if it exists
    wooSession = wooSessionHeader.startsWith('Session ')
      ? wooSessionHeader.substring(8)
      : wooSessionHeader
  }

  // 2. Then check in search params
  if (!wooSession) {
    wooSession = searchParams.get('woo_session') || undefined
  }

  // 3. Finally check in request body
  if (!wooSession) {
    try {
      const body = await request.json()
      wooSession = body.wooSession
    } catch (e) {
      // This is not necessarily an error - body might be empty
    }
  }

  // 4. Try the backup session if available
  if (!wooSession && typeof window !== 'undefined') {
    try {
      wooSession = localStorage.getItem('woo-session-backup') || undefined
    } catch (e) {
      // Browser storage not available in this context
    }
  }

  // Validate request
  if (!wooSession) {
    return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
  }

  try {
    const graphQLClient = getClient()

    // Format session correctly for the API
    const formattedSession = wooSession.startsWith('Session ')
      ? wooSession
      : `Session ${wooSession}`

    graphQLClient.setHeader('woocommerce-session', formattedSession)

    // console.log(
    //   'Attempting to empty cart with session:',
    //   wooSession.substring(0, 10) + '...',
    //   transactionId ? `transaction ID: ${transactionId}` : ''
    // )

    // Generate a unique client mutation ID with transaction ID if available
    const clientMutationId = `empty-cart-${transactionId || Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`

    // Type the response properly
    const result = await graphQLClient.request<EmptyCartResponse>(EmptyCartMutation, {
      input: {
        clientMutationId,
        clearPersistentCart: true,
      },
    })

    // Log the result
    const itemCount = result.emptyCart?.cart?.contents?.itemCount || 0
    // console.log(
    //   `Cart emptied successfully. New item count: ${itemCount}, ${
    //     transactionId ? `transaction ID: ${transactionId}` : ''
    //   }`
    // )

    return NextResponse.json({
      success: true,
      itemCount,
      clientMutationId,
      sessionUsed: wooSession.substring(0, 10) + '...',
      transactionId: transactionId || null,
    })
  } catch (error) {
    // console.error('Error emptying cart:', error)

    // Attempt with a different approach if GraphQL fails
    try {
      // console.log('Trying alternative method to empty cart...')
      const restEndpoint = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/store/v1/cart/items`

      // Get all cart items first
      const cartResponse = await fetch(restEndpoint, {
        headers: {
          'woocommerce-session': wooSession.startsWith('Session ')
            ? wooSession
            : `Session ${wooSession}`,
        },
      })

      if (!cartResponse.ok) {
        throw new Error('Failed to fetch cart items')
      }

      const cartItems = await cartResponse.json()

      // Delete each cart item
      for (const item of cartItems) {
        await fetch(`${restEndpoint}/${item.key}`, {
          method: 'DELETE',
          headers: {
            'woocommerce-session': wooSession.startsWith('Session ')
              ? wooSession
              : `Session ${wooSession}`,
          },
        })
      }

      return NextResponse.json({
        success: true,
        itemCount: 0,
        method: 'rest-fallback',
        itemsRemoved: cartItems.length,
      })
    } catch (fallbackError) {
      // console.error('Fallback cart clearing also failed:', fallbackError)

      return NextResponse.json(
        {
          error: 'Failed to empty cart',
          details: error instanceof Error ? error.message : 'Unknown error',
          fallbackError:
            fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback error',
        },
        { status: 500 }
      )
    }
  }
}
