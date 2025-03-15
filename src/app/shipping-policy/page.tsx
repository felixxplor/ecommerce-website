import ShippingPolicy from '@/server/shipping'
import MainPolicies from '@/components/main-policies'

export default function ShippingPolicyPage() {
  return (
    <div className="">
      <ShippingPolicy />
      <MainPolicies className="" />
    </div>
  )
}
