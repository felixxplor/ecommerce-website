import { ShopProvider } from '@/client/shop-provider'
import { fetchProducts, fetchCategories, fetchColors } from '@/graphql'
import { Shop } from '../../server/product-list'
import Navbar from '@/components/navbar'

export default async function ShopPage() {
  const products = await fetchProducts(20, 0)
  const categories = (await fetchCategories(20, 0, { hideEmpty: true })) || []
  const colors = (await fetchColors(20, 0, { hideEmpty: true })) || []

  if (!products) return <h1>Page not found</h1>

  return (
    <>
      <ShopProvider allProducts={products}>
        <Shop products={products} categories={categories} colors={colors} />
      </ShopProvider>
    </>
  )
}
