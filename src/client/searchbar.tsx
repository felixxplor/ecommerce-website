'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useShopContext } from './shop-provider'
import { X, Search } from 'lucide-react'
import { MobileNavigation } from '@/components/ui/menu'

export function SearchBar() {
  const { push } = useRouter()
  const { currentUrl, buildUrl, search } = useShopContext()
  const [searchInput, setSearchInput] = useState(search)
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false)

  // Update search input when URL search changes (for back/forward navigation)
  useEffect(() => {
    setSearchInput(search)
  }, [search])

  // Auto-focus the input when mobile search becomes visible
  useEffect(() => {
    if (mobileSearchVisible) {
      const input = document.getElementById('mobile-search-input')
      if (input) {
        setTimeout(() => input.focus(), 100)
      }
    }
  }, [mobileSearchVisible])

  const performSearch = (searchTerm: string) => {
    const url = buildUrl({
      search: searchTerm,
      page: 1,
    })
    if (url !== currentUrl) {
      push(url)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    performSearch(searchInput)
    setMobileSearchVisible(false)
  }

  const clearSearch = () => {
    setSearchInput('')
    performSearch('')
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
          className="bg-[#F6F5F2] rounded-full items-center hidden lg:flex focus-within:ring-2 focus-within:ring-gray-200"
        >
          <button className="py-2 pl-4 pr-1" type="submit" aria-label="Search">
            <Search className="w-5 h-5 text-gray-500" />
          </button>
          <input
            type="text"
            placeholder="Search products"
            className="text-black py-2 pr-4 flex-grow bg-transparent border-0 outline-none focus:ring-0 focus:outline-none focus:border-0"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="pr-4 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
