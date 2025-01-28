// app/search/page.tsx
import { Suspense } from 'react'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SearchBar } from '@/client/searchbar'
import { SearchResults } from '@/components/search-results'

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = typeof searchParams.query === 'string' ? searchParams.query : ''

  return (
    <MaxWidthWrapper>
      <div className="py-14 space-y-10">
        <SearchBar />
        <Suspense
          fallback={
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      </div>
    </MaxWidthWrapper>
  )
}
