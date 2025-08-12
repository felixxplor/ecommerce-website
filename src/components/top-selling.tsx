import TopSellingProductsClient from '@/client/top-seliing-client'
import { fetchProducts } from '@/graphql'

export default async function TopSellingProducts({
  title = 'Handpicked lights',
}: {
  title?: string
}) {
  // Fetch products from your existing function on the server
  const products = await fetchProducts(20, 5)

  if (!products || products.length === 0) {
    return null
  }

  // Pass the products to the client component for interactive features
  return <TopSellingProductsClient products={products} title={title} />
}
