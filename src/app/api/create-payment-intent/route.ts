// app/api/create-payment-intent/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request: Request) {
  try {
    const { amount, checkoutType, sessionToken } = await request.json()

    // Remove currency symbol and commas to get numeric value
    const numericAmount = parseFloat(amount.replace(/[$,]/g, ''))
    const amountInCents = Math.round(numericAmount * 100)

    // Build metadata
    const metadata: Record<string, string> = {
      integration_check: 'stripe_elements',
      checkoutType: checkoutType || 'unknown',
    }
    if (sessionToken) {
      metadata.woo_session = sessionToken
    }

    // Create a PaymentIntent that supports card + BNPL methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      payment_method_types: ['card', 'afterpay_clearpay', 'zip'],
      metadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}
