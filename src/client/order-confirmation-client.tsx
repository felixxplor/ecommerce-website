// app/client/order-confirmation-client.tsx
'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { useSession } from './session-provider'

// Skeleton component for loading state
function OrderConfirmationSkeleton() {
  return (
    <MaxWidthWrapper className="py-14">
      <div className="text-center max-w-md mx-auto animate-pulse">
        <div className="bg-gray-200 p-6 rounded-full inline-flex mb-6 w-32 h-32"></div>
        <div className="h-9 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
        <div className="h-5 bg-gray-200 rounded w-80 mx-auto mb-8"></div>
        <div className="flex justify-center gap-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-36"></div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}

// Main content component that uses useSearchParams
function OrderConfirmationContent() {
  const { isAuthenticated } = useSession()
  const searchParams = useSearchParams()
  const params = useParams()

  // Get order ID from URL path params, fallback to search params
  const orderId =
    (params.orderId as string) || searchParams.get('order_id') || searchParams.get('orderId') || ''

  // Clean up checkout data on successful payment
  useEffect(() => {
    // Check for success parameters in URL
    const isSuccess =
      searchParams.get('payment_intent') ||
      searchParams.get('order_id') ||
      searchParams.get('redirect_status') === 'succeeded'

    // If successful payment detected, remove the data
    if (isSuccess) {
      localStorage.removeItem('pending-bnpl-checkout')
      localStorage.removeItem('checkout-billing-email')
      console.log('Checkout data cleaned up after successful payment')
    }
  }, [searchParams])

  return (
    <MaxWidthWrapper className="py-14">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-green-50 p-6 rounded-full inline-flex mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-xl mb-2">Your order has been confirmed.</p>
        {orderId && (
          <p className="text-gray-600 mb-6">
            Order number: <span className="font-semibold">#{orderId}</span>
          </p>
        )}
        <p className="text-gray-600 mb-8">
          We've sent you an email with your order and tracking details.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/collections">Continue Shopping</Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild>
              <Link href={`/account/order-detail/${orderId}`}>View Order Details</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/order-tracking">Track This Order</Link>
            </Button>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  )
}

// Main OrderConfirmationClient component with Suspense boundary
export function OrderConfirmationClient() {
  return (
    <Suspense fallback={<OrderConfirmationSkeleton />}>
      <OrderConfirmationContent />
    </Suspense>
  )
}
