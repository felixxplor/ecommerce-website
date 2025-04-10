// app/api/payment-status/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent')

  try {
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    })

    // Extract payment method type
    const paymentMethodType = paymentIntent.payment_method_types?.[0] || 'unknown'

    // Get order ID from metadata if available
    const orderId = paymentIntent.metadata?.order_id

    // Check payment status
    const responseData = {
      payment_status: paymentIntent.status,
      payment_method: paymentMethodType,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      is_bnpl: ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethodType),
    }

    // Add order ID if available
    if (orderId) {
      return NextResponse.json({
        ...responseData,
        order_id: parseInt(orderId, 10),
      })
    }

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('Payment status retrieval error:', err)
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment status',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
