import { PropsWithChildren } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetTrigger } from '@/components/ui/sheet'

export function ShopSidebar({ children }: PropsWithChildren) {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild className="lg:hidden w-16 fixed inset-x-0 mx-auto bottom-10 z-30">
          <Button type="button">Open</Button>
        </SheetTrigger>
        <SheetContent>
          {children}
          <SheetFooter>
            <SheetClose asChild className="mt-4">
              <Button className="w-full flex items-center gap-x-2" type="button">
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block w-1/6 px-4 border-r">{children}</div>
    </>
  )
}
