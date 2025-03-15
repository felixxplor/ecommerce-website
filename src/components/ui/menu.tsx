'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown, Menu, X } from 'lucide-react'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="p-0" aria-label="Menu">
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] pt-20">
          <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-medium">Menu</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="h-auto" style={{ gap: 0 }}>
                  <X className="size-5" />
                </Button>
              </SheetClose>
            </div>

            {/* Navigation Menu Content */}
            <div className="overflow-y-auto flex-1 py-2">
              <div className="flex flex-col space-y-1">
                {/* Home Link */}
                <SheetClose asChild>
                  <Link href="/" className="flex items-center px-4 py-3 text-sm hover:bg-gray-100">
                    Home
                  </Link>
                </SheetClose>

                {/* Shop Section */}
                <Accordion type="single" collapsible className="w-full border-none">
                  <AccordionItem value="shop" className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-sm hover:bg-gray-100 [&[data-state=open]]:bg-gray-100">
                      Shop
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="pl-4 space-y-4">
                        {/* Featured Section */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Featured</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/best-sellers"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Best Sellers
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/new-releases"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  New Releases
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/sale"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  On Sale
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Shop All
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div>

                        {/* Collections Section */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Collections</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/smart-tech"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Smart Tech
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/home-decor"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Home Decor
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/kitchen-appliances"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Kitchen Appliances
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/collections/pets"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Pets
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Blog Section */}
                <Accordion type="single" collapsible className="w-full border-none">
                  <AccordionItem value="blog" className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-sm hover:bg-gray-100 [&[data-state=open]]:bg-gray-100">
                      Blog
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="pl-4 space-y-4">
                        {/* Follow Us Section */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Follow Us</div>
                          <div className="flex px-4 gap-4">
                            <a
                              href="https://instagram.com"
                              className="text-gray-700 hover:text-gray-900"
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path>
                              </svg>
                            </a>
                            <a
                              href="https://facebook.com"
                              className="text-gray-700 hover:text-gray-900"
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path>
                              </svg>
                            </a>
                          </div>
                        </div>

                        {/* About Us Section */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">About Us</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/about-us"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Our Story
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div>

                        {/* Blog Posts */}
                        {/* <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Blog Posts</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/blog/tech-news"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Tech News
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/blog/design-ideas"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Design Ideas
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div> */}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Support Section */}
                <Accordion type="single" collapsible className="w-full border-none">
                  <AccordionItem value="support" className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-sm hover:bg-gray-100 [&[data-state=open]]:bg-gray-100">
                      Support
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <div className="pl-4 space-y-4">
                        {/* Support Links */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Support</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/faq"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  FAQs
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/order-tracking"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Track your order
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/shipping-policy"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Shipping & Delivery
                                </Link>
                              </SheetClose>
                            </li>
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/return-policy"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Return Policy
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div>

                        {/* Inquiries */}
                        <div className="space-y-2">
                          <div className="font-medium text-sm px-4 text-gray-500">Inquiries</div>
                          <ul className="space-y-1">
                            <li>
                              <SheetClose asChild>
                                <Link
                                  href="/contact-us"
                                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  General inquiries
                                </Link>
                              </SheetClose>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Footer Section */}
            <div className="mt-auto border-t pt-4 pb-6 px-4">
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Link href="/login" className="w-full">
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Link href="/register" className="w-full">
                      Register
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
