'use client'

import React, { useState } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `
        Gizmooz.com and its apps and sub-domains (the "Site") is a marketplace platform owned and operated by Gizmooz Pty Ltd 
        ("Gizmooz") where you can browse, select and purchase products sold by third party sellers ("Sellers"), or by us.
        
        These terms and conditions are important and you should read them carefully as they apply to your use of the Site, 
        and by doing so you agree to be bound by them.
      `,
    },
    {
      id: 'key-terms',
      title: 'Key Terms',
      content: `
        <p><strong>Site and services availability</strong><br/>
        We may change the Site, or stop making our services or the Site available without prior notice.</p>
        
        <p><strong>Cancelling orders</strong><br/>
        Gizmooz or its Sellers may reject or cancel your order after it has been placed, and you will be notified when this 
        occurs and receive a refund for your order. Whether or not you can cancel an order placed with a Seller depends on 
        the Seller's own policies. If you are buying the Product from us, we may only allow you to cancel your order if it 
        has not yet been processed with our shipping partner.</p>
        
        <p><strong>Liabilities</strong><br/>
        Without limiting your consumer law rights, Gizmooz: (i) is not liable to you for any indirect or consequential loss 
        other than where such loss arises as a result of our own negligence or wilful misconduct; (ii) is not responsible for 
        the agreement between you and Seller, including for the acceptance of Orders and supply and delivery of Seller products; 
        and (iii) our liability to you under these terms will be reduced to the extent you either caused or contributed to that 
        loss or damage.</p>
        
        <p><strong>Fees to Sellers</strong><br/>
        Gizmooz earns fees from Sellers on Products sold.</p>
        
        <p><strong>Changing these terms</strong><br/>
        We can change these terms and conditions at any time, but the terms in place at the time you placed your order will 
        continue to apply.</p>
      `,
    },
    {
      id: 'about-you',
      title: 'About You',
      content: `
        <p>To use our Site and purchase Products on Gizmooz, you must:</p>
        <ul>
          <li>be at least 18 years of age;</li>
          <li>reside in Australia;</li>
          <li>possess the legal right and ability to enter into a binding agreement with Gizmooz and/or Seller with respect to any Products purchased on the Site; and</li>
          <li>use the Site in accordance with this Agreement.</li>
        </ul>
      `,
    },
    {
      id: 'registration',
      title: 'Registration & Guest Checkout',
      content: `
        <p>You can purchase Products from our Site by either registering a User account ("Account") or by using our guest checkout ("Guest Checkout").</p>
        
        <p>Registering an Account with us allows you to:</p>
        <ul>
          <li>save your details for future purchases;</li>
          <li>access your past order details;</li>
          <li>manage your subscription preferences;</li>
        </ul>
        
        <p>You must keep your Account login details, particularly your account password, confidential and secure. You will be responsible for 
        the use of your account by yourself and others. This includes unauthorised use where your login details have not been kept secure. 
        If you suspect unauthorised use on your account, you should notify us immediately by contacting us through our Help Centre.</p>
        
        <p>Your Account is personal to you, and cannot be transferred. You must ensure that your registration details are up to date and 
        accurate at all times. You can manage your Account information by logging in to the Site.</p>
        
        <p>You agree that Gizmooz may suspend, terminate and/or close your Account at any time where we believe you have breached this 
        Agreement or applicable laws, or your Account is being used for fraudulent activity. We may also suspend or terminate any 
        User account if we suspend or terminate providing the services we provide under this Agreement.</p>
      `,
    },
    {
      id: 'site-license',
      title: 'Our Site, License and Restrictions on Use',
      content: `
        <p>We provide this Site as a Service to our Users and Sellers, and reserve the right to change or modify the Site at any time, 
        cease providing the services on the Site in whole or part, or stop making the Site available to users (or Sellers), without prior notice.</p>
        
        <p>You may only use the Site in accordance with this Agreement and subject to the restrictions of this section.</p>
        
        <p>Users agree to use the Site solely for their own personal use. Further, Users and visitors to the Site must not:</p>
        <ul>
          <li>interrupt or attempt to interrupt the operation of the Site in any way, or use the Site in a manner that adversely affects 
          the availability of its resources to other Users;</li>
          <li>use any bots, scraping tools or other code or things designed to extract, scrape, harvest, or aggregate information from our Site;</li>
          <li>use the Site for any illegal purpose or in any manner that is inconsistent with this Agreement;</li>
          <li>modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from or offer 
          for sale any information contained on, or obtained from the Site.</li>
        </ul>
        
        <p>We allow Users to upload content to the Site, including Product reviews and communications with Sellers and our support team. 
        You agree that you must not supply content to us that: (i) would cause you or Gizmooz to breach any law, regulation, rule, code 
        or legal obligations, (ii) is or could reasonably be considered to be obscene, inappropriate, defamatory, disparaging, indecent, 
        offensive, pornographic, threatening, abusive, racist, discriminatory, in breach of confidence or in breach of privacy, or (iii) 
        that could infringe any person's rights, including their intellectual property rights.</p>
      `,
    },
    {
      id: 'transactions',
      title: 'Our Role in Transactions',
      content: `
        <p>Gizmooz's Site is a marketplace platform where you, the User, may purchase Products from Sellers. You will find the Seller's 
        details in the Product details page where you can add the Product to your cart. Sellers supply the Products, and Users purchase 
        Products from Sellers and not from Gizmooz. In this transaction, Gizmooz simply acts as a limited agent for the Seller and the User, 
        for the following purposes only:</p>
        <ul>
          <li>facilitating the purchase of Products by a User;</li>
          <li>collecting payment from the User and then remitting the payment to the Seller (less any fees charged to the Seller by Gizmooz); and</li>
          <li>providing the Support Services in respect of issues arising between a User and a Seller, in relation to the supply of Products 
          including facilitating the resolution of complaints and the provision of remedies to Users.</li>
        </ul>
        
        <p>When a Seller's Product is purchased via the Site, the User and the Seller will at that time form a legally binding agreement 
        between each other for the sale and supply of the Product. Sellers may specify terms of sale relevant to the transaction ("Seller Terms") 
        which are accessible in the Product listing or Seller page. In circumstances where you purchase Products from more than one Seller, 
        you will form a legally binding agreement with each Seller in relation to the relevant Products. Each such agreement is separate and 
        exclusive to each relevant Seller. These agreements will be formed when you confirm your purchase of the relevant Products in your shopping cart.</p>
        
        <p>Sellers are solely responsible for their Products, including the price, product information on the Site, supply, delivery, quality, 
        safety and compliance with any laws or standards, as well as providing you remedies in respect of any claims and any other issue arising 
        out of or in connection with the agreement between you and the Seller.</p>
      `,
    },
    {
      id: 'products',
      title: 'Products',
      content: `
        <p>Information about the Products on the Site is provided directly by Sellers, or is based on material furnished by suppliers and/or 
        product manufacturers. Product images on the Site are provided for illustrative purposes only and the actual Products may vary to a 
        small extent. We do what we can to ensure the Product listings on our site are correct, but we do not warrant that they will be error free.</p>
        
        <p>All Products offered on the Site are supplied subject to this Agreement and the relevant Seller Terms. To the extent there is any 
        inconsistency between this Agreement and each of the Seller Terms, the agreements will be read in the following order of priority 
        (i) this Agreement; and (ii) the Seller Terms. Where applicable, you agree that by purchasing a Product, that you will be bound by 
        the Seller Terms for that Product, as described in this clause.</p>
        
        <p>Gizmooz and its Sellers reserve the right to change, suspend or remove any Product offer or other information from the Site at any time.</p>
      `,
    },
    {
      id: 'ordering',
      title: 'Ordering and Delivery',
      content: `
        <p>By ordering Products via the Site, you, the User, agree to purchase the Products you have selected:</p>
        <ul>
          <li>for the purchase price and all other applicable fees and charges as displayed on the Site; and</li>
          <li>in accordance with this Agreement and any applicable Seller Terms, from the relevant Seller or Gizmooz (as applicable).</li>
        </ul>
        
        <p>You may place an order via the purchase functionality contained in the Site and may pay for your Products using the payment methods 
        we allow on the Site (which may include, without limitation, credit card, debit card, PayPal, Apple Pay, Google Pay, Afterpay and Zip). 
        By using third party payment methods, you may be bound by terms and conditions individual to those payment methods. We are not party to 
        these terms and conditions, and are not the providers of these services and are not responsible for them.</p>
        
        <p>The prices of Seller's Products and any associated shipping costs are as set by those individual Sellers and not Gizmooz. Gizmooz 
        and Sellers' prices may change at any time, with or without notice. All prices include GST but do not include delivery costs which, 
        if applicable, will be additional and displayed in cart.</p>
        
        <p>Your order will not be processed until payment is received by Gizmooz in full for the Products you have ordered (including the 
        purchase price, delivery fees, and any other applicable fees and charges). Once received, you agree that the payment will then become 
        the property of Gizmooz. Where applicable, we will then remit an amount equal to the payment to the relevant Seller (or Sellers), less 
        any applicable fees and charges of Gizmooz, as charged to the Sellers.</p>
        
        <p>Orders for Products sold by a Seller are shipped and fulfilled by that Seller from their own distribution centres. Delivery time 
        estimates can be viewed on Product listings or on the Seller's profile page. If no delivery time frame is stated in the Seller Terms 
        or Product listing, then you may contact the Seller to obtain an estimated delivery date. As these delivery time frames are estimates, 
        actual delivery times may vary and some delays in delivery may be unavoidable.</p>
      `,
    },
    {
      id: 'canceling',
      title: 'Canceling Orders',
      content: `
        <p>When an order is placed for Products, we will (i) process your order with our delivery partner(s) if you purchase the Product from us, 
        or (ii) send the order to the Seller for confirmation, at which time they may accept or reject your order if you purchase the Product from 
        a Seller. In some cases, once an order is placed, it may need to be rejected or cancelled prior to dispatch by either us or the Seller. 
        Orders may be cancelled or rejected where:</p>
        <ul>
          <li>Stock is missing or damaged, or the Product is out of stock;</li>
          <li>There is an error in the Product information or price of the Product on the Site;</li>
          <li>The Product is withdrawn for a safety or similar issue.</li>
        </ul>
        
        <p>Where your order is cancelled or rejected, you will be notified by us or the Seller (as applicable), and you will be refunded the 
        purchase price for the order and associated delivery charges for that Product. If an order for a Product from a consolidated order of 
        multiple Products is cancelled, you will still be charged shipping for the other remaining Products in that order that are sent to you.</p>
        
        <p>If you need to cancel an order that you have placed, you must contact (i) Gizmooz if you purchased the Product from us, or (ii) the 
        Seller if you purchased the Product from that Seller, via the Help Centre or through your account. Whether or not an order can be cancelled 
        depends on the status of the order, and any individual Seller Terms or policies. Once an order has been processed, is ready for dispatch 
        or has already been sent, it cannot be cancelled.</p>
        
        <p>Where your order is cancelled, to the maximum extent permitted by law, our maximum liability to you will be the amount paid for the 
        cancelled Product, and any applicable shipping charges.</p>
        
        <p>By using this site, you acknowledge that Gizmooz is intended as a site for direct to consumer sales. We reserve the right to cancel 
        any order where we reasonably believe Products are purchased for the purpose of resale. In the event your order is cancelled under this 
        clause, to the maximum extent permitted by law, Gizmooz will not be liable to you in contract, tort or otherwise for any claim, loss or 
        damage, whether directly or indirectly, arising from the cancellation of your order and our total liability to you will be, in any event, 
        limited to refund of the price paid for your order.</p>
      `,
    },
    {
      id: 'returns',
      title: 'Change of Mind Returns',
      content: `
        <p>Sellers have their own policies and procedures in relation to change of mind returns. You must review your order carefully before 
        placing it because change of mind returns are given at the sole discretion of each Seller and a Seller may refuse to refund or exchange 
        Products for change of mind or errors a User made in their order.</p>
        
        <p>If a Seller allows a return, then the User will need to follow the returns process outlined in the Seller Terms, or any other return 
        procedures or processes described by the Seller from time to time.</p>
        
        <p>For Products sold directly by Gizmooz:</p>
        <ul>
          <li>We may allow a change of mind return where:
            <ul>
              <li>the Product is unused and unopened (including seals being unbroken) and in its original, resalable condition (including the Product packaging);</li>
              <li>The Product is returned to us, at your cost, within 30 days of the Product being delivered to you.</li>
            </ul>
          </li>
          <li>We may refuse a change of mind return on certain Products, including those we classify as 'big and bulky', health products, jewelry, 
          intimates including underwear and swimwear, consumables including food and cosmetics, bedding and pillows, or other similar Products for hygiene reasons.</li>
          <li>If a Product does not meet the above conditions and you return it to us for a change of mind return, you will be responsible for the 
          cost of returning the Product to you.</li>
        </ul>
      `,
    },
    {
      id: 'problems',
      title: 'Problems with Your Products',
      content: `
        <p>All Products sold on Gizmooz come with guarantees that cannot be excluded by law. You are entitled to a replacement or refund for a 
        major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or 
        replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure. Nothing in these terms, or any 
        Seller listed policy or warranty, limits these rights.</p>
        
        <p>If you have a problem with a Product you have purchased on Gizmooz, or generally with the conduct of a Seller, you should first contact 
        the relevant Seller by submitting a ticket to the Seller via your Account. If the Seller is unable or unwilling to resolve your problem, you 
        may escalate your complaint to Gizmooz by following the link in the footer of email correspondence you receive from a Seller and submitting 
        a ticket to the Gizmooz support team in our Help Centre. Gizmooz will seek to assist you in resolving your problem (including, without 
        limitation, by liaising with the Seller on your behalf, investigating your issues, advising on the relevant Seller processes and procedures 
        for Product returns or refunds, or sending the Products to third parties for assessment or repair (if required)). In some circumstances, 
        where we believe it is necessary we may issue remedies to you consistent with your Australian Consumer Law rights, but without assuming 
        responsibility under them.</p>
      `,
    },
    {
      id: 'liability',
      title: 'Liability',
      content: `
        <p>For Products purchased from a Seller, it is the Seller and not Gizmooz, who is responsible to you as the supplier of the Product for 
        providing you with remedies under the Australian Consumer Law for major and non-major failures in respect of those Products.</p>
        
        <p>Without excluding, restricting or modifying the rights and remedies to which you may be entitled under these consumer guarantees 
        provisions of the Australian Consumer Law or Gizmooz's liabilities under those provisions:</p>
        <ul>
          <li>you acknowledge that the Site is provided 'as is' and Gizmooz does not make any representation or warranty in relation to Site that 
          your access and use of the site will be (i) uninterrupted and without error; (ii) free from viruses or defects; or (iii) always available; 
          or (iv) suitable for any purpose;</li>
          <li>we exclude all other implied terms and warranties, whether statutory or otherwise, relating to the Site or the subject matter of this agreement;</li>
          <li>we will not be liable for any claim or any losses that result from (i) things that occur which are outside our reasonable control; 
          (ii) something which is not a breach by us; or (iii) the unavailability or accessibility of our Site;</li>
          <li>we will not be liable to you for indirect and consequential loss arising from or connected to this agreement in contract, tort, 
          under any statute or otherwise (including, without limitation, for loss of revenue, loss of profits, failure to realise expected profits 
          or savings, loss or corruption of data and any other commercial or economic loss of any kind) unless such loss arises as a result of our 
          own negligence or wilful misconduct; and</li>
          <li>our liability to you for loss or damage of any kind arising out of this agreement or in connection with the relationship established 
          by it is reduced to the extent (if any) that you cause or contribute to the loss or damage. This reduction applies whether our liability 
          is in contract, tort (including negligence), under any statute or otherwise.</li>
        </ul>
      `,
    },
    {
      id: 'privacy',
      title: 'Privacy',
      content: `
        <p>Where personal information is provided to Gizmooz, the Privacy Policy of Gizmooz will govern how Gizmooz uses or discloses that information. 
        You acknowledge that Gizmooz may collect and use your personal information in accordance with its Privacy Policy.</p>
      `,
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      content: `
        <p>Unless expressly authorised under this Agreement or otherwise in writing by Gizmooz, Users cannot reproduce, adapt, modify, display, 
        perform, distribute, decompile, disassemble or reverse engineer any material (or part thereof) from the Site (including logos, trademarks, 
        brand features and source code) that is the intellectual property of Gizmooz or intellectual property that Gizmooz has permission to use.</p>
        
        <p>If you provide content to us, you grant Gizmooz an irrevocable and royalty free global license to use, copy, display or distribute the 
        content of any correspondence or communication you provide. This may include (without limitation) public display of testimonials on the Site, 
        reviews of Products posted by Users on the Site or on third party websites, or using ideas or suggestions provided by Users to improve and 
        goods, services, Products which Gizmooz offers.</p>
      `,
    },
    {
      id: 'miscellaneous',
      title: 'Miscellaneous',
      content: `
        <p>This Agreement constitutes the entire agreement between the parties with respect to the subject matter. No waiver by either party of any 
        breach or default hereunder is a waiver of any preceding or subsequent breach or default. The section headings used herein are for convenience 
        only and shall be of no legal force or effect. If any provision of this Agreement is held invalid by a court of competent jurisdiction, such 
        invalidity shall not affect the enforceability of any other provisions contained in this Agreement and the remaining portions of this Agreement 
        shall continue in full force and effect. The failure of either party to exercise any of its rights under this Agreement shall not be deemed a 
        waiver or forfeiture of such rights or any other rights provided hereunder.</p>
        
        <p>This Agreement is governed by and in accordance with the laws of the State of Victoria (exclusive of its rules regarding conflicts of laws). 
        The User and Gizmooz irrevocably submit to the jurisdiction of the Courts of the State of Victoria and their Courts of Appeal in relation to 
        this Agreement.</p>
        
        <p>Users agree and acknowledge that, in the event that there is a change in control in, merger with or sale of Gizmooz or its business to a 
        third party, Gizmooz can disclose personal information or data collected from Users to the third party without giving any notice to Users. 
        Gizmooz is also entitled to assign and novate the benefits of any agreements it has with Users to the third party, without notice to the User.</p>
        
        <p>Gizmooz reserves the right to change or modify this Agreement from time to time. Such modifications are effective immediately upon the 
        earlier of its publication on the Site, and/or the time that it is first communicated to you, however the terms that applied when you placed 
        your order will continue to be apply to that order. Continued use of the Site, or any of the materials or content contained on the Site, the 
        effective date of the change will be deemed to be acceptance by you of the modified version of this Agreement. If you do not agree to these 
        changes, you should not use our Site.</p>
      `,
    },
  ]

  return (
    <div className="bg-white py-16">
      <MaxWidthWrapper>
        {/* Header Section */}
        <div className="mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl -z-10" />
          <div className="max-w-3xl mx-auto text-center px-6 py-16">
            <h1 className="font-serif text-5xl font-medium mb-4 bg-clip-text">
              Terms and Conditions
            </h1>
            <p className="text-gray-600">Last updated: February 27, 2025</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-serif font-medium mb-4 text-gray-900">Contents</h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="hover:text-blue-800 transition-colors py-2 border-b border-gray-100"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.getElementById(section.id)
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-serif font-medium text-gray-900">{section.title}</h2>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                  aria-label={activeSection === section.id ? 'Collapse section' : 'Expand section'}
                >
                  {activeSection === section.id ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div
                className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                  activeSection === section.id
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-[1000px] opacity-100'
                }`}
              >
                <div
                  className="text-gray-700 leading-relaxed prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </section>
          ))}
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
