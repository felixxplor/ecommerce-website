'use client'

import { useSession } from '@/client/session-provider'
import useCartMutations from '@/hooks/use-cart-mutations'
import { CartItem as CartItemType, Cart as CartType } from '@/graphql/generated'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from './ui/scroll-area'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { create } from 'zustand'
import { deleteClientSessionId } from '@/utils/client'

interface DrawerStore {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useDrawerStore = create<DrawerStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))

interface CartItemProps {
  item: CartItemType
}

interface CartSummaryProps {
  cart: CartType
}

function CartItem({ item }: CartItemProps) {
  const { key, product, variation, quantity, subtotal } = item
  const productNode = product?.node
  const variationNode = variation?.node
  const qty = quantity ?? 0

  const productId = productNode?.databaseId ?? 0
  const image = productNode?.image
  const name = productNode?.name ?? ''
  const slug = productNode?.slug ?? ''
  const variationId = variationNode?.databaseId

  const cartMutations = useCartMutations(productId, variationId)

  // Check if any mutation is currently pending
  const isLoading = cartMutations.fetching

  // Calculate bulk discount info
  const hasBulkDiscount = qty >= 2
  let discountPercent = 0

  if (qty >= 3) {
    discountPercent = 15
  } else if (qty === 2) {
    discountPercent = 10
  }

  // Parse current price (after discount)
  const currentSubtotal = parseFloat(subtotal?.replace(/[^\d.-]/g, '') || '0')
  const currentPriceEach = qty > 0 ? currentSubtotal / qty : 0

  // Calculate original price (before bulk discount)
  const originalPriceEach =
    discountPercent > 0 ? currentPriceEach / (1 - discountPercent / 100) : currentPriceEach

  const savingsPerItem = originalPriceEach - currentPriceEach

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || isLoading) return
    cartMutations.mutate({ mutation: 'update', quantity: newQuantity })
  }

  const handleRemove = () => {
    if (isLoading) return
    cartMutations.mutate({ mutation: 'remove' })
  }

  return (
    <div className="py-4 flex gap-3">
      <div className="w-16 h-16 rounded-md border bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Link href={`/products/${slug}`}>
          <Image
            src={image?.sourceUrl || '/product-placeholder.png'}
            alt={image?.altText ?? name ?? ''}
            width={60}
            height={60}
            className="object-cover rounded"
          />
        </Link>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <Link href={`/products/${slug}`}>
            <h3 className="text-sm font-medium truncate">{name}</h3>
          </Link>

          {variation?.attributes?.map(
            (attr) =>
              attr && (
                <p key={attr.name ?? ''} className="text-xs text-gray-500">
                  {attr.name}: {attr.value}
                </p>
              )
          )}
        </div>

        {/* Price display with bulk discount info */}
        <div className="mb-2">
          {hasBulkDiscount ? (
            <div className="space-y-1">
              {/* Original vs Discounted Price */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 line-through text-xs">
                  ${originalPriceEach.toFixed(2)} each
                </span>
                <span className="text-green-600 font-medium text-sm">
                  ${currentPriceEach.toFixed(2)} each
                </span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>

              {/* Savings info */}
              <div className="text-xs text-green-600">
                Save ${savingsPerItem.toFixed(2)} per item
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">${currentPriceEach.toFixed(2)} each</div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className={`rounded-md border p-1 hover:bg-gray-100 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handleQuantityChange(qty - 1)}
              disabled={isLoading}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm w-8 text-center">{qty}</span>
            <button
              className={`rounded-md border p-1 hover:bg-gray-100 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => handleQuantityChange(qty + 1)}
              disabled={isLoading}
            >
              <Plus className="h-3 w-3" />
            </button>

            {/* Next tier motivation - compact version */}
            <div className="ml-2">
              {qty === 1 && <span className="text-xs text-blue-600">+1 for 15% off!</span>}
              {qty === 2 && <span className="text-xs text-blue-600">+1 for 15% off!</span>}
            </div>
          </div>

          <div className="text-right">
            <p className="font-medium text-sm">{subtotal}</p>
            {hasBulkDiscount && (
              <p className="text-xs text-green-600">(${(savingsPerItem * qty).toFixed(2)} saved)</p>
            )}
          </div>
        </div>

        <button
          className={`mt-2 text-xs text-red-500 hover:text-red-600 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleRemove}
          disabled={isLoading}
        >
          {isLoading ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  )
}

function CartSummary({ cart }: CartSummaryProps) {
  // Check if any items have quantity discounts
  const hasQuantityDiscounts = cart?.contents?.nodes?.some(
    (item) => item && item.quantity && item.quantity >= 2
  )

  const goToCheckoutPage = () => {
    deleteClientSessionId()
    window.location.href = 'http://gizmooz.com/checkout'
  }

  return (
    <div className="border-t bg-white">
      {/* Quantity Discount Banner */}
      {hasQuantityDiscounts && (
        <div className="px-4 py-3 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <span className="text-base">🎉</span>
            <div>
              <p className="font-semibold text-sm">Quantity Discounts Applied!</p>
              <p className="text-xs">Discounted prices are reflected in your cart</p>
            </div>
          </div>
        </div>
      )}

      {/* Increased padding and added extra bottom spacing for iOS */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-3 pb-24 sm:pb-6">
        <div className="flex items-center justify-between text-base">
          <span className="font-medium">Subtotal</span>
          <span className="font-medium">{cart.subtotal}</span>
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

        <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout</p>

        {/* Button container with significant spacing for iOS Safari */}
        <div className="pt-4 space-y-3">
          <button
            onClick={goToCheckoutPage}
            className="block w-full bg-black text-white py-4 text-center text-sm font-medium hover:bg-gray-900 transition-colors rounded-md"
          >
            Go to Checkout
          </button>
          <DrawerClose asChild>
            <Link
              href="/cart"
              className="block w-full text-center py-3 text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Cart
            </Link>
          </DrawerClose>
        </div>
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const { cart } = useSession()
  const { isOpen, onOpen, onClose } = useDrawerStore()

  const totalItems =
    cart?.contents?.nodes?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <DrawerTrigger asChild>
        <div className="relative py-2 pl-3 cursor-pointer group">
          <ShoppingBag
            className="h-6 w-6 transition-colors group-hover:text-gray-600"
            strokeWidth={1}
          />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-[7px] h-5 w-5 rounded-full bg-black text-white text-sm flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </div>
      </DrawerTrigger>
      <DrawerContent
        aria-describedby="cart-description"
        className="h-screen top-0 right-0 left-auto mt-0 w-full xs:w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px] rounded-none z-[999] overflow-hidden"
      >
        <DrawerHeader className="border-b px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <DrawerTitle className="text-base sm:text-lg font-medium">
            Shopping Cart ({totalItems})
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            View and edit items in your shopping cart
          </DrawerDescription>
          <DrawerClose className="absolute right-4 sm:right-6 top-3 sm:top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 p-1 flex items-center underline">
            <span className="mr-1 text-sm font-medium">Close</span>
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </DrawerClose>
        </DrawerHeader>

        {/* Updated container with better height calculations */}
        <div className="flex flex-col flex-1 min-h-0">
          {cart?.contents?.nodes && cart.contents.nodes.length > 0 ? (
            <>
              <ScrollArea className="flex-1 px-4 sm:px-6 min-h-0">
                <div className="divide-y">
                  {cart.contents.nodes.map((item) => (
                    <CartItem key={item.key} item={item} />
                  ))}
                </div>
              </ScrollArea>
              <div className="flex-shrink-0">
                <CartSummary cart={cart} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <DrawerClose asChild>
                <Link
                  href="/cart"
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-800 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  Go to Cart
                </Link>
              </DrawerClose>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
