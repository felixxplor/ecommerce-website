// app/api/addresses/route.ts
import { NextResponse } from 'next/server'
import {
  getClient,
  GetCustomerDetailsDocument,
  GetCustomerDetailsQuery,
  UpdateCustomerDocument,
  UpdateCustomerMutation,
} from '@/graphql'
import { GraphQLError, print } from 'graphql'
import { GraphQLClient } from 'graphql-request'

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

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT as string

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authToken = authHeader.split(' ')[1]
    const body = await request.json()
    const { shipping } = body

    if (!shipping) {
      return NextResponse.json({ error: 'Shipping information is required' }, { status: 400 })
    }

    const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const response = await client.request<UpdateCustomerMutation>(UpdateCustomerDocument, {
      input: {
        shipping: {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          address1: shipping.address1,
          address2: shipping.address2 || '',
          city: shipping.city,
          state: shipping.state,
          postcode: shipping.postcode,
          country: shipping.country,
        },
      },
    })

    if (!response.updateCustomer?.customer) {
      return NextResponse.json({ error: 'Failed to update shipping information' }, { status: 500 })
    }

    return NextResponse.json({
      customer: response.updateCustomer.customer,
    })
  } catch (error) {
    const graphqlError = error as GraphQLError
    console.error('Error updating shipping:', graphqlError)
    return NextResponse.json({ error: 'Failed to update shipping address' }, { status: 500 })
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
