'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useSession } from '@/client/session-provider'
import { Lock, Truck, User } from 'lucide-react'
import { cn } from '@/utils/ui'
import { changePassword } from '@/utils/session'
import Navbar from '@/components/navbar'
import PasswordChangeForm from '@/components/password-change-form'

type TabType = 'personal' | 'password' | 'shipping'

interface Customer {
  firstName: string
  lastName: string
  email: string
  shipping?: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    state: string
    postcode: string
    country: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { refetch } = useSession()

  useEffect(() => {
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    if (!authToken) {
      router.replace('/login?returnUrl=/account/profile')
      return
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/customer', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch customer data')
        }

        const data = await response.json()
        setCustomer(data.customer)
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile information',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSaving(true)
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    try {
      const response = await fetch('/api/customer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        }),
      })

      if (!response.ok) throw new Error('Failed to update profile')

      const data = await response.json()
      setCustomer(data.customer)

      await refetch()

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New passwords do not match',
      })
      return
    }

    setIsSaving(true)

    try {
      const result = await changePassword(currentPassword, newPassword)

      // changePassword returns true for success, string for error
      if (result === true) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        })

        // Reset form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        // If result is a string, it's an error message
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result,
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShippingUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    setIsSaving(true)
    const authToken = sessionStorage.getItem(process.env.AUTH_TOKEN_SS_KEY as string)

    try {
      const response = await fetch('/api/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          shipping: customer.shipping,
        }),
      })

      if (!response.ok) throw new Error('Failed to update shipping address')

      const data = await response.json()
      setCustomer(data.customer)

      await refetch()

      toast({
        title: 'Success',
        description: 'Shipping address updated successfully',
      })
    } catch (error) {
      console.error('Error updating shipping:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update shipping address',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <form onSubmit={handleProfileUpdate}>
            <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  value={customer?.firstName || ''}
                  onChange={(e) => setCustomer((prev) => ({ ...prev!, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  value={customer?.lastName || ''}
                  onChange={(e) => setCustomer((prev) => ({ ...prev!, lastName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={customer?.email || ''}
                  onChange={(e) => setCustomer((prev) => ({ ...prev!, email: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )
      case 'password':
        return <PasswordChangeForm />
      case 'shipping':
        return (
          <form onSubmit={handleShippingUpdate}>
            <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <Input
                  id="address1"
                  value={customer?.shipping?.address1 || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev!,
                      shipping: {
                        ...prev!.shipping!,
                        address1: e.target.value,
                      },
                    }))
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <Input
                  id="address2"
                  value={customer?.shipping?.address2 || ''}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev!,
                      shipping: {
                        ...prev!.shipping!,
                        address2: e.target.value,
                      },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    id="city"
                    value={customer?.shipping?.city || ''}
                    onChange={(e) =>
                      setCustomer((prev) => ({
                        ...prev!,
                        shipping: {
                          ...prev!.shipping!,
                          city: e.target.value,
                        },
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    id="state"
                    value={customer?.shipping?.state || ''}
                    onChange={(e) =>
                      setCustomer((prev) => ({
                        ...prev!,
                        shipping: {
                          ...prev!.shipping!,
                          state: e.target.value,
                        },
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="postcode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <Input
                    id="postcode"
                    value={customer?.shipping?.postcode || ''}
                    onChange={(e) =>
                      setCustomer((prev) => ({
                        ...prev!,
                        shipping: {
                          ...prev!.shipping!,
                          postcode: e.target.value,
                        },
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Input
                    id="country"
                    value={customer?.shipping?.country || ''}
                    onChange={(e) =>
                      setCustomer((prev) => ({
                        ...prev!,
                        shipping: {
                          ...prev!.shipping!,
                          country: e.target.value,
                        },
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )
    }
  }

  return (
    <>
      <MaxWidthWrapper className="py-14">
        <div className="min-h-[600px]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <Link href="/account">
              <Button variant="outline">Back to Account</Button>
            </Link>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 shrink-0">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md',
                      activeTab === 'personal'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <User className="h-5 w-5" />
                    Personal Details
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md',
                      activeTab === 'shipping'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Truck className="h-5 w-5" />
                    Shipping Address
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={cn(
                      'w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md',
                      activeTab === 'password'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Lock className="h-5 w-5" />
                    Change Password
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white p-6 rounded-lg shadow-sm">{renderContent()}</div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  )
}
