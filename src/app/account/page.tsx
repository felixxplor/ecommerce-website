'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/client/session-provider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { hasCredentials } from '@/utils/session'

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
  } | null
}

interface Order {
  id: string
  databaseId: number
  date: string
  status: string
  total: string
  tracking_items?: {
    tracking_number: string
    tracking_provider: string
    tracking_link: string
  }[]
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
  } | null
}

export default function AccountPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setIsLoading] = useState(true)
  const { logout: killSession, isAuthenticated } = useSession()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  useEffect(() => {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    if (!authToken) {
      router.replace('/login?returnUrl=/account')
      return
    }

    const fetchData = async () => {
      try {
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
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

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

  const handleLogout = () => {
    sessionStorage.removeItem('woo-auth-token')
    killSession()
    router.replace('/')
  }

  // Function to render shipping address or N/A if not available
  const renderShippingAddress = (shipping: Order['shipping'] | CustomerDetails['shipping']) => {
    if (
      !shipping ||
      !shipping.address1 ||
      (shipping.firstName === '' && shipping.lastName === '' && shipping.address1 === '')
    ) {
      return <p className="text-gray-600">N/A</p>
    }

    return (
      <p className="text-gray-600">
        {shipping.firstName} {shipping.lastName}
        <br />
        {shipping.address1}
        {shipping.address2 && (
          <>
            <br />
            {shipping.address2}
          </>
        )}
        <br />
        {shipping.city}, {shipping.state} {shipping.postcode}
        <br />
        {shipping.country}
      </p>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <MaxWidthWrapper className="py-8 md:py-14 px-4 md:px-0">
      <div className="min-h-[600px]">
        {/* Account Details Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Account Details</h1>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Link href="/account/edit" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Edit Profile
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {customer && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-gray-600">
                    {customer.firstName} {customer.lastName}
                    <br />
                    {customer.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold mb-2">Default Shipping Address</h3>
                  {renderShippingAddress(customer.shipping)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Recent Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">No order has been made yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                    <div className="space-y-4 w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                        <Link href={`/account/order-detail/${order.databaseId}`}>
                          <h3 className="font-semibold hover:text-primary text-sm md:text-base">
                            Order #{order.databaseId}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs md:text-sm"
                            onClick={() => router.push(`/account/order-detail/${order.databaseId}`)}
                          >
                            View Details
                          </Button>
                          {order.tracking_items && order.tracking_items.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs md:text-sm"
                              onClick={() => {
                                if (order.tracking_items?.[0]?.tracking_link) {
                                  window.open(order.tracking_items[0].tracking_link, '_blank')
                                } else {
                                  alert(
                                    `Tracking Number: ${
                                      order.tracking_items?.[0]?.tracking_number || 'Not available'
                                    }\nCarrier: ${
                                      order.tracking_items?.[0]?.tracking_provider ||
                                      'Not available'
                                    }`
                                  )
                                }
                              }}
                            >
                              Track Order
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-600">
                        {format(new Date(order.date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center gap-2 w-full sm:w-auto sm:self-start mt-2 sm:mt-0">
                      <Badge className={`${getStatusColor(order.status)} text-xs`}>
                        {order.status}
                      </Badge>
                      <p className="font-semibold text-sm md:text-base">{order.total}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-sm md:text-base">Items</h4>
                    <ul className="space-y-2 overflow-x-auto">
                      {order.lineItems.nodes.map((item, index) => (
                        <li key={index} className="flex justify-between text-xs md:text-sm">
                          <span className="truncate mr-2">
                            {item.quantity}x {item.product.node.name}
                          </span>
                          <span className="font-medium whitespace-nowrap">{item.total}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <h4 className="font-medium mb-2 text-sm md:text-base">Shipping Address</h4>
                    <div className="text-xs md:text-sm">
                      {renderShippingAddress(order.shipping)}
                    </div>
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
