// app/account/addresses/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'

interface Address {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  postcode: string
  country: string
}

interface CustomerAddresses {
  shipping: Address
}

export default function AddressesPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<CustomerAddresses | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    if (!authToken) {
      router.replace('/login?returnUrl=/account/addresses')
      return
    }

    const fetchAddresses = async () => {
      try {
        const response = await fetch('/api/addresses', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch addresses')
        const data = await response.json()
        setAddresses(data.addresses)
      } catch (error) {
        console.error('Error fetching addresses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <MaxWidthWrapper className="py-14">
      <div className="min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <Link href="/account">
            <Button variant="outline">Back to Account</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Shipping Address</h2>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
            {addresses?.shipping && (
              <p className="text-gray-600">
                {addresses.shipping.firstName} {addresses.shipping.lastName}
                <br />
                {addresses.shipping.address1}
                {addresses.shipping.address2 && (
                  <>
                    <br />
                    {addresses.shipping.address2}
                  </>
                )}
                <br />
                {addresses.shipping.city}, {addresses.shipping.state} {addresses.shipping.postcode}
                <br />
                {addresses.shipping.country}
              </p>
            )}
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}
