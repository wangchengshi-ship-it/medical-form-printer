/**
 * @fileoverview Isolated Mode HTML Renderer
 * @module renderer/isolated-html-renderer
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Generates HTML output with CSS isolation, ensuring:
 * 1. All class names have mpr- prefix
 * 2. Styles are completely isolated from external influence
 * 3. Font is forced to use Source Han Serif SC
 *
 * @dependencies
 * - ../types/print-schema - Print configuration types
 * - ../types/options - Render options types
 * - ../styles - Style system
 * - ./section-renderers - Section renderers
 * - ../utils - Utility functions
 *
 * @usedBy
 * - ../index.ts - Library main entry
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE, createThemeWithBaseUnit } from '../styles'
import type { DeepPartial } from '../styles'
import type { Theme } from '../types/theme'
import { renderSection } from './section-renderers'
import { escapeHtml, renderWatermarkHtml } from '../utils'

// ==================== Type Definitions ====================

/**
 * Isolated render options
 */
export interface IsolatedRenderOptions extends RenderOptions {
  /** Watermark text */
  watermark?: string
  /** Watermark opacity (0-1), values outside range will be clamped */
  watermarkOpacity?: number
}

/**
 * Render context (internal use)
 */
interface RenderContext {
  css: string
  pageClasses: string
  header: string
  sections: string
  footer: string
  watermark: string
}

// ==================== Constants ====================

/** Namespace prefix */
const ns = CSS_NAMESPACE

// ==================== Internal Render Functions ====================

/**
 * Render header
 */
function renderHeader(schema: PrintSchema): string {
  const { header } = schema

  const logo = header.showLogo && header.logoUrl
    ? `<img src="${escapeHtml(header.logoUrl)}" alt="Logo" class="${ns}-header-logo" />`
    : ''

  return `<header class="${ns}-print-header">
${logo}
<div class="${ns}-header-row">
<span class="${ns}-hospital-name">${escapeHtml(header.hospital)}</span>
<span class="${ns}-department-name">${escapeHtml(header.department || '')}</span>
</div>
<h1 class="${ns}-form-title">${escapeHtml(header.title)}</h1>
</header>`
}

/**
 * Render footer
 */
function renderFooter(schema: PrintSchema): string {
  const { footer } = schema
  if (!footer) return ''

  const notes = footer.notes
    ? `<span class="${ns}-footer-notes">${escapeHtml(footer.notes)}</span>`
    : ''

  const pageNumber = footer.showPageNumber
    ? `<span class="${ns}-page-number"></span>`
    : ''

  return `<footer class="${ns}-print-footer">
${notes}
${pageNumber}
</footer>`
}

/**
 * Render section title
 */
function renderSectionTitle(title: string | undefined): string {
  return title ? `<div class="${ns}-section-title">${escapeHtml(title)}</div>` : ''
}

/**
 * Render all sections
 * @description In isolated mode, automatically passes classPrefix: 'mpr' to all section renderers,
 * ensuring generated HTML class names match CSS rules.
 */
function renderSections(schema: PrintSchema, data: FormData, options?: RenderOptions): string {
  // In isolated mode, force use of mpr prefix
  const isolatedOptions: RenderOptions = {
    ...options,
    classPrefix: CSS_NAMESPACE,
  }
  
  return schema.sections
    .map((section) => {
      const title = renderSectionTitle(section.title)
      const content = renderSection(section.type, section.config, data, isolatedOptions)
      return `${title}${content}`
    })
    .join('\n')
}

/**
 * Render watermark
 * @param text - Watermark text
 * @param opacity - Opacity (0-1), values outside range will be clamped
 */
function renderWatermark(text?: string, opacity?: number): string {
  return renderWatermarkHtml({
    text,
    opacity,
    className: `${ns}-watermark`,
  })
}

/**
 * Get page class names
 */
function getPageClasses(schema: PrintSchema): string {
  return [
    `${ns}-print-page`,
    schema.pageSize.toLowerCase() !== 'a4' && `${ns}-${schema.pageSize.toLowerCase()}`,
    schema.orientation === 'landscape' && `${ns}-landscape`,
  ].filter(Boolean).join(' ')
}

// ==================== Core Render Logic ====================

/**
 * Create render context
 * Extracts common render logic to avoid code duplication
 */
function createRenderContext(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): RenderContext {
  // Build theme with baseUnit if provided
  let themeOverride: DeepPartial<Theme> | undefined = options?.theme
  if (schema.baseUnit) {
    const scaledTheme = createThemeWithBaseUnit(schema.baseUnit)
    themeOverride = { ...scaledTheme, ...options?.theme }
  }
  
  return {
    css: generateIsolatedCss(themeOverride),
    pageClasses: getPageClasses(schema),
    header: renderHeader(schema),
    sections: renderSections(schema, data, options),
    footer: renderFooter(schema),
    watermark: renderWatermark(options?.watermark, options?.watermarkOpacity),
  }
}

/**
 * Render isolated container content
 */
function renderIsolatedContent(ctx: RenderContext): string {
  return `<div class="${ISOLATION_ROOT_CLASS}">
<style>
${ctx.css}
</style>
<div class="${ctx.pageClasses}">
${ctx.watermark}
${ctx.header}
<main class="${ns}-print-content">
${ctx.sections}
</main>
${ctx.footer}
</div>
</div>`
}

// ==================== Public API ====================

/**
 * Render PrintSchema and FormData to isolated HTML string
 *
 * @param schema - Print layout configuration
 * @param data - Form data
 * @param options - Render options (font configuration will be ignored)
 * @returns Complete isolated HTML document
 *
 * @description
 * Generated HTML has the following characteristics:
 * 1. All content wrapped in .mpr-root isolation container
 * 2. CSS embedded in <style> tag within isolation container
 * 3. All class names have mpr- prefix
 * 4. Font forced to use embedded Source Han Serif SC
 *
 * @example
 * ```typescript
 * const html = renderToIsolatedHtml(schema, data)
 * // Output HTML styles are completely isolated, safe to embed in any page
 * ```
 */
export function renderToIsolatedHtml(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): string {
  const ctx = createRenderContext(schema, data, options)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(schema.header.title)}</title>
</head>
<body>
${renderIsolatedContent(ctx)}
</body>
</html>`
}

/**
 * Render isolated HTML fragment (without DOCTYPE and html/head/body tags)
 * Suitable for embedding into existing pages
 *
 * @param schema - Print layout configuration
 * @param data - Form data
 * @param options - Render options
 * @returns Isolated HTML fragment
 */
export function renderToIsolatedFragment(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): string {
  return renderIsolatedContent(createRenderContext(schema, data, options))
}
