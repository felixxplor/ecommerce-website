// app/api/create-paypal-session/route.ts
import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

// PayPal API credentials
const PAYPAL_CLIENT_ID =
  'BAAgaM6Yjs-cg1t1KVqZ8mQGpbMfzw9cbdctZ7cv4uwZdzt8_zLa-wLukFCsZe35QJ-DOjx6sA8v6Tj-Q4'
const PAYPAL_CLIENT_SECRET =
  'EATpExhpF5HYObWBYFIzOrR-NpxGZSbU5Qlu50BEH0mbilQRvo4kLl4MlA6cmaXF5AdPmDCQtwAW-2-Z'
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'
// process.env.PAYPAL_ENVIRONMENT === 'production'
//   ? 'https://api-m.paypal.com'
//   : 'https://api-m.sandbox.paypal.com'

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

// Define PayPal link type
interface PayPalLink {
  href: string
  rel: string
  method: string
}

export async function POST(request: Request) {
  try {
    const { orderTotal, returnUrl, cancelUrl, wooSession, metadata } = await request.json()

    if (!orderTotal) {
      return NextResponse.json({ error: 'Order total is required' }, { status: 400 })
    }

    if (!returnUrl || !cancelUrl) {
      return NextResponse.json({ error: 'Return and cancel URLs are required' }, { status: 400 })
    }

    // Extract amount from the order total
    // Handle different formats: $123.45, 123.45, 123,45 etc.
    const amount = parseFloat(orderTotal.toString().replace(/[^0-9.]/g, ''))

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: 'Invalid order total',
          details: `Could not parse amount from: ${orderTotal}`,
        },
        { status: 400 }
      )
    }

    const currency = 'AUD' // Adjust based on your store's currency
    const transactionId = metadata?.transaction_id || `paypal-${Date.now()}`
    const uniqueId = metadata?.unique_id || `unique-${Date.now()}`

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Create PayPal order
    const paypalOrderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: transactionId,
            custom_id: uniqueId, // This will be sent back in webhooks
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          brand_name: 'GIZMOOZ AUSTRALIA',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
        },
      }),
    })

    const paypalOrderData = await paypalOrderResponse.json()

    if (paypalOrderData.error) {
      // console.error('PayPal API error:', paypalOrderData.error)
      return NextResponse.json(
        {
          error: 'Failed to create PayPal order',
          details: paypalOrderData.error,
        },
        { status: 500 }
      )
    }

    // Find the approval URL in the links array
    const approvalLink = paypalOrderData.links.find((link: PayPalLink) => link.rel === 'approve')

    if (!approvalLink || !approvalLink.href) {
      return NextResponse.json(
        {
          error: 'No approval URL found in PayPal response',
          details: 'The PayPal API response did not contain an approval URL',
        },
        { status: 500 }
      )
    }

    const approvalUrl = approvalLink.href

    // Store metadata for later retrieval
    // This could be implemented with Redis, database, or other storage mechanism
    try {
      // Store metadata in a more persistent way - this is just a placeholder
      // In a real implementation, you would use a database or Redis
      // console.log('Storing PayPal metadata:', {
      //   paypalOrderId: paypalOrderData.id,
      //   ...metadata,
      //   wooSession,
      //   timestamp: Date.now(),
      // })
    } catch (metaError) {
      // Log the error but don't fail the request
      // console.warn('Failed to store PayPal metadata:', metaError)
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paypalOrderData.id, // Use same property name as Stripe for consistency
      paypalOrderId: paypalOrderData.id,
      approvalUrl,
    })
  } catch (error) {
    // console.error('Error creating PayPal session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create PayPal session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
