// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { GetCustomerOrdersDocument, GetCustomerOrdersQuery } from '@/graphql/generated'
import { print } from 'graphql'

interface GraphQLError {
  response?: {
    errors?: Array<{
      message: string
    }>
  }
  message: string
  stack?: string
}

// Helper function to validate and extract token
function extractAndValidateToken(request: Request): {
  token: string | null
  error: NextResponse | null
} {
  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    console.log('No Authorization header found')
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'No authorization header' } }, { status: 401 }),
    }
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.log('Authorization header does not start with Bearer:', authHeader)
    return {
      token: null,
      error: NextResponse.json(
        { errors: { message: 'Invalid authorization format' } },
        { status: 401 }
      ),
    }
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    console.log('No token found after Bearer')
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'No token provided' } }, { status: 401 }),
    }
  }

  // Validate JWT format (should have 3 segments separated by dots)
  const segments = token.split('.')
  if (segments.length !== 3) {
    console.log(
      'Invalid token format - segments:',
      segments.length,
      'token:',
      token.substring(0, 50) + '...'
    )
    return {
      token: null,
      error: NextResponse.json({ errors: { message: 'Invalid token format' } }, { status: 401 }),
    }
  }

  console.log('Valid token extracted, length:', token.length)
  return { token, error: null }
}

export async function GET(request: Request) {
  try {
    const { token, error } = extractAndValidateToken(request)
    if (error) return error

    const client = getClient()
    client.setHeader('Authorization', `Bearer ${token}`)

    const wooSession = request.headers.get('woocommerce-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    console.log('Making GraphQL request for customer orders...')
    const data = await client.request<GetCustomerOrdersQuery>(print(GetCustomerOrdersDocument))

    if (!data.customer?.orders?.nodes) {
      console.log('No orders data returned')
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve orders.' } },
        { status: 500 }
      )
    }

    // Process orders to include tracking information
    const processedOrders = data.customer.orders.nodes.map((order) => {
      const trackingMeta = order.metaData?.find(
        (meta) => meta?.key === '_wc_shipment_tracking_items'
      )?.value

      return {
        ...order,
        tracking_items: trackingMeta ? JSON.parse(trackingMeta) : null,
      }
    })

    console.log('Orders retrieved successfully, count:', processedOrders.length)
    return NextResponse.json({ orders: processedOrders })
  } catch (err) {
    const error = err as GraphQLError
    console.error('Error fetching orders:', {
      message: error.message,
      response: error.response,
      stack: error.stack,
    })

    // Handle specific authentication errors
    if (error.response?.errors?.[0]?.message) {
      const errorMessage = error.response.errors[0].message.toLowerCase()

      if (
        errorMessage.includes('invalid-secret-key') ||
        errorMessage.includes('wrong number of segments')
      ) {
        return NextResponse.json(
          { errors: { message: 'Authentication failed - invalid or malformed token' } },
          { status: 401 }
        )
      }

      if (errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
        return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
      }
    }

    return NextResponse.json({ errors: { message: 'Failed to fetch orders' } }, { status: 500 })
  }
}
