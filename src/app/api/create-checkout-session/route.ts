// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()

    const numericAmount = parseFloat(amount.replace(/[$,]/g, ''))
    const amountInCents = Math.round(numericAmount * 100)

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: 'test@example.com',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'aud',
            },
            display_name: 'Free shipping',
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: 'Order Total',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      return_url: `${
        process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
      }/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
    })

    if (!session.client_secret) {
      throw new Error('No client secret returned')
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Full error details:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    )
  }
}
