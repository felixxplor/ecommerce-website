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

    if (!products || products.length === 0) {
      return null
    }

    // Simple filter: only exclude 'misc' categories, ignore count
    const visibleCategories =
      categories?.filter(
        (category) => category.name?.toLowerCase() !== 'misc' && category.name && category.slug
      ) || []

    // Pass both products and categories to the client component
    return <HomepageGridClient products={products} categories={visibleCategories} title={title} />
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return null
  }
}
