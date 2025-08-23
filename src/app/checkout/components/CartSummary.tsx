import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cart } from '@/graphql/generated'
import { CartItem } from './CartItem'

export function CartSummary({ cart }: { cart: Cart }) {
  // Calculate if any items have quantity discounts
  const hasQuantityDiscounts = cart.contents?.nodes?.some(
    (item) => item && item.quantity && item.quantity >= 2
  )

  // Calculate total savings (approximate - since discounts are already applied to prices)
  const calculateSavings = () => {
    let totalSavings = 0
    cart.contents?.nodes?.forEach((item) => {
      if (item && item.quantity) {
        // This is an approximation - you might want to get this from backend instead
        const quantity = item.quantity
        if (quantity >= 3) {
          // Assuming 15% savings for 3+ items
          const currentPrice = parseFloat(item.subtotal?.replace(/[^\d.-]/g, '') || '0')
          const originalPrice = currentPrice / 0.85 // Reverse calculate original price
          totalSavings += originalPrice - currentPrice
        } else if (quantity === 2) {
          // Assuming 10% savings for 2 items
          const currentPrice = parseFloat(item.subtotal?.replace(/[^\d.-]/g, '') || '0')
          const originalPrice = currentPrice / 0.9 // Reverse calculate original price
          totalSavings += originalPrice - currentPrice
        }
      }
    })
    return totalSavings
  }

  const totalSavings = calculateSavings()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quantity Discount Banner */}
        {hasQuantityDiscounts && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-lg">🎉</span>
              <div>
                <p className="font-semibold text-sm">Quantity Discounts Applied!</p>
                {totalSavings > 0 && (
                  <p className="text-xs">You're saving ${totalSavings.toFixed(2)}</p>
                )}
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

          {/* Show quantity discounts if any */}
          {totalSavings > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-sm">Quantity Discounts</span>
              <span>-${totalSavings.toFixed(2)}</span>
            </div>
          )}

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

          {/* Show fees (this will include any backend-applied discounts) */}
          {cart.fees?.map(
            (fee) =>
              fee && (
                <div key={fee.id || fee.name} className="flex justify-between text-green-600">
                  <span className="text-sm">{fee.name}</span>
                  <span>{fee.total}</span>
                </div>
              )
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
