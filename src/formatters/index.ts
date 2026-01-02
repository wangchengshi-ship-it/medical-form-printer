/**
 * @fileoverview 数据格式化器
 * @module formatters
 */

import type { DateFormatOptions } from '../types/options'

/** 默认日期格式化选项 */
const defaultDateOptions: Required<DateFormatOptions> = {
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  dateTimeFormat: 'YYYY-MM-DD HH:mm',
}

/**
 * 格式化日期
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
 * 格式化布尔值为勾选框符号
 */
export function formatBoolean(value: unknown): string {
  return value ? '☑' : '☐'
}

/**
 * 格式化数字
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
 * 格式化值（通用）
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
  
  // 空值处理
  if (value === null || value === undefined || value === '') {
    return placeholder
  }
  
  // 自定义格式化器
  if (type && options?.customFormatters?.[type]) {
    return options.customFormatters[type](value)
  }
  
  // 内置类型格式化
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
 * 检查数组值是否包含指定选项
 */
export function isChecked(values: unknown, optionValue: string): boolean {
  if (Array.isArray(values)) {
    return values.includes(optionValue)
  }
  return String(values) === optionValue
}
