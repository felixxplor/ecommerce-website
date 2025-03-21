import ContactUs from '@/client/contact-us'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/contact-us',
  },
  openGraph: {
    title: 'Contact Us',
    description: 'Contact Us',
    url: 'https://www.gizmooz.com/contact-us',
    type: 'website',
  },
}

export default function ContactUsPage() {
  return (
    <div className="">
      <ContactUs />
      <MainPolicies className="" />
    </div>
  )
}
