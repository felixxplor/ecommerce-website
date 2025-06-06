// app/payment-processing/client.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSession } from '@/client/session-provider'

// Skeleton component for loading state
function PaymentProcessingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-pulse space-y-4 text-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-56 mx-auto"></div>
      </div>
    </div>
  )
}

// Main content component that uses useSearchParams
function PaymentProcessingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<string>('Initializing')
  const { refreshCart } = useSession()

  useEffect(() => {
    // Prevent multiple simultaneous processing attempts
    if (!isProcessing) return

    const processPayment = async () => {
      try {
        // Extract common query params
        const paymentMethod = searchParams.get('payment_method')
        const transactionId = searchParams.get('transaction_id')
        const uniqueId = searchParams.get('unique_id')
        const timestamp = searchParams.get('timestamp')

        // Get IDs for different payment methods
        const paymentIntent = searchParams.get('payment_intent') // For Stripe/BNPL
        const token = searchParams.get('token') // For PayPal
        const payerId = searchParams.get('PayerID') // For PayPal

        console.log('Processing payment with params:', {
          paymentMethod,
          paymentIntent,
          token,
          payerId,
          transactionId,
          uniqueId,
        })

        // Validate required parameters based on payment method
        if (!paymentMethod) {
          throw new Error('Missing payment method')
        }

        // For PayPal, check for token/PayerID instead of payment_intent
        if (paymentMethod === 'paypal') {
          if (!token && !payerId) {
            throw new Error('Missing PayPal payment parameters (token or PayerID)')
          }
        } else {
          // For other payment methods (Stripe/BNPL), check for payment_intent
          if (!paymentIntent) {
            throw new Error('Missing payment intent for Stripe/BNPL payment')
          }
        }

        // Check if this payment has already been processed
        const processedKey = `processed_${paymentIntent || token}_${transactionId || uniqueId}`
        if (sessionStorage.getItem(processedKey)) {
          console.log('Payment already processed, skipping...')
          setIsProcessing(false)
          return
        }

        // CRITICAL: Load stored tokens for user authentication
        const authToken = sessionStorage.getItem('woo-auth-token')
        const wooSession = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)

        console.log('Client processing payment:', {
          paymentMethod,
          paymentIntent,
          token,
          hasAuthToken: !!authToken,
          hasWooSession: !!wooSession,
          transactionId,
        })

        // --- PayPal Flow ---
        if (paymentMethod === 'paypal' && (token || payerId)) {
          setProcessingStage('Capturing PayPal payment')

          console.log('Processing PayPal payment with auth token:', !!authToken)

          // 1) Capture PayPal payment
          const captureRes = await fetch('/api/process-paypal-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(wooSession ? { 'woocommerce-session': `Session ${wooSession}` } : {}),
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              paypalOrderId: token,
              payerId,
              transactionId,
              uniqueId,
              wooSession,
              authToken, // Pass auth token in body as well
            }),
          })

          if (!captureRes.ok) {
            const err = await captureRes.json()
            throw new Error(err.error || 'PayPal capture failed')
          }

          const captureData = await captureRes.json()

          setProcessingStage('Creating order (PayPal)')

          // 2) Create WooCommerce order
          const orderRes = await fetch('/api/create-post-payment-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(wooSession ? { 'woocommerce-session': `Session ${wooSession}` } : {}),
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              paymentIntentId: token, // Use token as the payment identifier for PayPal
              transactionId,
              wooSession,
              authToken, // Pass auth token in body as well
              paymentMethodType: 'paypal',
              paypalDetails: captureData,
              checkoutData: JSON.parse(localStorage.getItem('pending-paypal-checkout') || '{}'),
              timestamp,
            }),
          })

          if (!orderRes.ok) {
            const err = await orderRes.json()
            throw new Error(err.error || 'Order creation failed')
          }

          const orderData = await orderRes.json()
          const orderId = orderData.orderId || orderData.checkout?.order?.databaseId

          console.log('PayPal order created successfully:', orderId)

          // Mark payment as processed to prevent duplicate calls
          sessionStorage.setItem(processedKey, 'true')

          // Clean up stored checkout data
          localStorage.removeItem('pending-paypal-checkout')

          // Refresh cart to reflect the purchase
          await refreshCart()

          setProcessingStage('Redirecting to confirmation')
          setIsProcessing(false) // Stop processing before redirect

          router.replace(`/order-confirmation/${orderId}?payment_method=paypal&paypal_id=${token}`)
          return
        }

        // --- BNPL Flow (Afterpay / Zip) ---
        const isBNPL = ['zip', 'afterpay_clearpay', 'afterpay', 'clearpay'].includes(
          paymentMethod || ''
        )

        if (isBNPL && paymentIntent) {
          setProcessingStage('Creating order (BNPL)')

          console.log('Processing BNPL payment with auth token:', !!authToken)

          const res = await fetch('/api/create-post-payment-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(wooSession ? { 'woocommerce-session': `Session ${wooSession}` } : {}),
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent,
              transactionId: transactionId || uniqueId || paymentIntent,
              wooSession,
              authToken, // Pass auth token in body as well
              paymentMethodType: paymentMethod,
              timestamp,
            }),
          })

          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Order creation failed')
          }

          const data = await res.json()
          const orderId = data.orderId || data.checkout?.order?.databaseId

          if (!orderId) throw new Error('No order ID returned')

          console.log('BNPL order created successfully:', orderId)

          // Mark payment as processed to prevent duplicate calls
          sessionStorage.setItem(processedKey, 'true')

          // Clean up stored checkout data
          localStorage.removeItem('pending-bnpl-checkout')

          // Refresh cart to reflect the purchase
          await refreshCart()

          setProcessingStage('Redirecting to confirmation')
          setIsProcessing(false) // Stop processing before redirect

          router.replace(
            `/order-confirmation/${orderId}?payment_method=${paymentMethod}&payment_intent=${paymentIntent}&transaction_id=${transactionId}`
          )
          return
        }

        // If we get here, no payment method was handled
        console.error('No payment method matched or missing required parameters:', {
          paymentMethod,
          paymentIntent,
          token,
          payerId,
        })
        throw new Error('Unsupported payment method or missing payment data')
      } catch (e) {
        console.error('Payment processing error:', e)
        const msg = e instanceof Error ? e.message : 'Unexpected error'
        setError(msg)
        setIsProcessing(false)

        // Don't automatically redirect on error - let user see the error
        // router.replace(
        //   `/checkout?error=payment_processing_error&message=${encodeURIComponent(msg)}`
        // )
      }
    }

    // Only run once when component mounts and has required data
    const paymentMethod = searchParams.get('payment_method')
    const paymentIntent = searchParams.get('payment_intent')
    const token = searchParams.get('token')

    // Check if we have the required parameters for any payment method
    const hasRequiredParams =
      paymentMethod &&
      ((paymentMethod === 'paypal' && token) || // PayPal needs token
        (paymentMethod !== 'paypal' && paymentIntent)) // Other methods need payment_intent

    if (hasRequiredParams) {
      processPayment()
    } else {
      console.error('Missing required parameters:', {
        paymentMethod,
        paymentIntent,
        token,
        hasPaymentMethod: !!paymentMethod,
        hasPaymentIntent: !!paymentIntent,
        hasToken: !!token,
      })
      setError('Missing required payment parameters for the selected payment method')
      setIsProcessing(false)
    }
  }, []) // Empty dependency array to run only once

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner className="h-12 w-12 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
        <p className="text-gray-600 mb-2">{processingStage}</p>
        <p className="text-gray-500 text-sm">Please do not close this window.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Payment Processing Error</h1>
        <p className="text-gray-600 mb-4 text-center max-w-md">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/checkout')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Checkout
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

// Main PaymentProcessingClient component with Suspense boundary
export default function PaymentProcessingClient() {
  return (
    <Suspense fallback={<PaymentProcessingSkeleton />}>
      <PaymentProcessingContent />
    </Suspense>
  )
}
