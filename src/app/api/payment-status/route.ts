// app/api/payment-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Define the response type for better type safety
interface PaymentStatusResponse {
  payment_status: string
  payment_method?: string
  order_id?: string | null
  amount?: number
  currency?: string
  created?: number
  error?: string
  details?: string
}

export async function GET(request: NextRequest) {
  try {
    // Get payment intent ID from query parameters
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')

    // Validate payment intent ID
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    // Basic validation of payment intent format
    if (!paymentIntentId.startsWith('pi_')) {
      return NextResponse.json({ error: 'Invalid payment intent ID format' }, { status: 400 })
    }

    // Retrieve payment intent from Stripe with minimal expansion
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method_types'],
    })

    // Determine if there's an order ID associated with this payment
    const orderId = paymentIntent.metadata?.order_id

    // Get payment method type
    const paymentMethodType = paymentIntent.payment_method_types?.[0]

    // Return payment status information with minimal sensitive data
    const response: PaymentStatusResponse = {
      payment_status: paymentIntent.status,
      payment_method: paymentMethodType,
      order_id: orderId || null,
      // Include only non-sensitive data
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
    }

    return NextResponse.json(response)
  } catch (error) {
    // console.error('Error checking payment status:', error)

    // Determine if it's a Stripe error
    let errorMessage = 'Failed to check payment status'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorMessage = error.message

      // Handle specific Stripe error cases
      if ('type' in error && typeof error.type === 'string') {
        // It's a Stripe error
        const stripeError = error as any

        if (stripeError.type === 'StripeCardError') {
          errorMessage = 'Card was declined'
        } else if (stripeError.type === 'StripeInvalidRequestError') {
          errorMessage = 'Invalid payment information'
        }

        // Add error code if available
        if (stripeError.code) {
          errorDetails = `Error code: ${stripeError.code}`
        }
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
