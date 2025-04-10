// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', status: session.payment_status },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
    })
  } catch (error) {
    console.error('Error fetching checkout session:', error)
    return NextResponse.json(
      {
        error: 'Failed to retrieve checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
