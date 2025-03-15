'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useShopContext } from './shop-provider'
import { X, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { MobileNavigation } from '@/components/ui/menu'

export function SearchBar() {
  const { push } = useRouter()
  const { currentUrl, buildUrl, search } = useShopContext()
  const [searchInput, setSearchInput] = useState(search)
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false)
  const debouncedSearch = useDebounce(searchInput, 500)

  // Handle search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== search) {
      const url = buildUrl({
        search: debouncedSearch,
        page: 1,
      })
      if (url !== currentUrl) {
        push(url)
      }
    }
  }, [debouncedSearch, search, buildUrl, currentUrl, push])

  // Auto-focus the input when mobile search becomes visible
  useEffect(() => {
    if (mobileSearchVisible) {
      const input = document.getElementById('mobile-search-input')
      if (input) {
        setTimeout(() => input.focus(), 100)
      }
    }
  }, [mobileSearchVisible])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const url = buildUrl({
      search: searchInput,
      page: 1,
    })
    if (url !== currentUrl) {
      push(url)
    }
    setMobileSearchVisible(false)
  }

  const clearSearch = () => {
    setSearchInput('')
    const url = buildUrl({
      search: '',
      page: 1,
    })
    if (url !== currentUrl) {
      push(url)
    }
  }

  const toggleMobileSearch = () => {
    setMobileSearchVisible(!mobileSearchVisible)
  }

  return (
    <>
      <form className="flex items-center order-1 lg:order-none relative" onSubmit={handleSubmit}>
        <MobileNavigation />

        {/* Mobile search icon button */}
        <button
          type="button"
          className="py-2 px-6 lg:hidden"
          onClick={toggleMobileSearch}
          aria-label="Toggle search"
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Desktop search input (always visible on desktop) */}
        <div
          tabIndex={0}
          className="bg-[#F6F5F2] rounded-full py-1 px-4 focus-within:outline-none focus-within:outline-2 focus-within:outline-gray-200 focus-within:outline-offset-0 hidden lg:block"
        >
          <div className="flex items-center relative">
            <button className="py-2 px-6" type="submit">
              <Search className="w-6 h-6" />
            </button>
            <input
              tabIndex={0}
              type="text"
              placeholder="Search products"
              className="text-black px-3 py-2 flex-grow border-none outline-none bg-transparent"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Mobile search bar - full width below navbar */}
      {mobileSearchVisible && (
        <div className="fixed top-16 left-0 right-0 w-full bg-white shadow-md z-40 py-3 px-4 lg:hidden animate-slide-down">
          <form onSubmit={handleSubmit} className="flex items-center max-w-screen-xl mx-auto">
            <input
              id="mobile-search-input"
              type="text"
              placeholder="Search products"
              className="flex-grow border border-gray-200 rounded-l-md p-2 h-10 focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button
              type="submit"
              className="bg-gray-100 p-2 h-10 rounded-r-md border border-l-0 border-gray-200"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="flex ml-2">
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-2 rounded-md hover:bg-gray-100 h-10 w-10 flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileSearchVisible(false)}
                className="p-2 ml-2 rounded-md hover:bg-gray-100 h-10 w-10 flex items-center justify-center"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
