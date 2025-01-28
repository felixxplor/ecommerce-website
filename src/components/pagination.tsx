import { useShopContext } from '@/client/shop-provider'
import { cn } from '@/utils/ui'
import Link from 'next/link'

interface Props {
  pageCount: number
}

const RANGE = 2
export default function Pagination({ pageCount }: Props) {
  const { buildUrl, page } = useShopContext()

  const renderPagination = () => {
    let dotBefore = false
    let dotAfter = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span key={`dot-before-${index}`} className="text-gray-500">
            ...
          </span>
        )
      }
    }
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span key={`dot-after-${index}`} className="text-gray-500">
            ...
          </span>
        )
      }
    }
    return Array(pageCount)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        if (
          page <= RANGE * 2 + 1 &&
          page + RANGE < pageNumber &&
          pageCount - RANGE + 1 >= pageNumber
        ) {
          return renderDotBefore(index)
        } else if (
          page >= pageCount - RANGE * 2 &&
          page - RANGE > pageNumber &&
          pageNumber > RANGE
        ) {
          return renderDotAfter(index)
        } else if (page > RANGE * 2 + 1 && page < pageCount - RANGE * 2) {
          if (pageNumber < page - RANGE && pageNumber > RANGE) {
            return renderDotBefore(index)
          } else if (pageNumber > page + RANGE && pageNumber < pageCount - RANGE + 1) {
            return renderDotAfter(index)
          }
        }
        return (
          <Link
            href={buildUrl({ page: pageNumber })}
            key={`page-${pageNumber}`}
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-full text-sm',
              pageNumber === page ? 'border-2 border-black' : 'hover:bg-gray-50'
            )}
          >
            {pageNumber}
          </Link>
        )
      })
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      {page === 1 ? (
        <span className="opacity-50 cursor-not-allowed">←</span>
      ) : (
        <Link href={buildUrl({ page: page - 1 })} className="text-gray-500 hover:text-black">
          ←
        </Link>
      )}

      {renderPagination()}

      {page === pageCount ? (
        <span className="opacity-50 cursor-not-allowed">→</span>
      ) : (
        <Link href={buildUrl({ page: page + 1 })} className="text-gray-500 hover:text-black">
          →
        </Link>
      )}
    </div>
  )
}
