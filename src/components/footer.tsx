import Link from 'next/link'
import MaxWidthWrapper from './max-width-wrapper'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-white relative pt-0 sm:pt-8">
      <MaxWidthWrapper className="py-4 sm:py-6 px-5 xl:px-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 pb-10 sm:pb-14 gap-x-5 sm:gap-x-10 gap-y-8 sm:gap-y-14">
          <div className="col-span-1">
            <h2 className="text-base sm:text-lg font-semibold">Company</h2>
            <ul className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-[16px] mt-4 sm:mt-6">
              <li>
                <Link href="/about-us" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-base sm:text-lg font-semibold">Quick Links</h2>
            <ul className="text-sm sm:text-[16px] mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
              <li>
                <Link href="/account" className="hover:text-blue-600 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-blue-600 transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-blue-600 transition-colors">
                  Delivery
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-blue-600 transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-base sm:text-lg font-semibold">Support</h2>
            <ul className="text-sm sm:text-[16px] mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
              <li>
                <Link href="/contact-us" className="hover:text-blue-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-600 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-blue-600 transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-base sm:text-lg font-semibold">Shopping</h2>
            <ul className="text-sm sm:text-[16px] mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
              <li>
                <Link href="/collections" className="hover:text-blue-600 transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/new-arrivals"
                  className="hover:text-blue-600 transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/best-selling"
                  className="hover:text-blue-600 transition-colors"
                >
                  Best Selling
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <h2 className="text-base sm:text-lg font-semibold">Follow Us</h2>
            <div className="flex gap-5 mt-4 sm:mt-6">
              <Link
                href="https://instagram.com/gizmoozdotcom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                  className="fill-current hover:text-blue-600 transition-colors"
                >
                  <path d="M12,4.622c2.403,0,2.688,0.009,3.637,0.052c0.877,0.04,1.354,0.187,1.671,0.31c0.42,0.163,0.72,0.358,1.035,0.673 c0.315,0.315,0.51,0.615,0.673,1.035c0.123,0.317,0.27,0.794,0.31,1.671c0.043,0.949,0.052,1.234,0.052,3.637 s-0.009,2.688-0.052,3.637c-0.04,0.877-0.187,1.354-0.31,1.671c-0.163,0.42-0.358,0.72-0.673,1.035 c-0.315,0.315-0.615,0.51-1.035,0.673c-0.317,0.123-0.794,0.27-1.671,0.31c-0.949,0.043-1.233,0.052-3.637,0.052 s-2.688-0.009-3.637-0.052c-0.877-0.04-1.354-0.187-1.671-0.31c-0.42-0.163-0.72-0.358-1.035-0.673 c-0.315-0.315-0.51-0.615-0.673-1.035c-0.123-0.317-0.27-0.794-0.31-1.671C4.631,14.688,4.622,14.403,4.622,12 s0.009-2.688,0.052-3.637c0.04-0.877,0.187-1.354,0.31-1.671c0.163-0.42,0.358-0.72,0.673-1.035 c0.315-0.315,0.615-0.51,1.035-0.673c0.317-0.123,0.794-0.27,1.671-0.31C9.312,4.631,9.597,4.622,12,4.622 M12,3 C9.556,3,9.249,3.01,8.289,3.054C7.331,3.098,6.677,3.25,6.105,3.472C5.513,3.702,5.011,4.01,4.511,4.511 c-0.5,0.5-0.808,1.002-1.038,1.594C3.25,6.677,3.098,7.331,3.054,8.289C3.01,9.249,3,9.556,3,12c0,2.444,0.01,2.751,0.054,3.711 c0.044,0.958,0.196,1.612,0.418,2.185c0.23,0.592,0.538,1.094,1.038,1.594c0.5,0.5,1.002,0.808,1.594,1.038 c0.572,0.222,1.227,0.375,2.185,0.418C9.249,20.99,9.556,21,12,21s2.751-0.01,3.711-0.054c0.958-0.044,1.612-0.196,2.185-0.418 c0.592-0.23,1.094-0.538,1.594-1.038c0.5-0.5,0.808-1.002,1.038-1.594c0.222-0.572,0.375-1.227,0.418-2.185 C20.99,14.751,21,14.444,21,12s-0.01-2.751-0.054-3.711c-0.044-0.958-0.196-1.612-0.418-2.185c-0.23-0.592-0.538-1.094-1.038-1.594 c-0.5-0.5-1.002-0.808-1.594-1.038c-0.572-0.222-1.227-0.375-2.185-0.418C14.751,3.01,14.444,3,12,3L12,3z M12,7.378 c-2.552,0-4.622,2.069-4.622,4.622S9.448,16.622,12,16.622s4.622-2.069,4.622-4.622S14.552,7.378,12,7.378z M12,15 c-1.657,0-3-1.343-3-3s1.343-3,3-3s3,1.343,3,3S13.657,15,12,15z M16.804,6.116c-0.596,0-1.08,0.484-1.08,1.08 s0.484,1.08,1.08,1.08c0.596,0,1.08-0.484,1.08-1.08S17.401,6.116,16.804,6.116z"></path>
                </svg>
              </Link>
              <Link
                href="https://x.com/gizmoozdotcom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                  className="fill-current hover:text-blue-600 transition-colors"
                >
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
                </svg>
              </Link>
              <Link
                href="https://facebook.com/gizmoozdotcom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                  className="fill-current hover:text-blue-600 transition-colors"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200" />

        <div className="flex flex-col md:flex-row md:justify-between justify-center items-center py-4 sm:py-8">
          <div className="text-center md:text-left pb-2 md:pb-0">
            <p className="text-xs sm:text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gizmooz Australia
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex space-x-4 sm:space-x-8">
              <Link
                href="/terms-and-conditions"
                className="text-xs sm:text-sm text-muted-foreground hover:text-gray-600"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="text-xs sm:text-sm text-muted-foreground hover:text-gray-600"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}

export default Footer
