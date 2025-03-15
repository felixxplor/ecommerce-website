// components/navbar-wrapper.tsx
import {
  fetchCategories,
  fetchProducts,
  OrderEnum,
  TermObjectsConnectionOrderbyEnum,
} from '@/graphql'
import Navbar from './navbar'

const NavbarWrapper = async () => {
  const categories =
    (await fetchCategories(5, 1, {
      orderby: TermObjectsConnectionOrderbyEnum.COUNT,
      order: OrderEnum.DESC,
    })) || []

  const menu = [
    ...categories.map((category) => ({
      label: category.name as string,
      href: `/collections/${category.slug}`,
    })),
  ]

  const products = await fetchProducts(20, 0)
  if (!products) return <h1>Page not found</h1>

  return <Navbar menu={menu} categories={categories} products={products} />
}

export default NavbarWrapper
