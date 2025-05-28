import { Product, ProductCategory } from '@/graphql'
import { ShopSidebar } from './sidebar'
import { ProductGrid } from '@/client/product-grid'
// import { PaColorPicker } from '@/client/pa-color-picker'
import { ShopCategories } from '@/client/categories'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ShopFilters } from '@/components/filter'
import Link from 'next/link'
import { useState } from 'react'
import { MobileFilterDrawer } from '@/components/mobile-filter-drawer'

export interface ShopProps {
  products: Product[]
  categories?: ProductCategory[]
  // colors: PaColor[]
  categoryName?: string
}

export function Shop(props: ShopProps) {
  const { products, categories, categoryName } = props

  // Display heading based on whether we're on a category page or the main shop page
  const heading = categoryName || 'All products'

  return (
    // Main shop layout with responsive design
    <div className="w-full">
      {/* Hero section with responsive padding and text sizes */}
      <div className="min-h-[200px] sm:min-h-[300px] md:min-h-[420px] bg-[#f6f5f2] p-3 sm:p-4 md:p-6">
        <MaxWidthWrapper className="py-4 sm:py-6 md:py-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium">{heading}</h1>
          <div className="mt-2 sm:mt-4 md:mt-10 text-sm sm:text-base md:text-lg">
            <p>Well designed products for your home & office.</p>
            <p className="hidden sm:block">
              Our high quality products will make your place modern.
            </p>
          </div>
          <div className="mt-4 sm:mt-6 md:mt-10 text-xs sm:text-sm md:text-lg font-medium flex flex-wrap gap-2 sm:gap-3 md:gap-6">
            <Link href="">
              <button className="border border-black rounded-full px-4 sm:px-6 md:px-12 py-1.5 sm:py-2 md:py-3 mb-1 sm:mb-2">
                Best Sellers
              </button>
            </Link>
            <button className="border border-black rounded-full px-4 sm:px-6 md:px-12 py-1.5 sm:py-2 md:py-3 mb-1 sm:mb-2">
              New Arrivals
            </button>
            <button className="border border-black rounded-full px-4 sm:px-6 md:px-12 py-1.5 sm:py-2 md:py-3 mb-1 sm:mb-2">
              Sale
            </button>
          </div>
        </MaxWidthWrapper>
      </div>

      {/* Main content area with responsive layout */}
      <MaxWidthWrapper className="mt-8 sm:mt-12 md:mt-20">
        <div className="flex flex-col lg:flex-row gap-6 py-0 sm:py-6 md:py-8 w-full">
          {/* Filters - Hidden on mobile, shown in sidebar on larger screens */}
          <div className="hidden lg:block">
            <ShopFilters categories={categories} products={products} />
          </div>

          {/* Mobile Filter Drawer - Only visible on small screens */}
          <MobileFilterDrawer categories={categories} products={products} />

          {/* Product grid area - Takes full width on mobile */}
          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
