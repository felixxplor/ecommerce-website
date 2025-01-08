import { ShopProduct } from '@/app/server/shop-product'
import { ProductProvider } from '@/client/product-provider'
import MainPolicies from '@/components/main-policies'
import { fetchProductBy, ProductIdTypeEnum } from '@/graphql'

export interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await fetchProductBy(slug, ProductIdTypeEnum.SLUG)

  if (!slug || !product) return <h1>Page not found</h1>

  return (
    <ProductProvider product={product}>
      <ShopProduct product={product} />
      <MainPolicies />
    </ProductProvider>
  )
}
