import ReturnPolicy from '@/server/return-policy'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Return Policy | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/return-policy',
  },
  openGraph: {
    title: 'Return Policy',
    description: 'Return Policy',
    url: 'https://www.gizmooz.com/return-policy',
    type: 'website',
  },
}

export default function ReturnPolicyPage() {
  return (
    <div className="">
      <ReturnPolicy />
      <MainPolicies className="" />
    </div>
  )
}
