// app/api/customer/route.ts
import { NextResponse } from 'next/server'
import {
  getClient,
  GetCustomerDetailsDocument,
  GetCustomerDetailsQuery,
  UpdateCustomerDocument,
  UpdateCustomerMutation,
} from '@/graphql'
import { print } from 'graphql'
import { GraphQLClient } from 'graphql-request'

interface CustomerResponse {
  customer: {
    firstName: string
    lastName: string
    email: string
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

interface GraphQLError {
  response?: {
    errors?: Array<{
      message: string
    }>
  }
  message: string
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
    const { firstName, lastName, email } = body

    // Validate input
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    // First, get the current customer ID
    const customerData = await client.request<GetCustomerDetailsQuery>(GetCustomerDetailsDocument)

    if (!customerData.customer?.id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update customer with both main and billing info
    const response = await client.request<UpdateCustomerMutation>(UpdateCustomerDocument, {
      input: {
        id: customerData.customer.id,
        firstName,
        lastName,
        email,
        billing: {
          firstName,
          lastName,
          email,
          // Preserve existing billing fields
          address1: customerData.customer.billing?.address1,
          address2: customerData.customer.billing?.address2,
          city: customerData.customer.billing?.city,
          state: customerData.customer.billing?.state,
          postcode: customerData.customer.billing?.postcode,
          country: customerData.customer.billing?.country,
          phone: customerData.customer.billing?.phone,
        },
      },
    })

    if (!response.updateCustomer || !response.updateCustomer.customer) {
      return NextResponse.json({ error: 'Failed to update customer information' }, { status: 500 })
    }

    return NextResponse.json({
      customer: response.updateCustomer.customer,
    })
  } catch (error) {
    const graphqlError = error as GraphQLError
    console.error('Error updating customer:', graphqlError)

    if (graphqlError.response?.errors?.[0]?.message.includes('email')) {
      return NextResponse.json(
        { error: 'Invalid email address or email already in use' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
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
        { errors: { message: 'Failed to retrieve customer details.' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ customer: data.customer })
  } catch (err) {
    console.error('Error fetching customer details:', err)
    return NextResponse.json(
      { errors: { message: 'Failed to fetch customer details' } },
      { status: 500 }
    )
  }
}
