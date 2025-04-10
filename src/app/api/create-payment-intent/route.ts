// app/api/create-payment-intent/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// In your /api/create-payment-intent/route.ts
export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    // Remove currency symbol and commas to get numeric value
    const numericAmount = parseFloat(amount.replace(/[$,]/g, ''))
    const amountInCents = Math.round(numericAmount * 100)

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'aud',
      automatic_payment_methods: {
        enabled: true,
      },
      // DON'T include return_url here
      metadata: {
        integration_check: 'stripe_elements',
      },
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
