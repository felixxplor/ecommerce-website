'use server'
import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { CheckoutDocument, CheckoutMutation, EmptyCartDocument } from '@/graphql/generated'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const {
      sessionId,
      wooSession: bodyWooSession,
      billingDetails,
      shippingDetails,
      shipToDifferentAddress,
      emptyCartOnSuccess,
      doNotEmptyCart,
      paymentMethod: requestPaymentMethod,
    } = await request.json()

    // Gather cookies and headers
    const cookieStore = cookies()
    let wooSession = (await cookieStore).get('woo-session')?.value

    // Fallback: parse from Cookie header
    if (!wooSession) {
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        const match = cookieHeader.match(/woo-session=([^;]+)/)
        if (match) wooSession = match[1]
      }
    }

    // Fallback: woocommerce-session header
    if (!wooSession) {
      const wooHeader = request.headers.get('woocommerce-session')
      if (wooHeader) wooSession = wooHeader.replace('Session ', '')
    }

    // Fallback: body
    if (!wooSession && bodyWooSession) {
      wooSession = bodyWooSession
    }

    // Validate
    if (!sessionId) {
      return NextResponse.json({ error: 'No payment intent ID provided' }, { status: 400 })
    }
    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }
    if (!billingDetails) {
      return NextResponse.json({ error: 'Billing details are required' }, { status: 400 })
    }

    // Initialize GraphQL client
    const graphQLClient = getClient()

    // Forward WordPress auth if present
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      graphQLClient.setHeader('Authorization', authHeader)
    }

    // Set WooCommerce session header
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(sessionId, {
      expand: ['payment_method'],
    })

    const paymentMethodType =
      requestPaymentMethod || paymentIntent.payment_method_types?.[0] || 'card'

    // Ensure valid status
    const validStatus = ['succeeded', 'processing', 'requires_capture', 'requires_confirmation']
    if (!validStatus.includes(paymentIntent.status)) {
      return NextResponse.json(
        { error: `Invalid payment status: ${paymentIntent.status}` },
        { status: 400 }
      )
    }

    const isPaid =
      paymentIntent.status === 'succeeded' ||
      (paymentIntent.status === 'processing' &&
        ['afterpay_clearpay', 'zip'].includes(paymentMethodType))

    // Extract first/last name
    const [firstName, ...lastParts] = billingDetails.name.trim().split(' ')
    const lastName = lastParts.join(' ') || ''

    // Build checkout input
    const checkoutInput: any = {
      clientMutationId: sessionId,
      paymentMethod: 'stripe',
      isPaid,
      metaData: [
        { key: 'stripe_payment_intent_id', value: sessionId },
        { key: 'payment_status', value: paymentIntent.status },
        { key: 'payment_method_type', value: paymentMethodType },
        {
          key: 'is_bnpl',
          value: isPaid && ['afterpay_clearpay', 'zip'].includes(paymentMethodType) ? 'yes' : 'no',
        },
      ],
      billing: {
        firstName,
        lastName,
        email: billingDetails.email,
        phone: billingDetails.phone || '',
        address1: billingDetails.address.line1,
        address2: billingDetails.address.line2 || '',
        city: billingDetails.address.city,
        state: billingDetails.address.state,
        postcode: billingDetails.address.postal_code,
        country: billingDetails.address.country,
      },
      shipping: shippingDetails
        ? {
            firstName,
            lastName,
            address1: shippingDetails.address.line1,
            address2: shippingDetails.address.line2 || '',
            city: shippingDetails.address.city,
            state: shippingDetails.address.state,
            postcode: shippingDetails.address.postal_code,
            country: shippingDetails.address.country,
          }
        : undefined,
      shipToDifferentAddress: shipToDifferentAddress === true,
    }

    // Run the checkout mutation
    const response = await graphQLClient.request<CheckoutMutation>(CheckoutDocument, {
      input: checkoutInput,
    })

    if (!response.checkout?.order?.databaseId) {
      throw new Error('WooCommerce order creation failed')
    }

    // Optionally update Stripe metadata
    try {
      await stripe.paymentIntents.update(sessionId, {
        metadata: { order_id: String(response.checkout.order.databaseId) },
      })
    } catch {}

    // Empty cart via GraphQL if needed
    if (!doNotEmptyCart) {
      await graphQLClient.request(EmptyCartDocument, {
        input: { clientMutationId: sessionId, clearPersistentCart: true },
      })
    }

    return NextResponse.json({ checkout: response.checkout })
  } catch (err: any) {
    console.error('Order creation failed:', err)
    return NextResponse.json(
      { error: 'Failed to create order', details: err.message },
      { status: 500 }
    )
  }
}
