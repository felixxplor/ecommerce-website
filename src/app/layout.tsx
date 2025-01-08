import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import Navbar, { NavItem } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { constructMetadata } from '@/lib/utils'
import Footer from '@/components/footer'
import { fetchCategories, OrderEnum, TermObjectsConnectionOrderbyEnum } from '@/graphql'
import { SessionProvider } from '@/client/session-provider'

const recursive = Quicksand({ subsets: ['latin'] })

export const metadata = constructMetadata({
  title: 'Gizmooz - Unlock the next level in tech and innovation',
  description: 'Get the latest tech at Gizmooz – innovative gadgets for a modern lifestyle',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories =
    (await fetchCategories(5, 1, {
      orderby: TermObjectsConnectionOrderbyEnum.COUNT,
      order: OrderEnum.DESC,
    })) || []
  const menu: NavItem[] = [
    ...categories.map((category) => ({
      label: category.name as string,
      href: `/${category.slug}`,
    })),
  ]
  return (
    <html lang="en">
      <body className={`${recursive.className}`}>
        <SessionProvider>
          <Navbar menu={menu} />

          <main className="flex grainy-light flex-col mx-5">
            <div className="flex-1 flex flex-col h-full">{children}</div>
          </main>
          <Footer />
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
