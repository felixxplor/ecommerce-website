// app/api/checkout-session/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  try {
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details', 'line_items'],
    })

    // More detailed session validation
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session', status: 'session_not_found' },
        { status: 404 }
      )
    }

    // Add payment status check
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          error: 'Payment not completed',
          status: 'payment_pending',
          payment_status: session.payment_status,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 'complete',
      payment_status: session.payment_status,
      customer_details: {
        name: session.customer_details?.name,
        email: session.customer_details?.email,
        phone: session.customer_details?.phone, // Added phone
        address: {
          line1: session.customer_details?.address?.line1,
          line2: session.customer_details?.address?.line2,
          city: session.customer_details?.address?.city,
          state: session.customer_details?.address?.state,
          postal_code: session.customer_details?.address?.postal_code,
          country: session.customer_details?.address?.country,
        },
      },
      line_items: session.line_items?.data.map((item) => ({
        id: item.id,
        description: item.description,
        amount_total: item.amount_total,
        quantity: item.quantity,
        currency: item.currency,
      })),
      total_amount: session.amount_total, // Total order amount
    })
  } catch (err) {
    console.error('Checkout session retrieval error:', err)
    return NextResponse.json(
      {
        error: 'Failed to retrieve session',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
