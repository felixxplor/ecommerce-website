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
  const [isZoomed, setIsZoomed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  // Detect if device is mobile/touch
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Combine main image with gallery images
  const allImages = useMemo(() => {
    const images = []

    if (image?.sourceUrl) {
      images.push({
        sourceUrl: image.sourceUrl,
        altText: image.altText || '',
        isMainImage: true,
      })
    }

    if (galleryImages?.nodes) {
      const galleryNodes = galleryImages.nodes.filter(
        (galleryImage: any) =>
          galleryImage?.sourceUrl && galleryImage.sourceUrl !== image?.sourceUrl
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

  const currentImages = useMemo(() => allImages.slice(...imagesIndex), [allImages, imagesIndex])

  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImage(sourceUrl || allImages[0].sourceUrl)
    }
  }, [allImages, sourceUrl])

  // Simple zoom toggle for mobile
  const handleImageClick = () => {
    if (isMobile) {
      setIsZoomed(!isZoomed)
    }
  }

  // Desktop zoom with mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (isMobile) return

    const rect = e.currentTarget.getBoundingClientRect()
    const image = imageRef.current
    if (!image) return

    const offsetX = e.pageX - rect.x
    const offsetY = e.pageY - rect.y

    const zoomScale = 1.5
    const { naturalWidth, naturalHeight } = image

    const zoomedWidth = naturalWidth * zoomScale
    const zoomedHeight = naturalHeight * zoomScale

    const top = (offsetY / rect.height) * (zoomedHeight - rect.height)
    const left = (offsetX / rect.width) * (zoomedWidth - rect.width)

    image.style.width = `${zoomedWidth}px`
    image.style.height = `${zoomedHeight}px`
    image.style.maxWidth = 'unset'
    image.style.top = `-${top}px`
    image.style.left = `-${left}px`
    image.style.transition = 'none'
  }

  const handleMouseLeave = () => {
    if (isMobile) return
    const image = imageRef.current
    if (image) {
      image.removeAttribute('style')
    }
  }

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

  const handleThumbnailClick = (imageUrl: string) => {
    setActiveImage(imageUrl)
    setIsZoomed(false) // Reset zoom when changing images
  }

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
        className={`relative w-full pt-[100%] overflow-hidden shadow-sm border border-gray-100 rounded-lg bg-white ${
          isMobile ? 'cursor-pointer' : 'cursor-zoom-in'
        }`}
        onClick={handleImageClick}
        onMouseMove={!isMobile ? handleMouseMove : undefined}
        onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      >
        <img
          className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-200 ease-in-out ${
            isMobile && isZoomed ? 'scale-125 cursor-zoom-out' : ''
          }`}
          ref={imageRef}
          src={activeImage}
          alt={altText}
          loading="eager"
          style={isMobile && isZoomed ? { transformOrigin: 'center center' } : undefined}
          onError={(e) => {
            console.error('Image failed to load:', activeImage)
          }}
        />

        {/* Mobile zoom hint */}
        {isMobile && !isZoomed && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Tap to zoom
          </div>
        )}

        {/* Mobile zoom out hint */}
        {isMobile && isZoomed && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Tap to zoom out
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="relative mt-4">
          <div className="grid grid-cols-5 gap-1">
            {/* Previous Button */}
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

            {/* Next Button */}
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

          {allImages.length > 5 && (
            <div className="text-center mt-2 text-xs text-gray-500">
              Showing {imagesIndex[0] + 1}-{Math.min(imagesIndex[1], allImages.length)} of{' '}
              {allImages.length} images
            </div>
          )}
        </div>
      )}
    </div>
  )
}
