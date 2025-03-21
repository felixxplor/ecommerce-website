import Checkout from '@/client/checkout'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/checkout',
  },
  openGraph: {
    title: 'Checkout',
    description: 'Checkout',
    url: 'https://www.gizmooz.com/checkout',
    type: 'website',
  },
}

export default function CheckoutPage() {
  return (
    <div className="">
      <Checkout />
      <MainPolicies className="" />
    </div>
  )
}
