// app/account/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/client/session-provider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CustomerDetails {
  firstName: string
  lastName: string
  email: string
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
}

interface Order {
  id: string
  databaseId: number
  date: string
  status: string
  total: string
  lineItems: {
    nodes: Array<{
      product: {
        node: {
          name: string
        }
      }
      total: string
      quantity: number
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
}

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    if (!authToken) {
      router.replace('/login?returnUrl=/account')
      return
    }

    const fetchData = async () => {
      try {
        // Fetch customer details and orders
        const [customerResponse, ordersResponse] = await Promise.all([
          fetch('/api/customer', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          fetch('/api/orders', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
        ])

        if (!customerResponse.ok || !ordersResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const customerData = await customerResponse.json()
        const ordersData = await ordersResponse.json()

        setCustomer(customerData.customer)
        setOrders(ordersData.orders)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

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

  return (
    <MaxWidthWrapper className="py-14">
      <div className="min-h-[600px]">
        {/* Account Details Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Account Details</h1>
            <Link href="/account/addresses">
              <Button variant="outline">Manage Addresses</Button>
            </Link>
          </div>

          {customer && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-gray-600">
                    {customer.firstName} {customer.lastName}
                    <br />
                    {customer.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Default Shipping Address</h3>
                  <p className="text-gray-600">
                    {customer.shipping.firstName} {customer.shipping.lastName}
                    <br />
                    {customer.shipping.address1}
                    {customer.shipping.address2 && (
                      <>
                        <br />
                        {customer.shipping.address2}
                      </>
                    )}
                    <br />
                    {customer.shipping.city}, {customer.shipping.state} {customer.shipping.postcode}
                    <br />
                    {customer.shipping.country}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">No order has been made yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.databaseId}</h3>
                      <p className="text-sm text-gray-600">{format(new Date(order.date), 'PPP')}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)}`}>{order.status}</Badge>
                      <p className="mt-1 font-semibold">{order.total}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Items</h4>
                    <ul className="space-y-2">
                      {order.lineItems.nodes.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.product.node.name}
                          </span>
                          <span className="font-medium">{item.total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  )
}