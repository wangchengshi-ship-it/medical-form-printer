/**
 * @fileoverview HTML Rendering Core
 * @module renderer/html-renderer
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import { generateCss, mergeTheme } from '../styles'
import { renderSection } from './section-renderers'
import { escapeHtml } from '../utils'

/**
 * Render header
 */
function renderHeader(schema: PrintSchema): string {
  const { header } = schema
  
  let logoHtml = ''
  if (header.showLogo && header.logoUrl) {
    logoHtml = `<img src="${escapeHtml(header.logoUrl)}" alt="Logo" class="header-logo" />`
  }
  
  let departmentHtml = ''
  if (header.department) {
    departmentHtml = `<div class="department-name">${escapeHtml(header.department)}</div>`
  }
  
  return `<header class="print-header">
${logoHtml}
<div class="hospital-name">${escapeHtml(header.hospital)}</div>
${departmentHtml}
<h1 class="form-title">${escapeHtml(header.title)}</h1>
</header>`
}

/**
 * Render footer
 */
function renderFooter(schema: PrintSchema): string {
  const { footer } = schema
  if (!footer) return ''
  
  let notesHtml = ''
  if (footer.notes) {
    notesHtml = `<span class="footer-notes">${escapeHtml(footer.notes)}</span>`
  }
  
  let pageNumberHtml = ''
  if (footer.showPageNumber) {
    pageNumberHtml = '<span class="page-number"></span>'
  }
  
  return `<footer class="print-footer">
${notesHtml}
${pageNumberHtml}
</footer>`
}

/**
 * Render all sections
 */
function renderSections(
  schema: PrintSchema,
  data: FormData,
  options?: RenderOptions
): string {
  return schema.sections
    .map((section) => {
      let titleHtml = ''
      if (section.title) {
        titleHtml = `<div class="section-title">${escapeHtml(section.title)}</div>`
      }
      
      const content = renderSection(section.type, section.config, data, options)
      
      return `${titleHtml}${content}`
    })
    .join('\n')
}

/**
 * Render watermark
 */
function renderWatermark(text?: string, opacity?: number): string {
  if (!text) return ''
  const style = opacity !== undefined ? ` style="opacity: ${opacity}"` : ''
  return `<div class="watermark"${style}>${escapeHtml(text)}</div>`
}

/**
 * Render PrintSchema and FormData to complete HTML string
 * 
 * @param schema - Print layout configuration
 * @param data - Form data
 * @param options - Render options
 * @returns Complete HTML string (including CSS)
 */
export function renderToHtml(
  schema: PrintSchema,
  data: FormData,
  options?: RenderOptions & { watermark?: string; watermarkOpacity?: number }
): string {
  const theme = mergeTheme(options?.theme)
  const css = generateCss(theme)
  
  // Page class names
  const pageClasses = [
    'print-page',
    schema.pageSize.toLowerCase(),
    schema.orientation,
  ].join(' ')
  
  // Render each part
  const header = renderHeader(schema)
  const sections = renderSections(schema, data, options)
  const footer = renderFooter(schema)
  const watermark = renderWatermark(options?.watermark, options?.watermarkOpacity)
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(schema.header.title)}</title>
<style>
${css}
</style>
</head>
<body>
<div class="${pageClasses}">
${watermark}
${header}
<main class="print-content">
${sections}
</main>
${footer}
</div>
</body>
</html>`
}

// Re-export escapeHtml for backward compatibility
export { escapeHtml }
