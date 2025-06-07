// utils/wordpress-content.ts

/**
 * Processes WordPress content to match the formatting applied by WordPress
 * This mimics WordPress's wpautop() function
 */
export function processWordPressContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  // Remove any existing formatting to start clean
  let processed = content.trim()

  // If content already has paragraph tags, return as-is
  if (processed.includes('<p>') || processed.includes('<div>')) {
    return processed
  }

  // Split content by double line breaks (WordPress paragraph separators)
  const blocks = processed.split(/\n\s*\n/)

  // Process each block
  const processedBlocks = blocks.map((block) => {
    block = block.trim()

    if (!block) {
      return ''
    }

    // Skip processing if block contains HTML block elements
    if (
      /<(div|h[1-6]|p|blockquote|pre|table|ul|ol|li|form|fieldset|address|style|script|object|embed|iframe|figure|section|article|header|footer|nav|aside|main)/i.test(
        block
      )
    ) {
      // Just process single line breaks within this block
      return block.replace(/\n(?!<)/g, '<br />')
    }

    // Convert single line breaks to <br> tags
    block = block.replace(/\n/g, '<br />')

    // Wrap in paragraph tags
    return `<p>${block}</p>`
  })

  return processedBlocks.filter((block) => block).join('\n\n')
}

/**
 * Alternative processor that's more conservative
 */
export function processWordPressContentSimple(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  let processed = content.trim()

  // If already has HTML structure, return as-is
  if (/<(p|div|h[1-6]|ul|ol|li|blockquote)/i.test(processed)) {
    return processed
  }

  // Simple processing: convert double line breaks to paragraph breaks
  // and single line breaks to <br> tags
  processed = processed
    .split(/\n\s*\n/) // Split on double line breaks
    .map((paragraph) => {
      paragraph = paragraph.trim()
      if (!paragraph) return ''

      // Convert single line breaks to <br>
      paragraph = paragraph.replace(/\n/g, '<br />')

      // Wrap in paragraph tags
      return `<p>${paragraph}</p>`
    })
    .filter((p) => p)
    .join('\n\n')

  return processed
}

/**
 * Clean up WordPress content (remove excessive spacing, etc.)
 */
export function cleanWordPressContent(content: string): string {
  if (!content) return ''

  return (
    content
      // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Clean up excessive line breaks
      .replace(/(<br\s*\/?>){3,}/g, '<br /><br />')
      // Clean up excessive spacing
      .replace(/\s{2,}/g, ' ')
      // Trim
      .trim()
  )
}
