import OrderConfirmation from '@/client/order-confirmation'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmation | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/order-confirmation',
  },
  openGraph: {
    title: 'Order Confirmation',
    description: 'Order Confirmation',
    url: 'https://www.gizmooz.com/order-confirmation',
    type: 'website',
  },
}

export default function OrderConfirmationPage() {
  return (
    <div className="">
      <OrderConfirmation />
      <MainPolicies className="" />
    </div>
  )
}
