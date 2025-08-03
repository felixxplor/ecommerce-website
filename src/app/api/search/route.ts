// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { SearchProductsDocument, SearchProductsQuery } from '@/graphql/generated'
import { print } from 'graphql'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ products: [] })
  }

  try {
    const client = getClient()

    const data = await client.request<SearchProductsQuery>(print(SearchProductsDocument), { query })

    // Add null check
    if (!data || !data.products || !data.products.nodes) {
      return NextResponse.json({ products: [] })
    }

    return NextResponse.json({ products: data.products.nodes })
  } catch (error) {
    // console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}
