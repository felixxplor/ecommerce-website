// app/api/create-post-payment-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { CheckoutDocument, CheckoutMutation, EmptyCartDocument } from '@/graphql/generated'
import Stripe from 'stripe'
import { cookies } from 'next/headers'
import fetch from 'node-fetch'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// PayPal API credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

// Get PayPal access token
async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString(
        'base64'
      )}`,
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

// Verify and get PayPal order details
async function getPayPalOrderDetails(token: string) {
  try {
    // Get access token
    const accessToken = await getPayPalAccessToken()

    // Get order by token
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return await response.json()
  } catch (error) {
    // console.error('Error getting PayPal order details:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const {
      paymentIntentId,
      transactionId,
      checkoutData, // Optional - might come from client
      wooSession: bodyWooSession,
      authToken: bodyAuthToken,
      timestamp,
      paymentMethodType: requestPaymentMethodType,
      paypalDetails,
    } = await request.json()

    // console.log('Creating post-payment order:', { paymentIntentId, transactionId, timestamp })

    // Determine if this is a PayPal payment
    const isPayPal =
      requestPaymentMethodType === 'paypal' ||
      paypalDetails != null ||
      (paymentIntentId &&
        (paymentIntentId.includes('PAY-') ||
          paymentIntentId.includes('PAYID-') ||
          paymentIntentId.includes('EC-')))

    // Get authentication token from multiple sources
    const requestAuthHeader = request.headers.get('authorization')
    const effectiveAuthToken = requestAuthHeader ? requestAuthHeader.replace('Bearer ', '') : ''

    // console.log('Auth token status:', {
    //   hasAuthHeader: !!requestAuthHeader,
    //   hasBodyAuth: !!bodyAuthToken,
    //   hasPayPalDetailsAuth: !!(paypalDetails && paypalDetails.authToken),
    //   hasEffectiveAuth: !!effectiveAuthToken,
    // })

    // Get WooSession from different sources
    let wooSession = request.headers.get('woocommerce-session')?.replace('Session ', '')

    // Fallback: body
    if (!wooSession && bodyWooSession) {
      wooSession = bodyWooSession
    }

    // Fallback: PayPal details
    if (!wooSession && paypalDetails && paypalDetails.wooSession) {
      wooSession = paypalDetails.wooSession
    }

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }
    if (!wooSession) {
      return NextResponse.json({ error: 'WooCommerce session is required' }, { status: 400 })
    }

    let paymentState = 'succeeded'
    let paymentMetadata: Record<string, string> = {}
    let paymentMethodType = requestPaymentMethodType || 'card'

    // Handle different payment processing based on payment method
    if (isPayPal) {
      // console.log('Processing PayPal payment data', {
      //   paymentIntentId,
      //   hasDetails: !!paypalDetails,
      //   captureId: paypalDetails?.captureId,
      //   transactionId: paypalDetails?.paypalTransactionId,
      // })
      paymentMethodType = 'paypal'

      // If we have capture details from previous API call, use those
      if (paypalDetails?.captureId) {
        // console.log('Using pre-captured PayPal payment:', paypalDetails.captureId)
        paymentState = 'succeeded'
        paymentMetadata = {
          paypal_order_id: paypalDetails.paypalOrderId || paymentIntentId,
          paypal_capture_id: paypalDetails.captureId,
          paypal_transaction_id: paypalDetails.paypalTransactionId || transactionId,
          payment_method: 'paypal',
        }
      } else {
        try {
          // Verify PayPal payment by getting payment details from PayPal API
          let paypalOrderDetails = null

          if (paypalDetails?.token || paymentIntentId.includes('EC-')) {
            const paypalToken = paypalDetails?.token || paymentIntentId
            // console.log('Fetching PayPal order details for token:', paypalToken)
            paypalOrderDetails = await getPayPalOrderDetails(paypalToken)

            // Extract payment status
            if (paypalOrderDetails?.status) {
              if (['COMPLETED', 'APPROVED', 'CAPTURED'].includes(paypalOrderDetails.status)) {
                paymentState = 'succeeded'
              } else {
                // console.warn('PayPal payment not completed:', paypalOrderDetails.status)
                paymentState = 'processing'
              }
            }

            // Extract metadata from PayPal order
            const purchaseUnit = paypalOrderDetails?.purchase_units?.[0]
            if (purchaseUnit) {
              paymentMetadata = {
                transaction_id: purchaseUnit.reference_id || transactionId,
                paypal_order_id: paypalOrderDetails.id,
                payment_method: 'paypal',
                paypal_status: paypalOrderDetails.status,
              }

              // Get capture ID and details if available
              if (purchaseUnit.payments?.captures && purchaseUnit.payments.captures.length > 0) {
                const capture = purchaseUnit.payments.captures[0]
                paymentMetadata.paypal_capture_id = capture.id
                paymentMetadata.paypal_capture_status = capture.status
              }
            }
          }
        } catch (paypalError: any) {
          // console.error('Error verifying PayPal payment:', paypalError)
          // Continue anyway - we'll trust the client data
          paymentState = 'processing'

          // Use provided data for metadata
          if (paypalDetails) {
            paymentMetadata = {
              paypal_order_id: paypalDetails.token || paymentIntentId,
              payment_method: 'paypal',
              paypal_payer_id: paypalDetails.PayerID || '',
            }
          }
        }
      }
    } else {
      // For Stripe payments, retrieve the payment intent to get metadata
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method'],
        })

        // console.log('Payment intent status:', paymentIntent.status)
        // console.log('Payment intent payment_method_types:', paymentIntent.payment_method_types)
        // console.log('Actual payment method:', paymentIntent.payment_method)

        // Verify payment status
        const validStatus = ['succeeded', 'processing']
        if (!validStatus.includes(paymentIntent.status)) {
          return NextResponse.json(
            { error: `Invalid payment status: ${paymentIntent.status}` },
            { status: 400 }
          )
        }

        paymentState = paymentIntent.status
        paymentMetadata = paymentIntent.metadata || {}

        // CRITICAL FIX: Always use the ACTUAL payment method type from Stripe
        // Priority: 1. Actual payment method object, 2. Request parameter as fallback
        if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
          // Use the actual payment method type - this is the TRUTH
          paymentMethodType = paymentIntent.payment_method.type
          // console.log('Using ACTUAL payment method from Stripe:', paymentMethodType)
        } else if (requestPaymentMethodType) {
          // Fallback to request parameter only if we can't get it from Stripe
          paymentMethodType = requestPaymentMethodType
          // console.log('Using payment method from request (fallback):', paymentMethodType)
        } else {
          // Last resort fallback
          paymentMethodType = paymentIntent.payment_method_types?.[0] || 'card'
          // console.log(
          //   'Using payment method from payment_method_types (last resort):',
          //   paymentMethodType
          // )
        }

        // console.log('Final confirmed payment method type:', paymentMethodType)

        // Prevent duplicate order creation
        const existingOrderId = paymentIntent.metadata?.order_id
        if (existingOrderId) {
          // console.log('Order already exists:', existingOrderId)
          return NextResponse.json({
            success: true,
            message: 'Order already exists',
            orderId: existingOrderId,
          })
        }
      } catch (stripeError: any) {
        // console.error('Error retrieving Stripe payment intent:', stripeError)
        return NextResponse.json(
          { error: 'Failed to verify payment: ' + (stripeError.message || 'Unknown error') },
          { status: 400 }
        )
      }
    }

    // Determine if this is a BNPL payment method
    const isBNPL = ['afterpay_clearpay', 'zip'].includes(paymentMethodType)

    // Initialize GraphQL client
    const graphQLClient = getClient()
    if (bodyWooSession) graphQLClient.setHeader('woocommerce-session', `Session ${bodyWooSession}`)
    if (effectiveAuthToken) {
      graphQLClient.setHeader('Authorization', `Bearer ${effectiveAuthToken}`)
      // console.log('Setting auth token from metadata or request:', !!effectiveAuthToken)
    }

    // Set headers for GraphQL client - using your baseHeaders approach
    const baseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(wooSession ? { 'woocommerce-session': `Session ${wooSession}` } : {}),
      ...(effectiveAuthToken ? { Authorization: `Bearer ${effectiveAuthToken}` } : {}),
    }

    // Apply headers to GraphQL client
    Object.entries(baseHeaders).forEach(([key, value]) => {
      if (value) {
        graphQLClient.setHeader(key, value)
      }
    })

    // console.log('Using headers for GraphQL client:', baseHeaders)

    // Extract customer data from various sources
    let customerInfo: any = {}
    const metadata = paymentMetadata || {}

    if (checkoutData && checkoutData.customerInfo) {
      // Use customer data from the request body if available
      customerInfo = checkoutData.customerInfo
    } else if (paypalDetails && paypalDetails.customerInfo) {
      // If PayPal with included customer info
      customerInfo = paypalDetails.customerInfo
    } else {
      // Try to extract customer info from payment metadata
      if (!metadata.customer_email && !metadata.customer_name) {
        // For PayPal, use fallback values if needed
        if (isPayPal) {
          // console.warn('Missing customer info for PayPal payment, using fallbacks')
          customerInfo = {
            name: 'PayPal Customer',
            email: 'customer@example.com',
            phone: '',
            address: {
              line1: '123 Main St',
              line2: '',
              city: 'Sydney',
              state: 'NSW',
              postal_code: '2000',
              country: 'AU',
            },
            differentBillingAddress: false,
          }
        } else {
          // console.error('Missing customer info in metadata:', metadata)
          return NextResponse.json(
            { error: 'Customer information not found in payment metadata' },
            { status: 400 }
          )
        }
      } else {
        // Use customer info from metadata
        customerInfo = {
          name: metadata.customer_name || '',
          email: metadata.customer_email || '',
          phone: metadata.customer_phone || '',
          address: {
            line1: metadata.shipping_address_line1 || '',
            line2: metadata.shipping_address_line2 || '',
            city: metadata.shipping_city || '',
            state: metadata.shipping_state || '',
            postal_code: metadata.shipping_postal_code || '',
            country: metadata.shipping_country || 'AU',
          },
          differentBillingAddress: metadata.different_billing_address === 'true',
          billingAddress: {
            line1: metadata.billing_address_line1 || metadata.shipping_address_line1 || '',
            line2: metadata.billing_address_line2 || metadata.shipping_address_line2 || '',
            city: metadata.billing_city || metadata.shipping_city || '',
            state: metadata.billing_state || metadata.shipping_state || '',
            postal_code: metadata.billing_postal_code || metadata.shipping_postal_code || '',
            country: metadata.billing_country || metadata.shipping_country || 'AU',
          },
        }
      }
    }

    // console.log('Customer info for order:', {
    //   name: customerInfo.name,
    //   email: customerInfo.email,
    //   hasPhone: !!customerInfo.phone,
    //   hasAddress: !!customerInfo.address,
    //   differentBillingAddress: customerInfo.differentBillingAddress,
    // })

    // Extract name and address data
    const { name, email, phone, address, billingAddress } = customerInfo
    const useDifferentBillingAddress = customerInfo.differentBillingAddress === true
    const actualBillingAddress =
      useDifferentBillingAddress && billingAddress ? billingAddress : address

    if (!name || !email || !address || !address.line1 || !address.city || !address.postal_code) {
      return NextResponse.json(
        { error: 'Incomplete customer information for order creation' },
        { status: 400 }
      )
    }

    // Extract first/last name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''

    // Build checkout input for the GraphQL mutation
    // For all Stripe-processed payments (including BNPL), use 'stripe' as the gateway
    // The specific payment method type is stored in metadata for reference
    const getWooCommercePaymentMethod = (stripePaymentMethodType: string) => {
      // Use stripe gateway for all Stripe-processed payments
      // This is the most reliable approach
      const stripeGatewayMapping = {
        card: 'stripe',
        afterpay_clearpay: 'stripe',
        zip: 'stripe',
        paypal: 'ppcp-gateway',
      }

      return (
        stripeGatewayMapping[stripePaymentMethodType as keyof typeof stripeGatewayMapping] ||
        'stripe'
      )
    }

    const wooPaymentMethod = getWooCommercePaymentMethod(paymentMethodType)

    // console.log('Payment method mapping:', {
    //   stripeType: paymentMethodType,
    //   wooGateway: wooPaymentMethod,
    //   isFromStripe: !isPayPal,
    // })

    // Prepare order metadata
    const orderMetaData = [
      {
        key: isPayPal ? 'paypal_payment_id' : 'stripe_payment_intent_id',
        value: paymentIntentId,
      },
      { key: 'payment_status', value: paymentState },
      { key: 'payment_method_type', value: paymentMethodType }, // This will now be correct
      { key: 'stripe_payment_method_type', value: paymentMethodType }, // Additional reference
      { key: 'is_bnpl', value: isBNPL ? 'yes' : 'no' },
      { key: 'transaction_id', value: transactionId || paymentIntentId },
      { key: 'created_at', value: new Date().toISOString() },
      { key: 'payment_gateway_used', value: wooPaymentMethod },
    ]

    // Add PayPal-specific metadata if available
    if (isPayPal) {
      if (paypalDetails?.captureId) {
        orderMetaData.push({ key: 'paypal_capture_id', value: paypalDetails.captureId })
      }
      if (paypalDetails?.paypalOrderId) {
        orderMetaData.push({ key: 'paypal_order_id', value: paypalDetails.paypalOrderId })
      }
      if (paypalDetails?.paypalTransactionId) {
        orderMetaData.push({
          key: 'paypal_transaction_id',
          value: paypalDetails.paypalTransactionId,
        })
      }
      if (paypalDetails?.captureStatus) {
        orderMetaData.push({ key: 'paypal_capture_status', value: paypalDetails.captureStatus })
      }
      if (paypalDetails?.PayerID) {
        orderMetaData.push({ key: 'paypal_payer_id', value: paypalDetails.PayerID })
      }
    }

    // Basic checkout input
    const checkoutInput: any = {
      clientMutationId: transactionId || `payment-${paymentIntentId}-${Date.now()}`,
      paymentMethod: wooPaymentMethod,
      isPaid: true, // Most external payments are considered paid at this point
      metaData: orderMetaData,
      billing: {
        firstName,
        lastName,
        email: email,
        phone: phone || '',
        address1: actualBillingAddress.line1,
        address2: actualBillingAddress.line2 || '',
        city: actualBillingAddress.city,
        state: actualBillingAddress.state,
        postcode: actualBillingAddress.postal_code,
        country: actualBillingAddress.country,
      },
      shipping: {
        firstName,
        lastName,
        address1: address.line1,
        address2: address.line2 || '',
        city: address.city,
        state: address.state,
        postcode: address.postal_code,
        country: address.country,
      },
      shipToDifferentAddress: useDifferentBillingAddress,
    }

    // console.log('Sending checkout mutation...')

    // Execute checkout mutation to create the order
    const response = await graphQLClient.request<CheckoutMutation>(CheckoutDocument, {
      input: checkoutInput,
    })

    // Check if order was created successfully
    if (!response.checkout?.order?.databaseId) {
      // console.error('WooCommerce order creation failed:', response)
      throw new Error('WooCommerce order creation failed')
    }

    const orderId = response.checkout.order.databaseId

    // console.log('Order created successfully:', orderId)

    // Update payment metadata with order ID if possible
    if (!isPayPal) {
      try {
        // For Stripe, update the payment intent with order ID
        await stripe.paymentIntents.update(paymentIntentId, {
          metadata: {
            order_id: String(orderId),
            transaction_completed: 'true',
            order_created_at: new Date().toISOString(),
          },
        })
      } catch (updateError) {
        // console.error('Error updating payment intent metadata:', updateError)
        // Continue despite metadata error - order is already created
      }
    } else if (isPayPal && PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET && paymentIntentId) {
      // For PayPal, try to add an invoice number or reference to the PayPal order
      // This is optional but helps with reconciliation
      try {
        // console.log('Updating PayPal order with order ID references:', orderId)
        // PayPal doesn't directly support updating order metadata after capture
        // Instead, add a note to the order via the WooCommerce API if needed
      } catch (updateError) {
        // console.warn('Error updating PayPal order with order ID:', updateError)
        // Non-critical - continue with order creation
      }
    }

    // Empty the cart
    try {
      await graphQLClient.request(EmptyCartDocument, {
        input: {
          clientMutationId: transactionId || `empty-cart-${paymentIntentId}`,
          clearPersistentCart: true,
        },
      })
      // console.log('Cart emptied successfully')
    } catch (cartError) {
      // console.error('Error emptying cart:', cartError)
      // Non-critical error, continue with order creation response
    }

    return NextResponse.json({
      success: true,
      checkout: response.checkout,
      orderId,
    })
  } catch (error: any) {
    // console.error('Post-payment order creation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
