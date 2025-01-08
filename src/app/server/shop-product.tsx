import { ProductImage } from '@/client/product-image'
import { Product, SimpleProduct, VariationAttribute } from '@/graphql'
import { CartOptions } from './cart-options'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MaxWidthWrapper from '@/components/max-width-wrapper'
import { ProductWithPrice } from '@/client/shop-provider'

export interface ShopProductProps {
  product: Product
}

export function ShopProduct(props: ShopProductProps) {
  const { product } = props
  const { rawPrice } = product as ProductWithPrice

  const attributes: Record<string, string[]> =
    (product as SimpleProduct).defaultAttributes?.nodes?.reduce((attributesList, attribute) => {
      const { value, label } = attribute as VariationAttribute

      const currentAttributes = attributesList[label as string] || []
      return {
        ...attributesList,
        [label as string]: [...currentAttributes, value as string],
      }
    }, {} as Record<string, string[]>) || {}

  return (
    <div className="bg-[#f6f5f2]">
      <MaxWidthWrapper className="flex flex-wrap p-12 gap-4 mb-36 lg:mb-0">
        <div className="grid grid-cols-12 gap-9">
          <div className="col-span-5">
            <ProductImage product={product} />
          </div>
          <div className="col-span-7 basis-full md:basis-1/2 pt-4 px-4 flex flex-col">
            <h1 className="font-serif text-5xl font-medium mb-2">{product.name}</h1>
            <div className="text-2xl py-4">${rawPrice}</div>
            <p className="text-base mb-4">{product.shortDescription}</p>
            <CartOptions product={product} />
          </div>
        </div>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <div dangerouslySetInnerHTML={{ __html: product.description as string }} />
          </TabsContent>
          <TabsContent value="attributes">
            <ul>
              {Object.entries(attributes).map(([label, values]) => (
                <li key={label}>
                  <p>
                    <span className="font-serif font-medium">{label}:</span> {values.join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="reviews">
            <p>Reviews</p>
          </TabsContent>
        </Tabs>
      </MaxWidthWrapper>
    </div>
  )
}
