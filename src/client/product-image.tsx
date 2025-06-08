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
  // Both main image and gallery images now use LARGE size from GetProductImages query
  const sourceUrl = (get('image.sourceUrl' as keyof Product) as string) || product?.image?.sourceUrl
  const altText = (get('image.altText' as keyof Product) as string) || product?.image?.altText || ''

  const [imagesIndex, setImagesIndex] = useState([0, 5])
  const [activeImage, setActiveImage] = useState('')

  // Combine main image with gallery images - both now use LARGE size from query
  const allImages = useMemo(() => {
    const images = []

    // Add main product image first (LARGE size from GetProductImages query)
    if (image?.sourceUrl) {
      images.push({
        sourceUrl: image.sourceUrl,
        altText: image.altText || '',
        isMainImage: true,
      })
    }

    // Add gallery images (LARGE size from GetProductImages query)
    if (galleryImages?.nodes) {
      const galleryNodes = galleryImages.nodes.filter(
        (galleryImage: any) =>
          galleryImage?.sourceUrl && galleryImage.sourceUrl !== image?.sourceUrl // Avoid duplicates
      )

      images.push(
        ...galleryNodes.map((galleryImage: any) => ({
          sourceUrl: galleryImage.sourceUrl.replace(/-\d+x\d+/, ''),
          altText: galleryImage.altText || '',
          isMainImage: false,
        }))
      )
    }

    return images
  }, [image, galleryImages])

  // Get current visible thumbnails (show 5 at a time)
  const currentImages = useMemo(() => allImages.slice(...imagesIndex), [allImages, imagesIndex])

  // Set initial active image
  useEffect(() => {
    if (allImages.length > 0) {
      // Use the current sourceUrl from context if available, otherwise use the first image
      setActiveImage(sourceUrl || allImages[0].sourceUrl)
    }
  }, [allImages, sourceUrl])

  // Navigation functions
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

  // Zoom functionality
  const imageRef = useRef<HTMLImageElement>(null)

  const handleZoom = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const image = imageRef.current as HTMLImageElement
    if (!image) return

    const { naturalWidth, naturalHeight } = image

    // Get the mouse position relative to the image
    const offsetX = e.pageX - rect.x
    const offsetY = e.pageY - rect.y

    // Set a zoom scale factor
    const zoomScale = 2.0 // 2x zoom for better detail viewing

    // Calculate the zoomed width and height of the image
    const zoomedWidth = naturalWidth * zoomScale
    const zoomedHeight = naturalHeight * zoomScale

    // Calculate the offsets for the top and left to zoom towards the cursor
    const top = (offsetY / rect.height) * (zoomedHeight - rect.height)
    const left = (offsetX / rect.width) * (zoomedWidth - rect.width)

    // Apply zoom styles
    image.style.width = `${zoomedWidth}px`
    image.style.height = `${zoomedHeight}px`
    image.style.maxWidth = 'unset'
    image.style.top = `-${top}px`
    image.style.left = `-${left}px`
    image.style.transition = 'none' // Disable transition during zoom
  }

  const handleZoomOut = () => {
    const image = imageRef.current
    if (image) {
      image.removeAttribute('style')
    }
  }

  // Handle thumbnail click
  const handleThumbnailClick = (imageUrl: string) => {
    setActiveImage(imageUrl)
  }

  // If no images available, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="relative w-full pt-[100%] overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          No image available
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div
        className="relative w-full pt-[100%] overflow-hidden cursor-zoom-in shadow-sm border border-gray-100 rounded-lg bg-white"
        onMouseMove={handleZoom}
        onMouseLeave={handleZoomOut}
      >
        <img
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-200 ease-in-out"
          ref={imageRef}
          src={activeImage}
          alt={altText}
          loading="eager"
          onError={(e) => {
            console.error('Image failed to load:', activeImage)
            // Optionally set a fallback image
            // e.currentTarget.src = '/fallback-image.jpg'
          }}
        />
      </div>

      {/* Thumbnail Navigation - Only show if there are multiple images */}
      {allImages.length > 1 && (
        <div className="relative mt-4">
          <div className="grid grid-cols-5 gap-1">
            {/* Previous Button - Always show but disable when can't go back */}
            <button
              className={`absolute left-0 top-1/2 z-20 h-8 w-6 -translate-y-1/2 rounded-r transition-all duration-200 ${
                imagesIndex[0] > 0
                  ? 'bg-black/30 hover:bg-black/50 text-white cursor-pointer shadow-md'
                  : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
              }`}
              onClick={prev}
              disabled={imagesIndex[0] <= 0}
              aria-label="Previous images"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 mx-auto"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Next Button - Always show but disable when can't go forward */}
            <button
              className={`absolute right-0 top-1/2 z-20 h-8 w-6 -translate-y-1/2 rounded-l transition-all duration-200 ${
                imagesIndex[1] < allImages.length
                  ? 'bg-black/30 hover:bg-black/50 text-white cursor-pointer shadow-md'
                  : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
              }`}
              onClick={next}
              disabled={imagesIndex[1] >= allImages.length}
              aria-label="Next images"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 mx-auto"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Thumbnail Images */}
            {currentImages.map((imageData, index) => (
              <div key={`${imageData.sourceUrl}-${index}`} className="relative aspect-square">
                <img
                  className={`w-full h-full cursor-pointer object-cover rounded-md transition-all duration-200 border-2 ${
                    activeImage === imageData.sourceUrl
                      ? 'ring-2 ring-blue-500 ring-offset-1 border-blue-300 opacity-100'
                      : 'border-gray-200 hover:border-gray-300 hover:opacity-80'
                  }`}
                  src={imageData.sourceUrl}
                  alt={imageData.altText || `Product image ${index + 1}`}
                  onClick={() => handleThumbnailClick(imageData.sourceUrl)}
                  loading="lazy"
                  onError={(e) => {
                    console.error('Thumbnail failed to load:', imageData.sourceUrl)
                    e.currentTarget.style.display = 'none'
                  }}
                />

                {/* Main image indicator */}
                {imageData.isMainImage && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm">
                    Main
                  </div>
                )}

                {/* Loading indicator for active image */}
                {activeImage === imageData.sourceUrl && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-md pointer-events-none">
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Image counter */}
          {allImages.length > 5 && (
            <div className="text-center mt-2 text-xs text-gray-500">
              Showing {imagesIndex[0] + 1}-{Math.min(imagesIndex[1], allImages.length)} of{' '}
              {allImages.length} images
            </div>
          )}
        </div>
      )}

      {/* Image info - for debugging (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400 font-mono">
          Active: {activeImage ? new URL(activeImage).pathname.split('/').pop() : 'None'}
          <br />
          Total images: {allImages.length}
        </div>
      )}
    </div>
  )
}
