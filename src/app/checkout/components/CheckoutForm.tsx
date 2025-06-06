'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/client/session-provider'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle, ArrowLeft, CreditCard, ShoppingCart, Wallet } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Cart, CartItem as CartItemType } from '@/graphql/generated'
import { Checkbox } from '@/components/ui/checkbox'
import { getAuthToken, getSession } from '@/utils/session'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const billingSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    address: z.object({
      line1: z.string().min(1, 'Address is required'),
      line2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postal_code: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
    }),
    differentBillingAddress: z.boolean().default(false),
    billingAddress: z
      .object({
        line1: z.string(),
        line2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postal_code: z.string(),
        country: z.string(),
      })
      .optional(),
    paymentMethod: z.enum(['stripe', 'paypal']).default('stripe'),
  })
  .refine(
    // Only validate billingAddress if differentBillingAddress is true
    (data) => {
      if (data.differentBillingAddress) {
        return (
          !!data.billingAddress?.line1 &&
          !!data.billingAddress?.city &&
          !!data.billingAddress?.state &&
          !!data.billingAddress?.postal_code &&
          !!data.billingAddress?.country
        )
      }
      return true
    },
    {
      message: 'Billing address is required when using a different billing address',
      path: ['billingAddress'],
    }
  )

type BillingFormValues = z.infer<typeof billingSchema>
// ------------------------------------

interface CheckoutFormProps {
  clientSecret: string
}

export function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentMethodType, setPaymentMethodType] = useState<string | null>(null)
  const [differentBillingAddress, setDifferentBillingAddress] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { cart, refreshCart } = useSession()

  // Get session tokens
  const authToken = typeof window !== 'undefined' ? sessionStorage.getItem('woo-auth-token') : null
  const wooSessionToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
      : null

  // Build base headers including auth token and woo session
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(wooSessionToken ? { 'woocommerce-session': `Session ${wooSessionToken}` } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  useEffect(() => {
    if (!elements) return

    const paymentElement = elements.getElement('payment')
    if (paymentElement) {
      paymentElement.on('change', (event) => {
        console.log('Payment element change event:', event)
        if (event.value && event.value.type) {
          console.log('Payment method type detected:', event.value.type)
          setPaymentMethodType(event.value.type)
        }
      })

      // Also listen for ready event to get initial payment method
      paymentElement.on('ready', () => {
        console.log('Payment element ready')
      })
    }
  }, [elements])

  useEffect(() => {
    const paymentElement = elements?.getElement('payment')
    if (!paymentElement) return

    paymentElement.on('change', (event: any) => {
      if (event.value?.type) {
        setPaymentMethodType(event.value.type)
      }
    })
  }, [elements])

  function storeAuthenticationData() {
    // Store the auth token for retrieval after redirect
    const authToken = sessionStorage.getItem('woo-auth-token')
  }

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'AU', // Default to Australia
      },
      billingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'AU',
      },
      paymentMethod: 'stripe',
    },
  })

  useEffect(() => {
    // Detect if returning from failed payment (both BNPL and PayPal)
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    const isPaymentFailed = errorParam === 'payment_failed'

    // If returning from a failed payment, restore form data
    if (isPaymentFailed) {
      try {
        console.log('Detected payment failure, attempting to restore data')

        // Check for both BNPL and PayPal checkout data
        const bnplCheckoutData = localStorage.getItem('pending-bnpl-checkout')
        const paypalCheckoutData = localStorage.getItem('pending-paypal-checkout')

        let checkoutInfo = null
        let dataSource = ''

        if (bnplCheckoutData) {
          checkoutInfo = JSON.parse(bnplCheckoutData)
          dataSource = 'BNPL'
          console.log('Found stored BNPL checkout data:', bnplCheckoutData)
        } else if (paypalCheckoutData) {
          checkoutInfo = JSON.parse(paypalCheckoutData)
          dataSource = 'PayPal'
          console.log('Found stored PayPal checkout data:', paypalCheckoutData)
        }

        if (checkoutInfo && checkoutInfo.customerInfo) {
          console.log(`Restoring ${dataSource} checkout data`)
          const { customerInfo } = checkoutInfo

          // CRITICAL: First update the UI state for the billing address checkbox
          // This needs to happen BEFORE form reset
          const hasDifferentBillingAddress = customerInfo.differentBillingAddress === true

          console.log('Different billing address detected:', hasDifferentBillingAddress)
          console.log('Billing address data:', customerInfo.billingAddress)

          // Immediately update the UI state
          setDifferentBillingAddress(hasDifferentBillingAddress)

          // For PayPal, also set the payment method back to PayPal
          if (dataSource === 'PayPal') {
            form.setValue('paymentMethod', 'paypal')
          }

          // Delay form reset slightly to ensure state updates are processed
          setTimeout(() => {
            // First set the form values directly for all fields to ensure they're populated
            form.setValue('name', customerInfo.name || '')
            form.setValue('email', customerInfo.email || '')
            form.setValue('phone', customerInfo.phone || '')

            // Set shipping address fields
            if (customerInfo.address) {
              form.setValue('address.line1', customerInfo.address.line1 || '')
              form.setValue('address.line2', customerInfo.address.line2 || '')
              form.setValue('address.city', customerInfo.address.city || '')
              form.setValue('address.state', customerInfo.address.state || '')
              form.setValue('address.postal_code', customerInfo.address.postal_code || '')
              form.setValue('address.country', customerInfo.address.country || 'AU')
            }

            // IMPORTANT: Set the differentBillingAddress value in the form
            form.setValue('differentBillingAddress', hasDifferentBillingAddress)

            // If using different billing address, set those fields too
            if (hasDifferentBillingAddress && customerInfo.billingAddress) {
              console.log('Setting billing address fields:', customerInfo.billingAddress)
              form.setValue('billingAddress.line1', customerInfo.billingAddress.line1 || '')
              form.setValue('billingAddress.line2', customerInfo.billingAddress.line2 || '')
              form.setValue('billingAddress.city', customerInfo.billingAddress.city || '')
              form.setValue('billingAddress.state', customerInfo.billingAddress.state || '')
              form.setValue(
                'billingAddress.postal_code',
                customerInfo.billingAddress.postal_code || ''
              )
              form.setValue('billingAddress.country', customerInfo.billingAddress.country || 'AU')
            }

            // Log the form values after setting
            console.log('Form values after restoration:', form.getValues())

            // Force a re-render to ensure the UI updates
            // This is important to make the billing address form appear
            form.trigger()
          }, 100) // Small delay to ensure state updates

          // Show payment error message
          if (isPaymentFailed) {
            const messageParam = urlParams.get('message')
            const errorMessage = decodeURIComponent(
              messageParam || `Your ${dataSource.toLowerCase()} payment was not completed`
            )
            toast({
              title: 'Payment unsuccessful',
              description: errorMessage,
              variant: 'destructive',
            })

            setPaymentError(errorMessage)
          }
        } else {
          console.log('No stored checkout data found to restore')
        }
      } catch (error) {
        console.error('Error restoring checkout data:', error)
      }
    }
  }, [form, toast])

  // Improved PayPal checkout handler with fixed TypeScript error
  // In your client component
  const handlePayPalCheckout = async () => {
    // Validate form fields before redirecting
    const isValid = await form.trigger()
    if (!isValid) {
      return // Don't proceed if validation fails
    }

    setIsProcessing(true)

    try {
      // Generate transaction IDs similar to BNPL flow
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 10)
      const transactionId = `paypal-${timestamp}-${randomString}`
      const uniqueMutationId = transactionId

      // Get form data
      const formData = form.getValues()

      // Safely handle the billing address
      const billingAddress =
        differentBillingAddress && formData.billingAddress
          ? formData.billingAddress
          : formData.address

      // Store customer information in the SAME FORMAT as BNPL
      const customerInfo = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        billingAddress: billingAddress, // Use the calculated billing address
        differentBillingAddress: differentBillingAddress,
      }

      // Store checkout information for recovery just like BNPL
      const checkoutInfo = {
        customerInfo,
        paymentMethodType: 'paypal',
        timestamp,
        wooSession: wooSessionToken,
        uniqueMutationId,
        transactionId,
      }

      // Save checkout data to localStorage for client-side recovery
      localStorage.setItem('pending-paypal-checkout', JSON.stringify(checkoutInfo))

      // IMPORTANT: Also store the checkout data on the server for access from server components
      await fetch('/api/store-checkout-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          uniqueId: uniqueMutationId,
          customerInfo,
          timestamp,
        }),
      })

      // Check if cart exists
      if (!cart || !cart.total) {
        throw new Error('Cart information is missing')
      }

      // Create a PayPal payment session directly
      const createPayPalSessionResponse = await fetch('/api/create-paypal-session', {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          orderTotal: cart.total,
          wooSession: wooSessionToken,
          returnUrl: `${
            window.location.origin
          }/payment-processing?payment_method=paypal&unique_id=${encodeURIComponent(
            uniqueMutationId
          )}&transaction_id=${encodeURIComponent(transactionId)}&timestamp=${timestamp}`,
          cancelUrl: `${
            window.location.origin
          }/checkout?error=payment_failed&message=${encodeURIComponent(
            'PayPal checkout was cancelled'
          )}&timestamp=${timestamp}`,
          metadata: {
            pending_checkout: 'true',
            woo_session: wooSessionToken || '',
            unique_id: uniqueMutationId,
            transaction_id: transactionId,
            timestamp: timestamp.toString(),
            payment_method: 'paypal',
            customer_email: formData.email,
            customer_name: formData.name,
            customer_phone: formData.phone || '',
            shipping_address_line1: formData.address.line1,
            shipping_address_line2: formData.address.line2 || '',
            shipping_city: formData.address.city,
            shipping_state: formData.address.state,
            shipping_postal_code: formData.address.postal_code,
            shipping_country: formData.address.country,
            different_billing_address: differentBillingAddress ? 'true' : 'false',
            billing_address_line1: billingAddress.line1,
            billing_address_line2: billingAddress.line2 || '',
            billing_city: billingAddress.city,
            billing_state: billingAddress.state,
            billing_postal_code: billingAddress.postal_code,
            billing_country: billingAddress.country,
          },
        }),
        credentials: 'include',
      })

      if (!createPayPalSessionResponse.ok) {
        const errorData = await createPayPalSessionResponse.json()
        throw new Error(errorData.error || 'Failed to create PayPal session')
      }

      const paypalData = await createPayPalSessionResponse.json()

      // Redirect to PayPal's checkout page
      if (paypalData.approvalUrl) {
        window.location.href = paypalData.approvalUrl
      } else {
        throw new Error('No PayPal approval URL returned')
      }
    } catch (error) {
      console.error('PayPal checkout error:', error)
      toast({
        title: 'PayPal Checkout Error',
        description: error instanceof Error ? error.message : 'Failed to initiate PayPal checkout',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  // In your checkout component
  async function refreshAuthToken() {
    try {
      // Get stored refresh token
      const refreshToken = localStorage.getItem(process.env.REFRESH_TOKEN_LS_KEY as string)

      if (!refreshToken) {
        console.warn('No refresh token available')
        return false
      }

      // Call the refresh token API
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Token refresh failed:', errorData)
        return false
      }

      const data = await response.json()

      if (data.authToken) {
        // Store the new auth token
        sessionStorage.setItem(process.env.AUTH_TOKEN_SS_KEY as string, data.authToken)

        // Update auth token expiry
        const authTimeout = Math.floor(Date.now() / 1000) + 15 * 60 // 15 minutes
        sessionStorage.setItem(process.env.AUTH_TOKEN_EXPIRY_SS_KEY as string, `${authTimeout}`)

        console.log('Auth token refreshed successfully')
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to refresh auth token:', error)
      return false
    }
  }

  // Handle form submission for Stripe payments
  const onSubmit = async (formData: BillingFormValues) => {
    // Prevent multiple submissions
    if (!stripe || !elements) return

    setIsProcessing(true)
    setPaymentError('')

    try {
      const tokenRefreshed = await refreshAuthToken()

      if (!tokenRefreshed) {
        console.warn('Could not refresh auth token, continuing with payment anyway')
      }

      // 1) Refresh / grab a valid JWT
      const authToken = await getSession()
      if (!authToken) {
        throw new Error('Your session has expired. Please log in again.')
      }

      // 2) Determine payment method type and billing address
      const isBNPL = paymentMethodType && ['afterpay_clearpay', 'zip'].includes(paymentMethodType)
      const billingAddress = differentBillingAddress
        ? (formData.billingAddress as typeof formData.address)
        : formData.address

      let orderId: number | null = null

      // 3) PayPal branch unchanged
      if (formData.paymentMethod === 'paypal') {
        // Store auth data before redirecting to PayPal
        storeAuthenticationData()

        // Store checkout information for later use when user returns
        const customerInfo = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          billingAddress: differentBillingAddress ? formData.billingAddress : formData.address,
          differentBillingAddress: differentBillingAddress,
        }

        const checkoutInfo = {
          customerInfo,
          paymentMethodType: 'paypal',
          timestamp: Date.now(),
          wooSession: wooSessionToken,
          // Auth token is already stored in localStorage by storeAuthenticationData
        }

        // Save checkout data for retrieval when user returns
        localStorage.setItem('pending-paypal-checkout', JSON.stringify(checkoutInfo))

        // Call the PayPal checkout handler
        await handlePayPalCheckout()
        return
      }

      // 4) Generate IDs
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 10)
      const transactionId = `${paymentMethodType || 'stripe'}-${timestamp}-${randomString}`
      const uniqueMutationId = transactionId

      // Handle Buy Now Pay Later flow (Afterpay, Zip, etc.)
      // Modified BNPL handling code - store checkout data instead of creating order
      if (isBNPL) {
        const authToken = sessionStorage.getItem('woo-auth-token')
        try {
          // Generate a unique transaction ID to track this checkout session
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 10)
          const transactionId = `${paymentMethodType}-${timestamp}-${randomString}`
          const uniqueMutationId = `${paymentMethodType}-${timestamp}-${randomString}`
          storeAuthenticationData()

          // Get payment intent ID from client secret
          const paymentIntentId = clientSecret.split('_secret_')[0]

          // Store the checkout information for later use when user returns
          const checkoutInfo = {
            customerInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              billingAddress: differentBillingAddress ? formData.billingAddress : formData.address,
              differentBillingAddress: differentBillingAddress,
            },
            paymentMethodType,
            timestamp,
            wooSession: wooSessionToken,
            uniqueMutationId,
          }

          // Save checkout data to localStorage for retrieval when user returns
          localStorage.setItem('pending-bnpl-checkout', JSON.stringify(checkoutInfo))

          // Update payment intent with transaction ID and checkout metadata
          try {
            await fetch('/api/update-payment-metadata', {
              method: 'POST',
              headers: baseHeaders,
              body: JSON.stringify({
                paymentIntentId: paymentIntentId,
                auth_token: authToken,
                metadata: {
                  pending_checkout: 'true',
                  woo_session: wooSessionToken || '',
                  unique_id: uniqueMutationId,
                  transaction_id: transactionId,
                  timestamp: timestamp.toString(),
                  payment_method: paymentMethodType || 'unknown',
                  customer_email: formData.email,
                  customer_name: formData.name,
                  customer_phone: formData.phone || '',

                  // Shipping address
                  shipping_address_line1: formData.address.line1,
                  shipping_address_line2: formData.address.line2 || '',
                  shipping_city: formData.address.city,
                  shipping_state: formData.address.state,
                  shipping_postal_code: formData.address.postal_code,
                  shipping_country: formData.address.country,

                  // Billing info
                  different_billing_address: differentBillingAddress ? 'true' : 'false',
                  billing_address_line1:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.line1
                      : formData.address.line1,
                  billing_address_line2:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.line2 || ''
                      : formData.address.line2 || '',
                  billing_city:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.city
                      : formData.address.city,
                  billing_state:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.state
                      : formData.address.state,
                  billing_postal_code:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.postal_code
                      : formData.address.postal_code,
                  billing_country:
                    differentBillingAddress && formData.billingAddress
                      ? formData.billingAddress.country
                      : formData.address.country,
                },
              }),
              credentials: 'include',
            })
          } catch (metadataError) {
            console.warn('Failed to update payment metadata:', metadataError)
            // Continue despite metadata error
          }

          // Determine the billing address to use
          const billingAddress =
            differentBillingAddress && formData.billingAddress
              ? formData.billingAddress
              : formData.address

          // Confirm payment and redirect to payment processing page instead of order-confirmation
          const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Redirect to the processing page which will handle order creation
              return_url: `${
                window.location.origin
              }/payment-processing?payment_intent=${paymentIntentId}&payment_method=${paymentMethodType}&woo_session=${encodeURIComponent(
                wooSessionToken || ''
              )}&unique_id=${encodeURIComponent(
                uniqueMutationId
              )}&transaction_id=${encodeURIComponent(transactionId)}&timestamp=${timestamp}`,
              payment_method_data: {
                billing_details: {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: billingAddress,
                },
              },
              shipping: {
                name: formData.name,
                phone: formData.phone || '',
                address: {
                  line1: formData.address.line1,
                  line2: formData.address.line2 || '',
                  city: formData.address.city,
                  state: formData.address.state,
                  postal_code: formData.address.postal_code,
                  country: formData.address.country,
                },
              },
            },
            redirect: 'if_required',
          })

          // Handle immediate errors
          if (error) {
            throw new Error(error.message || 'Payment failed')
          }

          // If we reach here without redirect, it's unusual for BNPL but handle it
          // Just redirect to the processing page manually
          setIsProcessing(false)
          router.push(
            `/payment-processing?payment_intent=${paymentIntentId}&payment_method=${paymentMethodType}&redirect_status=succeeded&woo_session=${encodeURIComponent(
              wooSessionToken || ''
            )}&transaction_id=${encodeURIComponent(transactionId)}&timestamp=${timestamp}`
          )
        } catch (err) {
          console.error('BNPL payment error:', err)
          const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
          setPaymentError(errorMessage)
          toast({
            title: 'Payment Error',
            description: errorMessage,
            variant: 'destructive',
          })
          setIsProcessing(false)
        }
      } else {
        // Standard credit card flow - mostly unchanged
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${
              window.location.origin
            }/order-confirmation?payment_method=card&woo_session=${encodeURIComponent(
              wooSessionToken || ''
            )}&unique_id=${encodeURIComponent(uniqueMutationId)}&timestamp=${timestamp}`,
            payment_method_data: {
              billing_details: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: billingAddress,
              },
            },
          },
          redirect: 'if_required',
        })

        if (error) {
          throw new Error(error.message || 'Payment failed')
        }

        // If payment succeeded immediately, create order
        if (paymentIntent?.status === 'succeeded') {
          // Store payment intent info for recovery
          sessionStorage.setItem('last_successful_payment_intent', paymentIntent.id)

          const resp = await fetch('/api/create-order', {
            method: 'POST',
            headers: baseHeaders,
            body: JSON.stringify({
              clientMutationId: uniqueMutationId,
              sessionId: paymentIntent.id,
              wooSession: wooSessionToken,
              paymentMethodType: paymentMethodType,
              billingDetails: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: billingAddress,
              },
              shippingDetails: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
              },
              shipToDifferentAddress: differentBillingAddress,
              emptyCartOnSuccess: true,
              forceNewOrder: true, // Force creating a new order
              unique_id: uniqueMutationId,
              timestamp: timestamp.toString(),
            }),
            credentials: 'include',
          })

          // Refresh cart to show it's empty
          await refreshCart()

          if (!resp.ok) {
            const errorData = await resp.json()
            throw new Error(errorData.error || 'Failed to create order')
          }

          const orderData = await resp.json()
          orderId = orderData.checkout?.order?.databaseId

          if (orderId) {
            sessionStorage.setItem('last_created_order_id', orderId.toString())
          }

          // Redirect to confirmation page
          router.push(
            `/order-confirmation/${orderId || ''}?payment_intent=${
              paymentIntent.id
            }&unique_id=${encodeURIComponent(uniqueMutationId)}`
          )
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      const msg = err instanceof Error ? err.message : 'Payment processing failed'
      setPaymentError(msg)
      toast({
        title: 'Payment Error',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      // Don't immediately reset submission status - let it time out
      setIsProcessing(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {paymentError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
            {paymentError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+61 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="address.line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apt 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Sydney" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="NSW" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="different-billing"
            checked={differentBillingAddress}
            onCheckedChange={(checked) => setDifferentBillingAddress(checked === true)}
          />
          <label
            htmlFor="different-billing"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            My billing address is different from my delivery address
          </label>
        </div>

        {/* Conditional Billing Address Form */}
        {differentBillingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="billingAddress.line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingAddress.line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt 4B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="billingAddress.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Sydney" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingAddress.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NSW" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingAddress.postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="2000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Hidden radio inputs - preserving original logic */}
              <div className="hidden">
                <input
                  type="radio"
                  id="payment-stripe"
                  name="payment-method"
                  checked={form.watch('paymentMethod') === 'stripe'}
                  onChange={() => form.setValue('paymentMethod', 'stripe')}
                />
                <input
                  type="radio"
                  id="payment-paypal"
                  name="payment-method"
                  checked={form.watch('paymentMethod') === 'paypal'}
                  onChange={() => form.setValue('paymentMethod', 'paypal')}
                />
              </div>

              {/* Tab-style payment method selection */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => form.setValue('paymentMethod', 'stripe')}
                  className={`
          relative flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:border-gray-400
          ${
            form.watch('paymentMethod') === 'stripe'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }
        `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm font-medium">Card, Zip & Afterpay</span>
                  </div>
                  {form.watch('paymentMethod') === 'stripe' && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => form.setValue('paymentMethod', 'paypal')}
                  className={`
          relative flex items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 hover:border-gray-400
          ${
            form.watch('paymentMethod') === 'paypal'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }
        `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Wallet className="h-6 w-6" />
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                  {form.watch('paymentMethod') === 'paypal' && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditionally render either Stripe Elements or PayPal button */}
        {form.watch('paymentMethod') === 'stripe' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentElement />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={!stripe || isProcessing}>
              {isProcessing ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                </>
              ) : (
                <>Pay Now</>
              )}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            onClick={handlePayPalCheckout}
            className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Redirecting to PayPal...
              </>
            ) : (
              <>Proceed to PayPal</>
            )}
          </Button>
        )}
      </form>
    </Form>
  )
}
