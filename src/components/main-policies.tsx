import { ShieldCheck, TicketSlash, Truck } from 'lucide-react'
import MaxWidthWrapper from './max-width-wrapper'
import { cn } from '@/utils/ui'

export default function MainPolicies({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full h-full pt-14 text-2xl font-extrabold text-balance leading-normal',
        className
      )}
    >
      <MaxWidthWrapper className="py-14 border-b border-t">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-5 items-center justify-between text-xl">
          <div className="flex items-center justify-center gap-5">
            <Truck strokeWidth={0.5} className="size-16" />
            <div className="text-sm min-w-[185px]">Free shipping for all orders</div>
          </div>
          <div className="flex items-center justify-center gap-5">
            <TicketSlash strokeWidth={0.5} className="size-16" />
            <div className="text-sm min-w-[185px]">30-day return policy</div>
          </div>
          <div className="flex items-center justify-center gap-5">
            <ShieldCheck strokeWidth={0.5} className="size-16" />
            <div className="text-sm min-w-[185px]">1 year warranty</div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
