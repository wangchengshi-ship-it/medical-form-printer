/**
 * @fileoverview Overflow field pagination handling
 * @module pagination/overflow-handler
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Handles pagination logic for long text fields (e.g., textarea):
 * - First page displays truncated content
 * - Continuation pages display remaining content
 * - Supports configuring truncation character count per field
 *
 * Reference frontend implementation: PrintModeForm.vue lines 130-175
 *
 * @requirements
 * - 9.1: Calculate page breaks based on measured content height
 * - 9.7: Support overflow field pagination
 *
 * @dependencies
 * - ./types.ts - Type definitions
 *
 * @usedBy
 * - ./index.ts - Module entry
 * - ../renderer/paginated-renderer.ts - Paginated renderer (to be implemented)
 */

import type { OverflowFieldConfig } from './types'
import { PAGINATION_DEFAULTS } from './types'

// ==================== Type Definitions ====================

/**
 * Overflow field processing result
 */
export interface OverflowFieldResult {
  /** Field name */
  fieldName: string
  /** First page display content */
  firstLine: string
  /** Continuation page display content */
  rest: string
  /** Whether there is overflow content */
  hasOverflow: boolean
}

// ==================== Internal Utility Functions ====================

/**
 * Safely convert to string
 */
function toSafeString(value: unknown): string {
  if (value == null) return ''
  return String(value)
}

/**
 * Split text by line breaks
 */
function splitLines(text: string): string[] {
  return text.split('\n')
}

// ==================== Core Processing Functions ====================

/**
 * Get first page display content for overflow field
 * @requirements 9.7 - Support overflow field pagination
 *
 * @param value - Field value
 * @param maxChars - Maximum characters to display on first page
 * @returns Content to display on first page
 *
 * @example
 * getOverflowFirstLine('This is a very long text...', 60)
 */
export function getOverflowFirstLine(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): string {
  const text = toSafeString(value)
  if (!text) return ''

  const firstLine = splitLines(text)[0]

  if (firstLine.length > maxChars) {
    return firstLine.substring(0, maxChars) + '...'
  }
  return firstLine
}

/**
 * Get continuation page display content for overflow field
 * @requirements 9.7 - Support overflow field pagination
 *
 * @param value - Field value
 * @param maxChars - Maximum characters to display on first page
 * @returns Content to display on continuation pages
 */
export function getOverflowRest(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): string {
  const text = toSafeString(value)
  if (!text) return ''

  const lines = splitLines(text)
  const firstLine = lines[0]

  // First line exceeds max chars, extract remaining part
  if (firstLine.length > maxChars) {
    const rest = firstLine.substring(maxChars)
    const remainingLines = lines.slice(1)
    return remainingLines.length > 0
      ? rest + '\n' + remainingLines.join('\n')
      : rest
  }

  // Only one line and doesn't exceed max chars
  if (lines.length <= 1) return ''

  // Return all content except first line
  return lines.slice(1).join('\n')
}

/**
 * Check if field has overflow content
 * @requirements 9.7 - Support overflow field pagination
 *
 * @param value - Field value
 * @param maxChars - Maximum characters to display on first page
 * @returns Whether there is overflow content to display on continuation pages
 */
export function hasOverflowContent(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): boolean {
  const text = toSafeString(value)
  if (!text) return false

  const lines = splitLines(text)

  // First line exceeds max chars or has multiple lines
  return lines[0].length > maxChars || lines.length > 1
}

// ==================== Configuration Factory Functions ====================

/**
 * Create overflow field configuration
 * @param fieldName - Field name
 * @param maxFirstLineChars - Maximum characters to display on first page
 * @returns Overflow field configuration
 */
export function createOverflowFieldConfig(
  fieldName: string,
  maxFirstLineChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): OverflowFieldConfig {
  return { fieldName, maxFirstLineChars }
}

/**
 * Create overflow field configuration list from field name array
 * @param fieldNames - Array of field names
 * @param defaultMaxChars - Default maximum characters
 * @returns Overflow field configuration list
 */
export function createOverflowFieldConfigs(
  fieldNames: string[],
  defaultMaxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): OverflowFieldConfig[] {
  return fieldNames.map((name) =>
    createOverflowFieldConfig(name, defaultMaxChars)
  )
}

// ==================== Configuration Query Functions ====================

/**
 * Get overflow configuration for a field
 * @param configs - Overflow field configuration list
 * @param fieldName - Field name
 * @returns Overflow field configuration, or undefined if not found
 */
export function getOverflowFieldConfig(
  configs: OverflowFieldConfig[],
  fieldName: string
): OverflowFieldConfig | undefined {
  return configs.find((c) => c.fieldName === fieldName)
}

/**
 * Check if field is configured as overflow field
 * @param configs - Overflow field configuration list
 * @param fieldName - Field name
 * @returns Whether it is an overflow field
 */
export function isOverflowField(
  configs: OverflowFieldConfig[],
  fieldName: string
): boolean {
  return configs.some((c) => c.fieldName === fieldName)
}

// ==================== Batch Processing Functions ====================

/**
 * Batch process overflow fields
 * @param data - Form data
 * @param configs - Overflow field configuration list
 * @returns Overflow field processing result list
 */
export function processOverflowFields(
  data: Record<string, unknown>,
  configs: OverflowFieldConfig[]
): OverflowFieldResult[] {
  return configs.map((config) => {
    const value = data[config.fieldName]
    const maxChars =
      config.maxFirstLineChars ?? PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS

    return {
      fieldName: config.fieldName,
      firstLine: getOverflowFirstLine(value, maxChars),
      rest: getOverflowRest(value, maxChars),
      hasOverflow: hasOverflowContent(value, maxChars),
    }
  })
}

/**
 * Check if any overflow content needs continuation pages
 * @param data - Form data
 * @param configs - Overflow field configuration list
 * @returns Whether continuation pages are needed
 */
export function hasAnyOverflowContent(
  data: Record<string, unknown>,
  configs: OverflowFieldConfig[]
): boolean {
  return configs.some((config) => {
    const value = data[config.fieldName]
    const maxChars =
      config.maxFirstLineChars ?? PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
    return hasOverflowContent(value, maxChars)
  })
}
