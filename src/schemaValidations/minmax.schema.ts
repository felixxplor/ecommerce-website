import { z } from 'zod'

// Custom error messages for better UX
const errorMessages = {
  notNumber: 'Please enter a valid number',
  negative: 'Price cannot be negative',
  minMax: 'Maximum price must be greater than minimum price',
} as const

// Schema for price range
export const priceRangeSchema = z
  .object({
    price_min: z.string().default(''),
    price_max: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    const min = data.price_min === '' ? 0 : Number(data.price_min)
    const max = data.price_max === '' ? Infinity : Number(data.price_max)

    // Validate min price if provided
    if (data.price_min !== '') {
      if (isNaN(min)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessages.notNumber,
          path: ['price_min'],
        })
        return
      }

      if (min < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessages.negative,
          path: ['price_min'],
        })
        return
      }
    }

    // Validate max price if provided
    if (data.price_max !== '') {
      if (isNaN(max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessages.notNumber,
          path: ['price_max'],
        })
        return
      }

      if (max < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorMessages.negative,
          path: ['price_max'],
        })
        return
      }
    }

    // Check min-max relationship if max is provided
    if (data.price_max !== '' && max < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: errorMessages.minMax,
        path: ['price_max'],
      })
    }
  })

export type PriceRangeSchema = z.infer<typeof priceRangeSchema>

export const defaultPriceRange: PriceRangeSchema = {
  price_min: '',
  price_max: '',
}
