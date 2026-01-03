/**
 * @fileoverview Render options type definitions
 * @module types/options
 */

import type { Theme } from './theme'

/** Date format options */
export interface DateFormatOptions {
  /** Date format */
  dateFormat?: string
  /** Time format */
  timeFormat?: string
  /** DateTime format */
  dateTimeFormat?: string
}

/** Render options */
export interface RenderOptions {
  /** Theme configuration */
  theme?: Partial<Theme>
  /** Locale */
  locale?: string
  /** Date format options */
  dateFormat?: DateFormatOptions
  /** Empty value placeholder */
  emptyPlaceholder?: string
  /** Custom formatters */
  formatters?: Record<string, (value: unknown) => string>
  /** CSS class name prefix (for isolation mode) */
  classPrefix?: string
}

/** PDF generation options */
export interface PdfOptions extends RenderOptions {
  /** Watermark text */
  watermark?: string
  /** Watermark opacity (0-1) */
  watermarkOpacity?: number
  /** Whether to generate PDF/A format */
  pdfA?: boolean
}

/** PDF merge options */
export interface MergeOptions {
  /** Whether to generate table of contents */
  tableOfContents?: boolean
  /** Section divider titles */
  sectionDividers?: boolean
}

/** Merge document item */
export interface MergeDocumentItem {
  /** Print configuration */
  schema: import('./print-schema').PrintSchema
  /** Form data */
  data: import('./print-schema').FormData
  /** Document title (for table of contents) */
  title?: string
}

/**
 * Create class name generator function
 * @param options - Render options
 * @returns Class name generator function
 */
export function createClassNameFn(options?: RenderOptions): (name: string) => string {
  const prefix = options?.classPrefix
  return prefix ? (name: string) => `${prefix}-${name}` : (name: string) => name
}

/**
 * Get class name (with namespace support)
 * @param name - Original class name
 * @param options - Render options
 * @returns Processed class name
 */
export function cls(name: string, options?: RenderOptions): string {
  const prefix = options?.classPrefix
  return prefix ? `${prefix}-${name}` : name
}
