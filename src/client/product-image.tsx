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

  const { get } = useProductContext()
  const sourceUrl = (get('image.sourceUrl' as keyof Product) as string) || product?.image?.sourceUrl
  const altText = (get('image.altText' as keyof Product) as string) || product?.image?.altText || ''

  const [imagesIndex, setImagesIndex] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')

  // Combine main image with gallery images, ensuring we get full-size images
  const allImages = useMemo(() => {
    const images = []

    // Add main product image first (full size)
    if (image?.sourceUrl) {
      images.push({
        sourceUrl: image.sourceUrl,
        altText: image.altText || '',
        isMainImage: true,
      })
    }

    // Add gallery images (full size)
    if (galleryImages?.nodes) {
      const galleryNodes = galleryImages.nodes.filter(
        (galleryImage: any) =>
          galleryImage?.sourceUrl && galleryImage.sourceUrl !== image?.sourceUrl // Avoid duplicates
      )

      images.push(
        ...galleryNodes.map((galleryImage: any) => ({
          sourceUrl: galleryImage.sourceUrl,
          altText: galleryImage.altText || '',
          isMainImage: false,
        }))
      )
    }

    return images
  }, [image, galleryImages])

  // Get current visible thumbnails
  const currentImages = useMemo(() => allImages.slice(...imagesIndex), [allImages, imagesIndex])

  // Set initial active image
  useEffect(() => {
    if (allImages.length > 0) {
      // Use the current sourceUrl from context if available, otherwise use the first image
      setActiveImage(sourceUrl || allImages[0].sourceUrl)
    }
  }, [allImages, sourceUrl])

  const next = () => {
    if (imagesIndex[1] < allImages.length) {
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
    const zoomScale = 1.5 // Zoom scale factor

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

  // If no images available, show placeholder or return null
  if (allImages.length === 0) {
    return (
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="absolute inset-0 flex items-center justify-center text-gray-400">
          No image available
        </span>
      </div>
    )
  }

  return (
    <>
      {/* Main Image Display */}
      <div
        className="relative w-full pt-[100%] overflow-hidden cursor-zoom-in shadow-sm border border-gray-100 rounded-lg"
        onMouseMove={handleZoom}
        onMouseLeave={handleZoomOut}
      >
        <img
          className="absolute top-0 left-0 w-full h-full bg-white object-cover"
          ref={imageRef}
          src={activeImage}
          alt={altText}
          loading="eager" // Load main image immediately
        />
      </div>

      {/* Thumbnail Navigation - Only show if there are multiple images */}
      {allImages.length > 1 && (
        <div className="relative mt-4 grid grid-cols-5 gap-1">
          {/* Previous Button - Only show if there are images before current view */}
          {imagesIndex[0] > 0 && (
            <button
              className="absolute left-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-r transition-colors"
              onClick={prev}
              aria-label="Previous images"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}

          {/* Next Button - Only show if there are images after current view */}
          {imagesIndex[1] < allImages.length && (
            <button
              className="absolute right-0 top-1/2 z-10 h-9 w-5 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-l transition-colors"
              onClick={next}
              aria-label="Next images"
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
          )}

          {/* Thumbnail Images */}
          {currentImages.map((imageData, index) => (
            <div key={`${imageData.sourceUrl}-${index}`} className="relative">
              <img
                className={`w-full aspect-square cursor-pointer object-cover rounded transition-all duration-200 ${
                  activeImage === imageData.sourceUrl
                    ? 'ring-2 ring-blue-500 ring-offset-1'
                    : 'hover:opacity-80'
                }`}
                src={imageData.sourceUrl}
                alt={imageData.altText}
                onClick={() => setActiveImage(imageData.sourceUrl)}
                loading="lazy" // Lazy load thumbnails
              />
              {/* Optional: Add a small indicator for the main image */}
              {imageData.isMainImage && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
