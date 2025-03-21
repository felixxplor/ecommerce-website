import { Register } from '@/client/register'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/register',
  },
  openGraph: {
    title: 'Register',
    description: 'Register',
    url: 'https://www.gizmooz.com/register',
    type: 'website',
  },
}

export default function RegisterPage() {
  return (
    <div className="">
      <Register />
      <MainPolicies className="" />
    </div>
  )
}
