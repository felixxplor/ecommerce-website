import MaxWidthWrapper from '@/components/max-width-wrapper'

export default function ShippingPolicy() {
  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text ">Shipping Policy</h1>
            <p className="text-gray-600">Last updated: February 27, 2025</p>
          </div>
        </div>

        {/* Free Shipping Banner */}
        <div className="mb-12 bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
          <div className="flex justify-center items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-3xl font-serif font-medium text-blue-600">
              Free Shipping on All Orders
            </h2>
          </div>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            We're excited to offer complimentary shipping on every purchase, regardless of order
            value. No minimum purchase required!
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10">
          {/* Shipping Costs Section */}
          <section id="shipping-costs" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">Shipping Costs</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Standard Shipping (Australia Post)</h3>
                  <p className="text-gray-700">Free on all orders within Australia</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-purple-100 p-4 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
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
                <div>
                  <h3 className="text-lg font-medium mb-1">Express Shipping (Australia Post)</h3>
                  <p className="text-gray-700">Available at checkout for an additional fee</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-700">
                  Express shipping costs are calculated during checkout and depend on:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>The number of products you have ordered</li>
                  <li>The weight of your order</li>
                  <li>The dimensions of your order</li>
                  <li>Your delivery address</li>
                </ul>
                <p className="mt-3 text-gray-700">
                  We'll display the express shipping costs after you've entered your delivery
                  address at checkout.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping and Dispatch Times Section */}
          <section id="shipping-times" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
              Shipping and Dispatch Times
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Standard Shipping</h3>
                    <p className="text-gray-700">
                      We offer free standard shipping on all orders, which typically takes 2-7
                      business days. Please allow 2-7 business days for delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Express Shipping</h3>
                    <p className="text-gray-700">
                      Express shipping orders are dispatched the same day for all orders placed
                      before 12:30pm AEST (weekdays). While Express Post remains Australia Post's
                      fastest postal service, delivery timeframes may vary.
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      For more information about express shipping, visit{' '}
                      <a
                        href="https://auspost.com.au"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Australia Post
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Regional and Remote Areas</h3>
                    <p className="text-gray-700">
                      For all orders, please note that delivery to more remote regional areas may
                      take a little longer. Please check your Australia Post shipping details for an
                      estimated time of arrival.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delayed Orders Section */}
          <section id="delayed-orders" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">Delayed Orders</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="bg-yellow-100 p-3 rounded-full mr-4 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700">
                    We want to ensure you receive your tech accessories promptly. If for any reason
                    you have not received your order within 5-8 business days, please contact our
                    customer service team and we will be happy to follow it up for you.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <a
                      href="tel:1300123456"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      1300 123 456
                    </a>
                    <a
                      href="mailto:info@gizmooz.com"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      info@gizmooz.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* International Shipping Section */}
          <section id="international-shipping" className="scroll-mt-20">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4">
              International Shipping
            </h2>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start">
                <div className="bg-gray-100 p-3 rounded-full mr-4 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-700">
                    Shipping outside of Australia is not available at this time. We're working on
                    expanding our shipping options to international customers. Stay tuned for
                    updates!
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-4 text-center">
            Need Help With Your Order?
          </h2>
          <p className="text-gray-700 text-center mb-6">
            Our customer service team is available to assist you with any questions or concerns
            about shipping and delivery.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {/* <a
              href="tel:1300123456"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="font-medium">Call us at 1300 123 456</span>
            </a> */}
            <a
              href="mailto:info@gizmooz.com"
              className="flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">Email us at info@gizmooz.com</span>
            </a>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
