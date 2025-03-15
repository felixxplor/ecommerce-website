import Link from 'next/link'
import { Product, SimpleProduct } from '@/graphql'
import { Image } from '@/components/ui/image'

interface RelatedProductsProps {
  products: Product[]
  title?: string
}

export function RelatedProducts({ products, title = 'Related Products' }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="mt-16 mb-12">
      <h2 className="text-2xl font-serif font-medium mb-6">{title}</h2>
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const sourceUrl = product.image?.sourceUrl
            const altText = product.image?.altText || product.name || ''
            return (
              <Link href={`/products/${product.slug}`} key={product.id} className="group">
                <div className="relative aspect-square mb-3 overflow-hidden rounded-md bg-gray-100">
                  {sourceUrl && (
                    <Image
                      src={sourceUrl}
                      alt={altText}
                      ratio={1 / 1}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-500">{(product as SimpleProduct).price}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
