'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/client/session-provider'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, UserCircle, ArrowLeft, CreditCard, ShoppingCart } from 'lucide-react'
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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Define types for billing schema
type BillingFormValues = z.infer<typeof billingSchema>

// Form schema for billing details
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

interface CheckoutFormProps {
  clientSecret: string
  wooSession: string | null
}

// Checkout form component with Stripe Elements
// This is an updated version of the CheckoutForm component to better handle Afterpay/Zip
function CheckoutForm({ clientSecret, wooSession }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentMethodType, setPaymentMethodType] = useState<string | null>(null)
  const [differentBillingAddress, setDifferentBillingAddress] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { cart } = useSession()
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  // Add an effect to detect when payment element loads and identify the payment method
  useEffect(() => {
    if (!elements) return

    const paymentElement = elements.getElement('payment')
    if (paymentElement) {
      paymentElement.on('change', (event) => {
        if (event.value && event.value.type) {
          setPaymentMethodType(event.value.type)
        }
      })
    }
  }, [elements])

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Store cart info before page unload
      const wooSession = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
      if (wooSession) {
        localStorage.setItem('woo-session-before-redirect', wooSession)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

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
    },
  })

  const handlePayPalCheckout = async () => {
    // Validate form fields before redirecting
    const isValid = await form.trigger()
    if (!isValid) {
      return // Don't proceed if validation fails
    }

    setIsProcessing(true)

    try {
      // Save the form data to localStorage to restore after return
      localStorage.setItem('checkout-form-data', JSON.stringify(form.getValues()))

      // Store the WooCommerce session - use both possible session locations
      const currentWooSession = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
      const sessionTokenBackup = localStorage.getItem('woo-session-token')

      // Ensure we have a session token to use
      const sessionToUse = currentWooSession || sessionTokenBackup

      if (sessionToUse) {
        // Store in multiple locations to ensure we can recover it
        localStorage.setItem('woo-session-backup', sessionToUse)

        // Also set as a cookie for extra reliability
        document.cookie = `woocommerce-session-backup=Session ${sessionToUse}; path=/; secure; samesite=strict`
      }

      // Get form data
      const formData = form.getValues()
      const billingAddress = differentBillingAddress ? formData.billingAddress : formData.address

      // Check if cart exists
      if (!cart || !cart.total) {
        throw new Error('Cart information is missing')
      }

      // Create a pending order first
      const createOrderResponse = await fetch('/api/create-pending-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wooSession: sessionToUse,
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
          paymentMethod: 'paypal',
          shipToDifferentAddress: differentBillingAddress,
          doNotEmptyCart: true,
        }),
      })

      if (!createOrderResponse.ok) {
        const errorData = await createOrderResponse.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const orderData = await createOrderResponse.json()
      const orderId = orderData.checkout?.order?.databaseId

      // Get the cart total
      const orderTotal = cart.total

      if (!orderId) {
        throw new Error('Order could not be created')
      }

      // Now create a PayPal payment session directly with the order total
      const createPayPalSessionResponse = await fetch('/api/create-paypal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          orderTotal, // Pass the total directly
          // Pass session in multiple ways to ensure it gets through
          wooSession: sessionToUse, // Include session directly in request body
          returnUrl: `${
            window.location.origin
          }/order-confirmation?paypal=success&order_id=${orderId}&woo_session=${encodeURIComponent(
            sessionToUse || ''
          )}&timestamp=${Date.now()}`,
          cancelUrl: `${
            window.location.origin
          }/order-confirmation?paypal=cancel&order_id=${orderId}&woo_session=${encodeURIComponent(
            sessionToUse || ''
          )}&timestamp=${Date.now()}`,
        }),
      })

      if (!createPayPalSessionResponse.ok) {
        const errorData = await createPayPalSessionResponse.json()
        throw new Error(errorData.error || 'Failed to create PayPal session')
      }

      const paypalData = await createPayPalSessionResponse.json()

      // Store additional info about the pending PayPal transaction
      localStorage.setItem(
        'paypal-pending-order',
        JSON.stringify({
          orderId,
          sessionToken: sessionToUse,
          timestamp: Date.now(),
        })
      )

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

  // In your CheckoutForm component
  const onSubmit = async (formData: BillingFormValues) => {
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setPaymentError('')

    try {
      // Store WooCommerce session as backup
      if (wooSession) {
        localStorage.setItem('woo-session-backup', wooSession)
      }

      // Check if using BNPL payment method like Afterpay/Zip
      const isBNPL =
        paymentMethodType &&
        ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethodType)

      // Determine which address to use for billing
      const billingAddress = differentBillingAddress ? formData.billingAddress : formData.address

      let orderId: number | null = null

      // For BNPL methods, create the order first (with status "pending")
      if (isBNPL) {
        // Create a pending order in WooCommerce
        const createOrderResponse = await fetch('/api/create-pending-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wooSession,
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
            paymentMethod: paymentMethodType,
            shipToDifferentAddress: differentBillingAddress,
            doNotEmptyCart: true,
          }),
        })

        if (!createOrderResponse.ok) {
          const errorData = await createOrderResponse.json()
          throw new Error(errorData.error || 'Failed to create order')
        }

        const orderData = await createOrderResponse.json()
        orderId = orderData.checkout?.order?.databaseId

        if (!orderId) {
          throw new Error('Order could not be created')
        }

        // Now confirm payment with order ID in return URL and include the woo session
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${
              window.location.origin
            }/order-confirmation?order_id=${orderId}&payment_method=${paymentMethodType}&woo_session=${encodeURIComponent(
              wooSession || ''
            )}&doNotEmptyCart=true`,
            payment_method_data: {
              billing_details: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: billingAddress, // Use the correct billing address here
              },
            },
          },
          redirect: 'if_required', // This will allow redirects for BNPL methods
        })

        if (error) {
          // If there's an error, update the order status to failed but preserve cart
          await fetch(
            `/api/update-order-status?order_id=${orderId}&status=failed&doNotEmptyCart=true`,
            {
              method: 'POST',
            }
          )
          throw new Error(error.message || 'Payment failed')
        }

        // If we get here without redirect, handle it (unlikely with BNPL)
        router.push(
          `/order-confirmation?order_id=${orderId}&payment_method=${paymentMethodType}&woo_session=${encodeURIComponent(
            wooSession || ''
          )}&doNotEmptyCart=true`
        )
      } else {
        // Standard credit card flow - confirm payment first, create order after success
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            // Include woo_session in the return URL for regular payments too
            return_url: `${
              window.location.origin
            }/order-confirmation?woo_session=${encodeURIComponent(
              wooSession || ''
            )}&doNotEmptyCart=true`,
            payment_method_data: {
              billing_details: {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: billingAddress, // Use the correct billing address here
              },
            },
          },
          redirect: 'if_required',
        })

        if (error) {
          throw new Error(error.message || 'Payment failed')
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Create order for credit card payment with flag to empty cart only on success
          const createOrderResponse = await fetch('/api/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: paymentIntent.id,
              wooSession,
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
              doNotEmptyCart: false,
            }),
          })

          if (!createOrderResponse.ok) {
            const errorData = await createOrderResponse.json()
            throw new Error(errorData.error || 'Failed to create order')
          }

          const orderData = await createOrderResponse.json()
          orderId = orderData.checkout?.order?.databaseId

          // Redirect to confirmation page with order ID and woo_session
          router.push(
            `/order-confirmation?payment_intent=${paymentIntent.id}&order_id=${
              orderId || ''
            }&woo_session=${encodeURIComponent(wooSession || '')}`
          )
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Payment processing failed. Please try again.'
      setPaymentError(errorMessage)
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }
  // Detect special payment method types
  const isBuyNowPayLater =
    paymentMethodType &&
    ['afterpay_clearpay', 'klarna', 'affirm', 'zip'].includes(paymentMethodType)

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
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="payment-stripe"
                  name="payment-method"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="payment-stripe"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Credit/Debit Card
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="payment-paypal"
                  name="payment-method"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="payment-paypal"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  PayPal
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* And then conditionally render either Stripe Elements or PayPal button: */}
        {paymentMethod === 'stripe' ? (
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
                  Processing...
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

interface CartItemProps {
  item: CartItemType
}

// Cart item component for order summary
function CartItem({ item }: CartItemProps) {
  const { product, variation, quantity, subtotal } = item
  const productNode = product?.node
  const image = productNode?.image
  const name = productNode?.name ?? ''

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={image?.sourceUrl || '/product-placeholder.png'}
          alt={image?.altText ?? name ?? ''}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm truncate">{name}</h3>
        {variation?.attributes?.map(
          (attr) =>
            attr && (
              <p key={attr.name ?? ''} className="text-xs text-gray-500">
                {attr.name ?? ''}: {attr.value ?? ''}
              </p>
            )
        )}
        <div className="flex justify-between mt-1">
          <p className="text-sm">Qty: {quantity ?? 0}</p>
          <p className="font-medium text-sm">{subtotal}</p>
        </div>
      </div>
    </div>
  )
}

interface CartSummaryProps {
  cart: Cart
}

// Cart summary component
function CartSummary({ cart }: CartSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 divide-y">
          {cart.contents?.nodes?.map(
            (item) => item && <CartItem key={item.key || ''} item={item} />
          )}
        </div>

        <div className="mt-4 space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{cart.subtotal}</span>
          </div>

          {cart.appliedCoupons?.filter(Boolean).map(
            (coupon) =>
              coupon && (
                <div key={coupon.code || ''} className="flex justify-between text-green-600">
                  <span className="text-sm">Coupon: {coupon.code}</span>
                  <span>-{coupon.discountAmount}</span>
                </div>
              )
          )}

          {cart.shippingTotal && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shippingTotal}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{cart.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type CheckoutChoice = 'guest' | 'login' | null

export default function CheckoutPage() {
  const { cart, isAuthenticated } = useSession()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkoutChoice, setCheckoutChoice] = useState<CheckoutChoice>(
    isAuthenticated ? 'guest' : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [wooSession, setWooSession] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Store WooCommerce session for later use
    const wooSessionToken = localStorage.getItem('woo-session-token')
    setWooSession(wooSessionToken)
  }, [])

  const createPaymentIntent = async () => {
    if (!cart?.total) return

    setIsLoading(true)
    try {
      // Add entry to browser history so back button works correctly
      if (!isAuthenticated && checkoutChoice === 'guest') {
        window.history.pushState({ checkoutChoice: 'guest' }, '', window.location.href)
      }

      // Get the WooCommerce session and store as backup
      const wooSession = localStorage.getItem(process.env.SESSION_TOKEN_LS_KEY as string)
      if (wooSession) {
        localStorage.setItem('woo-session-backup', wooSession)
      }

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cart.total,
          checkoutType: checkoutChoice || 'unknown',
          // DO NOT include returnUrl here
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error('Checkout error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // If user is authenticated or guest checkout is selected, and we have cart total
    if ((isAuthenticated || checkoutChoice === 'guest') && cart?.total && !clientSecret) {
      createPaymentIntent()
    }
  }, [checkoutChoice, isAuthenticated, cart?.total, clientSecret])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Reset the checkout choice if the user navigates back
      if (checkoutChoice && !isAuthenticated) {
        setCheckoutChoice(null)
        setClientSecret(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [checkoutChoice, isAuthenticated])

  if (error) {
  }

  // Handle empty cart
  if (cart && cart.contents?.nodes?.length === 0) {
    return (
      <MaxWidthWrapper className="py-14">
        <div className="text-center">
          <div className="mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout.</p>
          <Button asChild>
            <Link href="/collections">Continue Shopping</Link>
          </Button>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-14">
      {/* Checkout method selection */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-12"></div>
      ) : (
        !isAuthenticated &&
        !checkoutChoice && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Checkout Options</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sign In Option */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-blue-600">
                    <UserCircle size={36} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Sign In</h2>
                  <p className="text-gray-600 mb-6 flex-grow">
                    Already have an account? Sign in for a faster checkout experience and to access
                    your order history.
                  </p>
                  <Link
                    href={`/login?returnUrl=${encodeURIComponent('/checkout')}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant="outline">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Guest Checkout Option */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-gray-600">
                    <CreditCard size={36} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Guest Checkout</h2>
                  <p className="text-gray-600 mb-6 flex-grow">
                    Continue as a guest. No account required. You'll still have the option to create
                    an account during checkout.
                  </p>
                  <Button
                    onClick={() => setCheckoutChoice('guest')}
                    className="w-full"
                    variant="default"
                  >
                    Continue as Guest
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Create Account Option */}
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-3">Don't have an account yet?</p>
              <Link
                href={`/register?returnUrl=${encodeURIComponent('/checkout')}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create an account
              </Link>
            </div>
          </div>
        )
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
          <p className="mt-4 text-gray-600">Preparing your checkout...</p>
        </div>
      )}

      {/* Stripe Elements Checkout */}
      {!isLoading && clientSecret && (
        <div className="mt-6">
          {/* Back button to choose another checkout option */}
          {!isAuthenticated && (
            <Button
              variant="outline"
              onClick={() => {
                setCheckoutChoice(null)
                setClientSecret(null)
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Change Checkout Option
            </Button>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} wooSession={wooSession} />
              </Elements>
            </div>

            <div className="lg:col-span-1">{cart && <CartSummary cart={cart} />}</div>
          </div>
        </div>
      )}
    </MaxWidthWrapper>
  )
}
