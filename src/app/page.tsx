import Image from 'next/image'
import Link from 'next/link'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRight, Check, Star } from 'lucide-react'

import MainPolicies from '@/components/main-policies'
import TopSellingProducts from '@/components/top-selling'
import LogoCarousel from '@/components/ui/logo-carousel'
import { Icons } from '@/components/Icons'
import { cn } from '@/utils/ui'

export default function ResponsiveHomePage() {
  return (
    <div className="bg-white min-h-[calc(100vh-3.5rem-1px)]">
      {/* Hero Section */}
      <section>
        <div className="relative text-left flex flex-col items-center">
          <div className="relative w-full pt-[12vh] lg:pt-[20vh] pb-14 px-4 sm:px-5 max-h-[580px] lg:min-h-[680px]">
            <span className="absolute inset-0 z-10 bg-black opacity-20"></span>
            <Image
              alt="Home"
              src="/home-cover.webp"
              fill
              className="absolute inset-0 object-cover z-0"
            />
            <div className="relative w-full h-full z-20 text-white text-3xl sm:text-4xl lg:text-5xl text-balance leading-normal">
              <MaxWidthWrapper className="flex flex-col items-center md:items-start">
                <div className="max-w-[668px] mx-auto md:mx-0 text-center md:text-left">
                  <h1>Elevate your space with Gizmooz innovative smart tech solutions.</h1>
                  <p className="mt-6 sm:mt-10 text-base sm:text-lg">
                    Premium smart devices for home and workplace.
                    <br className="hidden sm:block" />
                    Transform your space into a connected, modern sanctuary.
                  </p>
                  <div className="flex justify-center md:justify-start mt-10 lg:mt-28">
                    <Link
                      href="/collections"
                      className="text-base md:text-lg border-2 border-white rounded-full px-8 sm:px-16 py-3 sm:py-4 font-medium hover:bg-white hover:text-black transition-colors duration-300"
                    >
                      Explore our collections
                    </Link>
                  </div>
                </div>
              </MaxWidthWrapper>
            </div>
          </div>
        </div>

        {/* Shop by categories */}
        <div className="relative w-full px-4 sm:px-5 py-10 sm:py-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2]">
          <MaxWidthWrapper>
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <h2>Shop by categories</h2>
              <Link href="/collections?sort=latest" className="flex items-center">
                <span className="text-sm font-medium underline underline-offset-2">See all</span>
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
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-5">
              {/* Category Cards - Made more compact on mobile */}
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/collections/${category.slug}`}
                  className="col-span-1 group block transition-all duration-300"
                >
                  <div className="w-full aspect-square relative overflow-hidden">
                    <Image
                      alt={category.name}
                      src={category.image}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                  <div className="mt-2 text-center text-base sm:text-lg font-semibold relative">
                    <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black group-hover:after:w-full after:transition-all after:duration-300">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </MaxWidthWrapper>
        </div>

        {/* Top selling products section */}
        <TopSellingProducts title="Top Picks" />

        {/* Trusted companies section - More compact on mobile */}
        <div className="relative w-full pt-0 pb-8 sm:py-14 text-sm md:text-xl font-extrabold text-balance leading-normal">
          <MaxWidthWrapper>
            <h2 className="text-center text-base sm:text-xl md:text-2xl">
              Trusted by leading companies in Australia
            </h2>
            <LogoCarousel />
          </MaxWidthWrapper>
        </div>

        {/* New Arrivals - Styled to match Shop by Categories */}
        <div className="relative w-full px-4 sm:px-5 py-10 sm:py-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2]">
          <MaxWidthWrapper>
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <h2>New Arrivals</h2>
              <Link href="/collections?sort=latest" className="flex items-center">
                <span className="text-sm font-medium underline underline-offset-2">See all</span>
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
              </Link>
            </div>

            {/* Different grid layout based on screen size */}
            <div className="mt-6 md:hidden grid grid-cols-3 gap-2">
              {/* Mobile layout: 3 smaller items in a row */}
              {newArrivals.map((item) => (
                <Link
                  key={item.slug}
                  href={`/collections/${item.slug}`}
                  className="col-span-1 group block transition-all duration-300"
                >
                  <div className="w-full aspect-square relative overflow-hidden">
                    <Image
                      alt={item.name}
                      src={item.image}
                      fill
                      sizes="33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                  <div className="mt-1 text-center text-xs font-semibold relative truncate px-1">
                    <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black group-hover:after:w-full after:transition-all after:duration-300">
                      {item.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Original layout for larger screens */}
            <div className="mt-6 hidden md:grid md:grid-cols-3 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* Desktop layout with smaller photos */}
              {newArrivals.map((item) => (
                <Link
                  key={item.slug}
                  href={`/collections/${item.slug}`}
                  className="col-span-1 group block transition-all duration-300"
                >
                  <div className="w-full aspect-[1/1] relative overflow-hidden">
                    <Image
                      alt={item.name}
                      src={item.image}
                      fill
                      sizes="(max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  </div>
                  <div className="mt-2 text-center text-sm sm:text-base font-medium relative">
                    <span className="relative inline-block after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black group-hover:after:w-full after:transition-all after:duration-300">
                      {item.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </MaxWidthWrapper>
        </div>

        {/* Featured Double Banner - Side by side on all screens */}
        <div className="relative w-full py-10 sm:py-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal">
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              {featureBanners.map((banner, index) => (
                <div
                  key={index}
                  className={`relative col-span-1 ${index === 1 ? 'hidden sm:block' : ''}`}
                >
                  {/* Make the aspect ratio shorter to make photos smaller vertically while taking full width */}
                  <div className="w-full aspect-[16/13] sm:aspect-[16/14] md:aspect-[16/12] relative">
                    <Image
                      alt={banner.title}
                      src={banner.image}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 py-4 sm:py-8 md:py-12 px-2 sm:px-4 md:px-5">
                      <div className="flex flex-col justify-between items-center text-white text-center h-full">
                        <div className="flex-grow flex flex-col justify-center">
                          <div className="text-sm sm:text-3xl md:text-4xl lg:text-5xl font-normal max-w-[500px]">
                            {banner.title}
                          </div>
                          <div className="text-xs sm:text-base md:text-lg font-normal max-w-[400px] mx-auto mt-2 sm:mt-6 md:mt-10 sm:block">
                            {banner.description}
                          </div>
                        </div>
                        <Link
                          className={cn(
                            buttonVariants({
                              size: 'sm', // Default size for mobile
                              className:
                                'mx-auto !w-auto !min-w-0 bg-transparent !border !border-white !rounded-full !mt-auto !font-bold hover:!bg-white hover:!text-black !transition-colors !duration-300 !whitespace-nowrap !shadow-none',
                            }),
                            '!text-xs !px-2 !py-0.5', // Mobile (default)
                            'sm:!text-sm sm:!px-3 sm:!py-1.5 sm:!shadow-sm', // Small screens - add shadow back
                            'md:!text-base md:!px-6 md:!py-3', // Medium screens
                            'lg:!text-lg lg:!px-8 lg:!py-4 lg:!h-12' // Large screens (xl size)
                          )}
                          href={banner.link}
                        >
                          {banner.linkText}{' '}
                          <ArrowRight className="!h-2.5 !w-2.5 sm:!h-3.5 sm:!w-3.5 md:!h-4 md:!w-4 !ml-1 md:!ml-1.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Our Collections */}
        <div className="relative w-full py-10 sm:py-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal bg-[#F6F5F2] px-4 sm:px-5">
          <MaxWidthWrapper>
            <h2 className="text-lg sm:text-xl text-center">Our Collections</h2>
            <p className="py-3 sm:py-5 mx-auto text-center font-normal text-sm sm:text-base max-w-[700px]">
              Discover the Gizmooz difference – expertly curated smart tech that transforms everyday
              moments into extraordinary experiences
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {collections.map((collection) => (
                <div key={collection.slug} className="col-span-1">
                  <div className="w-full aspect-video sm:h-[315px] relative">
                    <Image
                      alt={collection.name}
                      src={collection.image}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 text-base sm:text-lg font-semibold">{collection.name}</div>
                  <Link
                    className="flex items-center font-normal text-base sm:text-lg mt-2"
                    href={`/collections/${collection.slug}`}
                  >
                    <span className="underline underline-offset-4 hover:no-underline">
                      Explore this collection
                    </span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </div>
              ))}
            </div>
          </MaxWidthWrapper>
        </div>

        {/* Craftsmanship Section - Better mobile layout */}
        <div className="relative w-full py-10 sm:py-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal px-4 sm:px-5">
          <MaxWidthWrapper>
            <div className="flex flex-col-reverse md:grid grid-cols-3 gap-8 md:gap-0">
              <div className="md:col-span-1 md:py-9 md:pr-[70px]">
                <h2 className="mt-6 md:mt-0">
                  High quality craftmanship on every aspect, brings best of its kind.
                </h2>
                <p className="font-normal text-sm sm:text-base mt-4 sm:mt-6">
                  Premium devices that seamlessly integrate with your smart ecosystem.
                </p>
                <div className="flex justify-center md:justify-start mt-8 sm:mt-16">
                  <Link
                    className={buttonVariants({
                      size: 'lg',
                      className:
                        'bg-transparent border border-black !rounded-full !font-bold !text-black hover:!text-white',
                    })}
                    href="/about-us"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="w-full aspect-[16/10] relative">
                  <Image
                    alt="Craftsmanship"
                    src="/home-craft.png"
                    fill
                    sizes="(max-width: 768px) 100vw, 66.67vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </div>

        {/* Full width banner */}
        <div className="relative w-full pb-10 sm:pb-14 text-xl sm:text-2xl font-extrabold text-balance leading-normal">
          <div className="grid grid-cols-1">
            <div className="relative col-span-1">
              <div className="w-full aspect-[1/1] sm:aspect-[16/9] md:max-h-[600px] relative">
                <Image
                  alt="Tech Collections"
                  src="/home-cover-3.png"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 py-8 sm:py-12 px-4 sm:px-5">
                  <div className="flex flex-col justify-between items-center text-white text-center h-full">
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-normal max-w-[600px]">
                        World's best tech collections for you.
                      </div>
                      <div className="text-base sm:text-lg font-normal max-w-[400px] mx-auto mt-6 sm:mt-10">
                        Innovative devices that transform how you live, work and play.
                      </div>
                    </div>
                    <Link
                      className={buttonVariants({
                        size: 'lg',
                        className:
                          'mx-auto bg-transparent border border-white !rounded-full mt-auto !font-bold hover:bg-white hover:text-black transition-colors duration-300',
                      })}
                      href="/collections"
                    >
                      See more gadgets <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-10 sm:py-14 bg-[#F6F5F2]">
        <MaxWidthWrapper className="flex flex-col items-center px-4 sm:px-0">
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mt-10 md:mt-16">
            <div className="flex -space-x-4">
              {users.map((user, index) => (
                <Image
                  key={index}
                  className="inline-block rounded-full ring-2 ring-slate-100"
                  src={user.image}
                  alt="user image"
                  width={40}
                  height={40}
                />
              ))}
            </div>

            <div className="flex flex-col justify-between items-center sm:items-start">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-green-600 fill-green-600" />
                ))}
              </div>

              <p>
                <span className="font-semibold">1,250+</span> positive reviews
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2 gap-8 sm:gap-16 mt-10 sm:mt-14">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex flex-auto flex-col gap-4 lg:pr-8 xl:pr-20">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-green-600 fill-green-600" />
                  ))}
                </div>
                <div className="text-base sm:text-lg leading-8">
                  <p dangerouslySetInnerHTML={{ __html: testimonial.content }} />
                </div>
                <div className="flex gap-4 mt-2">
                  <Image
                    className="rounded-full object-cover"
                    src={testimonial.user.image}
                    alt="user"
                    width={48}
                    height={48}
                  />
                  <div className="flex flex-col">
                    <p className="font-semibold">{testimonial.user.name}</p>
                    <div className="flex gap-1.5 items-center text-zinc-600">
                      <Check className="h-4 w-4 stroke-[3px] text-green-600" />
                      <p className="text-sm">Verified Purchase</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <MainPolicies />
    </div>
  )
}

// Data for the page
const categories = [
  { name: 'Digital Elegance', slug: 'digital', image: '/cat-1.avif' },
  { name: 'Home Lighting', slug: 'lighting', image: '/cat-2.png' },
  { name: 'Cool Gadgets', slug: 'gadgets', image: '/cat-3.avif' },
  { name: 'Outdoor Fun', slug: 'outdoor', image: '/cat-4.png' },
]

const newArrivals = [
  { name: 'Latest Gadgets', slug: 'gadgets', image: '/latest-1.jpg' },
  { name: 'Kitchen Appliances', slug: 'kitchen-appliances', image: '/latest-2.jpg' },
  { name: 'Home Decor', slug: 'home-decor', image: '/cat-3.png' },
]

const featureBanners = [
  {
    title: 'Every space deserves smart innovation',
    description: 'Unique collections of premium products starting from affordable price.',
    link: '/collections/gadgets',
    linkText: 'See latest gadgets',
    image: '/home-cover-1.png',
  },
  {
    title: 'Make your home elegant and modern',
    description: 'Exclusive smart tech collection - premium innovation at accessible prices.',
    link: '/collections/home-gadgets',
    linkText: 'See home gadgets',
    image: '/home-cover-2.png',
  },
]

const collections = [
  { name: 'Office Gadgets', slug: 'office-gadgets', image: '/collection-1.jpg' },
  { name: 'Home Gadgets', slug: 'home-gadgets', image: '/home-collection-2.png' },
  { name: 'Pet Gadgets', slug: 'pet-gadgets', image: '/collection-3.webp' },
]

const users = [
  { image: '/users/user-1.png' },
  { image: '/users/user-2.png' },
  { image: '/users/user-3.png' },
  { image: '/users/user-4.jpg' },
  { image: '/users/user-5.jpg' },
]

const testimonials = [
  {
    content:
      '&quot;The Gizmooz smart clock feels solid in construction, and I\'ve received numerous compliments on its sleek design. After a year of daily use, the display <span class="p-0.5 bg-slate-800 text-white">remains crisp and responsive</span>, with all smart features working flawlessly.&quot;',
    user: {
      name: 'Jonathan',
      image: '/users/user-1.png',
    },
  },
  {
    content:
      '&quot;I have had this smart light for about six months now, and I could not be happier with the quality. It has <span class="p-0.5 bg-slate-800 text-white">truly elevated the ambiance</span> of my living room. Highly recommend!&quot;',
    user: {
      name: 'Josh',
      image: '/users/user-4.jpg',
    },
  },
]
