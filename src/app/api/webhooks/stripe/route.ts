// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { getClient } from '@/graphql'
import { UpdateOrderStatusDocument } from '@/graphql/generated'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  try {
    const body = await request.text()
    // Get the headers - make sure to await it
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature || !endpointSecret) {
      return NextResponse.json({ error: 'Missing signature or endpoint secret' }, { status: 400 })
    }

    // Verify the event came from Stripe
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Handle specific event types
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentSucceeded(paymentIntent)
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentFailed(paymentIntent)
    } else if (event.type === 'payment_intent.processing') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentIntentProcessing(paymentIntent)
    } else if (event.type === 'charge.captured') {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          typeof charge.payment_intent === 'string'
            ? charge.payment_intent
            : charge.payment_intent.id
        )
        await handlePaymentIntentSucceeded(paymentIntent)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// In your webhook handler
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Check if we have an order ID in payment intent metadata from return URL
  if (!paymentIntent.metadata?.order_id) {
    console.log('No order ID in metadata for payment intent:', paymentIntent.id)
    return
  }

  const orderId = parseInt(paymentIntent.metadata.order_id, 10)

  try {
    // Update order status to processing
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/update-order-status?order_id=${orderId}&status=processing`,
      {
        method: 'POST',
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update order status')
    }

    console.log(`Updated order ${orderId} status to PROCESSING after successful payment`)
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.order_id
  if (!orderId) return

  try {
    const graphQLClient = getClient()

    await graphQLClient.request(UpdateOrderStatusDocument, {
      input: {
        clientMutationId: `payment-failed-${paymentIntent.id}`,
        orderId: parseInt(orderId, 10),
        status: 'FAILED',
      },
    })

    console.log(`Updated order ${orderId} status to FAILED after payment failure`)
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error)
  }
}

async function handlePaymentIntentProcessing(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.order_id
  if (!orderId) return

  // For buy-now-pay-later methods, we might want to mark the order as "on-hold" or with a special status
  // depending on your store's business logic
  try {
    const graphQLClient = getClient()

    await graphQLClient.request(UpdateOrderStatusDocument, {
      input: {
        clientMutationId: `payment-processing-${paymentIntent.id}`,
        orderId: parseInt(orderId, 10),
        status: 'ON_HOLD', // Use appropriate status for your workflow
      },
    })

    console.log(`Updated order ${orderId} status to ON_HOLD for processing payment`)
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error)
  }
}
