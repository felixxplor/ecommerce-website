import MaxWidthWrapper from '@/components/max-width-wrapper'

export default function ReturnPolicy() {
  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text ">Return Policy</h1>
            <p className="text-gray-600">Last updated: February 27, 2025</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Overview Section */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full mr-5">
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
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-medium mb-4">Return Policy</h2>
                <p className="text-lg text-gray-700 mb-6">
                  We stand behind our products and want you to be completely satisfied with your
                  purchase.
                </p>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">30-Day Return Window</h3>
                  <p className="text-gray-700">
                    You have 30 days from the date you receive your item to initiate a return.
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Change of Mind Returns</h3>
                  <p className="text-gray-700 mb-2">
                    Items must be unused and in their original packaging to be eligible for return.
                  </p>
                  <p className="text-gray-700">
                    Customers are responsible for return shipping costs. A restocking fee may apply
                    if items are returned in a condition unfit for resale.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Return Process Section */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-serif font-medium mb-2">How to Start a Return</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-medium mb-2">Contact Us</h3>
                <p className="text-gray-600 text-sm">
                  Reach out via email or phone to start your return process
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-medium mb-2">Receive Instructions</h3>
                <p className="text-gray-600 text-sm">
                  We'll provide return shipping details and may request photos
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-medium mb-2">Receive Refund</h3>
                <p className="text-gray-600 text-sm">
                  After we inspect your return, we'll process your refund
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mt-6">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-700">
                  To start a return, or if you have any questions, you can contact us at{' '}
                  <a
                    href="mailto:info@gizmooz.com"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    info@gizmooz.com
                  </a>{' '}
                  {/* or by calling{' '}
                  <a
                    href="tel:1300123456"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    1300 123 456
                  </a>{' '}
                  (During business hours AEST). */}
                </p>
              </div>
            </div>
          </section>

          {/* Damages and Issues Section */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-medium mb-4">Damages and Issues</h2>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full mr-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700">
                  Please inspect your order upon delivery and contact us immediately if the item is
                  defective, damaged or if you receive the wrong item, so that we can evaluate the
                  issue and make it right.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-medium mb-2 text-gray-900">
                    When reporting issues, please include:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Your order number</li>
                    <li>Description of the problem</li>
                    <li>Photos showing the issue (if applicable)</li>
                    <li>Date you received the order</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Refunds Section */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-medium mb-4">Refund Process</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700">
                  We will notify you once we've received and inspected your return, and let you know
                  if the refund was approved or not.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700">
                  If approved, you'll be automatically refunded on your original payment method.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-full mr-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-700">
                  Please remember it can take some time for your bank or credit card company to
                  process and post the refund.
                </p>
              </div>
            </div>
          </section>

          {/* Non-Returnable Items Section */}
          <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-medium mb-4">Exceptions</h2>
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-full mr-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 mb-4">
                  Certain types of items cannot be returned, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Downloadable products and software</li>
                  <li>Gift cards</li>
                  <li>Personalized items</li>
                  <li>Items marked as final sale</li>
                  <li>Products with broken seals or packaging, for hygiene reasons</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Box */}
          <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 text-center">
            <h2 className="text-2xl font-serif font-medium mb-4">Still Have Questions?</h2>
            <p className="text-gray-700 mb-6">
              Our customer service team is ready to help you with any questions about our return
              policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@gizmooz.com"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
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
                <span className="font-medium">info@gizmooz.com</span>
              </a>
              <a
                href="tel:1300123456"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
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
                <span className="font-medium">1300 123 456</span>
              </a>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
