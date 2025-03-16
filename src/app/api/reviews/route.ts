// app/api/reviews/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { WriteProductReviewDocument, WriteProductReviewMutation } from '@/graphql/generated'
import { print } from 'graphql'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const wooSession = request.headers.get('woocommerce-session')

    // Extract basic review data
    const productId = Number(formData.get('productId'))
    const rating = Number(formData.get('rating'))
    const comment = formData.get('comment') as string
    const author = formData.get('author') as string
    const authorEmail = formData.get('authorEmail') as string
    const image = formData.get('image0')

    if (!productId || !rating || !comment || !author || !authorEmail) {
      return NextResponse.json({ errors: { message: 'Missing required fields' } }, { status: 400 })
    }

    const clientMutationId = `review-${Date.now()}`
    let uploadData = null

    // Handle photo upload if present
    if (image instanceof File) {
      const imageFormData = new FormData()
      imageFormData.append('file', image)

      try {
        const uploadUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/upload-review-photo`
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: imageFormData,
        })

        const responseData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(responseData.error || 'Upload failed')
        }

        uploadData = responseData
      } catch (error: any) {
        throw new Error(`Image upload failed: ${error.message}`)
      }
    }

    // Submit review via GraphQL
    const client = getClient()
    if (wooSession) {
      client.setHeader('woocommerce-session', wooSession)
    }

    const reviewResponse = await client.request<WriteProductReviewMutation>(
      print(WriteProductReviewDocument),
      {
        input: {
          commentOn: productId,
          rating,
          content: `${comment.trim()}`,
          author,
          authorEmail,
          clientMutationId,
        },
      }
    )

    if (!reviewResponse.writeReview) {
      throw new Error('Failed to create review')
    }

    // If we have an uploaded photo, link it to the review
    if (uploadData) {
      try {
        // Get the actual review ID
        const getReviewUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/get-review-id?clientMutationId=${clientMutationId}`
        const reviewIdResponse = await fetch(getReviewUrl)

        if (!reviewIdResponse.ok) {
          const errorData = await reviewIdResponse.json()
          throw new Error(errorData.error || 'Failed to get review ID')
        }

        const { review_id } = await reviewIdResponse.json()

        // Link the photo to the review
        const linkUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/custom/v1/link-review-photo`
        const linkResponse = await fetch(linkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            review_id,
            photo_id: uploadData.id,
          }),
        })

        if (!linkResponse.ok) {
          const errorData = await linkResponse.json()
          throw new Error(errorData.error || 'Failed to link photo to review')
        }
      } catch (error: any) {}
    }

    return NextResponse.json({
      success: true,
      review: {
        clientMutationId,
        rating: reviewResponse.writeReview.rating,
        images: uploadData
          ? [
              {
                id: uploadData.id,
                url: uploadData.url,
                thumbnail: uploadData.thumbnail,
              },
            ]
          : undefined,
      },
    })
  } catch (err: unknown) {
    console.error('Full error:', err)
    return NextResponse.json(
      {
        errors: {
          message: err instanceof Error ? err.message : 'Failed to submit review',
        },
      },
      { status: 500 }
    )
  }
}
