'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface OrderDetail {
  id: string
  coupon: string
  databaseId: number
  date: string
  status: string
  total: string
  subtotal: string
  shippingTotal: string
  tracking_items?: Array<{
    tracking_number: string
    tracking_provider: string
    tracking_link?: string
    custom_tracking_link?: string
    custom_tracking_provider?: string
    date_shipped?: string
    source?: string
    status_shipped?: string
    tracking_id?: string
    tracking_product_code?: string
    user_id?: number
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

// Helper function to generate tracking URLs for Australia Post and Sendle
const generateTrackingUrl = (trackingNumber: string, provider: string): string => {
  const cleanTrackingNumber = trackingNumber.trim()
  const cleanProvider = provider.toLowerCase().trim()

  console.log(
    `Generating tracking URL for provider: "${cleanProvider}" with tracking number: "${cleanTrackingNumber}"`
  )

  // Australia Post tracking URL (handle both "australia-post" and "australia post" formats)
  if (
    cleanProvider.includes('australia-post') ||
    cleanProvider.includes('australia post') ||
    cleanProvider.includes('auspost') ||
    cleanProvider.includes('australia_post')
  ) {
    const url = `https://auspost.com.au/mypost/track/#/details/${cleanTrackingNumber}`
    console.log('Generated Australia Post URL:', url)
    return url
  }

  // Sendle tracking URL (handle various Sendle formats)
  if (cleanProvider.includes('sendle') || cleanProvider === 'sendle') {
    const url = `https://track.sendle.com/${cleanTrackingNumber}`
    console.log('Generated Sendle URL:', url)
    return url
  }

  console.log('No matching provider found for:', cleanProvider)
  return ''
}

// Updated interface for Next.js 15 - params is now a Promise
interface PageProps {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState<string>('')

  // Resolve params Promise in useEffect
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setOrderId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!orderId) return // Wait for orderId to be resolved

    const authToken = sessionStorage.getItem('woo-auth-token')

    if (!authToken) {
      router.replace('/login?returnUrl=/account')
      return
    }

    const fetchOrder = async () => {
      try {
        // First, get the order details from GraphQL
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        console.log('Order data received:', data.order) // Debug log

        let orderWithTracking = data.order

        // If the order has billing email, also fetch tracking data from the working endpoint
        if (data.order?.billing?.email) {
          console.log(
            'Attempting to fetch tracking for order:',
            orderId,
            'email:',
            data.order.billing.email
          )
          try {
            const trackingUrl = `/api/track-order?id=${orderId}&email=${encodeURIComponent(
              data.order.billing.email
            )}`
            console.log('Fetching tracking from URL:', trackingUrl)

            const trackingResponse = await fetch(trackingUrl)
            console.log('Tracking response status:', trackingResponse.status)

            if (trackingResponse.ok) {
              const trackingData = await trackingResponse.json()
              console.log('Full tracking response:', trackingData)

              if (trackingData.order?.tracking_items) {
                console.log('Tracking data found:', trackingData.order.tracking_items)
                // Merge tracking data into the order
                orderWithTracking = {
                  ...data.order,
                  tracking_items: trackingData.order.tracking_items,
                }
                console.log('Order with tracking merged:', orderWithTracking)
              } else {
                console.log('No tracking_items in response:', trackingData.order)
              }
            } else {
              console.log('Tracking response not ok:', trackingResponse.status)
              const errorText = await trackingResponse.text()
              console.log('Tracking error response:', errorText)
            }
          } catch (trackingError) {
            console.log('Error fetching tracking data:', trackingError)
            // Continue without tracking data
          }
        } else {
          console.log('No billing email found:', data.order?.billing)
        }

        setOrder(orderWithTracking)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  // Update document title for client component
  useEffect(() => {
    const pageTitle = order
      ? `Order #${order.databaseId} | Gizmooz Account`
      : loading
      ? 'Loading Order Details | Gizmooz Account'
      : 'Order Not Found | Gizmooz Account'

    document.title = pageTitle

    // Set meta robots for private pages
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', 'noindex, nofollow')
  }, [order, loading])

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

  // Helper function to extract plain text and parse coupon amount
  const parseCouponAmount = (couponString: string): string => {
    if (!couponString) return ''

    // Remove HTML tags
    const plainText = couponString.replace(/<[^>]*>/g, '')

    // Look for dollar amounts in the string
    const dollarMatch = plainText.match(/\$[\d,]+\.?\d*/)
    if (dollarMatch) {
      return dollarMatch[0]
    }

    return plainText
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner />
        <span className="sr-only">Loading order details</span>
      </div>
    )
  }

  if (!order) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center" role="alert" aria-live="assertive">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="mb-6 text-gray-600">We couldn't find the order you're looking for.</p>
          <Link href="/account">
            <Button variant="outline">Back to Account</Button>
          </Link>
        </div>
      </MaxWidthWrapper>
    )
  }

  const orderDate = new Date(order.date)
  const formattedDate = format(orderDate, 'MMMM d, yyyy')

  return (
    <MaxWidthWrapper className="py-8 md:py-14 px-4 md:px-0">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2">
            <Link href="/account" className="text-sm text-gray-600 hover:text-primary block">
              ← Back to Account
            </Link>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold">Order #{order.databaseId}</h1>
          <time dateTime={orderDate.toISOString()} className="text-sm md:text-base text-gray-600">
            Placed on {formattedDate}
          </time>
        </div>
        <Badge
          className={`${getStatusColor(order.status)} mt-2 sm:mt-0`}
          aria-label={`Order status: ${order.status}`}
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Details */}
        <section className="md:col-span-2 space-y-6" aria-labelledby="order-items-heading">
          {/* Items */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 id="order-items-heading" className="text-lg md:text-xl font-semibold mb-4">
              Order Items
            </h2>
            <ul className="space-y-4" aria-label="Ordered products">
              {order.lineItems.nodes.map((item, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b last:border-0 gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.product.node.image ? (
                      <img
                        src={item.product.node.image.sourceUrl}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                        aria-hidden="true"
                      />
                    ) : (
                      <img
                        src="/product-placeholder.png"
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                        aria-hidden="true"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-sm md:text-base">{item.product.node.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <p className="font-medium text-sm md:text-base">${item.total}</p>
                    <p className="text-xs md:text-sm text-gray-600">Unit price: ${item.subtotal}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tracking Information */}
          {order?.tracking_items && order.tracking_items.length > 0 && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Tracking Information</h2>
              {order.tracking_items.map((trackingItem, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <dl className="space-y-2 mb-4">
                    {trackingItem.tracking_number && (
                      <div className="flex flex-col sm:flex-row sm:gap-2">
                        <dt className="font-medium text-sm md:text-base">Tracking Number:</dt>
                        <dd className="text-sm md:text-base font-mono">
                          {trackingItem.tracking_number}
                        </dd>
                      </div>
                    )}
                    {trackingItem.tracking_provider && (
                      <div className="flex flex-col sm:flex-row sm:gap-2">
                        <dt className="font-medium text-sm md:text-base">Carrier:</dt>
                        <dd className="text-sm md:text-base">{trackingItem.tracking_provider}</dd>
                      </div>
                    )}
                    {trackingItem.date_shipped && (
                      <div className="flex flex-col sm:flex-row sm:gap-2">
                        <dt className="font-medium text-sm md:text-base">Date Shipped:</dt>
                        <dd className="text-sm md:text-base">
                          {new Date(
                            parseInt(trackingItem.date_shipped) * 1000
                          ).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/* Enhanced tracking button logic */}
                  <div className="flex gap-2">
                    {/* First try custom tracking link */}
                    {trackingItem.custom_tracking_link &&
                    trackingItem.custom_tracking_link.trim() ? (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          window.open(
                            trackingItem.custom_tracking_link,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                      >
                        Track Package
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : /* Then try standard tracking link */ trackingItem.tracking_link &&
                      trackingItem.tracking_link.trim() ? (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          window.open(trackingItem.tracking_link, '_blank', 'noopener,noreferrer')
                        }
                      >
                        Track Package
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : /* Finally, generate URL if we have provider and number */ trackingItem.tracking_number &&
                      trackingItem.tracking_provider ? (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          console.log('Tracking item clicked:', trackingItem)
                          const generatedUrl = generateTrackingUrl(
                            trackingItem.tracking_number,
                            trackingItem.tracking_provider
                          )

                          if (generatedUrl) {
                            window.open(generatedUrl, '_blank', 'noopener,noreferrer')
                          } else {
                            // Copy tracking number to clipboard as fallback
                            navigator.clipboard
                              .writeText(trackingItem.tracking_number)
                              .then(() => {
                                alert(
                                  `Tracking number ${trackingItem.tracking_number} copied to clipboard!\n\nPlease visit ${trackingItem.tracking_provider} website to track your package.`
                                )
                              })
                              .catch(() => {
                                alert(
                                  `Tracking Number: ${trackingItem.tracking_number}\nCarrier: ${trackingItem.tracking_provider}\n\nPlease visit your carrier's website to track this package.`
                                )
                              })
                          }
                        }}
                      >
                        Track Package
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <section
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm"
            aria-labelledby="order-summary-heading"
          >
            <h2 id="order-summary-heading" className="text-lg md:text-xl font-semibold mb-4">
              Order Summary
            </h2>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm md:text-base">
                <dt>Subtotal</dt>
                <dd>{order.subtotal}</dd>
              </div>
              {order.coupon && (
                <div className="flex justify-between text-sm md:text-base">
                  <dt>Coupon</dt>
                  <dd className="text-green-600 font-medium">
                    -{parseCouponAmount(order.coupon) || order.coupon}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-sm md:text-base">
                <dt>Shipping</dt>
                <dd className="text-green-600 font-medium">Free</dd>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t text-sm md:text-base">
                <dt>Total</dt>
                <dd>{order.total}</dd>
              </div>
            </dl>
          </section>

          {/* Shipping Address */}
          <section
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm"
            aria-labelledby="shipping-address-heading"
          >
            <h2 id="shipping-address-heading" className="text-lg md:text-xl font-semibold mb-4">
              Shipping Address
            </h2>
            <address className="text-xs md:text-sm text-gray-600 not-italic">
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
            </address>
          </section>

          {/* Billing Address */}
          <section
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm"
            aria-labelledby="billing-address-heading"
          >
            <h2 id="billing-address-heading" className="text-lg md:text-xl font-semibold mb-4">
              Billing Address
            </h2>
            <address className="text-xs md:text-sm text-gray-600 not-italic">
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
              <a href={`mailto:${order.billing.email}`} className="hover:underline">
                {order.billing.email}
              </a>
              <br />
              <a href={`tel:${order.billing.phone}`} className="hover:underline">
                {order.billing.phone}
              </a>
            </address>
          </section>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
