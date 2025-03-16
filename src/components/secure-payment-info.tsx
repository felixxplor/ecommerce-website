import React from 'react'
import Image from 'next/image'

export const SecurePaymentInfo = () => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex flex-col space-y-2">
        <p className="text-sm text-gray-600 font-medium">Secure ways to pay at checkout</p>
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center h-8 w-14 bg-white rounded border border-gray-200">
            <Image
              src="/logo-mastercard.svg"
              alt="Mastercard"
              width={40}
              height={30}
              className="object-contain w-auto"
              style={{ height: 'auto' }}
            />
          </div>
          <div className="flex items-center justify-center h-8 w-14 bg-white rounded border border-gray-200">
            <Image
              src="/logo-visa.svg"
              alt="Visa"
              width={40}
              height={30}
              className="object-contain w-auto"
            />
          </div>
          <div className="flex items-center justify-center h-8 w-14 bg-white rounded border border-gray-200">
            <Image
              src="/logo-amex.svg"
              alt="American Express"
              width={40}
              height={30}
              className="object-contain w-auto"
            />
          </div>
          <div className="flex items-center justify-center h-8 w-14 bg-white rounded border border-gray-200">
            <Image
              src="/logo-paypal.svg"
              alt="PayPal"
              width={40}
              height={30}
              className="object-contain w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurePaymentInfo
