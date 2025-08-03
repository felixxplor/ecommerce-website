import MaxWidthWrapper from '@/components/max-width-wrapper'

export default function PrivacyPolicy() {
  return (
    <div className="bg-white py-20">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: February 27, 2025</p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 px-4 md:px-0">
            {/* Introduction Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Introduction</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  This web site is owned and operated by Gizmooz and will be referred to as "We",
                  "our" and "us" in this Internet Privacy Policy. By using this site, you agree to
                  the Internet Privacy Policy of this web site (www.gizmooz.com), which is set out
                  on this web site page. The Internet Privacy Policy relates to the collection and
                  use of personal information you may supply to us through your conduct on the web
                  site.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  We reserve the right, at our discretion, to modify or remove portions of this
                  Internet Privacy Policy at any time. This Internet Privacy Policy is in addition
                  to any other terms and conditions applicable to the web site. We do not make any
                  representations about third party web sites that may be linked to the web site.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  We recognise the importance of protecting the privacy of information collected
                  about visitors to our web site, in particular information that is capable of
                  identifying an individual ("personal information"). This Internet Privacy Policy
                  governs the manner in which your personal information, obtained through the web
                  site, will be dealt with. This Internet Privacy Policy should be reviewed
                  periodically so that you are updated on any changes. We welcome your comments and
                  feedback.
                </p>
              </div>
            </section>

            {/* Personal Information Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Personal Information
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  Personal information about visitors to our site is collected only when knowingly
                  and voluntarily submitted. For example, we may need to collect such information to
                  provide you with further services or to answer or forward any requests or
                  enquiries. It is our intention that this policy will protect your personal
                  information from being dealt with in any way that is inconsistent with applicable
                  privacy laws in Australia.
                </p>
              </div>
            </section>

            {/* Use of Information Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Use of Information
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  Personal information that visitors submit to our site is used only for the purpose
                  for which it is submitted or for such other secondary purposes that are related to
                  the primary purpose, unless we disclose other uses in this Internet Privacy Policy
                  or at the time of collection. Copies of correspondence sent from the web site,
                  that may contain personal information, are stored as archives for record-keeping
                  and back-up purposes only.
                </p>
              </div>
            </section>

            {/* Disclosure Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Disclosure</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Apart from where you have consented or disclosure is necessary to achieve the
                  purpose for which it was submitted, personal information may be disclosed in
                  special situations where we have reason to believe that doing so is necessary to
                  identify, contact or bring legal action against anyone damaging, injuring, or
                  interfering (intentionally or unintentionally) with our rights or property, users,
                  or anyone else who could be harmed by such activities. Also, we may disclose
                  personal information when we believe in good faith that the law requires
                  disclosure.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  We may engage third parties to provide you with goods or services on our behalf.
                  In that circumstance, we may disclose your personal information to those third
                  parties in order to meet your request for goods or services.
                </p>
              </div>
            </section>

            {/* Security Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Security</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We strive to ensure the security, integrity and privacy of personal information
                  submitted to our sites, and we review and update our security measures in light of
                  current technologies. Unfortunately, no data transmission over the Internet can be
                  guaranteed to be totally secure.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  However, we will endeavour to take all reasonable steps to protect the personal
                  information you may transmit to us or from our online products and services. Once
                  we do receive your transmission, we will also make our best efforts to ensure its
                  security on our systems.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  In addition, our employees and the contractors who provide services related to our
                  information systems are obliged to respect the confidentiality of any personal
                  information held by us. However, we will not be held responsible for events
                  arising from unauthorised access to your personal information.
                </p>
              </div>
            </section>

            {/* Cookies Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Cookies</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  Cookies are data that a Web site transfers to an individual's hard drive for
                  record-keeping purposes. Cookies, which are industry standard and are used by most
                  Web sites, including those operated by us, can facilitate a user's ongoing access
                  to and use of a site. They allow us to customise the web site to your needs. If
                  you do not want information collected through the use of Cookies, there is a
                  simple procedure in most browsers that allows you to deny or accept the Cookie
                  feature. But you should note that Cookies may be necessary to provide you with
                  some features of our on-line services.
                </p>
              </div>
            </section>

            {/* Access to Information Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Access to Information
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  We will endeavour to take all reasonable steps to keep secure any information
                  which we hold about you, and to keep this information accurate and up to date. If,
                  at any time, you discover that information held about you is incorrect, you may
                  contact us to have the information corrected.
                </p>

                <p className="text-gray-700 leading-relaxed">
                  In addition, our employees and the contractors who provide services related to our
                  information systems are obliged to respect the confidentiality of any personal
                  information held by us.
                </p>
              </div>
            </section>

            {/* Links to Other Sites Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Links to Other Sites
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  We provide links to Web sites outside of our web sites, as well as to third party
                  Web sites. These linked sites are not under our control, and we cannot accept
                  responsibility for the conduct of companies linked to our website. Before
                  disclosing your personal information on any other website, we advise you to
                  examine the terms and conditions of using that Web site and its privacy statement.
                </p>
              </div>
            </section>

            {/* Problems or Questions Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Problems or Questions
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  If we become aware of any ongoing concerns or problems with our web sites, we will
                  take these issues seriously and work to address these concerns. If you have any
                  further queries relating to our Privacy Policy, or you have a problem or
                  complaint, please contact us.
                </p>
              </div>
            </section>

            {/* Further Privacy Information Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">
                Further Privacy Information
              </h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">
                  For more information about privacy issues in Australia and protecting your
                  privacy, visit the Australian Federal Privacy Commissioner's web site:{' '}
                  <a
                    href="https://www.privacy.gov.au"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.privacy.gov.au
                  </a>
                </p>
              </div>
            </section>

            {/* Contact Us Section */}
            <section>
              <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Contact Us</h2>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="font-medium">By Email</span>
                    </div>
                    <p className="text-gray-700">info@gizmooz.com</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">Website</span>
                    </div>
                    <p className="text-gray-700">www.gizmooz.com/contact</p>
                  </div>

                  {/* <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="font-medium">Phone</span>
                    </div>
                    <p className="text-gray-700">(02) 1234 5678</p>
                  </div> */}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-16 text-center text-gray-500 text-sm">
            <p>© 2025 Gizmooz. All rights reserved.</p>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
