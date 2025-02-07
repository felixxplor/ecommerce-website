import { Product, ProductCategory, PaColor } from '@/graphql'
import { ShopSidebar } from './sidebar'
import { ProductGrid } from '@/client/product-grid'
import { PaColorPicker } from '@/client/pa-color-picker'
import { ShopCategories } from '@/client/categories'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ShopFilters } from '@/components/filter'

export interface ShopProps {
  products: Product[]
  categories?: ProductCategory[]
  colors: PaColor[]
}

export function Shop(props: ShopProps) {
  const { products, categories, colors } = props
  console.log('products', products)

  return (
    <div className="">
      <div className="min-h-[420px] bg-[#f6f5f2] p-6">
        <MaxWidthWrapper className="py-10">
          <h1 className="text-5xl font-medium">All products</h1>
          <div className="mt-10 text-lg">
            <p>Well designed products for your home & office.</p>
            <p>Our high quality products will make your place modern.</p>
          </div>
          <div className="mt-10 text-lg font-medium flex gap-6">
            <button className="border border-black rounded-full px-12 py-3">Home decor</button>
            <button className="border border-black rounded-full px-12 py-3">Lightings</button>
            <button className="border border-black rounded-full px-12 py-3">Smart devices</button>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper className="flex mt-20">
        <div className="flex gap-8 py-8 w-full">
          <ShopFilters categories={categories} products={products} colors={colors} />
          <div className="flex-1">
            <ProductGrid products={products} />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}
