// app/api/create-order/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { CheckoutDocument, CheckoutMutation, EmptyCartDocument } from '@/graphql/generated'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

function splitName(fullName: string) {
  const nameParts = fullName.trim().split(' ')
  return {
    firstName: nameParts.slice(0, -1).join(' ') || '',
    lastName: nameParts[nameParts.length - 1] || '',
  }
}

export async function POST(request: Request) {
  try {
    // Get both sessionId and wooSession from request body
    const { sessionId, wooSession } = await request.json()

    // Validate session ID and wooSession
    if (!sessionId) {
      return NextResponse.json({ error: 'No Stripe session ID provided' }, { status: 400 })
    }

    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    // Create GraphQL client with the woocommerce-session header
    const graphQLClient = getClient()
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'line_items'],
    })

    // Verify payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const isSameAddress =
      session.shipping_details?.address?.line1 === session.customer_details?.address?.line1 &&
      session.shipping_details?.address?.city === session.customer_details?.address?.city &&
      session.shipping_details?.address?.postal_code ===
        session.customer_details?.address?.postal_code

    // Name splitting
    const nameParts = session.customer_details?.name?.trim().split(' ') || []
    const checkoutInput = {
      clientMutationId: sessionId,
      paymentMethod: 'stripe',
      isPaid: true,
      metaData: [
        { key: 'stripe_session_id', value: sessionId },
        { key: 'payment_status', value: session.payment_status },
      ],
      billing: {
        firstName: nameParts.slice(0, -1).join(' ') || '',
        lastName: nameParts[nameParts.length - 1] || '',
        email: session.customer_details?.email || '',
        phone: session.customer_details?.phone || '',
        address1: session.customer_details?.address?.line1 || '',
        address2: session.customer_details?.address?.line2 || '',
        city: session.customer_details?.address?.city || '',
        state: session.customer_details?.address?.state || '',
        postcode: session.customer_details?.address?.postal_code || '',
        country: session.customer_details?.address?.country || '',
      },
      shipping: {
        firstName: session.shipping_details?.name
          ? session.shipping_details.name.split(' ').slice(0, -1).join(' ')
          : nameParts.slice(0, -1).join(' ') || '', // fallback to billing name
        lastName: session.shipping_details?.name
          ? session.shipping_details.name.split(' ').slice(-1)[0]
          : nameParts[nameParts.length - 1] || '', // fallback to billing name
        address1: session.shipping_details?.address?.line1 || '',
        address2: session.shipping_details?.address?.line2 || '',
        city: session.shipping_details?.address?.city || '',
        state: session.shipping_details?.address?.state || '',
        postcode: session.shipping_details?.address?.postal_code || '',
        country: session.shipping_details?.address?.country || '',
      },
      // Only set to true if shipping address is actually different
      shipToDifferentAddress: Boolean(session.shipping_details?.address?.line1 && !isSameAddress),
    }

    // Attempt to create order
    const response = await graphQLClient.request<CheckoutMutation>(CheckoutDocument, {
      input: checkoutInput,
    })

    // Check if the WooCommerce order was actually created
    if (!response.checkout?.order?.databaseId) {
      throw new Error('WooCommerce order creation failed')
    }

    try {
      // Try to clear the cart, but don't throw if it's already empty
      await graphQLClient.request(EmptyCartDocument, {
        input: {
          clientMutationId: sessionId,
          clearPersistentCart: true,
        },
      })
    } catch (cartError) {
      // Ignore the error if cart is already empty
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
