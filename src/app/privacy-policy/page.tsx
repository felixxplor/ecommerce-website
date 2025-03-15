import MainPolicies from '@/components/main-policies'
import PrivacyPolicy from '@/server/privacy'

export default function PrivacyPolicyPage() {
  return (
    <div className="">
      <PrivacyPolicy />
      <MainPolicies className="" />
    </div>
  )
}
