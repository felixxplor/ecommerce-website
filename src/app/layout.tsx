import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { constructMetadata } from '@/lib/utils'
import Footer from '@/components/footer'

import { SessionProvider } from '@/client/session-provider'
import Navbar from '@/components/navbar'

const recursive = Quicksand({ subsets: ['latin'] })

export const metadata = constructMetadata({
  title: 'Gizmooz - Unlock the next level in tech and innovation',
  description: 'Get the latest tech at Gizmooz – innovative gadgets for a modern lifestyle',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${recursive.className}`}>
        <SessionProvider>
          <Navbar />
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
