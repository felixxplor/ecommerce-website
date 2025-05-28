'use client'

import { useState, useEffect } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShopFilters } from './filter'
import { Product, ProductCategory } from '@/graphql'

interface MobileFilterDrawerProps {
  categories?: ProductCategory[]
  // colors: PaColor[]
  products: Product[]
}

export function MobileFilterDrawer({ categories, products }: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close drawer on escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen])

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden w-full mb-4">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full flex items-center justify-between border border-gray-300"
          aria-expanded={isOpen}
          aria-controls="filter-drawer"
        >
          <span>Filters</span>
          <SlidersHorizontal size={18} />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="filter-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Filter options"
        className={`
          fixed bottom-0 inset-x-0 lg:hidden z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="bg-white rounded-t-xl shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="font-medium">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters content */}
          <div className="p-4">
            <ShopFilters categories={categories} products={products} />
          </div>

          {/* Footer with apply/close buttons */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button className="flex-1" onClick={() => setIsOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
