'use client'

import { usePathname } from 'next/navigation'
import { Product, ProductCategory, PaColor } from '@/graphql'
import { ShopSidebar } from './sidebar'
import { ProductGrid } from '@/client/product-grid'
import { PaColorPicker } from '@/client/pa-color-picker'
import { ShopCategories } from '@/client/categories'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ShopFilters } from '@/components/filter'
import Link from 'next/link'
import { useState } from 'react'
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer'
import { cn } from '@/utils/ui'

export interface ShopProps {
  products: Product[]
  categories?: ProductCategory[]
  colors: PaColor[]
  categoryName?: string
}

export function Shop(props: ShopProps) {
  const { products, categories, colors, categoryName } = props
  const pathname = usePathname()

  // Display heading based on whether we're on a category page or the main shop page
  const heading = categoryName || 'All Products'

  // Navigation items with their paths
  const navigationItems = [
    { href: '/collections', label: 'All Products' },
    { href: '/collections/best-sellers', label: 'Best Sellers' },
    { href: '/collections/new-arrivals', label: 'New Arrivals' },
    { href: '/collections/sales', label: 'Sales' },
  ]

  // Function to check if a navigation item is active
  const isActive = (href: string) => {
    if (href === '/collections') {
      // For "All Products", only match exact path or base collections path
      return pathname === '/collections' || pathname === '/collections/'
    }
    return pathname === href || pathname === href + '/'
  }

  return (
    // Main shop layout with responsive design
    <div className="w-full">
      {/* Hero section with responsive padding and text sizes */}
      <div className="min-h-[200px] sm:min-h-[300px] md:min-h-[420px] bg-[#f6f5f2] p-3 sm:p-4 md:p-6">
        <MaxWidthWrapper className="py-4 sm:py-6 md:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium">{heading}</h1>
          <div className="mt-2 sm:mt-4 md:mt-10 text-sm sm:text-base md:text-lg">
            <p>Well designed products for your home & office</p>
            <p className="hidden sm:block">Our high quality products will make your place modern</p>
          </div>
          <div className="mt-4 sm:mt-6 md:mt-10 text-xs sm:text-sm md:text-lg font-medium flex flex-wrap gap-2 sm:gap-3 md:gap-6">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    'border border-black rounded-full px-4 sm:px-6 md:px-12 py-1.5 sm:py-2 md:py-3 mb-1 sm:mb-2 transition-all duration-300 ease-in-out transform',
                    isActive(item.href)
                      ? 'bg-black text-white shadow-lg hover:bg-gray-800 hover:scale-105 hover:shadow-xl'
                      : 'bg-transparent text-black hover:bg-black hover:text-white hover:scale-105 hover:shadow-md'
                  )}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>

      {/* Main content area with responsive layout */}
      <MaxWidthWrapper className="mt-8 sm:mt-12 md:mt-20">
        <div className="flex flex-col lg:flex-row gap-6 py-0 sm:py-6 md:py-8 w-full">
          {/* Filters - Hidden on mobile, shown in sidebar on larger screens */}
          <div className="hidden lg:block">
            <ShopFilters categories={categories} products={products} colors={colors} />
          </div>

          {/* Mobile Filter Drawer - Only visible on small screens */}
          <MobileFilterDrawer categories={categories} products={products} colors={colors} />

          {/* Product grid area - Takes full width on mobile */}
          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
