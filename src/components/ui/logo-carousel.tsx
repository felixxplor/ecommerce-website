'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

export default function LogoCarousel() {
  const [activeLogo, setActiveLogo] = useState(0)
  const intervalDuration = 2500

  // Organized logo data structure
  const logoColumns = [
    [
      { label: 'Amazon', url: '/Amazon.svg' },
      { label: 'Sydney', url: '/Sydney.svg' },
      { label: 'Bloomberg', url: '/Bloomberg.svg' },
      { label: 'Guardian', url: '/Guardian.svg' },
      { label: 'Insider', url: '/Insider.svg' },
      { label: 'Medium', url: '/Medium.svg' },
    ],
    [
      { label: 'Afterpay', url: '/Afterpay.svg' },
      { label: 'Facebook', url: '/Facebook.svg' },
      { label: 'Google', url: '/Google.svg' },
      { label: 'PayPal', url: '/PayPal.svg' },
      { label: 'Shopify', url: '/Shopify.svg' },
      { label: 'Stripe', url: '/Stripe.svg' },
    ],
    [
      { label: 'GooglePay', url: '/GooglePay.svg' },
      { label: 'Microsoft', url: '/Microsoft.svg' },
      { label: 'Reddit', url: '/Reddit.svg' },
      { label: 'Visa', url: '/Visa.svg' },
      { label: 'Yahoo', url: '/Yahoo.svg' },
      { label: 'AusPost', url: '/AusPost.svg' },
    ],
    [
      { label: 'Zip', url: '/Zip.svg' },
      { label: 'FedEx', url: '/FedEx.svg' },
      { label: 'Sendle', url: '/Sendle.svg' },
      { label: 'Mastercard', url: '/Mastercard.svg' },
      { label: 'Discord', url: '/Discord.svg' },
      { label: 'ApplePay', url: '/ApplePay.svg' },
    ],
    [
      { label: 'Amex', url: '/Amex.svg' },
      { label: 'Oz', url: '/Oz.svg' },
      { label: '7', url: '/7.svg' },
      { label: 'ABC', url: '/ABC.svg' },
      { label: 'Westfield', url: '/Westfield.svg' },
      { label: 'Medium', url: '/Medium.svg' },
    ],
  ]

  const totalLogos = logoColumns[0].length

  // Handle automatic rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogo((prev) => (prev === totalLogos - 1 ? 0 : prev + 1))
    }, intervalDuration)

    return () => clearInterval(interval)
  }, [totalLogos])

  // Animation classes based on logo index
  const getLogoClasses = useCallback(
    (index: number) => {
      if (index === activeLogo) {
        // Active logo (visible)
        return 'opacity-100 translate-y-0 duration-700'
      } else if (
        index === (activeLogo + 1) % totalLogos || // Next logo
        index === (activeLogo - 1 + totalLogos) % totalLogos // Previous (last) logo
      ) {
        return 'opacity-0 translate-y-[2.5rem]'
      } else {
        // Fully hidden logos
        return 'opacity-0'
      }
    },
    [activeLogo, totalLogos]
  )

  return (
    <div className="relative mx-auto py-0 sm:py-6">
      {/* Logo Grid */}
      <div
        role="group"
        tabIndex={0}
        className="max-w-container relative grid grid-cols-5 gap-5 mt-8 md:mt-0 md:gap-0 mx-5 border-t border-b border-gray-100 py-8"
      >
        {logoColumns.map((logoSet, colIndex) => (
          <div
            key={colIndex}
            className="relative aspect-[3/2] flex flex-col items-center justify-center"
          >
            {logoSet.map((logo, index) => (
              <div
                key={index}
                aria-label={logo.label}
                className={`absolute top-0 left-0 w-full h-full flex justify-center items-center transition-all ease-in-out ${getLogoClasses(
                  index
                )}`}
                style={{
                  transitionDelay: '600ms',
                }}
              >
                <div className="w-full max-w-[7.5rem] mx-auto aspect-square relative p-3">
                  <Image
                    src={logo.url}
                    alt={logo.label}
                    fill
                    sizes="(max-width: 768px) 20vw, (max-width: 1200px) 15vw, 12vw"
                    className="grayscale hover:grayscale-0 transition-all duration-300 object-contain opacity-80 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
