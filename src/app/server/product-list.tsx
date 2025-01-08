import { Product, ProductCategory, PaColor } from '@/graphql'
import { ShopSidebar } from './sidebar'
import { ProductListing } from '@/client/product-detail'
import { SearchBar } from '@/client/searchbar'
import { PaColorPicker } from '@/client/pa-color-picker'
import { ShopCategories } from '@/client/categories'

export interface ShopProps {
  products: Product[]
  categories?: ProductCategory[]
  colors: PaColor[]
}

export function Shop(props: ShopProps) {
  const { products, categories, colors } = props

  return (
    <div className="">
      <div className="min-h-[420px] bg-[#f6f5f2] p-6">
        <div className="py-10">
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
        </div>
      </div>
      <div className="flex mt-20">
        <ShopSidebar>
          {categories && (
            <>
              <p className="font-serif text-lg font-bold mb-2">Categories</p>
              <ShopCategories categories={categories} />
            </>
          )}
          <p className="font-serif text-lg font-bold mb-2">Colors</p>
          <PaColorPicker colors={colors} />
        </ShopSidebar>
        <div className="w-full px-4 lg:w-5/6">
          {/* <p className="font-serif text-lg font-bold mb-2">Results</p> */}
          <ProductListing products={products} />
        </div>
      </div>
    </div>
  )
}
