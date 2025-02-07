/* eslint-disable @next/next/no-img-element */
import { Icons } from '@/components/Icons'
import MainPolicies from '@/components/main-policies'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import Navbar from '@/components/navbar'
import Phone from '@/components/Phone'
import { Reviews } from '@/components/Review'
import HomePage from '@/components/single-product'
import { buttonVariants } from '@/components/ui/button'
import LogoCarousel from '@/components/ui/logo-carousel'
import { ArrowRight, Check, ShieldCheck, Star, TicketSlash, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="bg-white min-h-[calc(100vh-3.5rem-1px)] ">
        <section>
          <div className="col-span-3">
            <div className="relative text-left md:font-normal flex flex-col items-center">
              <div className="relative pt-[12vh] lg:pt-[20vh] pb-14 px-5 max-h-[580px] lg:min-h-[680px] w-full">
                <span className="absolute inset-0 z-10 bg-black opacity-20"></span>
                <Image
                  alt="Home"
                  src="/home-cover.png"
                  fill
                  className="absolute inset-0 object-cover z-0"
                ></Image>
                <div className="relative w-full h-full z-20 text-white text-4xl lg:text-5xl text-balance leading-normal">
                  <MaxWidthWrapper className="flex">
                    <div className="max-w-[668px] mx-auto md:mx-0">
                      <h1>Choose our lights and make your interior unique.</h1>
                      <p className="mt-10 text-lg">
                        Well designed lights for your home & office environments.
                        <br />
                        Our high quality lights will make your place modern.
                      </p>
                      <div className="flex justify-center md:justify-start mt-14 lg:mt-28">
                        <button className="text-sm border rounded-full px-12 py-3">
                          Explore our collections
                        </button>
                      </div>
                    </div>
                  </MaxWidthWrapper>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full px-5 py-14 text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2]">
              <MaxWidthWrapper>
                <div className="md:flex md:gap-4">
                  <h2>Shop by categories</h2>
                  <div className="flex items-center">
                    <span className="text-sm font-medium underline underline-offset-2">
                      See all
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 ml-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-5">
                  <div className="col-span-1">
                    <div className="w-full aspect-square relative">
                      <Image
                        alt="Collections"
                        src="/cat-1.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Floor Lamps
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full aspect-square relative">
                      <Image
                        alt="Collections"
                        src="/cat-2.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Indoor Lighting
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full aspect-square relative">
                      <Image
                        alt="Collections"
                        src="/cat-3.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Wall Lighting
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full aspect-square relative">
                      <Image
                        alt="Collections"
                        src="/cat-4.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Outdoor Lighting
                    </div>
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>
            <div className="relative w-full h-full py-14 text-sm md:text-xl font-extrabold text-balance leading-normal">
              <MaxWidthWrapper>
                <h2 className="text-center">Trusted by leading companies in Australia</h2>
                <LogoCarousel />
              </MaxWidthWrapper>
            </div>
            <div className="relative w-full h-full py-14 text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2] px-5">
              <MaxWidthWrapper>
                <div className="md:flex md:gap-4">
                  <h2>Best Sellers</h2>
                  <div className="flex items-center">
                    <span className="text-sm font-medium underline underline-offset-2">
                      See all
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 ml-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="col-span-1">
                    <div className="w-full max-h-[550px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/cat-1.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Floor Lamps
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full max-h-[550px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/cat-2.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Indoor Lighting
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full max-h-[550px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/cat-3.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold hover:underline underline-offset-8">
                      Wall Lighting
                    </div>
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>
            <div className="relative w-full h-full py-14 text-2xl font-extrabold text-balance leading-normal">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative col-span-1">
                    <div className="w-full max-h-[857px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/home-cover-1.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 py-12 px-5">
                        <div className="flex flex-col justify-between items-center text-white text-center h-full">
                          <div className="flex-grow flex flex-col justify-center">
                            <div className="text-4xl md:text-5xl font-normal max-w-[500px]">
                              Every home deserves better lighting
                            </div>
                            <div className="text-lg font-normal max-w-[400px] mx-auto mt-10">
                              Unique collections of premium products starting from affordable price.
                            </div>
                          </div>
                          <Link
                            className={buttonVariants({
                              size: 'xl',
                              className:
                                'mx-auto bg-transparent border border-white !rounded-full mt-auto !font-bold',
                            })}
                            href="/"
                          >
                            See indoor lights <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative col-span-1">
                    <div className="w-full max-h-[857px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/home-cover-2.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 py-12 px-5">
                        <div className="flex flex-col justify-between items-center text-white text-center h-full">
                          <div className="flex-grow flex flex-col justify-center">
                            <div className="text-4xl md:text-5xl font-normal max-w-[500px]">
                              Make your tables elegant and modern
                            </div>
                            <div className="text-lg font-normal max-w-[400px] mx-auto mt-10">
                              Unique collections of premium products starting from affordable price.
                            </div>
                          </div>
                          <Link
                            className={buttonVariants({
                              size: 'xl',
                              className:
                                'mx-auto bg-transparent border border-white !rounded-full mt-auto !font-bold',
                            })}
                            href="/"
                          >
                            See table lights <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full h-full py-14 text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2] px-5">
              <MaxWidthWrapper>
                <h2 className="text-xl text-center">Our Collections</h2>
                <p className="py-5 mx-auto text-center font-normal text-[16px] max-w-[700px]">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, voluptatum quam
                  aliquam odio temporibus earum voluptate, eum reiciendis magnam quidem quo ipsam?
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="col-span-1">
                    <div className="w-full h-[315px] relative">
                      <Image
                        alt="Collections"
                        src="/home-collection-1.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-lg font-semibold">Wall Lighting</div>
                    <Link className="flex items-center font-normal text-lg mt-2" href="/">
                      <span className="underline underline-offset-4 hover:no-underline">
                        Explore this collection
                      </span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full h-[315px] relative">
                      <Image
                        alt="Collections"
                        src="/home-collection-2.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-lg font-semibold">Living & Bedroom Lighting</div>
                    <Link className="flex items-center font-normal text-lg mt-2" href="/">
                      <span className="underline underline-offset-4 hover:no-underline">
                        Explore this collection
                      </span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                  <div className="col-span-1">
                    <div className="w-full h-[315px] relative">
                      <Image
                        alt="Collections"
                        src="/home-collection-3.png"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 text-lg font-semibold">Table Lighting</div>
                    <Link className="flex items-center font-normal text-lg mt-2" href="/">
                      <span className="underline underline-offset-4 hover:no-underline">
                        Explore this collection
                      </span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>

            <div className="relative w-full h-full py-14 text-2xl font-extrabold text-balance leading-normal px-5">
              <MaxWidthWrapper>
                <div className="flex flex-col md:grid grid-cols-3">
                  <div className="order-1 md:-order-none md:col-span-1 pt-7 md:py-9 md:pr-[70px]">
                    <h2>High quality craftmanship on every aspect, brings best of its kind.</h2>
                    <p className="font-normal text-[16px] mt-6">
                      Pellentesque id lorem sed ipsum lobortis suscipit sit amet vitae urna.
                    </p>
                    <Link
                      className={buttonVariants({
                        size: 'xl',
                        className:
                          'mx-auto mt-16 bg-transparent border border-black !rounded-full !font-bold !text-black',
                      })}
                      href="/"
                    >
                      Learn more
                    </Link>
                  </div>
                  <div className="md:col-span-2">
                    <div className="w-full max-h-[550px] aspect-square relative">
                      <Image
                        alt="Collections"
                        src="/home-craft.png"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>
            <div className="relative w-full h-full pb-14 text-2xl font-extrabold text-balance leading-normal">
              <div>
                <div className="grid grid-cols-1">
                  <div className="relative col-span-1">
                    <div className="w-full max-h-[600px] aspect-[2/3] relative">
                      <Image
                        alt="Collections"
                        src="/home-cover-3.png"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 py-12 px-5">
                        <div className="flex flex-col justify-between items-center text-white text-center h-full">
                          <div className="flex-grow flex flex-col justify-center">
                            <div className="text-4xl md:text-5xl font-normal max-w-[600px]">
                              World’s best outdoor lighting collections for you.
                            </div>
                            <div className="text-lg font-normal max-w-[400px] mx-auto mt-10">
                              Unique collections of premium products starting from affordable price.
                            </div>
                          </div>
                          <Link
                            className={buttonVariants({
                              size: 'xl',
                              className:
                                'mx-auto bg-transparent border border-white !rounded-full mt-auto !font-bold',
                            })}
                            href="/"
                          >
                            See more lightings <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <h1 className="relative w-fit tracking-tight text-balance mt-16 font-bold !leading-tight text-gray-900 text-5xl md:text-6xl lg:text-7xl">
            Your Image on a <span className="bg-green-600 px-2 text-white">Custom</span> Phone Case
          </h1>
          <p className="mt-8 text-lg lg:pr-10 max-w-prose text-center lg:text-left text-balance md:text-wrap">
            Capture your favorite memories with your own,{' '}
            <span className="font-semibold">one-of-one</span> phone case. CaseCobra allows you to
            protect your memories, not just your phone case.
          </p>

          <ul className="mt-8 space-y-2 text-left font-medium flex flex-col items-center sm:items-start">
            <div className="space-y-2">
              <li className="flex gap-1.5 items-center text-left">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                High-quality, durable material
              </li>
              <li className="flex gap-1.5 items-center text-left">
                <Check className="h-5 w-5 shrink-0 text-green-600" />5 year print guarantee
              </li>
              <li className="flex gap-1.5 items-center text-left">
                <Check className="h-5 w-5 shrink-0 text-green-600" />
                Modern iPhone models supported
              </li>
            </div>
          </ul> */}
          </div>

          {/* <div className="col-span-full lg:col-span-1 w-full flex justify-center px-8 sm:px-16 md:px-0 mt-32 lg:mx-0 lg:mt-20 h-fit">
            <div className="relative md:max-w-xl">
              <img
                alt=""
                src="/your-image.png"
                className="absolute w-40 lg:w-52 left-56 -top-20 select-none hidden sm:block lg:hidden xl:block"
              />
              <img alt="" src="/line.png" className="absolute w-20 -left-6 -bottom-6 select-none" />
              <Phone className="w-64" imgSrc="/testimonials/1.jpg" />
            </div>
          </div> */}
        </section>

        {/* value proposition section */}
        <section className="py-14 bg-[#F6F5F2]">
          <MaxWidthWrapper className="flex flex-col items-center">
            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
              <h2 className="mx-auto order-1 mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-xl md:text-2xl text-gray-900">
                What our{' '}
                <span className="relative px-2">
                  customers{' '}
                  <Icons.underline className="hidden sm:block pointer-events-none absolute inset-x-0 -bottom-4 text-green-500" />
                </span>{' '}
                say
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mt-14 md:mt-16">
              <div className="flex -space-x-4">
                <Image
                  className="inline-block rounded-full ring-2 ring-slate-100"
                  src="/users/user-1.png"
                  alt="user image"
                  width={40}
                  height={40}
                />
                <Image
                  className="inline-block rounded-full ring-2 ring-slate-100"
                  src="/users/user-2.png"
                  alt="user image"
                  width={40}
                  height={40}
                />
                <Image
                  className="inline-block rounded-full ring-2 ring-slate-100"
                  src="/users/user-3.png"
                  alt="user image"
                  width={40}
                  height={40}
                />
                <Image
                  className="inline-block rounded-full ring-2 ring-slate-100"
                  src="/users/user-4.jpg"
                  alt="user image"
                  width={40}
                  height={40}
                />
                <Image
                  className="inline-block object-cover rounded-full ring-2 ring-slate-100"
                  src="/users/user-5.jpg"
                  alt="user image"
                  width={40}
                  height={40}
                />
              </div>

              <div className="flex flex-col justify-between items-center sm:items-start">
                <div className="flex gap-0.5">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                </div>

                <p>
                  <span className="font-semibold">1,250+</span> positive reviews
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 gap-y-16 mt-14">
              <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
                <div className="flex gap-0.5 mb-2">
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div className="text-lg leading-8">
                  <p>
                    &quot;The fixture feels sturdy, and I haveve even received compliments on the
                    design. I have had it for about a year now, and{' '}
                    <span className="p-0.5 bg-slate-800 text-white">
                      the light remains bright and clear
                    </span>
                    .&quot;
                  </p>
                </div>
                <div className="flex gap-4 mt-2">
                  <Image
                    className="rounded-full object-cover"
                    src="/users/user-1.png"
                    alt="user"
                    width={48}
                    height={48}
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">Jonathan</p>
                    <div className="flex gap-1.5 items-center text-zinc-600">
                      <Check className="h-4 w-4 stroke-[3px] text-green-600" />
                      <p className="text-sm">Verified Purchase</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* second user review */}
              <div className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
                <div className="flex gap-0.5 mb-2">
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div className="text-lg leading-8">
                  <p>
                    &quot;I have had this light fixture for about six months now, and I could not be
                    happier with the quality. It has{' '}
                    <span className="p-0.5 bg-slate-800 text-white">
                      truly elevated the ambiance
                    </span>{' '}
                    of my living room. Highly recommend!&quot;
                  </p>
                </div>
                <div className="flex gap-4 mt-2">
                  <Image
                    className="rounded-full object-cover"
                    src="/users/user-4.jpg"
                    alt="user"
                    width={48}
                    height={48}
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">Josh</p>
                    <div className="flex gap-1.5 items-center text-zinc-600">
                      <Check className="h-4 w-4 stroke-[3px] text-green-600" />
                      <p className="text-sm">Verified Purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </section>

        <MainPolicies />

        {/* <div className="pt-16">
        <Reviews />
      </div> */}
      </div>
    </>
  )
}
