import { GetStaticProps } from 'next'
import client from '@/lib/apollo-client'
import { GET_PRODUCTS } from '@/queries/getProducts'

// Define the types for your product data
type Product = {
  id: string
  name: string
  slug: string
  description: string
  price: string
  image: {
    sourceUrl: string
  }
}

type HomePageProps = {
  products: Product[]
}

// Implement getStaticProps with types
export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const { data } = await client.query({
    query: GET_PRODUCTS,
  })

  console.log(data) // Check the console to see the structure of data

  return {
    props: {
      products: data.products?.nodes || [], // Fallback to an empty array if undefined
    },
  }
}

// Use types for the HomePage component props
export default function HomePage({ products = [] }: HomePageProps) {
  console.log(products)
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <img src={product.image.sourceUrl} alt={product.name} />
            </li>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </ul>
    </div>
  )
}
