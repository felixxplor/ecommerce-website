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
    <div className="py-6 flex gap-4">
      <div className="w-24 h-24 rounded-md border bg-gray-50 flex items-center justify-center">
        <Image
          src={image?.sourceUrl || '/product-placeholder.png'}
          alt={image?.altText ?? name ?? ''}
          width={80}
          height={80}
          className="object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium">{name}</h3>
            {variation?.attributes?.map(
              (attr) =>
                attr && (
                  <p key={attr.name ?? ''} className="text-sm text-gray-500">
                    {attr.name}: {attr.value}
                  </p>
                )
            )}
            <p className="mt-1 text-sm text-gray-500">{subtotal}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            className="rounded-md border p-1 hover:bg-gray-100"
            onClick={() => handleQuantityChange((quantity ?? 0) - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-sm w-8 text-center">{quantity}</span>
          <button
            className="rounded-md border p-1 hover:bg-gray-100"
            onClick={() => handleQuantityChange((quantity ?? 0) + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="ml-auto text-sm text-red-500 hover:text-red-600"
            onClick={() => cartMutations.mutate({ mutation: 'remove' })}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

function CartSummary({ cart }: CartSummaryProps) {
  const goToCartPage = () => {
    deleteClientSessionId()
    window.location.href = 'http://localhost:3000/cart'
  }

  return (
    <div className="border-t px-6 py-6">
      <div className="space-y-3">
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
        <div className="pt-3">
          <button
            onClick={goToCartPage}
            className="block w-full bg-black text-white py-4 text-center text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            Go to Cart
          </button>
          <DrawerClose className="block w-full text-center mt-3 text-sm text-gray-500 hover:text-gray-800">
            Continue Shopping
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
        className="h-screen top-0 right-0 left-auto mt-0 w-full xs:w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px] rounded-none z-[999]"
      >
        <DrawerHeader className="border-b px-4 sm:px-6 py-3 sm:py-4">
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

        <div className="flex h-[calc(100vh-66px)] sm:h-[calc(100vh-74px)] flex-col">
          {cart?.contents?.nodes && cart.contents.nodes.length > 0 ? (
            <>
              <ScrollArea className="flex-1 px-4 sm:px-6">
                <div className="divide-y">
                  {cart.contents.nodes.map((item) => (
                    <CartItem key={item.key} item={item} />
                  ))}
                </div>
              </ScrollArea>
              <CartSummary cart={cart} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                Looks like you haven't added any items to your cart yet.
              </p>
              <DrawerClose className="text-xs sm:text-sm text-gray-500 hover:text-gray-800">
                Continue Shopping
              </DrawerClose>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
