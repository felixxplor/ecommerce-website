// app/about/page.tsx
import { Metadata } from 'next'
import MainPolicies from '@/components/main-policies'
import AboutUs from '@/server/about-us'
import MaxWidthWrapper from '@/components/max-width-wrapper'

// Generate metadata for better SEO
export const metadata: Metadata = {
  title: 'About Us | Gizmooz',
  description:
    'Learn about Gizmooz, our mission to deliver cutting-edge technology, our team, and our commitment to customer satisfaction and innovation.',
  keywords:
    'about Gizmooz, tech company, our mission, company values, tech innovation, Gizmooz team',
  alternates: {
    canonical: 'https://www.gizmooz.com/about-us',
  },
  openGraph: {
    title: 'About Gizmooz',
    description:
      'Learn about Gizmooz, our mission to deliver cutting-edge technology, our team, and our commitment to customer satisfaction.',
    url: 'https://www.gizmooz.com/about-us',
    type: 'website',
  },
}

export default function AboutUsPage() {
  return (
    <article className="py-6 sm:py-12">
      <MaxWidthWrapper>
        {/* Main content section */}
        <section className="mb-12">
          <AboutUs />
        </section>
      </MaxWidthWrapper>
    </article>
  )
}
