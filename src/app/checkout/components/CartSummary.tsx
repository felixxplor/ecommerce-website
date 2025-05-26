import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cart } from '@/graphql/generated'
import { CartItem } from './CartItem'

export function CartSummary({ cart }: { cart: Cart }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
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

          {cart.appliedCoupons?.filter(Boolean).map(
            (coupon) =>
              coupon && (
                <div key={coupon.code || ''} className="flex justify-between text-green-600">
                  <span className="text-sm">Coupon: {coupon.code}</span>
                  <span>-{coupon.discountAmount}</span>
                </div>
              )
          )}

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
