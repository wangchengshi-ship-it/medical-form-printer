/**
 * @fileoverview Data formatters for converting values to display strings
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
 * Format a date value to a string
 * 
 * @param value - The date value (Date object, string, or number)
 * @param format - The format string (default: 'YYYY-MM-DD')
 * @returns Formatted date string, or empty string if value is falsy
 * 
 * @example
 * ```typescript
 * formatDate('2024-01-15')                    // '2024-01-15'
 * formatDate(new Date(), 'YYYY年MM月DD日')    // '2024年01月15日'
 * formatDate('2024-01-15', 'MM/DD/YYYY')      // '01/15/2024'
 * ```
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
 * Format a boolean value to a checkbox symbol
 * 
 * Uses ☑ (U+2611) for checked and □ (U+25A1) for unchecked,
 * consistent with Vue component rendering.
 * 
 * @param value - The boolean value (truthy/falsy)
 * @returns '☑' for truthy values, '□' for falsy values
 * 
 * @example
 * ```typescript
 * formatBoolean(true)   // '☑'
 * formatBoolean(false)  // '□'
 * formatBoolean(1)      // '☑'
 * formatBoolean(null)   // '□'
 * ```
 */
export function formatBoolean(value: unknown): string {
  return value ? '☑' : '□'
}

/**
 * Format a number value to a string with optional precision
 * 
 * @param value - The number value
 * @param precision - Number of decimal places (optional)
 * @returns Formatted number string, or empty string if value is empty/invalid
 * 
 * @example
 * ```typescript
 * formatNumber(1234.567)        // '1234.567'
 * formatNumber(1234.567, 2)     // '1234.57'
 * formatNumber('invalid')       // 'invalid'
 * formatNumber(null)            // ''
 * ```
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
 * Format a value based on its type
 * 
 * Generic formatter that handles different data types and supports
 * custom formatters for specialized formatting needs.
 * 
 * @param value - The value to format
 * @param type - The data type ('text', 'checkbox', 'date', 'datetime', 'number')
 * @param options - Formatting options
 * @param options.dateFormat - Date format configuration
 * @param options.emptyPlaceholder - Placeholder for empty values (default: '')
 * @param options.customFormatters - Custom formatter functions by type
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatValue('Hello', 'text')                    // 'Hello'
 * formatValue(true, 'checkbox')                   // '☑'
 * formatValue('2024-01-15', 'date')               // '2024-01-15'
 * formatValue(null, 'text', { emptyPlaceholder: '-' })  // '-'
 * ```
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
 * Check if a value is checked/selected for a given option
 * 
 * Handles both array values (multiple selection) and single values.
 * 
 * @param values - The value(s) to check (array or single value)
 * @param optionValue - The option value to check against
 * @returns true if the option is selected, false otherwise
 * 
 * @example
 * ```typescript
 * isChecked(['a', 'b', 'c'], 'b')  // true
 * isChecked(['a', 'b', 'c'], 'd')  // false
 * isChecked('yes', 'yes')          // true
 * isChecked('no', 'yes')           // false
 * ```
 */
export function isChecked(values: unknown, optionValue: string): boolean {
  if (Array.isArray(values)) {
    return values.includes(optionValue)
  }
  return String(values) === optionValue
}
