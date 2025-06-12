'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/client/session-provider'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CreditCard, UserCircle } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from '@/app/checkout/components/CheckoutForm'
import { CartSummary } from '@/app/checkout/components/CartSummary'
import { loadStripe } from '@stripe/stripe-js'

export function CheckoutClient() {
  const { cart, isAuthenticated } = useSession()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkoutChoice, setCheckoutChoice] = useState<'guest' | 'login' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [initialLoading, setInitialLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

  // Initialize checkout choice based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      setCheckoutChoice('guest')
    }
    setAuthChecked(true)
  }, [isAuthenticated])

  // Initial loading timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Create payment intent function
  const createPaymentIntent = async () => {
    if (!cart?.total) return

    setIsLoading(true)
    try {
      // Add entry to browser history so back button works correctly
      if (!isAuthenticated && checkoutChoice === 'guest') {
        window.history.pushState({ checkoutChoice: 'guest' }, '', window.location.href)
      }

      // Get the WooCommerce session
      const wooSession = localStorage.getItem('woo-session-token') || ''
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (wooSession) {
        headers['woocommerce-session'] = `Session ${wooSession}`
      }

      // Get auth token if available
      const authToken = sessionStorage.getItem('woo-auth-token')
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: cart.total,
          checkoutType: checkoutChoice || 'unknown',
          timestamp: Date.now(),
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create payment intent when checkout choice changes
  useEffect(() => {
    if (authChecked && checkoutChoice && cart?.total && !clientSecret) {
      createPaymentIntent()
    }
  }, [checkoutChoice, cart?.total, clientSecret, authChecked])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (checkoutChoice && !isAuthenticated) {
        setCheckoutChoice(null)
        setClientSecret(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [checkoutChoice, isAuthenticated])

  if (error) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-2">Error creating checkout session</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </MaxWidthWrapper>
    )
  }

  // Handle empty cart
  if (cart && cart.contents?.nodes?.length === 0) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center">
          <div className="mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout.</p>
          <Button asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    )
  }

  // Show loading state if we're still checking authentication
  if (!authChecked || initialLoading) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-10 md:py-14">
      {/* Checkout method selection - only show if not authenticated and no choice made */}
      {!isAuthenticated && !checkoutChoice && (
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">Checkout Options</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Sign In Option */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex flex-col h-full">
                <div className="mb-4 text-blue-600">
                  <UserCircle size={36} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Sign In</h2>
                <p className="text-gray-600 mb-6 flex-grow">
                  Already have an account? Sign in for a faster checkout experience and to access
                  your order history.
                </p>
                <Link
                  href={`/login?returnUrl=${encodeURIComponent('/checkout')}`}
                  className="w-full"
                >
                  <Button className="w-full" variant="outline">
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Guest Checkout Option */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex flex-col h-full">
                <div className="mb-4 text-gray-600">
                  <CreditCard size={36} />
                </div>
                <h2 className="text-xl font-semibold mb-2">Guest Checkout</h2>
                <p className="text-gray-600 mb-6 flex-grow">
                  Continue as a guest. No account required. You'll still have the option to create
                  an account during checkout.
                </p>
                <Button
                  onClick={() => setCheckoutChoice('guest')}
                  className="w-full"
                  variant="default"
                >
                  Continue as Guest
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Create Account Option */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-3">Don't have an account yet?</p>
            <Link
              href={`/register?returnUrl=${encodeURIComponent('/checkout')}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
          <p className="mt-4 text-gray-600">Preparing your checkout...</p>
        </div>
      )}

      {/* Stripe Elements Checkout */}
      {!isLoading && clientSecret && (
        <div className="mt-6">
          {/* Back button to choose another checkout option */}
          {!isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutChoice(null)
                setClientSecret(null)
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Checkout Option
            </Button>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            </div>

            <div className="lg:col-span-1">{cart && <CartSummary cart={cart} />}</div>
          </div>
        </div>
      )}
    </MaxWidthWrapper>
  )
}
