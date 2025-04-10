// app/api/empty-cart/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { EmptyCartDocument } from '@/graphql/generated'

export async function POST(request: Request) {
  try {
    const { wooSession } = await request.json()

    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    const graphQLClient = getClient()
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    await graphQLClient.request(EmptyCartDocument, {
      input: {
        clientMutationId: `empty-cart-${Date.now()}`,
        clearPersistentCart: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error emptying cart:', error)
    return NextResponse.json(
      {
        error: 'Failed to empty cart',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
