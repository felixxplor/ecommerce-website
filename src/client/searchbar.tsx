'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { useShopContext } from './shop-provider'
import { Menu } from '@/components/ui/menu'
import { X } from 'lucide-react' // Import X icon from lucide-react
import { useDebounce } from '@/hooks/use-debounce' // Create this hook

export function SearchBar() {
  const { push } = useRouter()
  const { currentUrl, buildUrl, search } = useShopContext()
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 500) // Debounce search input

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
  }, [debouncedSearch])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const url = buildUrl({
      search: searchInput,
      page: 1,
    })
    if (url !== currentUrl) {
      push(url)
    }
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

  return (
    <form className="flex items-center order-1 lg:order-none" onSubmit={handleSubmit}>
      <Menu />
      <button type="submit" className="py-2 px-6 lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#09090B"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
      <div
        tabIndex={0}
        className="bg-[#F6F5F2] rounded-full py-1 px-4 focus-within:outline-none focus-within:outline-2 focus-within:outline-gray-200 focus-within:outline-offset-0 hidden lg:block"
      >
        <div className="flex items-center relative">
          <button className="py-2 px-6" type="submit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#09090B"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
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
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
