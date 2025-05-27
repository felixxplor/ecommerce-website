// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { GetOrderByIdDocument, GetOrderByIdQuery } from '@/graphql/generated'
import { print } from 'graphql'

// Updated function signature for Next.js 15 - params is now a Promise
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params directly in Next.js 15
    const { id } = await params

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

    // Convert string ID to number for WooCommerce
    const orderId = parseInt(id, 10)

    const data = await client.request<GetOrderByIdQuery>(print(GetOrderByIdDocument), {
      id: orderId,
    })

    if (!data.order) {
      return NextResponse.json({ errors: { message: 'Order not found' } }, { status: 404 })
    }

    // Process order to include tracking information
    const trackingMeta = data.order.metaData?.find(
      (meta) => meta?.key === '_wc_shipment_tracking_items'
    )?.value

    const processedOrder = {
      ...data.order,
      tracking_items: trackingMeta ? JSON.parse(trackingMeta) : null,
    }

    return NextResponse.json({ order: processedOrder })
  } catch (err) {
    console.error('Error fetching order:', err)
    if (err instanceof Error && err.message.includes('auth')) {
      return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
    }
    return NextResponse.json({ errors: { message: 'Failed to fetch order' } }, { status: 500 })
  }
}
