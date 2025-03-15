'use client'

import React, { useState, FormEvent, ChangeEvent } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Package, Truck } from 'lucide-react'

// Define TypeScript interfaces for our data
interface OrderData {
  orderId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber: string
  carrier: string
  orderDate: string
  estimatedDelivery: string
}

export default function OrderTracking(): JSX.Element {
  // State for form and tracking
  const [orderId, setOrderId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    // Validation
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both order number and email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // In a real application, this would be an API call to your backend
      // For example:
      // const response = await fetch('/api/track-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ orderId, email })
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setOrderData(data);
      // } else {
      //   setError(data.message || 'Failed to find order');
      // }

      // This is just a simulation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (orderId === '12345' && email.includes('@')) {
        setOrderData({
          orderId: '12345',
          status: 'shipped',
          trackingNumber: 'AUS39458732',
          carrier: 'Australia Post',
          orderDate: '2025-02-20',
          estimatedDelivery: '2025-03-02',
        })
      } else {
        setError('No order found with this order number and email combination.')
      }
    } catch (err) {
      setError('Failed to fetch order information. Please try again later.')
      console.error('Error fetching order:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset the form and results
  const trackAnotherOrder = (): void => {
    setOrderData(null)
    setOrderId('')
    setEmail('')
    setError('')
  }

  // Format date helper
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get status badge color based on order status
  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text">Track Your Order</h1>
            <p className="text-gray-600 text-lg">
              Enter your order details below to check your order status.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {!orderData ? (
            /* Order Lookup Form */
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order Number</Label>
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value)}
                      placeholder="Enter your order number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="Enter the email used for your order"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Track Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Simple Order Status Display */
            <Card>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-medium mb-1">
                      Order #{orderData.orderId}
                    </h2>
                    <p className="text-gray-600">Placed on {formatDate(orderData.orderDate)}</p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(
                        orderData.status
                      )}`}
                    >
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Tracking Number</p>
                      <p className="text-gray-700">{orderData.trackingNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Carrier</p>
                      <p className="text-gray-700">{orderData.carrier}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-gray-700">{formatDate(orderData.estimatedDelivery)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <a
                    href={`https://auspost.com.au/mypost/track/#/details/${orderData.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors"
                  >
                    Track with {orderData.carrier}
                  </a>
                </div>

                <Button onClick={trackAnotherOrder} variant="outline" className="w-full">
                  Track Another Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
