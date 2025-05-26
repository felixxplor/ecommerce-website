// app/api/update-payment-metadata/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { paymentIntentId, metadata } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 })
    }

    // Update the payment intent metadata
    const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, { metadata })

    return NextResponse.json({
      success: true,
      paymentIntentId: updatedPaymentIntent.id,
      metadata: updatedPaymentIntent.metadata,
    })
  } catch (error) {
    console.error('Error updating payment metadata:', error)
    return NextResponse.json(
      {
        error: 'Failed to update payment metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
