// app/api/update-order-status/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { gql } from 'graphql-request'

// Define the GraphQL mutation
const UpdateOrderStatusMutation = gql`
  mutation UpdateOrderStatus($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      clientMutationId
      order {
        id
        databaseId
        orderNumber
        status
        total
      }
    }
  }
`

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderIdParam = searchParams.get('order_id')
  const status = searchParams.get('status')

  if (!orderIdParam) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  if (!status) {
    return NextResponse.json({ error: 'Status is required' }, { status: 400 })
  }

  const orderId = parseInt(orderIdParam, 10)

  try {
    const graphQLClient = getClient()

    // Convert status to WooCommerce format
    const wooStatus = status.toUpperCase()

    // Update order status
    await graphQLClient.request(UpdateOrderStatusMutation, {
      input: {
        clientMutationId: `status-update-${Date.now()}`,
        orderId,
        status: wooStatus,
      },
    })

    return NextResponse.json({ success: true, orderId, status: wooStatus })
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:, error`)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
