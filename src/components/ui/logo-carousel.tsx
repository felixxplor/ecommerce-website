'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LogoCarousel() {
  const [activeLogo, setActiveLogo] = useState(0)

  const logo1 = [
    { label: 'Amazon', url: '/Amazon.svg' },
    { label: 'Sydney', url: '/Sydney.svg' },
    { label: 'Bloomberg', url: '/Bloomberg.svg' },
    { label: 'Guardian', url: '/Guardian.svg' },
    { label: 'Insider', url: '/Insider.svg' },
    { label: 'Medium', url: '/Medium.svg' },
  ]

  const logo2 = [
    { label: 'Afterpay', url: '/Afterpay.svg' },
    { label: 'Facebook', url: '/Facebook.svg' },
    { label: 'Google', url: '/Google.svg' },
    { label: 'PayPal', url: '/PayPal.svg' },
    { label: 'Shopify', url: '/Shopify.svg' },
    { label: 'Stripe', url: '/Stripe.svg' },
  ]

  const logo3 = [
    { label: 'GooglePay', url: '/GooglePay.svg' },
    { label: 'Microsoft', url: '/Microsoft.svg' },
    { label: 'Reddit', url: '/Reddit.svg' },
    { label: 'Visa', url: '/Visa.svg' },
    { label: 'Yahoo', url: '/Yahoo.svg' },
    { label: 'AusPost', url: '/AusPost.svg' },
  ]

  const logo4 = [
    { label: 'Zip', url: '/Zip.svg' },
    { label: 'FedEx', url: '/FedEx.svg' },
    { label: 'Sendle', url: '/Sendle.svg' },
    { label: 'Mastercard', url: '/Mastercard.svg' },
    { label: 'Discord', url: '/Discord.svg' },
    { label: 'ApplePay', url: '/ApplePay.svg' },
  ]

  const logo5 = [
    { label: 'Amex', url: '/Amex.svg' },
    { label: 'Oz', url: '/Oz.svg' },
    { label: '7', url: '/7.svg' },
    { label: 'ABC', url: '/ABC.svg' },
    { label: 'Westfield', url: '/Westfield.svg' },
    { label: 'Medium', url: '/Medium.svg' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLogo((prev) => (prev === logo1.length - 1 ? 0 : prev + 1))
    }, 3500) //
    return () => clearInterval(interval)
  }, [logo1.length])

  const getLogoClasses = (index: number) => {
    if (index === activeLogo) {
      // Active logo (visible)
      return 'opacity-100 translate-y-0 duration-[6000ms]' // Extended animation duration
    } else if (
      index === (activeLogo + 1) % logo1.length || // Next logo
      index === (activeLogo - 1 + logo1.length) % logo1.length // Previous (last) logo
    ) {
      return 'opacity-0 translate-y-[2.5rem]' // No animation for next and last logo
    } else {
      // Fully hidden logos
      return 'opacity-0'
    }
  }

  return (
    <div
      role="group"
      tabIndex={0}
      className="max-w-container relative grid grid-cols-5 gap-5 mt-8 md:mt-0 md:gap-0 mx-5"
    >
      {[logo1, logo2, logo3, logo4, logo5].map((logoSet, colIndex) => (
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
              <div className="w-full max-w-[7.5rem] mx-auto aspect-square relative">
                <Image src={logo.url} alt={logo.label} fill className="grayscale object-contain" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
