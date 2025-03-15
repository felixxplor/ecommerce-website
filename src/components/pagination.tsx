import { useShopContext } from '@/client/shop-provider'
import { cn } from '@/utils/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2">
      {/* Previous button with better styling */}
      {page === 1 ? (
        <button
          disabled
          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          <span className="sr-only">Previous</span>
        </button>
      ) : (
        <Link
          href={buildUrl({ page: page - 1 })}
          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
          <span className="sr-only">Previous</span>
        </Link>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1 sm:gap-2">{renderPagination()}</div>

      {/* Next button with better styling */}
      {page === pageCount ? (
        <button
          disabled
          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 cursor-not-allowed"
        >
          <ChevronRight size={16} />
          <span className="sr-only">Next</span>
        </button>
      ) : (
        <Link
          href={buildUrl({ page: page + 1 })}
          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-700 hover:bg-gray-100"
        >
          <ChevronRight size={16} />
          <span className="sr-only">Next</span>
        </Link>
      )}
    </div>
  )
}
