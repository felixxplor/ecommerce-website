import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutUs() {
  return (
    <div className="bg-[#f6f5f2] py-16">
      <MaxWidthWrapper>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-medium mb-6">About Gizmooz</h1>
          <p className="text-lg max-w-3xl mx-auto">
            We're passionate about creating innovative tech accessories that enhance your digital
            lifestyle.
          </p>
        </div>

        {/* Our Story Section */}
        <Card className="mb-16 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-96 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 opacity-20 mix-blend-multiply bg-[url('/api/placeholder/600/600')] bg-center bg-cover"></div>
              </div>
              <div className="relative h-full flex items-center justify-center p-10 text-white">
                <h2 className="text-4xl font-medium">Our Story</h2>
              </div>
            </div>
            <CardContent className="p-10">
              <p className="mb-4">
                Gizmooz was founded in 2020 with a simple mission: to create tech accessories that
                combine functionality, innovation, and style. What started as a small operation in a
                garage has grown into a global brand trusted by tech enthusiasts worldwide.
              </p>
              <p className="mb-4">
                Our founders, lifelong tech enthusiasts, were frustrated by the lack of truly
                innovative accessories in the market. They believed that the devices we use every
                day deserve companions that are just as thoughtfully designed as the devices
                themselves.
              </p>
              <p>
                Today, we continue to push boundaries with unique products that enhance how you
                interact with your technology while expressing your personal style.
              </p>
            </CardContent>
          </div>
        </Card>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-medium text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-xl mb-2">Innovation</h3>
              <p className="text-gray-600">
                We constantly push the boundaries of what's possible, creating products that solve
                problems in new and exciting ways.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-xl mb-2">Quality</h3>
              <p className="text-gray-600">
                We never compromise on materials or craftsmanship, ensuring our products are built
                to last and perform flawlessly.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-xl mb-2">Unique Design</h3>
              <p className="text-gray-600">
                We believe tech accessories should be as stylish as they are functional, reflecting
                your personal taste and lifestyle.
              </p>
            </Card>
          </div>
        </div>

        {/* Product Approach */}
        <Card className="mb-16">
          <CardContent className="p-10">
            <h2 className="text-3xl font-medium mb-6">Our Approach to Products</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="mb-4">
                  At Gizmooz, we don't just create accessories—we craft experiences. Our product
                  development process starts with identifying the real needs of tech users, not just
                  adding features for the sake of it.
                </p>
                <p>
                  Each product undergoes rigorous testing and refinement before it reaches your
                  hands. We obsess over the details, because we know that's where true innovation
                  happens. From the feel of a material to the sound of a click, every aspect is
                  carefully considered.
                </p>
              </div>
              <div>
                <p className="mb-4">
                  Our commitment to sustainability means we're constantly exploring eco-friendly
                  materials and manufacturing processes without compromising on quality or design.
                </p>
                <p>
                  We believe that the best tech accessories should seamlessly integrate into your
                  life, enhancing your relationship with technology while reducing environmental
                  impact. That's the Gizmooz promise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commitment Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-10 text-center">
            <h2 className="text-3xl font-medium mb-6">Our Commitment to You</h2>
            <p className="text-lg max-w-3xl mx-auto mb-8">
              Every Gizmooz product is backed by our dedication to exceptional quality, innovative
              design, and outstanding customer service. We're not just selling products—we're
              building relationships with tech enthusiasts who share our passion.
            </p>
            <Link
              href="/collections"
              className="bg-white text-blue-600 font-medium py-3 px-6 rounded-md hover:bg-blue-50 transition-colors"
            >
              Explore Our Products
            </Link>
          </CardContent>
        </Card>
      </MaxWidthWrapper>
    </div>
  )
}
