/**
 * @fileoverview HTML Rendering Core
 * @module renderer/html-renderer
 * @version 2.1.0
 * @author Kiro
 * @created 2024-04-07
 * @modified 2026-01-04
 *
 * @description
 * Core HTML rendering module for medical form print output.
 * Generates complete HTML documents with embedded CSS styles,
 * ready for printing or PDF generation.
 *
 * Features:
 * - Schema-driven rendering with PrintSchema configuration
 * - Per-template baseUnit scaling support
 * - Watermark support
 * - Custom theme configuration
 *
 * @dependencies
 * - ../types/print-schema - Print configuration types
 * - ../types/options - Render options types
 * - ../styles - CSS generation and theme system
 * - ./section-renderers - Section-specific renderers
 * - ../utils - Utility functions
 *
 * @usedBy
 * - ../index.ts - Library main entry
 * - ../node.ts - Node.js PDF generation entry
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import { generateCss, mergeTheme, createThemeWithBaseUnit } from '../styles'
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
    // For single page rendering, show "Page 1 of 1"
    pageNumberHtml = '<span class="page-number">Page 1 of 1</span>'
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
 * Render PrintSchema and FormData to a complete HTML document
 * 
 * This is the main rendering function that generates a complete HTML document
 * with embedded CSS styles, ready for printing or PDF generation.
 * 
 * @param schema - Print layout configuration defining page size, header, sections, and footer
 * @param data - Form data object containing field values
 * @param options - Optional render configuration
 * @param options.theme - Custom theme configuration for fonts, colors, and spacing
 * @param options.watermark - Watermark text to display on the page
 * @param options.watermarkOpacity - Watermark opacity (0-1)
 * @returns Complete HTML document string including DOCTYPE, head, and body
 * 
 * @example
 * ```typescript
 * import { renderToHtml } from 'medical-form-printer'
 * 
 * const html = renderToHtml(printSchema, formData, {
 *   watermark: 'Internal Use Only',
 *   watermarkOpacity: 0.1,
 *   theme: {
 *     colors: { primary: '#1a1a1a' }
 *   }
 * })
 * 
 * // Display in iframe or use for PDF generation
 * document.getElementById('preview').innerHTML = html
 * ```
 */
export function renderToHtml(
  schema: PrintSchema,
  data: FormData,
  options?: RenderOptions & { watermark?: string; watermarkOpacity?: number }
): string {
  // Use baseUnit from schema if provided, otherwise use default theme
  const theme = schema.baseUnit 
    ? createThemeWithBaseUnit(schema.baseUnit)
    : mergeTheme(options?.theme)
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

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * Re-exported from utils/html-builder for backward compatibility.
 * @see {@link ../utils/html-builder.ts}
 */
export { escapeHtml }
