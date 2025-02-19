// app/api/orders/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { GetCustomerOrdersDocument, GetCustomerOrdersQuery } from '@/graphql/generated'
import { print } from 'graphql'

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!authToken) {
      return NextResponse.json({ errors: { message: 'Unauthorized' } }, { status: 401 })
    }

    const client = getClient()
    client.setHeader('Authorization', `Bearer ${authToken}`)

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

    return NextResponse.json({ orders: processedOrders })
  } catch (err) {
    console.error('Error fetching orders:', err)
    if (err instanceof Error && err.message.includes('auth')) {
      return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
    }
    return NextResponse.json({ errors: { message: 'Failed to fetch orders' } }, { status: 500 })
  }
}
