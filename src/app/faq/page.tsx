import FAQ from '@/client/faq'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/faq',
  },
  openGraph: {
    title: 'FAQ',
    description: 'FAQ',
    url: 'https://www.gizmooz.com/faq',
    type: 'website',
  },
}

export default function FAQPage() {
  return (
    <div className="">
      <FAQ />
      <MainPolicies className="" />
    </div>
  )
}
