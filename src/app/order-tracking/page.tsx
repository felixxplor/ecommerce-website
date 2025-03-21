import OrderTracking from '@/client/tracking'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Tracking | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/order-tracking',
  },
  openGraph: {
    title: 'Order Tracking',
    description: 'Order Tracking',
    url: 'https://www.gizmooz.com/order-tracking',
    type: 'website',
  },
}

export default function TrackingPage() {
  return (
    <div className="">
      <OrderTracking />
      <MainPolicies className="" />
    </div>
  )
}
