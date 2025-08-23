import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cart } from '@/graphql/generated'
import { CartItem } from './CartItem'

export function CartSummary({ cart }: { cart: Cart }) {
  // Simple check if any items have quantity 2+ (for banner only)
  const hasQuantityDiscounts = cart.contents?.nodes?.some(
    (item) => item && item.quantity && item.quantity >= 2
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Simple quantity discount banner */}
        {hasQuantityDiscounts && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-lg">🎉</span>
              <div>
                <p className="font-semibold text-sm">Quantity Discounts Applied!</p>
                <p className="text-xs">Discounted prices are reflected in your cart</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1 divide-y">
          {cart.contents?.nodes?.map(
            (item) => item && <CartItem key={item.key || ''} item={item} />
          )}
        </div>

        <div className="mt-4 space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{cart.subtotal}</span>
          </div>

          {/* Show any coupons */}
          {cart.appliedCoupons?.filter(Boolean).map(
            (coupon) =>
              coupon && (
                <div key={coupon.code || ''} className="flex justify-between text-green-600">
                  <span className="text-sm">Coupon: {coupon.code}</span>
                  <span>-{coupon.discountAmount}</span>
                </div>
              )
          )}

          {/* Show shipping */}
          {cart.shippingTotal && (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shippingTotal}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{cart.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
