import { PropsWithChildren } from 'react'

import { Product, ProductTypesEnum, SimpleProduct } from '@/graphql'
import { cn } from '@/utils/ui'
import { SimpleCartOptions } from '@/client/simple-cart-options'
import { VariableCartOptions } from '@/client/variable-cart-options'

function Container({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        className && className,
        'flex fixed inset-x-0 mx-auto p-4',
        'lg:relative lg:inset-auto lg:mx-0 lg:p-0',
        'bg-white bottom-0 z-30 w-screen',
        'lg:bg-inherit lg:bottom-auto lg:z-auto lg:w-auto'
      )}
    >
      {children}
    </div>
  )
}

export interface CartOptionsProps {
  product: Product
  className?: string
  value?: number
  onIncrease?: (value: number) => void
  onDecrease?: (value: number) => void
  onType?: (value: number) => void
  onFocusOut?: (value: number) => void
}

export function CartOptions(props: CartOptionsProps) {
  const { product, className } = props
  const { type } = product as unknown as SimpleProduct

  let Component: (props: CartOptionsProps) => JSX.Element | null = () => null
  if (type === ProductTypesEnum.SIMPLE) {
    Component = SimpleCartOptions
  } else if (type === ProductTypesEnum.VARIABLE) {
    Component = VariableCartOptions
  }

  return (
    <Container className={className}>
      <Component product={product} />
    </Container>
  )
}
