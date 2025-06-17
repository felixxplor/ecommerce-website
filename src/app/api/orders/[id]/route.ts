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

    // Convert string ID to number for WooCommerce, but keep as string for GraphQL
    const orderId = parseInt(id, 10)
    console.log('Fetching order with ID:', orderId)

    const data = await client.request<GetOrderByIdQuery>(print(GetOrderByIdDocument), {
      id: id, // Pass as string, not number - GraphQL ID! type expects string
    })

    if (!data.order) {
      return NextResponse.json({ errors: { message: 'Order not found' } }, { status: 404 })
    }

    // Debug: Log all metadata to see what's available
    console.log('Order metadata:', data.order.metaData)

    // Log all metadata keys to help identify the correct tracking key
    if (data.order.metaData) {
      console.log(
        'Available metadata keys:',
        data.order.metaData.map((meta) => meta?.key)
      )
    }

    // Process order to include tracking information
    const trackingMeta = data.order.metaData?.find(
      (meta) => meta?.key === '_wc_shipment_tracking_items'
    )?.value

    console.log('Tracking metadata found:', trackingMeta)

    // Also check for alternative tracking metadata keys
    const alternativeTrackingKeys = [
      '_wc_shipment_tracking_items',
      'tracking_items',
      '_tracking_items',
      '_shipment_tracking_items',
    ]

    let trackingData = null
    for (const key of alternativeTrackingKeys) {
      const meta = data.order.metaData?.find((meta) => meta?.key === key)
      if (meta?.value) {
        console.log(`Found tracking data with key: ${key}`, meta.value)
        try {
          trackingData = JSON.parse(meta.value)
          break
        } catch (parseError) {
          console.log(`Failed to parse tracking data for key ${key}:`, parseError)
          // If it's not JSON, use the raw value
          trackingData = meta.value
        }
      }
    }

    const processedOrder = {
      ...data.order,
      tracking_items: trackingData,
    }

    console.log('Final processed order tracking_items:', processedOrder.tracking_items)

    return NextResponse.json({ order: processedOrder })
  } catch (err) {
    console.error('Error fetching order:', err)
    if (err instanceof Error && err.message.includes('auth')) {
      return NextResponse.json({ errors: { message: 'Authentication failed' } }, { status: 401 })
    }
    return NextResponse.json({ errors: { message: 'Failed to fetch order' } }, { status: 500 })
  }
}
