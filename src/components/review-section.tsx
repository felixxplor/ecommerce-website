'use client'

import React, { useState, useEffect } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Product } from '@/graphql'
import ReviewModal, { ReviewSubmitData } from './review-modal'
import { getClient } from '@/graphql'
import { print } from 'graphql'
import { GetProductReviewsDocument, GetProductReviewsQuery } from '@/graphql/generated'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

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

export function ReviewsSection({ product }: { product: Product }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [ratingCounts, setRatingCounts] = useState<number[]>([0, 0, 0, 0, 0])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const isValidImage = (photo: any): ReviewImage | null => {
    if (!photo || !photo.sourceUrl) return null

    // Get thumbnail from mediaDetails if available
    const thumbnail = photo.mediaDetails?.sizes?.[0]?.sourceUrl || photo.sourceUrl

    return {
      id: photo.id || String(Date.now()),
      url: photo.sourceUrl,
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
          // Handle single review photo
          const reviewPhoto = edge.node?.reviewPhoto
          const image = reviewPhoto ? isValidImage(reviewPhoto) : null

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

  console.log('review', reviews)

  return (
    <div id="reviews" className="scroll-mt-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-medium">Customer Reviews</h2>
        <ReviewModal
          productId={product.id}
          productName={product.name}
          onSubmit={handleReviewSubmit}
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Rating Snapshot */}
          <div className="w-full md:w-72 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4">Rating Snapshot</h3>
            <p className="text-sm text-gray-600 mb-4">Select a row to filter reviews.</p>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars, index) => (
                <button
                  key={stars}
                  onClick={() => handleRatingFilter(stars)}
                  className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors ${
                    selectedRating === stars ? 'bg-gray-100' : ''
                  }`}
                >
                  <span className="w-16 text-sm">{stars} stars</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${reviewCount ? (ratingCounts[index] / reviewCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm text-right">{ratingCounts[index]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          <div className="w-full md:w-72 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4">Overall Rating</h3>
            <div className="text-center">
              <div className="text-5xl font-medium mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{reviewCount} Reviews</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-2">
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
                  className="text-gray-700 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: review.review,
                  }}
                />
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                    {review.images.map((image) => (
                      <button
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity group"
                        onClick={() => setSelectedImage(image.url)}
                      >
                        <Image
                          src={image.thumbnail || image.url}
                          alt="Review photo"
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = image.url // Fallback to full URL if thumbnail fails
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
            <div className="text-center py-4 text-gray-500">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedImage && (
            <div className="relative aspect-square bg-black">
              <Image
                src={selectedImage}
                alt="Review photo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
