import Cart from '@/client/cart'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/cart',
  },
  openGraph: {
    title: 'Cart',
    description: 'Cart',
    url: 'https://www.gizmooz.com/cart',
    type: 'website',
  },
}

export default function CartPage() {
  return (
    <div className="">
      <Cart />
      <MainPolicies className="" />
    </div>
  )
}
