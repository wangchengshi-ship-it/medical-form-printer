/**
 * @fileoverview 数据格式化器测试
 * @modifies {vitest}
 * @command {yarn test:formatters}
 * @see XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
  isChecked,
} from '../src/formatters'

describe('formatDate', () => {
  it('should format Date object with default format', () => {
    const date = new Date('2024-03-15T10:30:45')
    expect(formatDate(date)).toBe('2024-03-15')
  })

  it('should format date string', () => {
    expect(formatDate('2024-03-15')).toBe('2024-03-15')
  })

  it('should format with custom format', () => {
    const date = new Date('2024-03-15T10:30:45')
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/03/15')
    expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2024年03月15日')
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 10:30:45')
  })

  it('should return empty string for falsy values', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })

  it('should return original string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  // Property-based test: 格式化后的日期应包含年月日
  it('should always contain year, month, day for valid dates', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
        (date) => {
          const result = formatDate(date, 'YYYY-MM-DD')
          const year = date.getFullYear().toString()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return result === `${year}-${month}-${day}`
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('formatBoolean', () => {
  it('should return checked symbol for truthy values', () => {
    expect(formatBoolean(true)).toBe('☑')
    expect(formatBoolean(1)).toBe('☑')
    expect(formatBoolean('yes')).toBe('☑')
  })

  it('should return unchecked symbol for falsy values', () => {
    expect(formatBoolean(false)).toBe('□')
    expect(formatBoolean(0)).toBe('□')
    expect(formatBoolean('')).toBe('□')
    expect(formatBoolean(null)).toBe('□')
    expect(formatBoolean(undefined)).toBe('□')
  })

  // Property-based test: 结果只能是两种符号之一
  it('should always return one of two symbols', () => {
    fc.assert(
      fc.property(fc.anything(), (value) => {
        const result = formatBoolean(value)
        return result === '☑' || result === '□'
      }),
      { numRuns: 100 }
    )
  })
})

describe('formatNumber', () => {
  it('should format numbers', () => {
    expect(formatNumber(123)).toBe('123')
    expect(formatNumber(123.456)).toBe('123.456')
    expect(formatNumber('456')).toBe('456')
  })

  it('should format with precision', () => {
    expect(formatNumber(123.456, 2)).toBe('123.46')
    expect(formatNumber(123, 2)).toBe('123.00')
    expect(formatNumber(123.4, 0)).toBe('123')
  })

  it('should return empty string for empty values', () => {
    expect(formatNumber(null)).toBe('')
    expect(formatNumber(undefined)).toBe('')
    expect(formatNumber('')).toBe('')
  })

  it('should return original string for non-numeric values', () => {
    expect(formatNumber('abc')).toBe('abc')
  })

  // Property-based test: 数字格式化后应能解析回数字
  it('should produce parseable number strings', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e10, max: 1e10, noNaN: true }),
        (num) => {
          const result = formatNumber(num)
          const parsed = parseFloat(result)
          return !isNaN(parsed) && Math.abs(parsed - num) < 1e-10
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('formatValue', () => {
  it('should format based on type', () => {
    expect(formatValue(true, 'checkbox')).toBe('☑')
    expect(formatValue(false, 'checkbox')).toBe('□')
    expect(formatValue(123, 'number')).toBe('123')
    expect(formatValue('hello', 'text')).toBe('hello')
  })

  it('should use placeholder for empty values', () => {
    expect(formatValue(null, 'text', { emptyPlaceholder: '—' })).toBe('—')
    expect(formatValue(undefined, 'text', { emptyPlaceholder: 'N/A' })).toBe('N/A')
    expect(formatValue('', 'text', { emptyPlaceholder: '空' })).toBe('空')
  })

  it('should use custom formatters', () => {
    const customFormatters = {
      currency: (v: unknown) => `¥${v}`,
    }
    expect(formatValue(100, 'currency', { customFormatters })).toBe('¥100')
  })

  it('should format date type', () => {
    const date = new Date('2024-03-15')
    expect(formatValue(date, 'date')).toContain('2024')
  })

  // Property-based test: 非空值格式化后不应为空
  it('should never return empty for non-empty values without placeholder', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 1 }),
          fc.integer(),
          fc.boolean()
        ),
        (value) => {
          const result = formatValue(value, 'text')
          return result.length > 0
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('isChecked', () => {
  it('should check array values', () => {
    expect(isChecked(['a', 'b', 'c'], 'b')).toBe(true)
    expect(isChecked(['a', 'b', 'c'], 'd')).toBe(false)
  })

  it('should check single values', () => {
    expect(isChecked('yes', 'yes')).toBe(true)
    expect(isChecked('yes', 'no')).toBe(false)
  })

  it('should handle numeric values', () => {
    expect(isChecked([1, 2, 3], '2')).toBe(false) // 类型不匹配
    expect(isChecked(['1', '2', '3'], '2')).toBe(true)
  })

  // Property-based test: 数组包含检查的一致性
  it('should be consistent with array includes', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        fc.string(),
        (arr, value) => {
          return isChecked(arr, value) === arr.includes(value)
        }
      ),
      { numRuns: 100 }
    )
  })
})
