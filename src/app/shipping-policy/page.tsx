import ShippingPolicy from '@/server/shipping'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/shipping-policy',
  },
  openGraph: {
    title: 'Shipping Policy',
    description: 'Shipping Policy',
    url: 'https://www.gizmooz.com/shipping-policy',
    type: 'website',
  },
}

export default function ShippingPolicyPage() {
  return (
    <div className="">
      <ShippingPolicy />
      <MainPolicies className="" />
    </div>
  )
}
