// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { GetCustomerOrdersDocument, GetCustomerOrdersQuery } from '@/graphql/generated'
import { print } from 'graphql'

export async function GET(request: Request) {
  try {
    // Get the auth token from the request header
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '')

    // Check if user is authenticated
    if (!authToken) {
      return NextResponse.json({ errors: { message: 'Unauthorized' } }, { status: 401 })
    }

    const client = getClient()

    // Set the Authorization header with Bearer token
    client.setHeader('Authorization', `Bearer ${authToken}`)

    // Get WooCommerce session if available
    const wooSession = request.headers.get('woocommerce-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    const data = await client.request<GetCustomerOrdersQuery>(print(GetCustomerOrdersDocument))

    if (!data.customer?.orders?.nodes) {
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve orders.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders: data.customer.orders.nodes })
  } catch (err) {
    console.error('Error fetching orders:', err)

    // Check if error is due to authentication
    if (err instanceof Error && err.message.includes('auth')) {
      return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
    }

    return NextResponse.json({ errors: { message: 'Failed to fetch orders' } }, { status: 500 })
  }
}
