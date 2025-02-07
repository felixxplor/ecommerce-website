'use client'

import React, { useCallback, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { NavLink } from './ui/navlink'
import InputNumber from './input-number'
import { cn } from '@/utils/ui'
import { useShopContext } from '@/client/shop-provider'
import { PaColorPicker } from '@/client/pa-color-picker'
import { priceRangeSchema, type PriceRangeSchema } from '@/schemaValidations/minmax.schema'
import { PaColor, Product, ProductCategory } from '@/graphql'

interface ShopFiltersProps {
  categories?: ProductCategory[]
  colors: PaColor[]
  products: Product[]
}

export function ShopFilters({ categories, colors }: ShopFiltersProps) {
  const { selectedCategories, buildUrl } = useShopContext()
  const router = useRouter()

  const form = useForm<PriceRangeSchema>({
    resolver: zodResolver(priceRangeSchema),
    defaultValues: {
      price_min: '',
      price_max: '',
    },
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const priceRange = searchParams.get('price')?.split('-') || []

    form.setValue('price_min', priceRange[0] || '')
    form.setValue('price_max', priceRange[1] || '')
  }, [])

  const onSubmit = useCallback(
    (data: PriceRangeSchema) => {
      const min = Number(data.price_min) || 0
      const max = Number(data.price_max) || null

      const href = buildUrl({
        price: max !== null ? [max, min] : [min, max],
        page: 1,
      })

      router.push(href)
    },
    [buildUrl, router]
  )

  return (
    <div className="w-64 pr-8">
      {/* Selected Categories Section */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          {selectedCategories.map((slug) => {
            const category = categories?.find((c) => c.slug === slug)
            if (!category) return null

            const href = buildUrl({
              categories: selectedCategories.filter((s) => s !== slug),
              page: 1,
            })

            return (
              <Link key={category.id} href={href} shallow prefetch={false}>
                <Badge
                  variant="outline"
                  className={cn(
                    'hover:bg-red-500 hover:text-white cursor-pointer',
                    'transition-colors duration-250 ease-in-out'
                  )}
                >
                  {category.name}
                </Badge>
              </Link>
            )
          })}
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-corner-rounded scrollbar-thumb-ring">
              {categories?.map((category) => {
                if (selectedCategories.includes(category.slug as string)) {
                  return null
                }
                const href = buildUrl({
                  categories: [...selectedCategories, category.slug as string],
                  page: 1,
                })
                return (
                  <div key={category.id} className="flex items-center gap-2">
                    <NavLink
                      href={href}
                      prefetch={false}
                      shallow
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {category.name}
                    </NavLink>
                  </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <PaColorPicker colors={colors} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <InputNumber
                      placeholder="$ FROM"
                      className="w-full"
                      {...form.register('price_min')}
                    />
                    {form.formState.errors.price_min && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.price_min.message}
                      </p>
                    )}
                  </div>

                  <span className="text-gray-500">-</span>

                  <div className="flex-1">
                    <InputNumber
                      placeholder="$ TO"
                      className="w-full"
                      {...form.register('price_max')}
                    />
                    {form.formState.errors.price_max && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.price_max.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 text-sm">
                    Apply
                  </Button>
                  <Button type="button" variant="outline" className="text-sm">
                    Clear
                  </Button>
                </div>
              </form>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
