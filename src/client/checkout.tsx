'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/client/session-provider'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle, ArrowLeft, CreditCard } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { cart, isAuthenticated } = useSession()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string>()
  const [error, setError] = useState<string>()
  const [checkoutChoice, setCheckoutChoice] = useState<'guest' | 'login' | null>(
    isAuthenticated ? 'guest' : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // If user is authenticated or guest checkout is selected, and we have cart total
    if ((isAuthenticated || checkoutChoice === 'guest') && cart?.total && !clientSecret) {
      createCheckoutSession()
    }
  }, [checkoutChoice, isAuthenticated, cart?.total])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Reset the checkout choice if the user navigates back
      if (checkoutChoice && !isAuthenticated) {
        setCheckoutChoice(null)
        setClientSecret(undefined)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [checkoutChoice, isAuthenticated])

  const createCheckoutSession = async () => {
    if (!cart?.total) return

    setIsLoading(true)
    try {
      // Add entry to browser history so back button works correctly
      if (!isAuthenticated && checkoutChoice === 'guest') {
        // Push current state to history stack
        window.history.pushState({ checkoutChoice: 'guest' }, '', window.location.href)
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cart.total,
          checkoutType: checkoutChoice || 'unknown',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create checkout session')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Checkout failed')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Checkout failed',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <MaxWidthWrapper className="py-14">
      {/* Checkout method selection */}
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

      {/* Stripe Checkout */}
      {!isLoading && clientSecret && (
        <div className="mt-6">
          {/* Back button to choose another checkout option */}
          {!isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutChoice(null)
                setClientSecret(undefined)
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}

          <div className="bg-white border border-gray-200 rounded-lg shadow p-4 mb-6">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </div>
      )}
    </MaxWidthWrapper>
  )
}
