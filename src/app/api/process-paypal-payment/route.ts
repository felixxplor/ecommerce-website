// app/api/process-paypal-payment/route.ts
import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

// PayPal credentials
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

// Get PayPal access token
async function getPayPalAccessToken() {
  try {
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

    if (!response.ok) {
      console.error('Error getting PayPal token, status:', response.status)
      const errorText = await response.text()
      throw new Error(`Failed to get PayPal token: ${errorText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting PayPal access token:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const { paypalOrderId, wooSession, payerId, authToken, transactionId, uniqueId } =
      await request.json()
    const reqAuthHeader = request.headers.get('authorization')
    const effectiveAuthToken =
      authToken || (reqAuthHeader ? reqAuthHeader.replace('Bearer ', '') : null)

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'PayPal order ID is required' }, { status: 400 })
    }

    console.log(`Capturing PayPal payment for order ID: ${paypalOrderId}`)

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()
    if (!accessToken) {
      throw new Error('Failed to obtain PayPal access token')
    }

    // Check order status before attempting capture
    const checkOrderResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!checkOrderResponse.ok) {
      console.error('Error checking PayPal order, status:', checkOrderResponse.status)
      const errorText = await checkOrderResponse.text()
      throw new Error(`Failed to check PayPal order: ${errorText}`)
    }

    const orderData = await checkOrderResponse.json()
    console.log(`PayPal order status: ${orderData.status}`)

    // If already captured, return the details
    if (orderData.status === 'COMPLETED') {
      const captureId = orderData.purchase_units?.[0]?.payments?.captures?.[0]?.id
      if (captureId) {
        console.log(`Order already captured with ID: ${captureId}`)
        return NextResponse.json({
          success: true,
          captureId,
          paypalOrderId,
          status: orderData.status,
          captureStatus: orderData.purchase_units?.[0]?.payments?.captures?.[0]?.status,
          transactionId: captureId,
          paypalTransactionId: captureId,
        })
      }
    }

    // Capture the PayPal payment
    console.log('Attempting to capture payment...')
    const captureResponse = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'PayPal-Request-Id': uniqueId || transactionId || `capture-${Date.now()}`,
        },
        // Empty body is required for capture
        body: JSON.stringify({}),
      }
    )

    // Log full response for debugging
    console.log('Capture response status:', captureResponse.status)

    if (!captureResponse.ok) {
      let errorText = await captureResponse.text()
      console.error('PayPal capture error:', errorText)
      try {
        // Try to parse as JSON if possible
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          {
            error: 'Failed to capture PayPal payment',
            details: errorData,
          },
          { status: 500 }
        )
      } catch (e) {
        // If not JSON, return as text
        return NextResponse.json(
          {
            error: 'Failed to capture PayPal payment',
            details: errorText,
          },
          { status: 500 }
        )
      }
    }

    // Parse the capture data
    const captureData = await captureResponse.json()
    console.log('PayPal capture successful. Status:', captureData.status)

    // Extract capture information
    let captureId = null
    let paypalTransactionId = null
    let captureStatus = captureData.status || 'COMPLETED'

    // Get the capture ID from the response
    if (captureData.purchase_units && captureData.purchase_units.length > 0) {
      const unit = captureData.purchase_units[0]
      if (unit.payments?.captures && unit.payments.captures.length > 0) {
        const capture = unit.payments.captures[0]
        captureId = capture.id
        paypalTransactionId = capture.id
        captureStatus = capture.status || captureStatus
      }
    }

    // Return all the necessary details for order creation
    return NextResponse.json({
      success: true,
      captureId: captureId || 'unknown',
      paypalOrderId: paypalOrderId,
      status: captureData.status,
      captureStatus: captureStatus,
      transactionId: paypalTransactionId || transactionId || uniqueId || `paypal-${Date.now()}`,
      paypalTransactionId: paypalTransactionId,
      authToken: effectiveAuthToken,
    })
  } catch (error) {
    console.error('Error processing PayPal payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to process PayPal payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
