// app/api/reviews/ratings/route.ts
import { NextResponse } from 'next/server'
import { getClient } from '@/graphql'

interface CommentMeta {
  key: string
  value: string
}

interface CommentResponse {
  comment: {
    commentMeta: CommentMeta[]
  }
}

export async function GET(request: Request) {
  try {
    const commentId = request.headers.get('comment-id')

    if (!commentId) {
      return NextResponse.json({ errors: { message: 'Comment ID is required' } }, { status: 400 })
    }

    const client = getClient()

    // Get the rating from WordPress comment meta
    const query = `
      query GetCommentMeta($id: ID!) {
        comment(id: $id) {
          commentMeta {
            key
            value
          }
        }
      }
    `

    const response = await client.request<CommentResponse>(query, { id: commentId })

    if (!response.comment) {
      return NextResponse.json({ errors: { message: 'Comment not found' } }, { status: 404 })
    }

    const ratingMeta = response.comment.commentMeta.find((meta) => meta.key === 'rating')

    return NextResponse.json({ rating: ratingMeta?.value || '5' })
  } catch (err) {
    // console.error('Error fetching comment rating:', err)
    return NextResponse.json({ errors: { message: 'Failed to fetch rating' } }, { status: 500 })
  }
}
