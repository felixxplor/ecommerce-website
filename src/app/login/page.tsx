import { Login } from '@/client/login'
import MainPolicies from '@/components/main-policies'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Gizmooz',
  alternates: {
    canonical: 'https://www.gizmooz.com/login',
  },
  openGraph: {
    title: 'Login',
    description: 'Login',
    url: 'https://www.gizmooz.com/login',
    type: 'website',
  },
}

export default function LoginPage() {
  return (
    <div className="">
      <Login />
      <MainPolicies className="" />
    </div>
  )
}
