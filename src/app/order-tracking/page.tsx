import OrderTracking from '@/client/tracking'
import MainPolicies from '@/components/main-policies'
import AboutUs from '@/server/about-us'

export default function TrackingPage() {
  return (
    <div className="">
      <OrderTracking />
      <MainPolicies className="" />
    </div>
  )
}
