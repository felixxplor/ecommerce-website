// app/api/create-pending-order/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { CheckoutDocument, CheckoutMutation } from '@/graphql/generated'

export async function POST(request: Request) {
  try {
    // Get wooSession and details from request body
    const {
      wooSession,
      billingDetails,
      shippingDetails,
      paymentMethod,
      shipToDifferentAddress,
      doNotEmptyCart,
    } = await request.json()

    // Validate required fields
    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    if (!billingDetails) {
      return NextResponse.json({ error: 'Billing details are required' }, { status: 400 })
    }

    if (!shippingDetails) {
      return NextResponse.json({ error: 'Shipping details are required' }, { status: 400 })
    }

    // Create GraphQL client with the woocommerce-session header
    const graphQLClient = getClient()
    graphQLClient.setHeader('woocommerce-session', `Session ${wooSession}`)

    // Extract name parts for shipping
    const shippingNameParts = shippingDetails.name.trim().split(' ')
    const shippingFirstName = shippingNameParts.slice(0, -1).join(' ') || ''
    const shippingLastName = shippingNameParts[shippingNameParts.length - 1] || ''

    // Extract name parts for billing
    const billingNameParts = billingDetails.name.trim().split(' ')
    const billingFirstName = billingNameParts.slice(0, -1).join(' ') || ''
    const billingLastName = billingNameParts[billingNameParts.length - 1] || ''

    // Create checkout input with shipping and billing details
    const checkoutInput = {
      clientMutationId: `pending-${Date.now()}`,
      paymentMethod: 'stripe', // Keep as 'stripe' for WooCommerce
      isPaid: false, // Important: Set to false for pending order
      metaData: [
        { key: 'payment_method_type', value: paymentMethod || 'unknown' },
        { key: 'payment_status', value: 'pending' },
        {
          key: 'is_bnpl',
          value: ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethod)
            ? 'yes'
            : 'no',
        },
        // Add metadata to indicate cart should be preserved for BNPL payments
        { key: 'do_not_empty_cart', value: 'yes' }, // Always preserve cart for pending orders
      ],
      shipping: {
        firstName: shippingFirstName,
        lastName: shippingLastName,
        address1: shippingDetails.address.line1,
        address2: shippingDetails.address.line2 || '',
        city: shippingDetails.address.city,
        state: shippingDetails.address.state,
        postcode: shippingDetails.address.postal_code,
        country: shippingDetails.address.country,
      },
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
      shipToDifferentAddress: !!shipToDifferentAddress, // Convert to boolean
    }

    console.log('Creating pending order for BNPL payment', {
      paymentMethod,
      doNotEmptyCart: true,
      shipToDifferentAddress: !!shipToDifferentAddress,
    })

    // Create the order with pending status
    const response = await graphQLClient.request<CheckoutMutation>(CheckoutDocument, {
      input: checkoutInput,
    })

    // Check if the WooCommerce order was actually created
    if (!response.checkout?.order?.databaseId) {
      throw new Error('WooCommerce order creation failed')
    }

    // Now that we have an order ID, update its status to "pending"
    const orderId = response.checkout.order.databaseId

    // Use the update-order-status endpoint to set the order to pending
    const updateResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
      }/api/update-order-status?order_id=${orderId}&status=pending&doNotEmptyCart=true`,
      {
        method: 'POST',
      }
    )

    if (!updateResponse.ok) {
      console.warn('Failed to update order status to pending, but order was created successfully')
    }

    return NextResponse.json({
      ...response,
      cartPreserved: true,
      doNotEmptyCart: true,
    })
  } catch (error) {
    console.error('Pending order creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create pending order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
