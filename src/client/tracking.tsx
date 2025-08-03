'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Truck, ExternalLink, Package, Search, AlertTriangle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Form validation schema
const TrackingSchema = z.object({
  orderId: z.string().min(1, { message: 'Order ID is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

type TrackingFormValues = z.infer<typeof TrackingSchema>

// Order interface for TypeScript typing
interface OrderTracking {
  id: number
  order_number: string
  date_created: string
  status: string
  status_label: string
  total: string
  currency: string
  payment_method: string
  line_items: {
    id: number
    name: string
    quantity: number
    total: string
    image_url: string
  }[]
  tracking_items:
    | {
        tracking_provider: string
        custom_tracking_provider: string
        custom_tracking_link: string
        tracking_number: string
        tracking_product_code: string
        date_shipped: string
        products_list: string
        status_shipped: string
        tracking_id: string
        user_id?: number
        source?: string
      }[]
    | null
  shipping: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
  }
  billing: {
    first_name: string
    last_name: string
    company: string
    address_1: string
    address_2: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
}

// Format the order status for display
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'processing':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'refunded':
      return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default function OrderTrackingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderDetails, setOrderDetails] = useState<OrderTracking | null>(null)
  const [plainTotal, setPlainTotal] = useState<string>('')
  const [plainLineItemTotals, setPlainLineItemTotals] = useState<Record<number, string>>({})
  const [showForm, setShowForm] = useState(true)
  const [errorType, setErrorType] = useState<'not_found' | 'email_mismatch' | 'general' | null>(
    null
  )

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(TrackingSchema),
    defaultValues: {
      orderId: '',
      email: '',
    },
  })

  // Extract plain text from HTML string
  const getPlainTextFromHtml = (htmlString: string) => {
    if (!htmlString) return ''

    // If we're in the browser
    if (typeof document !== 'undefined') {
      // Create a temporary div element
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlString
      // Return the text content
      return tempDiv.textContent || tempDiv.innerText || ''
    }

    // Simple regex fallback for server-side
    return htmlString.replace(/<[^>]*>/g, '')
  }

  // Format total to remove $0.00
  const formatTotal = (total: string) => {
    if (!total) return ''

    // Remove any HTML tags first
    const plainText = total.replace(/<[^>]*>/g, '')

    // Remove any trailing $0.00 or similar zero amounts
    return plainText.replace(/\s+\$0\.00$/, '')
  }

  // Extract plain totals when order details change
  useEffect(() => {
    if (orderDetails) {
      // Extract order total
      const totalText = getPlainTextFromHtml(orderDetails.total)
      setPlainTotal(formatTotal(totalText))

      // Extract line item totals
      const itemTotals: Record<number, string> = {}
      orderDetails.line_items?.forEach((item) => {
        itemTotals[item.id] = getPlainTextFromHtml(item.total)
      })
      setPlainLineItemTotals(itemTotals)
    }
  }, [orderDetails])

  const onSubmit = async (data: TrackingFormValues) => {
    setIsLoading(true)
    setError('')
    setErrorType(null)
    setOrderDetails(null)
    setPlainTotal('')
    setPlainLineItemTotals({})

    try {
      // Use GET request with query parameters
      const queryParams = new URLSearchParams({
        id: data.orderId,
        email: data.email,
      }).toString()

      const response = await fetch(`/api/track-order?${queryParams}`)
      const responseData = await response.json()

      // Handle different error scenarios
      if (!response.ok) {
        if (response.status === 404) {
          // Order not found
          setErrorType('not_found')
          setError(
            `No order found with ID "${data.orderId}". Please check your order ID and try again.`
          )
        } else if (response.status === 401) {
          // Email doesn't match
          setErrorType('email_mismatch')
          setError(
            'The email address does not match our records for this order. Please check your email and try again.'
          )
        } else {
          // Other errors
          setErrorType('general')
          setError(responseData.errors?.message || 'Failed to track order')
        }
        return
      }

      // Check if we have valid order data
      if (!responseData.order) {
        setErrorType('not_found')
        setError(
          `No order found with ID "${data.orderId}". Please check your order ID and try again.`
        )
        return
      }

      // Success - we have order data
      setOrderDetails(responseData.order)
      setShowForm(false) // Hide the form on successful search
      setErrorType(null)
    } catch (error) {
      // console.error('Error:', error)
      setErrorType('general')
      setError(
        error instanceof Error ? error.message : 'An error occurred while tracking your order'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrackAnother = () => {
    setOrderDetails(null)
    setShowForm(true)
    setError('')
    setErrorType(null)
    form.reset()
  }

  // Generate tracking URL based on provider and tracking number
  const generateTrackingUrl = (trackingNumber: string, provider: string): string => {
    const cleanTrackingNumber = trackingNumber.trim()
    const cleanProvider = provider.toLowerCase().trim()

    // console.log(
    //   `Generating tracking URL for provider: "${cleanProvider}" with tracking number: "${cleanTrackingNumber}"`
    // )

    // Australia Post tracking URL (handle both "australia-post" and "australia post" formats)
    if (
      cleanProvider.includes('australia-post') ||
      cleanProvider.includes('australia post') ||
      cleanProvider.includes('auspost') ||
      cleanProvider.includes('australia_post')
    ) {
      const url = `https://auspost.com.au/mypost/track/#/details/${cleanTrackingNumber}`
      // console.log('Generated Australia Post URL:', url)
      return url
    }

    // Sendle tracking URL (handle various Sendle formats)
    if (cleanProvider.includes('sendle') || cleanProvider === 'sendle') {
      const url = `https://track.sendle.com/${cleanTrackingNumber}`
      // console.log('Generated Sendle URL:', url)
      return url
    }

    // DHL tracking URL
    if (cleanProvider.includes('dhl')) {
      const url = `https://www.dhl.com/en/express/tracking.html?AWB=${cleanTrackingNumber}`
      // console.log('Generated DHL URL:', url)
      return url
    }

    // FedEx tracking URL
    if (cleanProvider.includes('fedex')) {
      const url = `https://www.fedex.com/fedextrack/?trknbr=${cleanTrackingNumber}`
      // console.log('Generated FedEx URL:', url)
      return url
    }

    // UPS tracking URL
    if (cleanProvider.includes('ups')) {
      const url = `https://www.ups.com/track?loc=en_US&tracknum=${cleanTrackingNumber}`
      // console.log('Generated UPS URL:', url)
      return url
    }

    // TNT tracking URL
    if (cleanProvider.includes('tnt')) {
      const url = `https://www.tnt.com/express/en_us/site/shipping-tools/tracking.html?searchType=con&cons=${cleanTrackingNumber}`
      // console.log('Generated TNT URL:', url)
      return url
    }

    // console.log('No matching provider found for:', cleanProvider)
    return ''
  }

  // Format date for better display
  const formatDate = (dateValue: string | number) => {
    if (!dateValue) return ''

    try {
      let date: Date

      // Check if it's a number (Unix timestamp)
      if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
        const timestamp = Number(dateValue)

        // Check if it's in seconds (Unix timestamp typically has 10 digits)
        // or milliseconds (JavaScript timestamp typically has 13 digits)
        if (timestamp < 10000000000) {
          // It's in seconds, convert to milliseconds
          date = new Date(timestamp * 1000)
        } else {
          // It's already in milliseconds
          date = new Date(timestamp)
        }
      } else {
        // It's a string, try to parse it
        // Replace space with 'T' to better conform to ISO format
        const isoFormattedDate = String(dateValue).replace(' ', 'T')
        date = new Date(isoFormattedDate)

        // Check if date is valid
        if (isNaN(date.getTime())) {
          // If invalid, try parsing with explicit format
          const [datePart, timePart] = String(dateValue).split(' ')
          if (datePart && datePart.includes('-')) {
            const [year, month, day] = datePart.split('-').map(Number)
            const [hour, minute, second] = timePart ? timePart.split(':').map(Number) : [0, 0, 0]

            // Create date using explicit values (months are 0-indexed in JavaScript)
            date = new Date(year, month - 1, day, hour, minute, second)
          } else {
            throw new Error('Unsupported date format')
          }
        }
      }

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch (error) {
      // console.error('Error formatting date:', error, 'Value:', dateValue)
      return String(dateValue) // Return the original string if formatting fails
    }
  }

  return (
    <MaxWidthWrapper className="py-14">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order ID and the email address used for the order to check its status and
            tracking information.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-8 rounded-lg shadow-sm mb-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                      <Alert
                        variant="destructive"
                        className={
                          errorType === 'not_found'
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : errorType === 'email_mismatch'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            : ''
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">
                          {errorType === 'not_found' && 'Order Not Found'}
                          {errorType === 'email_mismatch' && 'Email Mismatch'}
                          {errorType === 'general' && 'Error'}
                        </AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="orderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your order ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter the email used for your order"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner className="h-4 w-4" />
                          Tracking Order...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Track Another Order Button */}
              <div className="mb-6">
                <Button
                  onClick={handleTrackAnother}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Track Another Order
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {orderDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Order #{orderDetails.order_number}</h2>
                  <p className="text-gray-600">Placed on {formatDate(orderDetails.date_created)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-sm h-8 ${getStatusBadgeColor(orderDetails.status)}`}
                >
                  {orderDetails.status_label}
                </Badge>
              </div>
            </div>

            {/* Tracking information */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Tracking Information
              </h3>

              {orderDetails.tracking_items && orderDetails.tracking_items.length > 0 ? (
                <div className="space-y-4">
                  {orderDetails.tracking_items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Tracking Provider</p>
                          <p className="font-medium capitalize">
                            {item.tracking_provider.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tracking Number</p>
                          <p className="font-medium">{item.tracking_number}</p>
                        </div>
                        {item.date_shipped && (
                          <div>
                            <p className="text-sm text-gray-500">Date Shipped</p>
                            <p className="font-medium">{formatDate(item.date_shipped)}</p>
                          </div>
                        )}
                      </div>

                      {/* Tracking Links Section */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {/* Custom tracking link from plugin (if available) */}
                        {item.custom_tracking_link && (
                          <a
                            href={item.custom_tracking_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Track Package (Official)
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        )}

                        {/* Generated tracking link based on provider */}
                        {(() => {
                          const generatedUrl = generateTrackingUrl(
                            item.tracking_number,
                            item.tracking_provider
                          )
                          return generatedUrl ? (
                            <a
                              href={generatedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                item.custom_tracking_link
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Track on {item.tracking_provider.replace('-', ' ').replace(/_/g, ' ')}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          ) : null
                        })()}

                        {/* If no tracking links are available, show the tracking number as copyable text */}
                        {!item.custom_tracking_link &&
                          !generateTrackingUrl(item.tracking_number, item.tracking_provider) && (
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md border border-gray-300">
                              <Package className="mr-2 h-4 w-4" />
                              Tracking: {item.tracking_number}
                              <button
                                onClick={() => navigator.clipboard.writeText(item.tracking_number)}
                                className="ml-2 p-1 hover:bg-gray-200 rounded"
                                title="Copy tracking number"
                              >
                                📋
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-gray-600">
                  No tracking information is available yet. This will be updated once your order
                  ships.
                </div>
              )}
            </div>

            {/* Order details */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>

              <div className="divide-y divide-gray-200">
                {orderDetails.line_items?.map((item) => (
                  <div key={item.id} className="py-4 flex items-center gap-4">
                    {item.image_url && (
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {plainLineItemTotals[item.id] || getPlainTextFromHtml(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <p className="font-bold">Total</p>
                  <p className="font-bold">
                    {plainTotal || formatTotal(getPlainTextFromHtml(orderDetails.total))}
                  </p>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Payment via {orderDetails.payment_method}
                </p>
              </div>
            </div>

            {/* Shipping address */}
            {orderDetails.shipping && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <address className="not-italic">
                  {orderDetails.shipping.first_name} {orderDetails.shipping.last_name}
                  <br />
                  {orderDetails.shipping.company && (
                    <>
                      {orderDetails.shipping.company}
                      <br />
                    </>
                  )}
                  {orderDetails.shipping.address_1}
                  <br />
                  {orderDetails.shipping.address_2 && (
                    <>
                      {orderDetails.shipping.address_2}
                      <br />
                    </>
                  )}
                  {orderDetails.shipping.city}, {orderDetails.shipping.state}{' '}
                  {orderDetails.shipping.postcode}
                  <br />
                  {orderDetails.shipping.country}
                </address>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </MaxWidthWrapper>
  )
}
