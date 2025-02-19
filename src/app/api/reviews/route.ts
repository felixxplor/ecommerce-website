// app/api/reviews/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'
import { WriteProductReviewDocument, WriteProductReviewMutation } from '@/graphql/generated'
import { print } from 'graphql'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const wooSession = request.headers.get('woocommerce-session')

    // Debug log
    console.log('Received form data keys:', Array.from(formData.keys()))

    // Extract basic review data
    const productId = Number(formData.get('productId'))
    const rating = Number(formData.get('rating'))
    const comment = formData.get('comment') as string
    const author = formData.get('author') as string
    const authorEmail = formData.get('authorEmail') as string
    const image = formData.get('image0')

    // Validation
    if (!productId || !rating || !author || !authorEmail) {
      return NextResponse.json({ errors: { message: 'Missing required fields' } }, { status: 400 })
    }

    // Submit review
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
          content: comment.trim(),
          author,
          authorEmail,
          clientMutationId: `review-${Date.now()}`,
        },
      }
    )

    if (!reviewResponse.writeReview) {
      throw new Error('Failed to write review')
    }

    // Handle image upload
    const uploadedImages = []
    if (image instanceof File) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', image)
      uploadFormData.append('review_bot_trap', '')

      const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL
      console.log(
        'Uploading to WordPress:',
        `${WORDPRESS_URL}/wp-json/custom/v1/upload-review-photo`
      )

      try {
        const uploadResponse = await fetch(
          `${WORDPRESS_URL}/wp-json/custom/v1/upload-review-photo`,
          {
            method: 'POST',
            body: uploadFormData,
          }
        )

        console.log('Upload response status:', uploadResponse.status)
        const responseText = await uploadResponse.text()
        console.log('Upload response:', responseText)

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${responseText}`)
        }

        const uploadData = JSON.parse(responseText)
        uploadedImages.push({
          id: uploadData.id || String(Date.now()),
          url: uploadData.url || uploadData.source_url,
          thumbnail: uploadData.thumbnail || uploadData.source_url,
        })
      } catch (error) {
        console.error('Error uploading image:', error)
      }
    }

    // Return success response - removed id from the response since it's not in the type
    return NextResponse.json({
      success: true,
      review: {
        clientMutationId: reviewResponse.writeReview.clientMutationId,
        rating: reviewResponse.writeReview.rating,
        images: uploadedImages,
      },
    })
  } catch (err) {
    console.error('Error submitting review:', err)
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
