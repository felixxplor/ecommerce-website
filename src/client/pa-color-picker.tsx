// 'use client'

// import { cn } from '@/utils/ui'
// import { PaColor } from '@/graphql'
// import Link from 'next/link'
// import { Badge } from '@/components/ui/badge'
// import { useShopContext } from './shop-provider'

// interface ColorSwatchProps {
//   color: string
//   circle?: boolean
//   small?: boolean
// }

// function ColorSwatch({ color, circle, small }: ColorSwatchProps) {
//   return (
//     <div
//       className={cn(circle ? 'rounded-full' : 'rounded', small ? 'w-4 h-4' : 'w-6 h-6')}
//       style={{ backgroundColor: color }}
//     />
//   )
// }

// export interface PaColorPickerProps {
//   colors: PaColor[]
// }

// export function PaColorPicker({ colors }: PaColorPickerProps) {
//   const { buildUrl, selectedColors, allProducts } = useShopContext()

//   const displayedColors = allProducts
//     ? colors.filter((color) => {
//         const productsWithColor = allProducts.filter((product) => {
//           if (!product.allPaColor || product.allPaColor.nodes.length === 0) {
//             return false
//           }

//           return product.allPaColor.nodes.some((node: PaColor) => {
//             return node.slug === color.slug
//           })
//         })

//         return productsWithColor.length > 0
//       })
//     : colors

//   return (
//     <>
//       <div className="flex gap-2 flex-wrap mb-4">
//         {selectedColors.map((slug) => {
//           const color = displayedColors.find((c) => c.slug === slug)
//           if (!color) {
//             return null
//           }

//           const href = buildUrl({
//             colors: selectedColors.filter((s) => s !== slug),
//           })
//           return (
//             <Link key={color.id} href={href} shallow prefetch={false}>
//               <Badge
//                 variant="outline"
//                 className={cn(
//                   'hover:bg-red-500 hover:text-white cursor-pointer',
//                   'transition-colors duration-250 ease-in-out',
//                   'flex gap-1 border-0'
//                 )}
//               >
//                 <ColorSwatch color={color.slug as string} circle small />
//                 {color.name}
//               </Badge>
//             </Link>
//           )
//         })}
//       </div>
//       <ul className="mb-4 max-h-[40vh] lg:max-h-[25vh] overflow-y-scroll scrollbar-thin scrollbar-corner-rounded scrollbar-thumb-ring">
//         {displayedColors.map((color) => {
//           if (selectedColors.includes(color.slug as string)) {
//             return null
//           }

//           const href = buildUrl({
//             colors: [...selectedColors, color.slug as string],
//           })
//           return (
//             <li className="group py-4" key={color.id}>
//               <Link href={href} className="px-0 flex gap-2">
//                 <ColorSwatch color={color.slug as string} />
//                 {color.name}
//               </Link>
//             </li>
//           )
//         })}
//       </ul>
//     </>
//   )
// }
