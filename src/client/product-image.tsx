'use client'

import { Image } from '@/components/ui/image'
import { Product } from '@/graphql'
import { useProductContext } from './product-provider'
import { useEffect, useMemo, useRef, useState } from 'react'

export interface ProductImageProps {
  product: Product
}

export function ProductImage({ product }: ProductImageProps) {
  const { image, galleryImages } = product
  console.log(product)

  const { get } = useProductContext()
  const sourceUrl = (get('image.sourceUrl' as keyof Product) as string) || product?.image?.sourceUrl
  const altText = (get('image.altText' as keyof Product) as string) || product?.image?.altText || ''

  const [imagesIndex, setImagesIndex] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')

  const currentImages = useMemo(
    () => (galleryImages ? (galleryImages.nodes as any[]).slice(...imagesIndex) : []),
    [product, imagesIndex]
  )
  console.log(galleryImages)
  console.log(currentImages)

  useEffect(() => {
    if (galleryImages && galleryImages.nodes.length > 0 && image?.sourceUrl) {
      setActiveImage(image.sourceUrl)
    }
  }, [galleryImages, image])

  const next = () => {
    if (galleryImages && imagesIndex[1] < galleryImages.nodes.length) {
      setImagesIndex((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }

  const prev = () => {
    if (imagesIndex[0] > 0) {
      setImagesIndex((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }

  const imageRef = useRef<HTMLImageElement>(null)

  const handleZoom = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const image = imageRef.current as HTMLImageElement
    const { naturalWidth, naturalHeight } = image

    // Get the mouse position relative to the image
    const offsetX = e.pageX - rect.x
    const offsetY = e.pageY - rect.y

    // Set a zoom scale factor (adjust the scale level as needed)
    const zoomScale = 1.5 // Zoom scale factor (2x zoom for example)

    // Calculate the zoomed width and height of the image
    const zoomedWidth = naturalWidth * zoomScale
    const zoomedHeight = naturalHeight * zoomScale

    // Calculate the offsets for the top and left to zoom towards the cursor
    const top = (offsetY / rect.height) * (zoomedHeight - rect.height)
    const left = (offsetX / rect.width) * (zoomedWidth - rect.width)

    // Set the styles to zoom the image and follow the mouse position
    image.style.width = `${zoomedWidth}px`
    image.style.height = `${zoomedHeight}px`
    image.style.maxWidth = 'unset' // Remove maxWidth to allow zooming beyond the container
    image.style.top = `-${top}px` // Move the image top to zoom towards the mouse position
    image.style.left = `-${left}px` // Move the image left to zoom towards the mouse position
  }

  const handleZoomOut = () => {
    imageRef.current?.removeAttribute('style')
  }

  if (!sourceUrl) {
    return null
  }

  return (
    <>
      <div
        className="relative w-full pt-[100%] overflow-hidden cursor-zoom-in"
        onMouseMove={handleZoom}
        onMouseLeave={handleZoomOut}
      >
        {activeImage ? (
          <img
            className="absolute top-0 left-0 w-full bg-white object-cover"
            ref={imageRef}
            src={activeImage}
            alt={altText}
          />
        ) : null}
      </div>
      <div className="relative mt-4 grid grid-cols-5 gap-1">
        <button
          className="absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white"
          onClick={prev}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          className="absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 text-white"
          onClick={next}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        {galleryImages?.nodes &&
          currentImages.map((image, index) => (
            <img
              key={index}
              className={`cursor-pointer object-cover ${
                activeImage === image.sourceUrl ? 'ring-2 ring-blue-500' : ''
              }`}
              src={image.sourceUrl}
              alt={image.altText}
              onClick={() => setActiveImage(image.sourceUrl)}
            />
          ))}
      </div>
    </>
  )
}
