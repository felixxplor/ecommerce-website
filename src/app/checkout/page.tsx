// app/checkout/page.tsx
import { Suspense } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CheckoutClient } from '@/client/checkout'

// This is a server component
export default function CheckoutPage() {
  return (
    <MaxWidthWrapper className="py-4 md:py-14">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
            <p className="mt-4 text-gray-600">Loading checkout...</p>
          </div>
        }
      >
        <CheckoutClient />
      </Suspense>

      {/* Add the session debug component */}
      {process.env.NODE_ENV !== 'production'}
    </MaxWidthWrapper>
  )
}
