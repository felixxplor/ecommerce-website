// utils/advanced-wp-processor.ts

/**
 * Advanced WordPress content processor that handles tables, headings, and complex formatting
 */
export function processAdvancedWordPressContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  let processed = content.trim()

  // If content already has proper HTML structure, apply enhancements
  if (/<(table|h[1-6]|div|p)/i.test(processed)) {
    return enhanceExistingHTML(processed)
  }

  // Process raw content into structured HTML
  return processRawContent(processed)
}

function enhanceExistingHTML(content: string): string {
  let enhanced = content

  // Enhance tables with better styling
  enhanced = enhanced.replace(
    /<table([^>]*)>/gi,
    '<table$1 class="wp-block-table w-full border-collapse border border-gray-300">'
  )

  enhanced = enhanced.replace(/<td([^>]*)>/gi, '<td$1 class="border border-gray-300 px-3 py-2">')

  enhanced = enhanced.replace(
    /<th([^>]*)>/gi,
    '<th$1 class="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold">'
  )

  // Enhance headings
  enhanced = enhanced.replace(/<h([1-6])([^>]*)>/gi, (match, level, attrs) => {
    const classes = {
      '1': 'text-3xl font-bold mb-4 mt-6',
      '2': 'text-2xl font-bold mb-3 mt-5',
      '3': 'text-xl font-semibold mb-3 mt-4',
      '4': 'text-lg font-semibold mb-2 mt-3',
      '5': 'text-base font-semibold mb-2 mt-3',
      '6': 'text-sm font-semibold mb-2 mt-2',
    }
    return `<h${level}${attrs} class="${classes[level as keyof typeof classes]}">`
  })

  // Enhance lists
  enhanced = enhanced.replace(/<ul([^>]*)>/gi, '<ul$1 class="list-disc pl-6 mb-4 space-y-1">')

  enhanced = enhanced.replace(/<ol([^>]*)>/gi, '<ol$1 class="list-decimal pl-6 mb-4 space-y-1">')

  enhanced = enhanced.replace(/<li([^>]*)>/gi, '<li$1 class="mb-1">')

  return enhanced
}

function processRawContent(content: string): string {
  // Split content into sections based on common patterns
  const sections = content.split(/(?=^[A-Z][^a-z\n]*$)/m).filter((s) => s.trim())

  return sections
    .map((section) => {
      section = section.trim()
      if (!section) return ''

      // Check if this looks like a heading (all caps or title case, short line)
      const lines = section.split('\n')
      const firstLine = lines[0].trim()

      if (isHeadingLine(firstLine) && lines.length > 1) {
        const heading = firstLine
        const content = lines.slice(1).join('\n').trim()

        return `<h3 class="text-xl font-semibold mb-3 mt-4">${heading}</h3>\n${processContentSection(
          content
        )}`
      }

      return processContentSection(section)
    })
    .join('\n\n')
}

function isHeadingLine(line: string): boolean {
  // Check if line looks like a heading
  return (
    line.length < 50 && // Short enough to be a heading
    (line === line.toUpperCase() || // All caps
      /^[A-Z][a-z\s]*$/.test(line) || // Title case
      /^[A-Z][^a-z]*$/.test(line)) && // Starts with caps, no lowercase
    !/[.!?:]$/.test(line) // Doesn't end with sentence punctuation
  )
}

function processContentSection(content: string): string {
  let processed = content

  // Process table-like content (Feature | Details pattern)
  if (processed.includes('|') && processed.includes('\n')) {
    processed = processTableContent(processed)
  }
  // Process list items
  else if (/^[-•*]\s/m.test(processed)) {
    processed = processListContent(processed)
  }
  // Process regular paragraphs
  else {
    processed = processParagraphContent(processed)
  }

  return processed
}

function processTableContent(content: string): string {
  const lines = content.split('\n').filter((line) => line.trim())
  const tableRows: string[] = []
  let hasHeader = false

  lines.forEach((line, index) => {
    if (line.includes('|')) {
      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell)

      if (cells.length >= 2) {
        if (
          index === 0 ||
          (!hasHeader &&
            (cells[0].toLowerCase().includes('feature') ||
              cells[0].toLowerCase().includes('property')))
        ) {
          // Header row
          tableRows.push(
            `<tr>${cells
              .map(
                (cell) =>
                  `<th class="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold">${cell}</th>`
              )
              .join('')}</tr>`
          )
          hasHeader = true
        } else {
          // Data row
          tableRows.push(
            `<tr>${cells
              .map((cell) => `<td class="border border-gray-300 px-3 py-2">${cell}</td>`)
              .join('')}</tr>`
          )
        }
      }
    }
  })

  if (tableRows.length > 0) {
    return `<table class="wp-block-table w-full border-collapse border border-gray-300 mb-4">
      <tbody>
        ${tableRows.join('\n')}
      </tbody>
    </table>`
  }

  return processParagraphContent(content)
}

function processListContent(content: string): string {
  const lines = content.split('\n')
  const listItems: string[] = []
  let currentItem = ''

  lines.forEach((line) => {
    if (/^[-•*]\s/.test(line.trim())) {
      if (currentItem) {
        listItems.push(currentItem.trim())
      }
      currentItem = line.replace(/^[-•*]\s/, '').trim()
    } else if (line.trim() && currentItem) {
      currentItem += ' ' + line.trim()
    } else if (currentItem) {
      listItems.push(currentItem.trim())
      currentItem = ''
    }
  })

  if (currentItem) {
    listItems.push(currentItem.trim())
  }

  if (listItems.length > 0) {
    const formattedItems = listItems.map((item) => `<li class="mb-1">${item}</li>`).join('\n')
    return `<ul class="list-disc pl-6 mb-4 space-y-1">\n${formattedItems}\n</ul>`
  }

  return processParagraphContent(content)
}

function processParagraphContent(content: string): string {
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim())

  return paragraphs
    .map((paragraph) => {
      paragraph = paragraph.trim().replace(/\n/g, ' ')
      return `<p class="mb-4">${paragraph}</p>`
    })
    .join('\n')
}

/**
 * Add measurement highlighting (like the red underlines in your WordPress version)
 */
export function highlightMeasurements(content: string): string {
  // Highlight measurements like 30cm, 10m, 3.5mm, etc.
  return content.replace(
    /(\d+(?:\.\d+)?)(cm|mm|m|kg|g|w|v|mah|hours?)\b/gi,
    '<span class="measurement-highlight text-red-600 underline font-medium">$1$2</span>'
  )
}

/**
 * Main function to use in your component
 */
export function formatProductDescription(content: string): string {
  if (!content) return ''

  let formatted = processAdvancedWordPressContent(content)
  formatted = highlightMeasurements(formatted)

  return formatted
}
