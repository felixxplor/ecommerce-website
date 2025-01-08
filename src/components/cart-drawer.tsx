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

export default function CartDrawer() {
  const { products, totalItems, cartTotal } = useCartProducts()
  console.log(products)
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <div className="py-2 pl-3 cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-[500px] rounded-none z-[999]">
        <ScrollArea className="h-screen">
          <div className="mx-auto w-full p-10">
            <DrawerHeader>
              <DrawerTitle>
                <div className="relative flex items-center">
                  <h5 className="">1 item</h5>
                  <button
                    className="absolute min-h-5 min-w-5 h-5 w-5 right-0"
                    type="button"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="icon icon-close"
                      fill="none"
                      viewBox="0 0 18 17"
                    >
                      <path
                        d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </button>
                </div>
              </DrawerTitle>
            </DrawerHeader>
            <div className="m-5 space-y-4 border-t">
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                {products && products.length > 0 ? (
                  <div className="p-2">
                    <span className="text-gray-300">Recently Added</span>
                    <div className="mt-5"></div>
                    {products?.slice(0, 5).map((product) => (
                      <Link href="/" className="mt-2 flex py-2 hover:bg-gray-100" key={product.key}>
                        <div className="flex-shrink-0">
                          <Image
                            src={product.image?.sourceUrl ?? ''}
                            alt=""
                            width={44}
                            height={44}
                          />
                        </div>
                        <div className="ml-2 flex-grow overflow-hidden">
                          <div className="truncate"></div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="text-orange"></span>
                        </div>
                      </Link>
                    ))}
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-xs capitalize text-gray-500"></div>
                      <Link href="" className="bg-orange text-white px-3 py-2">
                        Your Cart
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[300px] w-[300px] flex-col items-center justify-center p-2">
                    <img src="" alt="no-items" className="h-24 w-24" />
                    <div className="mt-3">Your Cart is Empty</div>
                  </div>
                )}
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 2</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 3</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 4</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 4</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 5</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 6</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 7</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 8</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 9</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 10</p>
              </div>
              <div className="bg-muted flex items-center justify-center rounded-lg h-32">
                <p>Image 11</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
