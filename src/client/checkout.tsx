'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/client/session-provider'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const { cart, isAuthenticated } = useSession() // Get isAuthenticated from session
  const [clientSecret, setClientSecret] = useState<string>()
  const [error, setError] = useState<string>()
  const { toast } = useToast()

  useEffect(() => {
    if (!cart?.total) return

    const createCheckoutSession = async () => {
      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: cart.total,
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
      }
    }

    createCheckoutSession()
  }, [cart?.total])

  if (error) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center text-red-600">
          <h2>Error creating checkout session</h2>
          <p>{error}</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-14">
      {!isAuthenticated && ( // Only show auth options if user is not logged in
        <div className="mb-8">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-center">Express Checkout</h2>

            <div className="flex flex-col space-y-4 items-center">
              <Link
                href={`/login?returnUrl=${encodeURIComponent('/checkout')}`}
                className="text-blue-600 hover:text-blue-800"
              >
                Returning customer? Click here to login
              </Link>
              <Link
                href={`/register?returnUrl=${encodeURIComponent('/checkout')}`}
                className="text-blue-600 hover:text-blue-800"
              >
                New customer? Create an account here
              </Link>
              <div className="text-gray-600">or</div>
              <div className="text-gray-600">Continue as guest below</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {clientSecret ? (
          <div className="lg:col-span-2">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : (
          <div className="lg:col-span-2 flex justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </MaxWidthWrapper>
  )
}
