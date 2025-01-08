import { gql } from '@apollo/client'

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      nodes {
        id
        name
        slug
        description
        image {
          sourceUrl
        }
      }
    }
  }
`
