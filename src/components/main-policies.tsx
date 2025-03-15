import { ShieldCheck, TruckIcon, RefreshCcw } from 'lucide-react'
import MaxWidthWrapper from './max-width-wrapper'
import { cn } from '@/utils/ui'

interface PolicyItemProps {
  icon: React.ReactNode
  title: string
  description: string
}

const PolicyItem = ({ icon, title, description }: PolicyItemProps) => (
  <div className="flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-sm">
    <div className="mb-4 text-blue-600 bg-blue-50 p-5 rounded-full">{icon}</div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
)

export default function MainPolicies({ className }: { className?: string }) {
  const policies = [
    {
      icon: <TruckIcon strokeWidth={1.5} className="size-8" />,
      title: 'Free Shipping',
      description:
        'Enjoy free standard shipping on all orders within Australia, no minimum purchase required.',
    },
    {
      icon: <RefreshCcw strokeWidth={1.5} className="size-8" />,
      title: '30-Day Returns',
      description:
        'Not completely satisfied? Return any item within 30 days for a full refund or exchange.',
    },
    {
      icon: <ShieldCheck strokeWidth={1.5} className="size-8" />,
      title: '1 Year Warranty',
      description:
        'All our products come with a comprehensive 1-year warranty for your peace of mind.',
    },
  ]

  return (
    <div className={cn('relative w-full bg-white py-8 sm:py-12', className)}>
      <MaxWidthWrapper className="px-0 sm:px-6 xl:px-0">
        <div className="border-t border-gray-200 w-full mb-8 sm:mb-14"></div>
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-medium mb-2">
            <span className="bg-clip-text">Shop With Confidence</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            At Gizmooz, we stand behind our products and services with policies that put you first.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {policies.map((policy, index) => (
            <PolicyItem
              key={index}
              icon={policy.icon}
              title={policy.title}
              description={policy.description}
            />
          ))}
        </div>
        <div className="border-b border-gray-200 w-full mt-8 sm:mt-14"></div>
      </MaxWidthWrapper>
    </div>
  )
}
