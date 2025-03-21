import MainPolicies from '@/components/main-policies'
import PrivacyPolicy from '@/server/privacy'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Privacy Policy',
    url: 'https://www.gizmooz.com/privacy-policy',
    type: 'website',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="">
      <PrivacyPolicy />
      <MainPolicies className="" />
    </div>
  )
}
