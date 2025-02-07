import { ShopProvider } from '@/client/shop-provider'
import { fetchProducts, fetchColors } from '@/graphql'
import { Shop } from '../../../server/product-list'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navbar from '@/components/navbar'

export interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params

  const products = await fetchProducts(1, 0, { category: category })
  const colors = (await fetchColors(1)) || []

  if (!products || products.length === 0)
    return (
      <MaxWidthWrapper>
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>

            <h2 className="text-2xl font-semibold">Page not found</h2>

            <p className="text-muted-foreground text-lg">
              Sorry, we couldn't find the page you're looking for.
            </p>

            <div className="flex justify-center gap-2">
              <Button asChild variant="default">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    )

  return (
    <>
      <ShopProvider allProducts={products}>
        <Shop products={products} colors={colors} />
      </ShopProvider>
    </>
  )
}
