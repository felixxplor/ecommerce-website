'use client'

import { useSession } from '@/client/session-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { CartItem as CartItemType, Cart as CartType } from '@/graphql/generated'
import { deleteClientSessionId } from '@/utils/client'

interface CartItemProps {
  item: CartItemType
}

interface CartSummaryProps {
  cart: CartType
}

function CartItem({ item }: CartItemProps) {
  const { key, product, variation, quantity, subtotal } = item
  // Add null check for product and node
  const productNode = product?.node
  const variationNode = variation?.node

  // Add null checks and default values
  const productId = productNode?.databaseId ?? 0
  const image = productNode?.image
  const name = productNode?.name ?? ''
  const variationId = variationNode?.databaseId

  const cartMutations = useCartMutations(productId, variationId)

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    cartMutations.mutate({ mutation: 'update', quantity: newQuantity })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      {/* Product Image - consistent size across devices */}
      <div className="relative h-20 w-20 flex-shrink-0">
        <Image
          src={image?.sourceUrl || '/product-placeholder.png'}
          alt={image?.altText ?? name ?? ''}
          fill
          className="object-cover rounded-md"
        />
      </div>

      {/* Product Info - takes available space */}
      <div className="flex-grow w-full sm:w-auto">
        <h3 className="font-medium">{name}</h3>
        {variation?.attributes?.map(
          (attr) =>
            attr && (
              <p key={attr.name ?? ''} className="text-sm text-gray-500">
                {attr.name ?? ''}: {attr.value ?? ''}
              </p>
            )
        )}

        {/* Price shown below product info on mobile */}
        <p className="font-medium mt-1 sm:hidden">{subtotal}</p>
      </div>

      {/* Bottom section on mobile, flex row on desktop */}
      <div className="flex justify-between items-center w-full sm:w-auto mt-4 sm:mt-0">
        {/* Quantity Controls - more compact on mobile */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange((quantity ?? 0) - 1)}
            className="h-8 w-8"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={quantity ?? 0}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            className="w-12 text-center h-8 px-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange((quantity ?? 0) + 1)}
            className="h-8 w-8"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Price hidden on mobile (shown above) */}
        <div className="hidden sm:block text-right min-w-[80px] md:min-w-[100px]">
          <p className="font-medium">{subtotal}</p>
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => cartMutations.mutate({ mutation: 'remove' })}
          className="text-red-500 hover:text-red-600 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function CartSummary({ cart }: CartSummaryProps) {
  const { checkoutUrl } = useSession()

  const goToCheckoutPage = () => {
    deleteClientSessionId()
    window.location.href = 'http://gizmooz.com/checkout'
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm space-y-3 md:space-y-4 sticky top-20">
      <h3 className="text-lg font-semibold">Cart Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{cart.subtotal}</span>
        </div>

        {cart.appliedCoupons?.filter(Boolean).map(
          (coupon) =>
            coupon && (
              <div key={coupon.code} className="flex justify-between text-green-600">
                <span className="text-sm md:text-base">Coupon: {coupon.code}</span>
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

        <div className="pt-3 md:pt-4 border-t">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{cart.total}</span>
          </div>
        </div>
      </div>

      {/* Full-width button with consistent spacing */}
      <Button className="w-full mt-4 md:mt-6" onClick={goToCheckoutPage}>
        Proceed to Checkout
      </Button>
    </div>
  )
}

export default function Cart() {
  const { cart } = useSession()

  if (!cart) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!cart.contents?.nodes?.length) {
    return (
      <MaxWidthWrapper>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <Button asChild>
            <a href="/collections">Continue Shopping</a>
          </Button>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper className="py-8">
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.contents.nodes.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <CartSummary cart={cart} />
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
