// app/order-confirmation/page.tsx
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

// Add the searchParams prop to the component
export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="">
      <MainPolicies className="" />
    </div>
  )
}
