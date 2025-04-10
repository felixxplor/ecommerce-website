'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { CheckCircle, XCircle, ShoppingBag, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useSession } from './session-provider'

interface OrderDetails {
  checkout?: {
    order?: {
      databaseId?: number
    }
  }
}

export default function OrderConfirmationPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'processing' | 'error'>('pending')
  const [error, setError] = useState<string>()
  const [orderNumber, setOrderNumber] = useState<number>()
  const [paymentMethodType, setPaymentMethodType] = useState<string>()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  // Get parameters from URL
  const paymentIntentId = searchParams.get('payment_intent')
  const orderId = searchParams.get('order_id')
  const redirectStatus = searchParams.get('redirect_status')
  const paymentMethod = searchParams.get('payment_method')
  const { refetch, refreshCart } = useSession()

  useEffect(() => {
    refreshCart()
  }, [])

  useEffect(() => {
    // Set payment method from URL param if available
    if (paymentMethod) {
      setPaymentMethodType(paymentMethod)
    }

    // Check for payment failure in URL
    if (redirectStatus === 'failed') {
      setStatus('error')
      setError('Your payment was declined. Please try again with a different payment method.')
      toast({
        title: 'Payment Failed',
        description: 'Your payment could not be processed. Please try again.',
        variant: 'destructive',
      })
      return
    }

    // If we already have an order ID, we can skip the order verification
    if (orderId) {
      setOrderNumber(parseInt(orderId, 10))

      // Check if this is a buy-now-pay-later method that might still be processing
      if (
        paymentMethod &&
        ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethod)
      ) {
        // Set status to processing for these payment methods
        setStatus('processing')
      } else {
        // For other payment methods, if we have an order ID, assume success
        setStatus('success')
      }
      return
    }

    // If no order ID but we have a payment intent, verify payment and check for existing order
    if (paymentIntentId) {
      checkPaymentAndOrder()
    } else {
      // No payment intent or order ID provided
      setStatus('error')
      setError('No payment information found. Please return to checkout.')
    }
  }, [paymentIntentId, orderId, paymentMethod, redirectStatus])

  // In your OrderConfirmationPage component
  useEffect(() => {
    // Extract the session from URL
    const params = new URLSearchParams(window.location.search)
    const wooSession = params.get('woo_session')

    if (wooSession) {
      // Restore the original session
      localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, wooSession)
      document.cookie = `woocommerce-session=Session ${wooSession}; path=/; secure; samesite=strict`

      // Remove the session from URL to avoid security issues
      const newUrl =
        window.location.pathname +
        window.location.search.replace(/woo_session=[^&]*&?/, '').replace(/[?&]$/, '')
      window.history.replaceState({}, document.title, newUrl)
    } else {
      // Fallback to backup session if URL param isn't available
      const backupSession = localStorage.getItem('woo-session-backup')
      if (backupSession) {
        localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, backupSession)
        document.cookie = `woocommerce-session=Session ${backupSession}; path=/; secure; samesite=strict`
        localStorage.removeItem('woo-session-backup') // Clean up after restore
      }
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paypalStatus = params.get('paypal')
    const orderId = params.get('order_id')
    const token = params.get('token') // PayPal order ID
    const wooSession = params.get('woo_session')

    if (paypalStatus && orderId) {
      // PayPal redirect has occurred

      // First, ensure we have a session - either from URL parameter or from backup
      let sessionToken = wooSession

      // If we received the session in the URL, save it first
      if (sessionToken) {
        // Save the session from URL parameter
        localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
        document.cookie = `woocommerce-session=Session ${sessionToken}; path=/; secure; samesite=strict`

        // Remove session from URL for security
        const newUrl =
          window.location.pathname +
          window.location.search.replace(/woo_session=[^&]*&?/, '').replace(/[?&]$/, '')
        window.history.replaceState({}, document.title, newUrl)
      } else {
        // No session in URL, try to get from localStorage or backup
        sessionToken =
          localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string) ||
          localStorage.getItem('woo-session-backup')

        // If we found a backup session, restore it
        if (sessionToken && localStorage.getItem('woo-session-backup') === sessionToken) {
          localStorage.setItem(process.env.SESSION_TOKEN_LS_KEY as string, sessionToken)
          document.cookie = `woocommerce-session=Session ${sessionToken}; path=/; secure; samesite=strict`
          localStorage.removeItem('woo-session-backup') // Clean up after restore
        }
      }

      if (paypalStatus === 'success') {
        setIsLoading(true)
        setStatus('pending')
        setPaymentMethodType('paypal')

        if (orderId) {
          setOrderNumber(parseInt(orderId, 10))
        }

        // Need to capture the payment
        if (token) {
          if (!sessionToken) {
            console.error('No WooCommerce session found')
            setStatus('error')
            setError('Authentication error: No WooCommerce session found')
            setIsLoading(false)
            return
          }

          fetch('/api/paypal-capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              paypalOrderId: token,
              wooSession: sessionToken,
            }),
          })
            .then((response) => response.json())
            .then((data) => {
              setIsLoading(false)
              // Check if capture was successful
              if (data.success) {
                setStatus('success')
              } else {
                setStatus('error')
                setError(data.error || 'Failed to capture payment')
                toast({
                  title: 'Payment Error',
                  description: data.error || 'Failed to capture payment',
                  variant: 'destructive',
                })
              }
            })
            .catch((error) => {
              setIsLoading(false)
              console.error('Error capturing PayPal payment:', error)
              setStatus('error')
              setError('Failed to capture payment. Please contact support.')
              toast({
                title: 'Payment Error',
                description: 'Failed to process your payment. Please contact support.',
                variant: 'destructive',
              })
            })
        } else {
          // No token present, display basic success
          setStatus('success')
          setIsLoading(false)
        }
      } else if (paypalStatus === 'cancel') {
        // Handle cancelled payment
        setStatus('error')
        setError('Payment was cancelled. Please try again.')
        toast({
          title: 'Payment Cancelled',
          description: 'Your PayPal payment was cancelled. Please try again.',
          variant: 'destructive',
        })

        // Update order status to cancelled
        if (sessionToken) {
          fetch(`/api/update-order-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: parseInt(orderId, 10),
              status: 'cancelled',
              wooSession: sessionToken,
            }),
          }).catch(console.error)
        }
      }
    }
  }, [toast, setStatus, setError, setOrderNumber, setPaymentMethodType, setIsLoading])

  // In your order-confirmation page
  useEffect(() => {
    // Check for payment failure in URL
    if (redirectStatus === 'failed') {
      setStatus('error')
      setError('Your payment was declined. Please try again with a different payment method.')

      // If we have an order ID, update its status to failed
      if (orderId) {
        fetch(`/api/update-order-status?order_id=${orderId}&status=failed`, {
          method: 'POST',
        }).catch(console.error)
      }

      return
    }

    // If we have an order ID, use it
    if (orderId) {
      const orderIdNum = parseInt(orderId, 10)
      setOrderNumber(orderIdNum)

      // Check if this is Afterpay/Zip
      if (
        paymentMethod &&
        ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethod)
      ) {
        setPaymentMethodType(paymentMethod)

        // Check payment status if we also have a payment intent
        if (paymentIntentId) {
          checkPaymentStatus(paymentIntentId, orderIdNum)
        } else {
          // No payment intent ID, assume processing for BNPL methods
          setStatus('processing')
        }
      } else {
        // For non-BNPL methods with order ID, assume success
        setStatus('success')
        if (paymentMethod) {
          setPaymentMethodType(paymentMethod)
        }
      }
      return
    }

    // No order ID but have payment intent - unusual case
    if (paymentIntentId) {
      checkPaymentStatus(paymentIntentId)
    } else {
      // No order ID or payment intent - error
      setStatus('error')
      setError('No order information found. Please contact support.')
    }
  }, [orderId, paymentIntentId, paymentMethod, redirectStatus])

  // Function to check payment status
  const checkPaymentStatus = async (paymentIntentId: string, existingOrderId?: number) => {
    try {
      const response = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)

      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      const data = await response.json()

      // Set payment method if available
      if (data.payment_method) {
        setPaymentMethodType(data.payment_method)
      }

      // Update status based on payment status
      if (data.payment_status === 'succeeded') {
        setStatus('success')

        // If we have an order ID, update its status
        if (existingOrderId) {
          fetch(`/api/update-order-status?order_id=${existingOrderId}&status=processing`, {
            method: 'POST',
          }).catch(console.error)
        }
      } else if (data.payment_status === 'processing') {
        setStatus('processing')
      } else {
        setStatus('error')
        setError(`Payment is in ${data.payment_status} state. Please contact support.`)
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  // Function to check payment status and look for existing order
  const checkPaymentAndOrder = async () => {
    try {
      // First check if an order already exists for this payment intent
      const checkOrderResponse = await fetch(`/api/check-order?payment_intent=${paymentIntentId}`)

      if (!checkOrderResponse.ok) {
        throw new Error('Failed to check order status')
      }

      const orderData = await checkOrderResponse.json()

      // If order exists, use it and don't create a new one
      if (orderData.exists && orderData.orderId) {
        setOrderNumber(orderData.orderId)

        // Now check payment status
        const paymentResponse = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)

        if (!paymentResponse.ok) {
          throw new Error('Failed to check payment status')
        }

        const paymentData = await paymentResponse.json()

        // Set payment method from API response
        if (paymentData.payment_method) {
          setPaymentMethodType(paymentData.payment_method)
        }

        // Determine status based on payment status
        if (paymentData.payment_status === 'succeeded') {
          setStatus('success')
        } else if (paymentData.payment_status === 'processing') {
          setStatus('processing')
        } else {
          setStatus('error')
          setError(`Payment is in ${paymentData.payment_status} state. Please contact support.`)
        }
        return
      }

      // No existing order found, check if payment is valid
      const paymentResponse = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)

      if (!paymentResponse.ok) {
        throw new Error('Payment verification failed')
      }

      const paymentData = await paymentResponse.json()

      // Set payment method
      if (paymentData.payment_method) {
        setPaymentMethodType(paymentData.payment_method)
      }

      // If payment is successful or processing, try to create order
      if (['succeeded', 'processing'].includes(paymentData.payment_status)) {
        // We need to create an order
        // This is a fallback and shouldn't normally happen if orders are created
        // properly during checkout
        setStatus(paymentData.payment_status === 'succeeded' ? 'success' : 'processing')

        // Note: We don't create the order here, as this would be a fallback implementation
        // that would create orders with incomplete information
      } else {
        // Payment not in a valid state
        setStatus('error')
        setError(`Payment is in ${paymentData.payment_status} state. Please contact support.`)
      }
    } catch (error) {
      console.error('Error checking payment and order:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  // Function to check order status again (for processing payments)
  const checkOrderStatus = async () => {
    if (!paymentIntentId) return

    setStatus('pending')

    try {
      // Check payment status
      const response = await fetch(`/api/payment-status?payment_intent=${paymentIntentId}`)

      if (!response.ok) {
        throw new Error('Failed to check payment status')
      }

      const data = await response.json()

      if (data.payment_status === 'succeeded') {
        setStatus('success')

        // Check for order ID if not already set
        if (!orderNumber) {
          const orderCheckResponse = await fetch(
            `/api/check-order?payment_intent=${paymentIntentId}`
          )
          const orderData = await orderCheckResponse.json()
          if (orderData.exists && orderData.orderId) {
            setOrderNumber(orderData.orderId)
          }
        }
      } else if (data.payment_status === 'processing') {
        setStatus('processing')
      } else {
        throw new Error(`Payment is in ${data.payment_status} state`)
      }
    } catch (error) {
      setStatus('error')
      setError(error instanceof Error ? error.message : 'Failed to check payment status')
    }
  }

  // Render different UI based on current status
  if (status === 'pending') {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner className="h-12 w-12 text-primary" />
          <p className="mt-4 text-lg">Processing your order...</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  if (status === 'processing') {
    // Special state for payment methods that take time to process (like Afterpay/Zip)
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-50 p-6 rounded-full inline-flex mb-6">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Processing</h1>

          {paymentMethodType && (
            <p className="text-xl mb-2">
              Your{' '}
              {paymentMethodType === 'afterpay_clearpay'
                ? 'Afterpay'
                : paymentMethodType === 'zip'
                ? 'Zip'
                : paymentMethodType}{' '}
              payment is being processed
            </p>
          )}

          {orderNumber ? (
            <p className="text-gray-600 mb-2">
              Order number: <span className="font-semibold">#{orderNumber}</span>
            </p>
          ) : (
            <p className="text-gray-600 mb-2">
              Your order will be created once payment is complete
            </p>
          )}

          <p className="text-gray-600 mb-8">
            This may take a few minutes to complete. We'll send you a confirmation email once the
            payment is finalized.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={checkOrderStatus} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Check Status
            </Button>

            <Button asChild variant="outline">
              <Link href="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    )
  }

  if (status === 'error') {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-red-600">Payment Error</h1>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            {error || 'There was a problem processing your payment.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/cart">Return to Cart</Link>
            </Button>
            <Button asChild>
              <Link href="/checkout">Try Again</Link>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    )
  }

  // Success state
  return (
    <MaxWidthWrapper className="py-14">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-green-50 p-6 rounded-full inline-flex mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-xl mb-2">Your order has been confirmed</p>

        {paymentMethodType && (
          <p className="text-gray-600 mb-2">
            Payment method:{' '}
            {paymentMethodType === 'afterpay_clearpay'
              ? 'Afterpay'
              : paymentMethodType === 'zip'
              ? 'Zip'
              : paymentMethodType}
          </p>
        )}

        {orderNumber && (
          <p className="text-gray-600 mb-6">
            Order number: <span className="font-semibold">#{orderNumber}</span>
          </p>
        )}

        <p className="text-gray-600 mb-8">
          We've sent you an email with your order details and tracking information.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          {orderNumber && (
            <Button asChild>
              <Link href={`/orders/${orderNumber}`}>View Order Details</Link>
            </Button>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
