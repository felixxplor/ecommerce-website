'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'

interface OrderDetails {
  checkout?: {
    order?: {
      databaseId?: number
    }
  }
}

export default function OrderConfirmationPage() {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [error, setError] = useState<string>()
  const [orderNumber, setOrderNumber] = useState<number>()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) return

    const checkOrderStatus = async () => {
      try {
        const wooSession = localStorage.getItem('woo-session-token')
        if (!wooSession) {
          throw new Error('WooCommerce session not found')
        }

        const checkoutSessionResponse = await fetch(`/api/checkout-session?session_id=${sessionId}`)
        if (!checkoutSessionResponse.ok) {
          const errorData = await checkoutSessionResponse.json()
          throw new Error(errorData.error || 'Payment verification failed')
        }

        const createOrderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            wooSession,
          }),
        })

        if (!createOrderResponse.ok) {
          const errorData = await createOrderResponse.json()
          throw new Error(errorData.error || 'Failed to create order')
        }

        const orderData: OrderDetails = await createOrderResponse.json()
        setOrderNumber(orderData.checkout?.order?.databaseId)
        setStatus('success')
      } catch (error) {
        setStatus('error')
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    }

    checkOrderStatus()
  }, [sessionId])

  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">Processing your order...</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Error Creating Order</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Payment successful!</h1>
        {orderNumber && (
          <p className="text-lg mb-4">
            Order number: <span className="font-semibold">#{orderNumber}</span>
          </p>
        )}
        <p className="text-gray-600">Thank you for your order!</p>
      </div>
    </MaxWidthWrapper>
  )
}
