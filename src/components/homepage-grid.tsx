import HomepageGridClient from '@/client/homepage-grid-client'
import { fetchProducts, fetchCategories } from '@/graphql'

export default async function HomepageGrid({ title = 'Featured Products' }: { title?: string }) {
  try {
    // Fetch both products and categories on the server
    const [products, categories] = await Promise.all([
      fetchProducts(20, 0), // Fetch more products to have variety
      fetchCategories(10, 0, {
        hideEmpty: true, // Only show categories with products
        exclude: [], // Add any category IDs you want to exclude
      }),
    ])

    console.log('Fetched products count:', products?.length)
    console.log('Fetched categories:', categories)
    console.log(
      'Raw categories data:',
      categories?.map((cat) => ({ name: cat.name, slug: cat.slug, count: cat.count }))
    )

    if (!products || products.length === 0) {
      return null
    }

    // Filter out categories that should be hidden (like 'misc')
    const visibleCategories =
      categories?.filter(
        (category) =>
          category.name?.toLowerCase() !== 'misc' && category.count && category.count > 0
      ) || []

    // Pass both products and categories to the client component
    return <HomepageGridClient products={products} categories={visibleCategories} title={title} />
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return null
  }
}
