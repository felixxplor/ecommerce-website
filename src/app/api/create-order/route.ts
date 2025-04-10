// app/api/create-order/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { CheckoutDocument, CheckoutMutation, EmptyCartDocument } from '@/graphql/generated'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    // Get sessionId (payment intent ID), wooSession, and billing/shipping details from request body
    const {
      sessionId,
      wooSession,
      billingDetails,
      shippingDetails, // Add this to extract shipping details
      shipToDifferentAddress, // Add this flag to check if shipping is different
      paymentMethod: requestPaymentMethod,
    } = await request.json()

    // Validate session ID and wooSession
    if (!sessionId) {
      return NextResponse.json({ error: 'No payment intent ID provided' }, { status: 400 })
    }

    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    if (!billingDetails) {
      return NextResponse.json({ error: 'Billing details are required' }, { status: 400 })
    }

    // Create GraphQL client with the woocommerce-session header
    const graphQLClient = getClient()
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(sessionId, {
      expand: ['payment_method'],
    })

    // Get payment method type
    const paymentMethodType =
      requestPaymentMethod || paymentIntent.payment_method_types?.[0] || 'card'

    // Check for valid payment statuses
    const validPaymentStatuses = [
      'succeeded',
      'processing',
      'requires_capture',
      'requires_confirmation',
    ]

    if (!validPaymentStatuses.includes(paymentIntent.status)) {
      return NextResponse.json(
        {
          error: `Invalid payment status: ${paymentIntent.status}`,
          details: 'Payment must be in a valid state (succeeded, processing, or pending capture)',
        },
        { status: 400 }
      )
    }

    // Determine if the payment should be considered paid
    const isPaid =
      paymentIntent.status === 'succeeded' ||
      (paymentIntent.status === 'processing' &&
        ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethodType))

    // Extract billing name parts
    const billingNameParts = billingDetails.name.trim().split(' ')
    const billingFirstName = billingNameParts.slice(0, -1).join(' ') || ''
    const billingLastName = billingNameParts[billingNameParts.length - 1] || ''

    // Create checkout input with billing details
    const checkoutInput = {
      clientMutationId: sessionId,
      paymentMethod: 'stripe', // Keep as 'stripe' for WooCommerce (all Stripe methods)
      isPaid: isPaid,
      metaData: [
        { key: 'stripe_payment_intent_id', value: sessionId },
        { key: 'payment_status', value: paymentIntent.status },
        { key: 'payment_method_type', value: paymentMethodType },
        {
          key: 'is_bnpl',
          value: ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethodType)
            ? 'yes'
            : 'no',
        },
      ],
      billing: {
        firstName: billingFirstName,
        lastName: billingLastName,
        email: billingDetails.email,
        phone: billingDetails.phone || '',
        address1: billingDetails.address.line1,
        address2: billingDetails.address.line2 || '',
        city: billingDetails.address.city,
        state: billingDetails.address.state,
        postcode: billingDetails.address.postal_code,
        country: billingDetails.address.country,
      },
      // Use shipping details if shipToDifferentAddress is true, otherwise use billing details
      shipping: shippingDetails
        ? {
            // Extract shipping name parts
            firstName: (() => {
              const shippingNameParts = shippingDetails.name.trim().split(' ')
              return shippingNameParts.slice(0, -1).join(' ') || ''
            })(),
            lastName: (() => {
              const shippingNameParts = shippingDetails.name.trim().split(' ')
              return shippingNameParts[shippingNameParts.length - 1] || ''
            })(),
            address1: shippingDetails.address.line1,
            address2: shippingDetails.address.line2 || '',
            city: shippingDetails.address.city,
            state: shippingDetails.address.state,
            postcode: shippingDetails.address.postal_code,
            country: shippingDetails.address.country,
          }
        : {
            // Fall back to billing details if no shipping details provided
            firstName: billingFirstName,
            lastName: billingLastName,
            address1: billingDetails.address.line1,
            address2: billingDetails.address.line2 || '',
            city: billingDetails.address.city,
            state: billingDetails.address.state,
            postcode: billingDetails.address.postal_code,
            country: billingDetails.address.country,
          },
      shipToDifferentAddress: true,
    }

    console.log('Creating order with:', {
      paymentStatus: paymentIntent.status,
      paymentMethodType,
      isPaid,
      shipToDifferentAddress: !!shipToDifferentAddress,
    })

    // Attempt to create order
    const response = await graphQLClient.request<CheckoutMutation>(CheckoutDocument, {
      input: checkoutInput,
    })

    // Check if the WooCommerce order was actually created
    if (!response.checkout?.order?.databaseId) {
      throw new Error('WooCommerce order creation failed')
    }

    // Store the order ID in a way that can be retrieved by the confirmation page
    try {
      // Update the payment intent with the order ID
      await stripe.paymentIntents.update(sessionId, {
        metadata: {
          order_id: response.checkout.order.databaseId.toString(),
        },
      })
    } catch (updateError) {
      // Log but don't throw - this is not critical
      console.warn('Failed to update payment intent with order ID:', updateError)
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
      console.log('Cart clearing error (non-critical):', cartError)
    }

    return NextResponse.json({
      checkout: response.checkout,
      paymentStatus: paymentIntent.status,
      paymentMethodType,
    })
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
