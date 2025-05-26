// app/payment-processing/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Stripe from 'stripe'
import PaymentProcessingClient from './client'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface PageProps {
  params: {}
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

export default async function PaymentProcessingPage(props: PageProps) {
  // Access searchParams safely
  const searchParams = (await props.searchParams) || {}

  // Get payment intent (handling array case)
  const paymentIntentParam = searchParams.payment_intent
  const paymentIntent = Array.isArray(paymentIntentParam)
    ? paymentIntentParam[0]
    : paymentIntentParam || ''

  // Get other params safely
  const redirectStatus = searchParams.redirect_status as string | undefined
  const paymentMethod = searchParams.payment_method as string | undefined
  const transactionId = searchParams.transaction_id as string | undefined
  const uniqueId = searchParams.unique_id as string | undefined
  const paramWooSession = searchParams.woo_session as string | undefined
  const timestamp = searchParams.timestamp as string | undefined

  // PayPal specific parameters
  const paypalToken = searchParams.token as string | undefined
  const paypalPayerId = searchParams.PayerID as string | undefined

  // BNPL payment methods that need client-side processing for auth tokens
  const bnplMethods = ['zip', 'afterpay_clearpay', 'afterpay', 'clearpay']
  const isBNPL = bnplMethods.includes(paymentMethod || '')

  // For PayPal payments OR BNPL payments, use the client component
  // This allows access to sessionStorage for auth tokens
  if (paymentMethod === 'paypal' && (paypalToken || paypalPayerId)) {
    return <PaymentProcessingClient />
  }

  // NEW: Also use client component for BNPL payments to access auth tokens
  if (isBNPL && paymentIntent) {
    return <PaymentProcessingClient />
  }

  // For regular credit card payments, continue with server-side processing
  // (Credit card payments typically don't have the same auth token issues)

  // Get the woo session from cookies
  const cookieStore = await cookies()
  const wooSession = paramWooSession

  // Use either transaction_id or unique_id for deduplication
  const deduplicationId = transactionId || uniqueId || null

  // Check for required payment intent for Stripe payments
  if (!paymentIntent) {
    redirect('/checkout?error=missing_payment_intent')
  }

  console.log('Processing Stripe payment for intent:', paymentIntent)

  // For Stripe payments, retrieve and verify the payment intent
  let stripePaymentIntent
  try {
    // Retrieve the payment intent from Stripe
    stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent, {
      expand: ['payment_method'],
    })
    console.log('Stripe payment intent status:', stripePaymentIntent.status)
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    redirect(
      `/checkout?error=payment_retrieval_error&message=${encodeURIComponent(
        'Could not retrieve payment information'
      )}`
    )
  }

  // Validate the payment status
  const validSuccessStatuses = ['succeeded', 'processing', 'requires_capture']
  const isSuccessful = validSuccessStatuses.includes(stripePaymentIntent.status)

  if (!isSuccessful) {
    // If payment is not in a successful state, redirect to checkout with error
    redirect(
      `/checkout?error=payment_failed&message=${encodeURIComponent(
        `Payment not successful. Please try again.`
      )}`
    )
  }

  // If we got here, we have a successful payment - create the order
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (wooSession) {
    headers['woocommerce-session'] = `Session ${wooSession}`
  }

  console.log('Creating order with Stripe payment intent:', paymentIntent)

  // Get the actual payment method from Stripe (most reliable)
  let detectedPaymentMethod = paymentMethod

  if (
    stripePaymentIntent.payment_method &&
    typeof stripePaymentIntent.payment_method === 'object'
  ) {
    // ALWAYS prioritize the actual payment method from Stripe
    detectedPaymentMethod = stripePaymentIntent.payment_method.type
    console.log('Using ACTUAL payment method from Stripe payment intent:', detectedPaymentMethod)
  } else if (
    stripePaymentIntent.payment_method_types &&
    stripePaymentIntent.payment_method_types.length > 0
  ) {
    // Check for BNPL methods first, then fallback
    const bnplMethods = ['afterpay_clearpay', 'klarna', 'affirm', 'zip']
    const bnplMethod = stripePaymentIntent.payment_method_types.find((type) =>
      bnplMethods.includes(type)
    )
    detectedPaymentMethod = bnplMethod || stripePaymentIntent.payment_method_types[0]
    console.log('Using payment method from payment_method_types:', detectedPaymentMethod)
  } else if (paymentMethod) {
    // Use URL parameter as last resort
    detectedPaymentMethod = paymentMethod
    console.log('Using payment method from URL parameter:', detectedPaymentMethod)
  }

  console.log('Final detected payment method for order creation:', detectedPaymentMethod)

  // Call the create-post-payment-order API
  let createOrderResponse
  try {
    createOrderResponse = await fetch(
      `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/create-post-payment-order`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paymentIntentId: paymentIntent,
          transactionId: deduplicationId || `payment-${Date.now()}`,
          wooSession,
          timestamp: timestamp || Date.now().toString(),
          // Pass the correctly detected payment method type
          paymentMethodType: detectedPaymentMethod,
        }),
      }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    redirect(
      `/checkout?error=order_creation_error&message=${encodeURIComponent('Failed to create order')}`
    )
  }

  if (!createOrderResponse.ok) {
    let errorMessage = 'Failed to create order'
    try {
      const errorData = await createOrderResponse.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Ignore JSON parse errors
    }
    redirect(`/checkout?error=order_creation_error&message=${encodeURIComponent(errorMessage)}`)
  }

  let orderData
  try {
    orderData = await createOrderResponse.json()
  } catch (error) {
    console.error('Error parsing order response:', error)
    redirect(
      `/checkout?error=order_data_error&message=${encodeURIComponent('Could not parse order data')}`
    )
  }

  const newOrderId = orderData.orderId || orderData.checkout?.order?.databaseId

  if (newOrderId) {
    // This line will throw a NEXT_REDIRECT exception - that's normal and expected!
    // DO NOT wrap this in a try/catch
    redirect(
      `/order-confirmation/${newOrderId}?payment_intent=${paymentIntent}&payment_method=${
        detectedPaymentMethod || stripePaymentIntent.payment_method_types?.[0]
      }`
    )
  } else {
    // Order was processed but we couldn't get an ID
    redirect(
      `/order-confirmation?payment_method=${
        detectedPaymentMethod || stripePaymentIntent.payment_method_types?.[0]
      }&status=success`
    )
  }

  // This code will never be reached due to the redirects above
  return (
    <MaxWidthWrapper className="py-14">
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner className="h-12 w-12 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
        <p className="text-gray-600">Please wait while we finalize your order.</p>
      </div>
    </MaxWidthWrapper>
  )
}
