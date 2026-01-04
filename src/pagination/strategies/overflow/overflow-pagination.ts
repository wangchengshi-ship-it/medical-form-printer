/**
 * @fileoverview Overflow field pagination rendering
 * @module pagination/overflow-pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Handles overflow field pagination rendering logic:
 * - Identifies sections containing overflow fields
 * - First page displays truncated content + continuation marker (red "see next page")
 * - Continuation pages display remaining content with field label + "(continued)" suffix
 * - Integrates with existing pagination features
 *
 * @requirements
 * - 1.1: Identify sections containing overflow fields
 * - 1.2: Support info-grid sections with overflow fields
 * - 1.3: Support multiple overflow fields
 * - 2.1: Render truncated content on first page
 * - 2.2: Append continuation marker when there is overflow content
 * - 3.1: Render remaining content on continuation pages
 * - 3.2: Display field label with continuation suffix
 *
 * @dependencies
 * - ./overflow-handler.ts - Overflow field processing core logic
 * - ../../types.ts - Type definitions
 * - ../../../types/print-schema.ts - PrintSection types
 *
 * @usedBy
 * - ../../paginated-renderer.ts - Paginated renderer
 */

import type { PrintSection, InfoGridConfig, InfoGridCell } from '../../../types/print-schema'
import type { PaginationConfig, OverflowTextConfig, OverflowFieldConfig } from '../../types'
import type { OverflowFieldResult } from './overflow-handler'
import { DEFAULT_OVERFLOW_TEXT, PAGINATION_DEFAULTS } from '../../types'
import { getOverflowFirstLine, hasOverflowContent } from './overflow-handler'
import { span, div, escapeHtml } from '../../../utils'

// ==================== Type Definitions ====================

/** Class name generator function type */
type ClassNameFn = (name: string) => string

/**
 * Overflow field render context
 * Contains all information needed to render overflow fields
 */
export interface OverflowRenderContext {
  /** Overflow field processing result */
  result: OverflowFieldResult
  /** Field label (for continuation page display) */
  fieldLabel: string
  /** Whether this is the first page */
  isFirstPage: boolean
}

// ==================== CSS Class Name Constants ====================

/** CSS class names for overflow field rendering */
export const OVERFLOW_CSS_CLASSES = {
  /** First page truncated content container */
  OVERFLOW_FIRST_LINE: 'overflow-first-line',
  /** Continuation page content container */
  OVERFLOW_CONTINUATION: 'overflow-continuation',
  /** "see next page" marker (red color) */
  SEE_NEXT: 'see-next',
  /** Field label on continuation page */
  OVERFLOW_LABEL: 'overflow-label',
  /** Overflow content (preserves whitespace) */
  OVERFLOW_CONTENT: 'overflow-content',
} as const

// ==================== Section Identification Functions ====================

/**
 * Check if a section contains overflow fields
 *
 * @param section - PrintSection to check
 * @param overflowFields - List of overflow field names
 * @returns Whether section contains any overflow field
 *
 * @requirements 1.1, 1.2 - Identify sections containing overflow fields
 *
 * @example
 * const isOverflow = isOverflowSection(section, ['nursingPoints'])
 */
export function isOverflowSection(
  section: PrintSection,
  overflowFields: string[]
): boolean {
  // Only info-grid sections can contain overflow fields
  if (section.type !== 'info-grid') {
    return false
  }

  if (overflowFields.length === 0) {
    return false
  }

  const config = section.config as InfoGridConfig
  
  // Check if any cell's field matches overflow fields
  for (const row of config.rows) {
    for (const cell of row.cells) {
      if (overflowFields.includes(cell.field)) {
        return true
      }
    }
  }

  return false
}

/**
 * Find the label for an overflow field from section configuration
 *
 * @param section - PrintSection containing the field
 * @param fieldName - Field name to find
 * @returns Field label, or fieldName if not found
 *
 * @requirements 1.2 - Extract field label from info-grid configuration
 *
 * @example
 * const label = findOverflowFieldLabel(section, 'nursingPoints')
 * // Returns: "Nursing Points (add attachment if needed)"
 */
export function findOverflowFieldLabel(
  section: PrintSection,
  fieldName: string
): string {
  if (section.type !== 'info-grid') {
    return fieldName
  }

  const config = section.config as InfoGridConfig

  for (const row of config.rows) {
    for (const cell of row.cells) {
      if (cell.field === fieldName) {
        return cell.label || fieldName
      }
    }
  }

  return fieldName
}

/**
 * Find overflow field cell from section
 *
 * @param section - PrintSection to search
 * @param fieldName - Field name to find
 * @returns InfoGridCell if found, undefined otherwise
 */
export function findOverflowFieldCell(
  section: PrintSection,
  fieldName: string
): InfoGridCell | undefined {
  if (section.type !== 'info-grid') {
    return undefined
  }

  const config = section.config as InfoGridConfig

  for (const row of config.rows) {
    for (const cell of row.cells) {
      if (cell.field === fieldName) {
        return cell
      }
    }
  }

  return undefined
}

// ==================== Configuration Extraction Functions ====================

/**
 * Extract overflow field configurations from PaginationConfig
 *
 * @param paginationConfig - Pagination configuration
 * @returns Array of overflow field configurations
 *
 * @requirements 1.3 - Support multiple overflow fields
 *
 * @example
 * const configs = getOverflowFieldsFromConfig(schema.pagination)
 */
export function getOverflowFieldsFromConfig(
  paginationConfig?: PaginationConfig
): OverflowFieldConfig[] {
  if (!paginationConfig) {
    return []
  }

  // Use new config structure, fallback to deprecated fields for backward compatibility
  // TODO: Remove deprecated field support in v2.0
  const fields = paginationConfig.overflow?.fields 
    ?? paginationConfig.overflowFields // eslint-disable-line @typescript-eslint/no-deprecated
  if (!fields || fields.length === 0) {
    return []
  }

  const maxChars = paginationConfig.overflow?.firstLineChars
    ?? paginationConfig.overflowFirstLineChars // eslint-disable-line @typescript-eslint/no-deprecated
    ?? PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS

  return fields.map(fieldName => ({
    fieldName,
    maxFirstLineChars: maxChars,
  }))
}

/**
 * Get overflow field names from PaginationConfig
 *
 * @param paginationConfig - Pagination configuration
 * @returns Array of overflow field names
 */
export function getOverflowFieldNames(
  paginationConfig?: PaginationConfig
): string[] {
  if (!paginationConfig) {
    return []
  }

  // TODO: Remove deprecated field support in v2.0
  return paginationConfig.overflow?.fields 
    ?? paginationConfig.overflowFields // eslint-disable-line @typescript-eslint/no-deprecated
    ?? []
}

// ==================== First Page Rendering Functions ====================

/**
 * Render overflow field content for first page
 * Displays truncated content with red "(see next page)" marker when there is overflow
 *
 * @param value - Field value
 * @param maxChars - Maximum characters to display
 * @param textConfig - Overflow text configuration for i18n
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 *
 * @requirements 2.1, 2.2, 2.3, 2.4 - First page overflow rendering
 *
 * @example
 * // Output: "1. Breastfeeding guidance <span class="see-next">(see next page)</span>"
 * renderOverflowFirstLine(value, 60, DEFAULT_OVERFLOW_TEXT, cls)
 */
export function renderOverflowFirstLine(
  value: unknown,
  maxChars: number,
  textConfig: OverflowTextConfig,
  cls: ClassNameFn
): string {
  const firstLine = getOverflowFirstLine(value, maxChars)
  const hasOverflow = hasOverflowContent(value, maxChars)

  if (!hasOverflow) {
    // No overflow, just return the content
    return span().class(cls(OVERFLOW_CSS_CLASSES.OVERFLOW_FIRST_LINE)).text(firstLine).build()
  }

  // Has overflow, add red "see next page" marker
  const marker = span().class(cls(OVERFLOW_CSS_CLASSES.SEE_NEXT)).text(textConfig.seeNextMarker).build()

  // Build the content with both truncated text and marker
  // Use child() to add escaped text, then raw() for the pre-built marker HTML
  const escapedFirstLine = escapeHtml(firstLine + ' ')
  
  return span()
    .class(cls(OVERFLOW_CSS_CLASSES.OVERFLOW_FIRST_LINE))
    .raw(escapedFirstLine + marker)
    .build()
}

// ==================== Continuation Page Rendering Functions ====================

/**
 * Render overflow field content for continuation page
 * Displays field label with "(continued)" suffix and remaining content
 *
 * @param result - Overflow field processing result
 * @param fieldLabel - Field label (e.g., "Nursing Points (add attachment if needed)")
 * @param textConfig - Overflow text configuration for i18n
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 *
 * @requirements 3.1, 3.2, 3.3, 3.4 - Continuation page overflow rendering
 *
 * @example
 * // Output:
 * // <div class="overflow-continuation">
 * //   <div class="overflow-label">Nursing Points (continued):</div>
 * //   <div class="overflow-content">2. Umbilical care, keep dry\n3. Jaundice monitoring...</div>
 * // </div>
 */
export function renderOverflowContinuation(
  result: OverflowFieldResult,
  fieldLabel: string,
  textConfig: OverflowTextConfig,
  cls: ClassNameFn
): string {
  if (!result.hasOverflow || !result.rest) {
    return ''
  }

  // Label with "(continued)" suffix
  const labelText = `${fieldLabel}${textConfig.continuationSuffix}：`
  const labelHtml = div()
    .class(cls(OVERFLOW_CSS_CLASSES.OVERFLOW_LABEL))
    .text(labelText)
    .build()

  // Content with preserved whitespace
  const contentHtml = div()
    .class(cls(OVERFLOW_CSS_CLASSES.OVERFLOW_CONTENT))
    .text(result.rest)
    .build()

  return div()
    .class(cls(OVERFLOW_CSS_CLASSES.OVERFLOW_CONTINUATION))
    .raw(labelHtml + '\n' + contentHtml)
    .build()
}

// ==================== Utility Functions ====================

/**
 * Merge overflow text configuration with defaults
 *
 * @param config - Partial overflow text configuration
 * @returns Complete overflow text configuration
 */
export function mergeOverflowTextConfig(
  config?: Partial<OverflowTextConfig>
): OverflowTextConfig {
  return {
    ...DEFAULT_OVERFLOW_TEXT,
    ...config,
  }
}


// ==================== Continuation Page Rendering ====================

/**
 * Overflow continuation page render context
 */
export interface OverflowContinuationPageContext {
  /** Page number for this continuation page */
  pageNumber: number
  /** Total pages (including this continuation page) */
  totalPages: number
  /** Form title */
  title: string
  /** Hospital name */
  hospital?: string
  /** Department name */
  department?: string
  /** Overflow field results with labels */
  overflowFields: Array<{
    result: OverflowFieldResult
    label: string
  }>
  /** Overflow text configuration */
  textConfig: OverflowTextConfig
  /** Whether to show signature area */
  showSignature?: boolean
  /** Signature HTML (pre-rendered) */
  signatureHtml?: string
  /** Page number format */
  pageNumberFormat?: string
}

/** CSS class names for page structure */
const PAGE_CSS_CLASSES = {
  PRINT_PAGE: 'print-page',
  CONTINUATION_PAGE: 'continuation-page',
  PRINT_HEADER: 'print-header',
  PRINT_FOOTER: 'print-footer',
  PRINT_CONTENT: 'print-content',
  HOSPITAL_NAME: 'hospital-name',
  DEPARTMENT_NAME: 'department-name',
  FORM_TITLE: 'form-title',
  PAGE_NUMBER: 'page-number',
} as const

/**
 * Render overflow continuation page header
 * Title includes "(continued)" suffix
 *
 * @param ctx - Continuation page context
 * @param cls - Class name generator function
 * @returns Rendered header HTML
 */
function renderOverflowPageHeader(
  ctx: OverflowContinuationPageContext,
  cls: ClassNameFn
): string {
  const parts: string[] = []

  // Hospital name
  if (ctx.hospital) {
    parts.push(
      div().class(cls(PAGE_CSS_CLASSES.HOSPITAL_NAME)).text(ctx.hospital).build()
    )
  }

  // Department name
  if (ctx.department) {
    parts.push(
      div().class(cls(PAGE_CSS_CLASSES.DEPARTMENT_NAME)).text(ctx.department).build()
    )
  }

  // Form title with "(continued)" suffix
  const titleText = `${ctx.title} ${ctx.textConfig.pageTitleSuffix}`
  parts.push(
    div().class(cls(PAGE_CSS_CLASSES.FORM_TITLE)).text(titleText).build()
  )

  return div()
    .class(cls(PAGE_CSS_CLASSES.PRINT_HEADER))
    .raw(parts.join('\n'))
    .build()
}

/**
 * Render overflow continuation page footer
 *
 * @param ctx - Continuation page context
 * @param cls - Class name generator function
 * @returns Rendered footer HTML
 */
function renderOverflowPageFooter(
  ctx: OverflowContinuationPageContext,
  cls: ClassNameFn
): string {
  const format = ctx.pageNumberFormat ?? 'Page {current} of {total}'
  const pageNumberText = format
    .replace('{current}', String(ctx.pageNumber))
    .replace('{total}', String(ctx.totalPages))

  const pageNumberHtml = span()
    .class(cls(PAGE_CSS_CLASSES.PAGE_NUMBER))
    .text(pageNumberText)
    .build()

  return div()
    .class(cls(PAGE_CSS_CLASSES.PRINT_FOOTER))
    .raw(pageNumberHtml)
    .build()
}

/**
 * Render overflow continuation page content
 * Contains all overflow field continuations
 *
 * @param ctx - Continuation page context
 * @param cls - Class name generator function
 * @returns Rendered content HTML
 */
function renderOverflowPageContent(
  ctx: OverflowContinuationPageContext,
  cls: ClassNameFn
): string {
  const parts: string[] = []

  // Render each overflow field that has continuation content
  for (const { result, label } of ctx.overflowFields) {
    if (result.hasOverflow && result.rest) {
      const fieldHtml = renderOverflowContinuation(result, label, ctx.textConfig, cls)
      if (fieldHtml) {
        parts.push(fieldHtml)
      }
    }
  }

  return div()
    .class(cls(PAGE_CSS_CLASSES.PRINT_CONTENT))
    .raw(parts.join('\n'))
    .build()
}

/**
 * Render complete overflow continuation page
 * Includes header (with "(continued)" suffix), overflow content, optional signature, and footer
 *
 * @param ctx - Continuation page context
 * @param cls - Class name generator function
 * @param pageSize - Page size class (e.g., "16k", "a4")
 * @param orientation - Page orientation (e.g., "portrait", "landscape")
 * @returns Rendered page HTML
 *
 * @requirements 3.1, 4.2, 4.3 - Continuation page rendering
 *
 * @example
 * const pageHtml = renderOverflowContinuationPage(ctx, cls, '16k', 'portrait')
 */
export function renderOverflowContinuationPage(
  ctx: OverflowContinuationPageContext,
  cls: ClassNameFn,
  pageSize: string = '16k',
  orientation: string = 'portrait'
): string {
  const pageClasses = [
    cls(PAGE_CSS_CLASSES.PRINT_PAGE),
    cls(pageSize),
    cls(orientation),
    cls(PAGE_CSS_CLASSES.CONTINUATION_PAGE),
  ].join(' ')

  const parts: string[] = []

  // Header
  parts.push(renderOverflowPageHeader(ctx, cls))

  // Content
  parts.push(renderOverflowPageContent(ctx, cls))

  // Signature (optional)
  if (ctx.showSignature && ctx.signatureHtml) {
    parts.push(ctx.signatureHtml)
  }

  // Footer
  parts.push(renderOverflowPageFooter(ctx, cls))

  return div()
    .class(pageClasses)
    .attr('data-page', ctx.pageNumber)
    .raw(parts.join('\n'))
    .build()
}

/**
 * Check if any overflow fields have continuation content
 *
 * @param overflowFields - Array of overflow field results
 * @returns Whether any field has continuation content
 */
export function hasAnyContinuationContent(
  overflowFields: Array<{ result: OverflowFieldResult }>
): boolean {
  return overflowFields.some(({ result }) => result.hasOverflow && result.rest)
}
