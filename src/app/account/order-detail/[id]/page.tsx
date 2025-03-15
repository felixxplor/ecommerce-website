'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import Link from 'next/link'

interface OrderDetail {
  id: string
  databaseId: number
  date: string
  status: string
  total: string
  subtotal: string
  shippingTotal: string
  tracking_items?: Array<{
    tracking_number: string
    tracking_provider: string
    tracking_link: string
  }>
  lineItems: {
    nodes: Array<{
      product: {
        node: {
          name: string
          image?: {
            sourceUrl: string
          }
        }
      }
      total: string
      quantity: number
      subtotal: string
    }>
  }
  shipping: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  billing: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    if (!authToken) {
      router.replace('/login?returnUrl=/account')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, router])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!order) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/account">
            <Button variant="outline">Back to Account</Button>
          </Link>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-8 md:py-14 px-4 md:px-0">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/account" className="text-sm text-gray-600 hover:text-primary mb-2 block">
            ← Back to Account
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Order #{order.databaseId}</h1>
          <p className="text-sm md:text-base text-gray-600">
            Placed on {format(new Date(order.date), 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge className={`${getStatusColor(order.status)} mt-2 sm:mt-0`}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.lineItems.nodes.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b last:border-0 gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.product.node.image && (
                      <img
                        src={item.product.node.image.sourceUrl}
                        alt={item.product.node.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-sm md:text-base">{item.product.node.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="font-medium text-sm md:text-base">{item.total}</p>
                    <p className="text-xs md:text-sm text-gray-600">Unit price: {item.subtotal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Information */}
          {order?.tracking_items && order.tracking_items.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Tracking Information</h2>
              <div className="space-y-2">
                {order.tracking_items[0]?.tracking_number && (
                  <p className="text-sm md:text-base">
                    <span className="font-medium">Tracking Number:</span>{' '}
                    {order.tracking_items[0].tracking_number}
                  </p>
                )}
                {order.tracking_items[0]?.tracking_provider && (
                  <p className="text-sm md:text-base">
                    <span className="font-medium">Carrier:</span>{' '}
                    {order.tracking_items[0].tracking_provider}
                  </p>
                )}
                {order.tracking_items[0]?.tracking_link && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto mt-2"
                    onClick={() =>
                      window.open(order.tracking_items?.[0]?.tracking_link ?? '#', '_blank')
                    }
                  >
                    Track Package
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <span>Subtotal</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span>Shipping</span>
                <span>{order.shippingTotal}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t text-sm md:text-base">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Shipping Address</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {order.shipping.firstName} {order.shipping.lastName}
              <br />
              {order.shipping.address1}
              {order.shipping.address2 && (
                <>
                  <br />
                  {order.shipping.address2}
                </>
              )}
              <br />
              {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
              <br />
              {order.shipping.country}
            </p>
          </div>

          {/* Billing Address */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Billing Address</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {order.billing.firstName} {order.billing.lastName}
              <br />
              {order.billing.address1}
              {order.billing.address2 && (
                <>
                  <br />
                  {order.billing.address2}
                </>
              )}
              <br />
              {order.billing.city}, {order.billing.state} {order.billing.postcode}
              <br />
              {order.billing.country}
              <br />
              <br />
              Email: {order.billing.email}
              <br />
              Phone: {order.billing.phone}
            </p>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
