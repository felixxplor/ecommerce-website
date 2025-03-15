import { ShopProduct } from '@/server/shop-product'
import { ProductProvider } from '@/client/product-provider'
import MainPolicies from '@/components/main-policies'
import { fetchProductBy, ProductIdTypeEnum } from '@/graphql'
import Navbar from '@/components/navbar'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await fetchProductBy(slug, ProductIdTypeEnum.SLUG)

  if (!slug || !product)
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
      <ProductProvider product={product}>
        <ShopProduct product={product} />
        <MainPolicies />
      </ProductProvider>
    </>
  )
}
