'use client'

import React, { useState, useEffect } from 'react'
import { Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/graphql'
import ReviewModal, { ReviewSubmitData } from './review-modal'
import { getClient } from '@/graphql'
import { print } from 'graphql'
import { GetProductReviewsDocument, GetProductReviewsQuery } from '@/graphql/generated'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface ReviewImage {
  id: string
  url: string
  thumbnail: string
}

interface Review {
  name: string
  date: string
  review: string
  rating: number
  images?: ReviewImage[]
}

interface ImageDialogProps {
  isOpen: boolean
  onClose: () => void
  image: string | null
  review: {
    name: string
    date: string
    rating: number
    review: string
  }
}

function encodeId(type: string, id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  if (isNaN(numericId)) {
    throw new Error('Invalid ID format')
  }
  return btoa(`${type}:${numericId}`)
}

function decodeId(globalId: string): { type: string; id: number } {
  try {
    const decoded = atob(globalId)
    const [type, idStr] = decoded.split(':')
    const id = parseInt(idStr, 10)
    if (isNaN(id)) {
      throw new Error('Invalid ID format')
    }
    return { type, id }
  } catch (error) {
    console.error('Error decoding ID:', error)
    return { type: '', id: 0 }
  }
}

const ImageDialog = ({ isOpen, onClose, image, review }: ImageDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 bg-white">
        <DialogTitle className="sr-only">Review Image Preview</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square bg-black">
            {image && (
              <Image
                src={image}
                alt="Review photo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            )}
          </div>

          {/* Review Section */}
          <div className="p-6">
            <div className="flex flex-col gap-2">
              {/* Stars */}
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < review.rating ? 'fill-current' : ''}`} />
                ))}
              </div>

              {/* Review Title */}
              <div
                className="text-gray-700 text-lg font-medium"
                dangerouslySetInnerHTML={{
                  __html: review.review,
                }}
              />

              {/* Reviewer Info */}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium">{review.name}</span>
                <span className="text-sm text-gray-500">
                  <span className="mx-2">•</span>
                  {review.date}
                </span>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 text-green-700 text-sm">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                  </svg>
                  <span>VERIFIED PURCHASER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ReviewsSection({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [ratingCounts, setRatingCounts] = useState<number[]>([0, 0, 0, 0, 0])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('recent')
  const reviewsPerPage = 4

  const isValidImage = (photo: any): ReviewImage | null => {
    if (!photo || !photo.sourceUrl) return null

    // Get the most appropriate size from mediaDetails
    const thumbnail =
      photo.mediaDetails?.sizes?.find(
        (size: any) => size.name === 'thumbnail' || size.name === 'medium'
      )?.sourceUrl || photo.sourceUrl

    return {
      id: photo.id,
      url: photo.sourceUrl || photo.mediaItemUrl,
      thumbnail: thumbnail,
    }
  }

  const fetchAndProcessReviews = async (productId: string, rating?: number) => {
    const client = getClient()
    const wooSession = sessionStorage.getItem('woo-session')
    if (wooSession) {
      client.setHeader('woocommerce-session', `Session ${wooSession}`)
    }

    let globalId: string
    try {
      const decodedId = decodeId(productId)
      globalId = decodedId.id ? productId : encodeId('product', productId)
    } catch {
      globalId = encodeId('product', productId)
    }

    const response = await client.request<GetProductReviewsQuery>(
      print(GetProductReviewsDocument),
      {
        id: globalId,
        rating: rating || null,
      }
    )

    if (!response.product?.reviews?.edges) {
      return null
    }

    return response
  }

  const processReviewsData = (response: GetProductReviewsQuery) => {
    const formattedReviews =
      response.product?.reviews?.edges
        ?.filter((edge): edge is NonNullable<typeof edge> => edge !== null)
        .map((edge): Review => {
          const photo = edge.node?.reviewPhoto
          let image = null

          if (photo) {
            image = isValidImage(photo)
          }

          return {
            name: edge.node?.author?.node?.name || 'Anonymous',
            date: edge.node?.date ? new Date(edge.node.date).toLocaleDateString() : '',
            review: edge.node?.content?.replace(/<\/?p>/g, '') || '',
            rating: Number(edge.rating || 5),
            images: image ? [image] : undefined,
          }
        }) || []

    const counts = [0, 0, 0, 0, 0]
    formattedReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating - 1]++
      }
    })

    const edges = response.product?.reviews?.edges || []
    const totalRating = edges.reduce((acc, edge) => acc + (edge?.rating || 0), 0)
    const avgRating = edges.length > 0 ? totalRating / edges.length : 0

    return {
      reviews: formattedReviews,
      ratingCounts: counts.reverse(),
      averageRating: avgRating,
      reviewCount: edges.length,
    }
  }

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetchAndProcessReviews(product.id, selectedRating || undefined)
        if (response) {
          const processed = processReviewsData(response)
          setReviews(processed.reviews)
          setRatingCounts(processed.ratingCounts)
          setAverageRating(processed.averageRating)
          setReviewCount(processed.reviewCount)
        }
      } catch (error) {
        console.error('Error loading reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [product.id, selectedRating])

  const handleReviewSubmit = async (reviewData: ReviewSubmitData): Promise<void> => {
    try {
      const wooSession = sessionStorage.getItem('woo-session')
      const { id: productNumericId } = decodeId(product.id)

      if (!productNumericId) {
        throw new Error('Invalid product ID')
      }

      const formData = new FormData()
      formData.append('productId', productNumericId.toString())
      formData.append('rating', reviewData.rating.toString())
      formData.append('comment', reviewData.comment)
      formData.append('author', reviewData.author)
      formData.append('authorEmail', reviewData.authorEmail)

      if (reviewData.images) {
        reviewData.images.forEach((image, index) => {
          formData.append(`image${index}`, image)
        })
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'woocommerce-session': `Session ${wooSession || ''}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.errors?.message || 'Failed to submit review')
      }

      // Refresh reviews after submission
      const refreshResponse = await fetchAndProcessReviews(product.id, selectedRating || undefined)
      if (refreshResponse) {
        const processed = processReviewsData(refreshResponse)
        setReviews(processed.reviews)
        setRatingCounts(processed.ratingCounts)
        setAverageRating(processed.averageRating)
        setReviewCount(processed.reviewCount)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    }
  }

  const handleRatingFilter = async (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating)
    setIsLoading(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading reviews...</span>
      </div>
    )
  }

  const handleImageClick = (image: string, review: Review) => {
    setSelectedImage(image)
    setSelectedReview(review)
  }

  const sortReviews = (reviewsToSort: Review[]) => {
    return [...reviewsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'recent':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })
  }

  // Get current reviews
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const sortedReviews = sortReviews(reviews)
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  // Handle page changes
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  // Handle sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  return (
    <div id="reviews" className="scroll-mt-20">
      {/* Top section with Write Review button and Rating stats */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        {/* Write Review Button - Mobile only at top */}
        <div className="md:hidden w-full mb-2">
          <ReviewModal
            productId={product.id}
            productName={product.name}
            onSubmit={handleReviewSubmit}
            className="w-full"
          />
        </div>

        <div className="md:w-2/3 flex flex-col sm:flex-row gap-4">
          {/* Rating Snapshot with enhanced shadow */}
          <div className="w-full sm:w-3/5 bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2">Rating Snapshot</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
              Select a row to filter reviews.
            </p>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((stars, index) => (
                <button
                  key={stars}
                  onClick={() => handleRatingFilter(stars)}
                  className={`w-full flex items-center gap-2 p-1 md:p-1.5 rounded hover:bg-gray-50 transition-colors ${
                    selectedRating === stars ? 'bg-gray-100' : ''
                  }`}
                >
                  <span className="w-10 md:w-14 text-xs md:text-sm">{stars} stars</span>
                  <div className="flex-1 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${reviewCount ? (ratingCounts[index] / reviewCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 md:w-8 text-xs md:text-sm text-right">
                    {ratingCounts[index]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Overall Rating with enhanced shadow */}
          <div className="w-full sm:w-2/5 bg-white p-3 md:p-4 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-medium text-base md:text-lg mb-1 md:mb-2">Overall Rating</h3>
            {/* Mobile-only horizontal layout */}
            <div className="flex md:hidden flex-row items-center gap-4 py-1">
              <div className="text-3xl font-medium">{averageRating.toFixed(1)}</div>
              <div className="flex flex-col items-center">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(averageRating) ? 'fill-current' : ''
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">{reviewCount} Reviews</p>
              </div>
            </div>

            {/* Desktop layout - unchanged from original */}
            <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:h-[calc(100%-2rem)]">
              <div className="text-4xl font-medium mb-1">{averageRating.toFixed(1)}</div>
              <div className="flex text-yellow-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{reviewCount} Reviews</p>
            </div>
          </div>
        </div>

        {/* Write Review Button at top right - desktop only (unchanged) */}
        <div className="hidden md:block md:w-1/3 md:flex md:justify-end">
          <ReviewModal
            productId={product.id}
            productName={product.name}
            onSubmit={handleReviewSubmit}
          />
        </div>
      </div>

      {/* Reviews List Section */}
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {/* Sort and Pagination Info */}
        <div className="flex justify-between items-center bg-white p-6 rounded-t-lg shadow-sm">
          {/* Mobile-only stacked layout with reordering */}
          <div className="sm:hidden w-full flex flex-col gap-3">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest to Lowest</SelectItem>
                <SelectItem value="lowest">Lowest to Highest</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-600">
              {reviews.length > 0
                ? `${indexOfFirstReview + 1} - ${Math.min(indexOfLastReview, reviews.length)} of ${
                    reviews.length
                  } Reviews`
                : '0 Reviews'}
            </div>
          </div>

          {/* Original desktop layout - unchanged */}
          <div className="hidden sm:block text-sm text-gray-600">
            {reviews.length > 0
              ? `${indexOfFirstReview + 1} - ${Math.min(indexOfLastReview, reviews.length)} of ${
                  reviews.length
                } Reviews`
              : '0 Reviews'}
          </div>
          <div className="hidden sm:block">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest to Lowest</SelectItem>
                <SelectItem value="lowest">Lowest to Highest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews */}
        <div className="divide-y divide-gray-100">
          {currentReviews.length > 0 ? (
            currentReviews.map((review, index) => (
              <div key={index} className="p-4 sm:p-6">
                {/* Mobile-only stacked layout */}
                <div className="flex flex-col sm:hidden gap-1 mb-2">
                  <h4 className="font-medium text-sm">{review.name}</h4>
                  <div className="flex text-yellow-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>

                {/* Desktop layout (unchanged) */}
                <div className="hidden sm:flex sm:items-start sm:justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{review.name}</h4>
                    <div className="flex text-yellow-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>

                <div
                  className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4"
                  dangerouslySetInnerHTML={{
                    __html: review.review,
                  }}
                />
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 sm:pb-0 sm:overflow-x-visible">
                    {review.images.map((image) => (
                      <button
                        key={image.id}
                        className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden hover:opacity-90 transition-opacity group flex-shrink-0 shadow-sm"
                        onClick={() => {
                          setSelectedImage(image.url)
                          setSelectedReview(review)
                        }}
                      >
                        <Image
                          src={image.thumbnail || image.url}
                          alt="Review photo"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = image.url
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 sm:gap-2 p-4 sm:p-6 border-t border-gray-100">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 sm:h-auto sm:w-auto"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="flex items-center px-2 sm:px-4 text-xs sm:text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 sm:h-auto sm:w-auto"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      {selectedReview && (
        <ImageDialog
          isOpen={!!selectedImage}
          onClose={() => {
            setSelectedImage(null)
            setSelectedReview(null)
          }}
          image={selectedImage}
          review={selectedReview}
        />
      )}
    </div>
  )
}
