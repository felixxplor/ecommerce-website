import Cart from '@/client/cart'
import MainPolicies from '@/components/main-policies'
import Navbar, { NavItem } from '@/components/navbar'
import { fetchCategories, OrderEnum, TermObjectsConnectionOrderbyEnum } from '@/graphql'

export default function CartPage() {
  return (
    <div className="">
      <Cart />
      <MainPolicies className="" />
    </div>
  )
}
