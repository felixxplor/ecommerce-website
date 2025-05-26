import Image from 'next/image'
import { CartItem as CartItemType } from '@/graphql/generated'

export function CartItem({ item }: { item: CartItemType }) {
  const { product, variation, quantity, subtotal } = item
  const productNode = product?.node
  const image = productNode?.image
  const name = productNode?.name ?? ''

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={image?.sourceUrl || '/product-placeholder.png'}
          alt={image?.altText ?? name ?? ''}
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm truncate">{name}</h3>
        {variation?.attributes?.map(
          (attr) =>
            attr && (
              <p key={attr.name ?? ''} className="text-xs text-gray-500">
                {attr.name ?? ''}: {attr.value ?? ''}
              </p>
            )
        )}
        <div className="flex justify-between mt-1">
          <p className="text-sm">Qty: {quantity ?? 0}</p>
          <p className="font-medium text-sm">{subtotal}</p>
        </div>
      </div>
    </div>
  )
}
