// components/search-results.tsx
'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Product } from '@/graphql'
import { ProductListing } from '@/client/product-detail'

export function SearchResults({ query }: { query: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        setProducts(data.products)
      } catch (error) {
        setError('Failed to search products')
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    searchProducts()
  }, [query])

  if (loading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!query) {
    return (
      <div className="text-center text-muted-foreground">Enter a search term to find products</div>
    )
  }

  if (products.length === 0) {
    return <div className="text-center text-muted-foreground">No products found for "{query}"</div>
  }

  return <ProductListing products={products} />
}
