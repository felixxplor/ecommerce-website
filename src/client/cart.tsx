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
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="relative h-20 w-20 flex-shrink-0">
        <Image
          src={image?.sourceUrl ?? ''}
          alt={image?.altText ?? name ?? ''}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-grow">
        <h3 className="font-medium">{name}</h3>
        {variation?.attributes?.map(
          (attr) =>
            attr && (
              <p key={attr.name ?? ''} className="text-sm text-gray-500">
                {attr.name ?? ''}: {attr.value ?? ''}
              </p>
            )
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange((quantity ?? 0) - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity ?? 0}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
          className="w-16 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange((quantity ?? 0) + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right min-w-[100px]">
        <p className="font-medium">{subtotal}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => cartMutations.mutate({ mutation: 'remove' })}
        className="text-red-500 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function CartSummary({ cart }: CartSummaryProps) {
  const { checkoutUrl } = useSession()
  console.log(checkoutUrl)

  const goToCheckoutPage = () => {
    deleteClientSessionId()
    window.location.href = checkoutUrl
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
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
                <span>Coupon: {coupon.code}</span>
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

        <div className="pt-4 border-t">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{cart.total}</span>
          </div>
        </div>
      </div>

      <Button className="w-full mt-6" onClick={goToCheckoutPage}>
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
            <a href="/">Continue Shopping</a>
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
