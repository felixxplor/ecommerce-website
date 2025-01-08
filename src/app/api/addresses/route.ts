// app/api/addresses/route.ts
import { NextResponse } from 'next/server'
import { getClient, GetCustomerDetailsDocument, GetCustomerDetailsQuery } from '@/graphql'
import { print } from 'graphql'

interface AddressesResponse {
  customer: {
    billing: {
      firstName: string
      lastName: string
      address1: string
      address2: string
      city: string
      state: string
      postcode: string
      country: string
    }
    shipping: {
      firstName: string
      lastName: string
      address1: string
      address2: string
      city: string
      state: string
      postcode: string
      country: string
    }
  }
}

export async function GET(request: Request) {
  try {
    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!authToken) {
      return NextResponse.json({ errors: { message: 'Unauthorized' } }, { status: 401 })
    }

    const client = getClient()
    client.setHeader('Authorization', `Bearer ${authToken}`)

    const wooSession = request.headers.get('woocommerce-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    const data = await client.request<GetCustomerDetailsQuery>(print(GetCustomerDetailsDocument))

    if (!data.customer) {
      return NextResponse.json(
        { errors: { message: 'Failed to retrieve addresses.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      addresses: {
        shipping: data.customer.shipping,
      },
    })
  } catch (err) {
    console.error('Error fetching addresses:', err)
    return NextResponse.json({ errors: { message: 'Failed to fetch addresses' } }, { status: 500 })
  }
}
