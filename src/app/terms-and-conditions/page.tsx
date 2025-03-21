import TermsAndConditions from '@/client/terms'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/terms-and-conditions',
  },
  openGraph: {
    title: 'Terms and Conditions ',
    description: 'Terms and Conditions ',
    url: 'https://www.gizmooz.com/terms-and-conditions',
    type: 'website',
  },
}

export default function TermsAndConditionsPage() {
  return (
    <div className="">
      <TermsAndConditions />
      <MainPolicies className="" />
    </div>
  )
}
