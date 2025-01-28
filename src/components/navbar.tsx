/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import MaxWidthWrapper from './max-width-wrapper'
import Image from 'next/image'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Menu } from './ui/menu'
import { SearchBar } from '@/client/searchbar'
import { ShopProvider } from '@/client/shop-provider'
import { fetchProducts } from '@/graphql'
import CartDrawer from './cart-drawer'
import { User } from 'lucide-react'
import UserLink from './user-icon'

export interface NavItem {
  label: string
  href: string
  cta?: boolean
}

export interface NavBarProps {
  menu: NavItem[]
}

const Navbar = async ({ menu }: NavBarProps) => {
  const products = await fetchProducts(20, 0)
  if (!products) return <h1>Page not found</h1>
  // const user = true

  // const isAdmin = true

  return (
    <ShopProvider allProducts={products}>
      <nav className="sticky z-[100] inset-x-0 top-0 w-full bg-white/75 backdrop-blur-md transition-all">
        <MaxWidthWrapper className="py-3 px-5 xl:px-0">
          <div className="flex items-center justify-between">
            <Link href="/" className="z-10 font-semibold w-32 h-6 order-2 lg:order-none">
              <Image
                src="/logo.svg"
                alt=""
                width={100}
                height={25}
                className="object-cover w-full h-full"
              />
            </Link>

            <SearchBar />

            <NavigationMenu className="static hidden lg:block">
              <NavigationMenuList className="">
                <NavigationMenuItem>
                  <NavigationMenuLink className="py-2 px-4" href="/">
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem className="">
                  <Link href="/collections">
                    <NavigationMenuTrigger className="hover:underline hover:underline-offset-4 bg-transparent">
                      Shop
                    </NavigationMenuTrigger>
                  </Link>
                  <NavigationMenuContent className="">
                    <div className="mx-auto max-w-screen-xl max-h-[300px] grid grid-cols-4 gap-5 px-2.5 md:px-20 py-10">
                      <div className="col-span-1">
                        <div className="text-lg font-semibold mb-5">Featured</div>
                        <ul className="flex flex-col gap-2">
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/collections/best-sellers"
                              tabIndex={-1}
                            >
                              Best Sellers
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/collections/new-releases"
                              tabIndex={-1}
                            >
                              New Releases
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/collections/custom"
                              tabIndex={-1}
                            >
                              Custom
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/collections/sales"
                              tabIndex={-1}
                            >
                              On Sale
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/collections"
                              tabIndex={-1}
                            >
                              Shop All
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </div>
                      <div className="col-span-1">
                        <div className="text-lg font-semibold mb-5">Collections</div>
                        <ul className="flex flex-col gap-2">
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              RGB
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Lighting
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Home Decor
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Smart Home
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </div>
                      <div className="col-span-1">
                        <div className="w-full h-[200px] relative">
                          <Image
                            alt="Collections"
                            src="/menu-1.png"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-2">Our Collections</div>
                      </div>
                      <div className="col-span-1">
                        <div className="w-full h-[200px] relative">
                          <Image alt="Blog" src="/menu-2.png" fill className="object-cover" />
                        </div>
                        <div className="mt-2">Explore our Blog</div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:underline hover:underline-offset-4 bg-transparent">
                    Blog
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="">
                    <div className="mx-auto max-w-screen-xl grid grid-cols-4 gap-5 px-2.5 md:px-20 py-10">
                      <div className="col-span-1">
                        <div className="text-lg font-semibold mb-5">Follow Us</div>
                        <ul className="flex gap-2">
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path>
                              </svg>
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path>
                              </svg>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </div>
                      <div className="col-span-1">
                        <div className="text-lg font-semibold mb-5">About Us</div>
                      </div>
                      <div className="flex flex-col col-span-1 w-full h-full">
                        <div className="w-full h-[200px] relative">
                          <Image
                            alt="Ideas"
                            src="/home-intro-1.png"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="mt-2">Design Ideas</div>
                      </div>
                      <div className="flex flex-col col-span-1 w-full h-full">
                        <div className="w-full h-[200px] relative">
                          <Image alt="Tips" src="/home-intro-2.png" fill className="object-cover" />
                        </div>
                        <div className="mt-2">Lighting Tips</div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="hover:underline hover:underline-offset-4 bg-transparent">
                    Support
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="mx-auto max-w-screen-xl grid grid-cols-4 gap-5 px-2.5 md:px-20 py-10">
                      <div className="col-span-1 col-start-2">
                        <div className="text-lg font-semibold mb-5">Support</div>
                        <ul className="flex flex-col gap-2">
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              FAQs
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Track your order
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Shipping & Delivery
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Return Policy
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </div>
                      <div className="col-span-1 col-start-3">
                        <div className="text-lg font-semibold mb-5">Inquiries</div>
                        <ul className="flex flex-col gap-2">
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              General inquiries
                            </NavigationMenuLink>
                          </li>
                          <li className="">
                            <NavigationMenuLink
                              className="focus:shadow-md text-sm"
                              href="/"
                              tabIndex={-1}
                            >
                              Business Cooperation
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex order-3 lg:order-none">
              <UserLink />
              <CartDrawer />
            </div>

            {/* <div className="h-full flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/api/auth/logout"
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  })}
                >
                  Sign out
                </Link>
                {isAdmin ? (
                  <Link
                    href="/dashboard"
                    className={buttonVariants({
                      size: 'sm',
                      variant: 'ghost',
                    })}
                  >
                    Dashboard ✨
                  </Link>
                ) : null}
                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: 'sm',
                    className: 'hidden sm:flex items-center gap-1',
                  })}
                >
                  Create case
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/api/auth/register"
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  })}
                >
                  Sign up
                </Link>

                <Link
                  href="/api/auth/login"
                  className={buttonVariants({
                    size: 'sm',
                    variant: 'ghost',
                  })}
                >
                  Login
                </Link>

                <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: 'sm',
                    className: 'hidden sm:flex items-center gap-1',
                  })}
                >
                  Create case
                  <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            )}
          </div> */}
          </div>
        </MaxWidthWrapper>
      </nav>
    </ShopProvider>
  )
}

export default Navbar
