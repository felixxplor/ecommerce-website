// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getClient } from '@/graphql'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.gizmooz.com'
  const currentDate = new Date()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Get products for sitemap
  let productPages = []
  try {
    const query = `
      query GetProductsForSitemap($first: Int) {
        products(first: $first) {
          nodes {
            slug
            modified
          }
        }
      }
    `
    const client = getClient()
    const response = (await client.request(query, { first: 1000 })) as { products: any }
    const { products } = response

    if (products?.nodes) {
      productPages = products.nodes.map((product: any) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: new Date(product.modified || currentDate),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
  }

  // Combine all pages
  return [...staticPages, ...productPages]
}
