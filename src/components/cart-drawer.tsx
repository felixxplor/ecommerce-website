'use client'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from './ui/scroll-area'
import { useCartProducts } from '@/hooks/use-cart-products'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'

export default function CartDrawer() {
  const { products, totalItems, cartTotal } = useCartProducts()

  return (
    <Drawer direction="right">
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
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none z-[999]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle className="text-lg font-medium">Shopping Cart ({totalItems})</DrawerTitle>
          <DrawerClose className="absolute right-6 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex h-[calc(100vh-74px)] flex-col">
          {products && products.length > 0 ? (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 px-6">
                <div className="divide-y">
                  {products.map((product) => (
                    <div key={product.key} className="py-6 flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-md border bg-gray-50 flex items-center justify-center">
                        <Image
                          src={product.image?.sourceUrl ?? ''}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-medium">{product.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">${product.price}</p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-4 flex items-center gap-2">
                          <button className="rounded-md border p-1 hover:bg-gray-100">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm w-8 text-center">{product.quantity}</span>
                          <button className="rounded-md border p-1 hover:bg-gray-100">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button className="ml-auto text-sm text-red-500 hover:text-red-600">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary */}
              <div className="border-t px-6 py-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">${cartTotal}</span>
                  </div>
                  <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout</p>
                  <div className="pt-3">
                    <Link
                      href="/checkout"
                      className="block w-full bg-black text-white py-4 text-center text-sm font-medium hover:bg-gray-900 transition-colors"
                    >
                      Checkout • ${cartTotal}
                    </Link>
                    <DrawerClose className="block w-full text-center mt-3 text-sm text-gray-500 hover:text-gray-800">
                      Continue Shopping
                    </DrawerClose>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Empty Cart State
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500 mb-4">
                Looks like you haven't added any items to your cart yet.
              </p>
              <DrawerClose className="text-sm text-gray-500 hover:text-gray-800">
                Continue Shopping
              </DrawerClose>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
