// app/order-confirmation/[orderId]/page.tsx

import { OrderConfirmationClient } from '@/client/order-confirmation-client'

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>
  searchParams: Promise<{
    payment_intent?: string
    order_id?: string
    redirect_status?: string
    status?: string
    payment_method?: string
    paypal?: string
    token?: string
    woo_session?: string
    transaction_id?: string
    unique_id?: string
  }>
}) {
  // We don't need to await params or searchParams since the client component
  // will handle reading the URL parameters directly

  // Simply render the client component without any props
  return <OrderConfirmationClient />
}
