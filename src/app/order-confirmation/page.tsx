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

// Updated interface for Next.js 15 - searchParams is now a Promise
interface OrderConfirmationPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Updated component to await searchParams
export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams

  return (
    <div className="">
      <MainPolicies className="" />
    </div>
  )
}
