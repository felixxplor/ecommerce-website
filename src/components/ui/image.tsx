'use client'

import { useState, forwardRef } from 'react'
import NextImage from 'next/image'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/utils/ui'
import { LoadingSpinner } from './loading-spinner'

export type ImageProps = {
  className?: string
  src: string
  sizes?: string
  width?: number
  height?: number
  ratio?: number
  alt: string
  style?: JSX.IntrinsicElements['img']['style']
  fill?: boolean
  priority?: boolean
  targetImageRef?: React.Ref<HTMLImageElement>
}

// Forwarding the ref
export const Image = forwardRef<HTMLDivElement, ImageProps>((props, ref) => {
  const [isLoading, setLoading] = useState(true)

  const {
    className = '',
    src,
    alt,
    sizes,
    width,
    height,
    ratio,
    style,
    fill = true,
    priority,
    targetImageRef, // Pass-through ref for the <img>
  } = props

  return (
    <div
      className={cn('overflow-hidden group relative', className && className)}
      style={style}
      ref={targetImageRef}
    >
      <AspectRatio ratio={ratio}>
        {isLoading && (
          <LoadingSpinner className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <NextImage
          src={src}
          alt={alt}
          width={width as number}
          height={height as number}
          sizes={sizes}
          className={cn(
            'object-cover',
            'duration-700 ease-in-out',
            isLoading ? 'grayscale blur-2xl scale-110' : 'grayscale-0 blur-0 scale-100'
          )}
          fill={fill}
          onLoad={() => setLoading(false)}
          priority={priority}
        />
      </AspectRatio>
    </div>
  )
})
