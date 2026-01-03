/**
 * @fileoverview Data formatters
 * @module formatters
 * @modified 2023-03-02
 */

import type { DateFormatOptions } from '../types/options'

/** Default date format options */
const defaultDateOptions: Required<DateFormatOptions> = {
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'YYYY-MM-DD HH:mm',
}

/**
 * Format date
 */
export function formatDate(
  value: unknown,
  format: string = defaultDateOptions.dateFormat
): string {
  if (!value) return ''
  
  const date = value instanceof Date ? value : new Date(String(value))
  if (isNaN(date.getTime())) return String(value)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Format boolean value to checkbox symbol
 * Uses □ (U+25A1) as unchecked symbol, consistent with Vue components
 */
export function formatBoolean(value: unknown): string {
  return value ? '☑' : '□'
}

/**
 * Format number
 */
export function formatNumber(
  value: unknown,
  precision?: number
): string {
  if (value === null || value === undefined || value === '') return ''
  
  const num = Number(value)
  if (isNaN(num)) return String(value)
  
  if (precision !== undefined) {
    return num.toFixed(precision)
  }
  return String(num)
}

/**
 * Format value (generic)
 */
export function formatValue(
  value: unknown,
  type?: string,
  options?: {
    dateFormat?: DateFormatOptions
    emptyPlaceholder?: string
    customFormatters?: Record<string, (value: unknown) => string>
  }
): string {
  const placeholder = options?.emptyPlaceholder ?? ''
  
  // Empty value handling
  if (value === null || value === undefined || value === '') {
    return placeholder
  }
  
  // Custom formatters
  if (type && options?.customFormatters?.[type]) {
    return options.customFormatters[type](value)
  }
  
  // Built-in type formatting
  switch (type) {
    case 'checkbox':
      return formatBoolean(value)
    case 'date':
      return formatDate(value, options?.dateFormat?.dateFormat)
    case 'datetime':
      return formatDate(value, options?.dateFormat?.dateTimeFormat)
    case 'number':
      return formatNumber(value)
    default:
      return String(value)
  }
}

/**
 * Check if array value contains specified option
 */
export function isChecked(values: unknown, optionValue: string): boolean {
  if (Array.isArray(values)) {
    return values.includes(optionValue)
  }
  return String(values) === optionValue
}
