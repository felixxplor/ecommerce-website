import { useRouter } from 'next/navigation'

import { cn } from '@/utils/ui'
import { Button } from '@/components/ui/button'
import { linkClassName, NavLink } from '@/components/ui/navlink'
import { useSession } from './session-provider'
import { deleteClientSessionId } from '@/utils/client'

export function UserNav() {
  const { push } = useRouter()
  const {
    cart,
    customer,
    cartUrl,
    checkoutUrl,
    accountUrl,
    logout: killSession,
    isAuthenticated,
    fetching,
  } = useSession()

  const goToCartPage = () => {
    deleteClientSessionId()
    window.location.href = cartUrl
  }
  const goToCheckoutPage = () => {
    deleteClientSessionId()
    window.location.href = checkoutUrl
  }
  const goToAccountPage = () => {
    deleteClientSessionId()
    window.location.href = accountUrl
  }

  const logout = () => {
    killSession(`Goodbye, ${customer?.firstName}`)
  }

  return (
    <>
      <li className="group">
        <Button
          className={cn(
            'flex flex-row gap-x-2 items-center p-0 hover:no-underline text-base font-normal',
            linkClassName
          )}
          disabled={fetching}
          variant="link"
          onClick={goToCartPage}
        >
          <span>{cart?.contents?.itemCount || 0}</span>
          Cart
        </Button>
      </li>
      <li className="group w-auto">
        <Button
          className={cn('p-0 hover:no-underline text-base font-normal', linkClassName)}
          disabled={fetching}
          variant="link"
          onClick={goToCheckoutPage}
        >
          Checkout
        </Button>
      </li>
      {isAuthenticated ? (
        <>
          <li className="group">
            <Button
              className={cn('p-0 hover:no-underline text-base font-normal', linkClassName)}
              disabled={fetching}
              variant="link"
              onClick={goToAccountPage}
            >
              Account
            </Button>
          </li>
          <li className="group">
            <Button
              className={cn('p-0 hover:no-underline text-base font-normal', linkClassName)}
              disabled={fetching}
              variant="link"
              onClick={logout}
            >
              Logout
            </Button>
          </li>
        </>
      ) : (
        <li className="group">
          <NavLink href="/login">Login</NavLink>
        </li>
      )}
    </>
  )
}
