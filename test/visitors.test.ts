/**
 * @fileoverview Visitor 模式测试
 * @module test/visitors
 *
 * @description
 * 测试 Visitor 模式实现，包括：
 * - FormatVisitor: 数据格式化
 * - ValidationVisitor: 数据验证
 * - MeasureVisitor: 内容测量
 * - FormDataTraverser: 数据遍历
 *
 * @requirements 1.1-1.11
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import {
  FormatVisitor,
  ValidationVisitor,
  MeasureVisitor,
  FormDataTraverser,
  createFormatVisitor,
  createValidationVisitor,
  createMeasureVisitor,
  createFormDataTraverser,
  type FieldInfo,
  type FormDataVisitor,
  type ValidationResult,
  type MeasureResult,
} from '../src/renderer/visitors'
import type { PrintSection, InfoGridConfig, TableConfig } from '../src/types/print-schema'

// ============================================================================
// Fast-check 生成器
// ============================================================================

/**
 * 生成有效的字段名
 */
const fieldNameArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s))

/**
 * 生成字段信息
 */
const fieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
    fc.constant(null)
  ),
  type: fc.option(fc.constantFrom('text', 'number', 'date', 'checkbox', 'boolean'), { nil: undefined }),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成字符串字段信息
 */
const stringFieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.string(),
  type: fc.constant('text' as const),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成数字字段信息
 */
const numberFieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.oneof(fc.integer(), fc.double({ noNaN: true, min: -1e10, max: 1e10 })),
  type: fc.constant('number' as const),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成布尔字段信息
 */
const booleanFieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.boolean(),
  type: fc.constantFrom('checkbox', 'boolean'),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成日期字段信息
 */
const dateFieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
  type: fc.constant('date' as const),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成数组字段信息
 */
const arrayFieldInfoArb = fc.record({
  name: fieldNameArb,
  value: fc.array(fc.oneof(fc.string(), fc.integer()), { maxLength: 10 }),
  type: fc.constant(undefined),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
})

/**
 * 生成表单数据
 */
const formDataArb = fc.dictionary(
  fieldNameArb,
  fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.date(), fc.array(fc.string()), fc.constant(null))
)


// ============================================================================
// FormatVisitor 单元测试
// Requirements: 1.1-1.6
// ============================================================================

describe('FormatVisitor', () => {
  let visitor: FormatVisitor

  beforeEach(() => {
    visitor = new FormatVisitor()
  })

  describe('visitString', () => {
    /**
     * Requirements: 1.1
     * WHEN a FormatVisitor visits a string field, THE Test_Suite SHALL verify
     * the formatted output matches the input string
     */
    it('should format string value correctly', () => {
      const field: FieldInfo = { name: 'testField', value: 'Hello World' }
      const result = visitor.visitString(field)
      expect(result).toBe('Hello World')
    })

    it('should handle empty string', () => {
      const field: FieldInfo = { name: 'testField', value: '' }
      const result = visitor.visitString(field)
      expect(result).toBe('')
    })

    it('should convert non-string values to string', () => {
      const field: FieldInfo = { name: 'testField', value: 123 }
      const result = visitor.visitString(field)
      expect(result).toBe('123')
    })

    it('should handle null/undefined as empty string', () => {
      const field1: FieldInfo = { name: 'testField', value: null }
      const field2: FieldInfo = { name: 'testField', value: undefined }
      expect(visitor.visitString(field1)).toBe('')
      expect(visitor.visitString(field2)).toBe('')
    })
  })

  describe('visitNumber', () => {
    /**
     * Requirements: 1.2
     * WHEN a FormatVisitor visits a number field, THE Test_Suite SHALL verify
     * the number is formatted correctly
     */
    it('should format integer correctly', () => {
      const field: FieldInfo = { name: 'age', value: 25 }
      const result = visitor.visitNumber(field)
      expect(result).toBe('25')
    })

    it('should format decimal correctly', () => {
      const field: FieldInfo = { name: 'weight', value: 65.5 }
      const result = visitor.visitNumber(field)
      expect(result).toBe('65.5')
    })

    it('should handle string numbers', () => {
      const field: FieldInfo = { name: 'count', value: '42' }
      const result = visitor.visitNumber(field)
      expect(result).toBe('42')
    })

    it('should handle null/undefined as empty string', () => {
      const field1: FieldInfo = { name: 'count', value: null }
      const field2: FieldInfo = { name: 'count', value: undefined }
      expect(visitor.visitNumber(field1)).toBe('')
      expect(visitor.visitNumber(field2)).toBe('')
    })

    it('should handle non-numeric values', () => {
      const field: FieldInfo = { name: 'count', value: 'abc' }
      const result = visitor.visitNumber(field)
      expect(result).toBe('abc')
    })
  })

  describe('visitBoolean', () => {
    /**
     * Requirements: 1.3
     * WHEN a FormatVisitor visits a boolean field, THE Test_Suite SHALL verify
     * the correct symbol (☑/☐) is returned
     */
    it('should return ☑ for true', () => {
      const field: FieldInfo = { name: 'checked', value: true }
      const result = visitor.visitBoolean(field)
      expect(result).toBe('☑')
    })

    it('should return ☐ for false', () => {
      const field: FieldInfo = { name: 'checked', value: false }
      const result = visitor.visitBoolean(field)
      expect(result).toBe('☐')
    })

    it('should use custom boolean symbols', () => {
      const customVisitor = new FormatVisitor({
        booleanSymbols: { true: 'Yes', false: 'No' },
      })
      const trueField: FieldInfo = { name: 'checked', value: true }
      const falseField: FieldInfo = { name: 'checked', value: false }
      expect(customVisitor.visitBoolean(trueField)).toBe('Yes')
      expect(customVisitor.visitBoolean(falseField)).toBe('No')
    })
  })

  describe('visitDate', () => {
    /**
     * Requirements: 1.4
     * WHEN a FormatVisitor visits a date field, THE Test_Suite SHALL verify
     * the date is formatted according to the specified format
     */
    it('should format date with default format', () => {
      const date = new Date('2024-03-15T10:30:00')
      const field: FieldInfo = { name: 'birthDate', value: date }
      const result = visitor.visitDate(field)
      expect(result).toBe('2024-03-15')
    })

    it('should format date string', () => {
      const field: FieldInfo = { name: 'birthDate', value: '2024-03-15' }
      const result = visitor.visitDate(field)
      expect(result).toBe('2024-03-15')
    })

    it('should use custom date format', () => {
      const customVisitor = new FormatVisitor({ dateFormat: 'YYYY年MM月DD日' })
      const date = new Date('2024-03-15')
      const field: FieldInfo = { name: 'birthDate', value: date }
      const result = customVisitor.visitDate(field)
      expect(result).toBe('2024年03月15日')
    })

    it('should handle null/undefined as empty string', () => {
      const field1: FieldInfo = { name: 'birthDate', value: null }
      const field2: FieldInfo = { name: 'birthDate', value: undefined }
      expect(visitor.visitDate(field1)).toBe('')
      expect(visitor.visitDate(field2)).toBe('')
    })
  })

  describe('visitArray', () => {
    /**
     * Requirements: 1.5
     * WHEN a FormatVisitor visits an array field, THE Test_Suite SHALL verify
     * array elements are joined with commas
     */
    it('should join array elements with commas', () => {
      const field: FieldInfo = { name: 'tags', value: ['a', 'b', 'c'] }
      const result = visitor.visitArray(field)
      expect(result).toBe('a, b, c')
    })

    it('should handle empty array', () => {
      const field: FieldInfo = { name: 'tags', value: [] }
      const result = visitor.visitArray(field)
      expect(result).toBe('')
    })

    it('should handle mixed type array', () => {
      const field: FieldInfo = { name: 'mixed', value: ['text', 123, true] }
      const result = visitor.visitArray(field)
      expect(result).toContain('text')
      expect(result).toContain('123')
    })
  })

  describe('visitNull', () => {
    /**
     * Requirements: 1.6
     * WHEN a FormatVisitor visits a null field, THE Test_Suite SHALL verify
     * an empty string is returned
     */
    it('should return empty string for null', () => {
      const field: FieldInfo = { name: 'empty', value: null }
      const result = visitor.visitNull(field)
      expect(result).toBe('')
    })

    it('should return empty string for undefined', () => {
      const field: FieldInfo = { name: 'empty', value: undefined }
      const result = visitor.visitNull(field)
      expect(result).toBe('')
    })
  })

  describe('visitObject', () => {
    it('should stringify object', () => {
      const field: FieldInfo = { name: 'data', value: { key: 'value' } }
      const result = visitor.visitObject(field)
      expect(result).toBe('{"key":"value"}')
    })

    it('should handle nested objects', () => {
      const field: FieldInfo = { name: 'data', value: { a: { b: 1 } } }
      const result = visitor.visitObject(field)
      expect(result).toBe('{"a":{"b":1}}')
    })
  })

  describe('getResult and getFormattedData', () => {
    it('should return all formatted values joined by newline', () => {
      visitor.visitString({ name: 'field1', value: 'value1' })
      visitor.visitString({ name: 'field2', value: 'value2' })
      const result = visitor.getResult()
      expect(result).toBe('value1\nvalue2')
    })

    it('should return formatted data as Map', () => {
      visitor.visitString({ name: 'field1', value: 'value1' })
      visitor.visitNumber({ name: 'field2', value: 42 })
      const data = visitor.getFormattedData()
      expect(data.get('field1')).toBe('value1')
      expect(data.get('field2')).toBe('42')
    })
  })

  describe('createFormatVisitor factory', () => {
    it('should create FormatVisitor with default options', () => {
      const visitor = createFormatVisitor()
      expect(visitor).toBeInstanceOf(FormatVisitor)
    })

    it('should create FormatVisitor with custom options', () => {
      const visitor = createFormatVisitor({
        dateFormat: 'YYYY/MM/DD',
        booleanSymbols: { true: 'Y', false: 'N' },
      })
      expect(visitor.visitBoolean({ name: 'test', value: true })).toBe('Y')
    })
  })
})


// ============================================================================
// FormatVisitor 属性测试
// Property 1: FormatVisitor 格式化正确性
// **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
// ============================================================================

describe('FormatVisitor Property Tests', () => {
  /**
   * Property 1: FormatVisitor 格式化正确性
   * *For any* field type and value, FormatVisitor SHALL produce correctly
   * formatted output that matches the expected format for that type.
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
   */
  describe('Property 1: FormatVisitor 格式化正确性', () => {
    it('should always produce string output for string fields', () => {
      fc.assert(
        fc.property(stringFieldInfoArb, (field) => {
          const visitor = new FormatVisitor()
          const result = visitor.visitString(field as FieldInfo)
          return typeof result === 'string'
        }),
        { numRuns: 100 }
      )
    })

    it('should always produce string output for number fields', () => {
      fc.assert(
        fc.property(numberFieldInfoArb, (field) => {
          const visitor = new FormatVisitor()
          const result = visitor.visitNumber(field as FieldInfo)
          return typeof result === 'string'
        }),
        { numRuns: 100 }
      )
    })

    it('should always produce one of two symbols for boolean fields', () => {
      fc.assert(
        fc.property(booleanFieldInfoArb, (field) => {
          const visitor = new FormatVisitor()
          const result = visitor.visitBoolean(field as FieldInfo)
          return result === '☑' || result === '☐'
        }),
        { numRuns: 100 }
      )
    })

    it('should produce correct boolean symbol based on value', () => {
      fc.assert(
        fc.property(fc.boolean(), fieldNameArb, (value, name) => {
          const visitor = new FormatVisitor()
          const field: FieldInfo = { name, value }
          const result = visitor.visitBoolean(field)
          return value ? result === '☑' : result === '☐'
        }),
        { numRuns: 100 }
      )
    })

    it('should always produce string output for date fields', () => {
      fc.assert(
        fc.property(dateFieldInfoArb, (field) => {
          const visitor = new FormatVisitor()
          const result = visitor.visitDate(field as FieldInfo)
          return typeof result === 'string'
        }),
        { numRuns: 100 }
      )
    })

    it('should always produce comma-separated string for array fields', () => {
      fc.assert(
        fc.property(arrayFieldInfoArb, (field) => {
          const visitor = new FormatVisitor()
          const result = visitor.visitArray(field as FieldInfo)
          const arr = field.value as unknown[]
          // Empty array should produce empty string
          if (arr.length === 0) {
            return result === ''
          }
          // Non-empty array should contain commas if more than one element
          if (arr.length > 1) {
            return result.includes(', ')
          }
          return typeof result === 'string'
        }),
        { numRuns: 100 }
      )
    })

    it('should always return empty string for null fields', () => {
      fc.assert(
        fc.property(fieldNameArb, (name) => {
          const visitor = new FormatVisitor()
          const field: FieldInfo = { name, value: null }
          const result = visitor.visitNull(field)
          return result === ''
        }),
        { numRuns: 100 }
      )
    })

    it('should store all visited fields in formatted data map', () => {
      fc.assert(
        fc.property(
          fc.array(stringFieldInfoArb, { minLength: 1, maxLength: 10 }),
          (fields) => {
            const visitor = new FormatVisitor()
            for (const field of fields) {
              visitor.visitString(field as FieldInfo)
            }
            const data = visitor.getFormattedData()
            // All unique field names should be in the map
            const uniqueNames = new Set(fields.map((f) => f.name))
            return uniqueNames.size <= data.size
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


// ============================================================================
// ValidationVisitor 单元测试
// Requirements: 1.7-1.9
// ============================================================================

describe('ValidationVisitor', () => {
  describe('Required field validation', () => {
    /**
     * Requirements: 1.7
     * WHEN a ValidationVisitor validates required fields, THE Test_Suite SHALL verify
     * missing required fields produce errors
     */
    it('should produce error for missing required field (null)', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: null, label: '必填字段' }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('requiredField')
      expect(result.errors[0].message).toContain('必填字段')
    })

    it('should produce error for missing required field (undefined)', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: undefined, label: '必填字段' }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should produce error for missing required field (empty string)', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: '', label: '必填字段' }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('should pass for non-empty required field', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: 'value', label: '必填字段' }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass for non-required empty field', () => {
      const visitor = new ValidationVisitor(['otherField'])
      const field: FieldInfo = { name: 'optionalField', value: null }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should use field name when label is not provided', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: null }
      visitor.visitString(field)
      const result = visitor.getResult()
      expect(result.errors[0].message).toContain('requiredField')
    })
  })

  describe('Number field validation', () => {
    /**
     * Requirements: 1.8
     * WHEN a ValidationVisitor validates a number field with non-numeric value,
     * THE Test_Suite SHALL verify an error is produced
     */
    it('should produce error for non-numeric value', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'age', value: 'not-a-number', label: '年龄' }
      visitor.visitNumber(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('有效数字')
    })

    it('should pass for valid number', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'age', value: 25 }
      visitor.visitNumber(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should pass for string number', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'age', value: '25' }
      visitor.visitNumber(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should pass for null/undefined number (not required)', () => {
      const visitor = new ValidationVisitor()
      const field1: FieldInfo = { name: 'age', value: null }
      const field2: FieldInfo = { name: 'age', value: undefined }
      visitor.visitNumber(field1)
      visitor.visitNumber(field2)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should check both required and numeric validation', () => {
      const visitor = new ValidationVisitor(['age'])
      const field: FieldInfo = { name: 'age', value: 'abc', label: '年龄' }
      visitor.visitNumber(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      // Should have error for non-numeric value
      expect(result.errors.some((e) => e.message.includes('有效数字'))).toBe(true)
    })
  })

  describe('Date field validation', () => {
    /**
     * Requirements: 1.9
     * WHEN a ValidationVisitor validates a date field with invalid date,
     * THE Test_Suite SHALL verify an error is produced
     */
    it('should produce error for invalid date string', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'birthDate', value: 'not-a-date', label: '出生日期' }
      visitor.visitDate(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('有效日期')
    })

    it('should pass for valid date object', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'birthDate', value: new Date('2024-03-15') }
      visitor.visitDate(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should pass for valid date string', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'birthDate', value: '2024-03-15' }
      visitor.visitDate(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should pass for null/undefined date (not required)', () => {
      const visitor = new ValidationVisitor()
      const field1: FieldInfo = { name: 'birthDate', value: null }
      const field2: FieldInfo = { name: 'birthDate', value: undefined }
      visitor.visitDate(field1)
      visitor.visitDate(field2)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })

    it('should pass for empty string date (not required)', () => {
      const visitor = new ValidationVisitor()
      const field: FieldInfo = { name: 'birthDate', value: '' }
      visitor.visitDate(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
    })
  })

  describe('reset method', () => {
    it('should clear all errors', () => {
      const visitor = new ValidationVisitor(['requiredField'])
      const field: FieldInfo = { name: 'requiredField', value: null }
      visitor.visitString(field)
      expect(visitor.getResult().valid).toBe(false)

      visitor.reset()
      expect(visitor.getResult().valid).toBe(true)
      expect(visitor.getResult().errors).toHaveLength(0)
    })
  })

  describe('Other visit methods', () => {
    it('should validate required boolean fields', () => {
      const visitor = new ValidationVisitor(['checked'])
      const field: FieldInfo = { name: 'checked', value: null }
      visitor.visitBoolean(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
    })

    it('should validate required array fields', () => {
      const visitor = new ValidationVisitor(['tags'])
      const field: FieldInfo = { name: 'tags', value: null }
      visitor.visitArray(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
    })

    it('should validate required object fields', () => {
      const visitor = new ValidationVisitor(['data'])
      const field: FieldInfo = { name: 'data', value: null }
      visitor.visitObject(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
    })

    it('should validate required null fields', () => {
      const visitor = new ValidationVisitor(['empty'])
      const field: FieldInfo = { name: 'empty', value: null }
      visitor.visitNull(field)
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
    })
  })

  describe('createValidationVisitor factory', () => {
    it('should create ValidationVisitor without required fields', () => {
      const visitor = createValidationVisitor()
      expect(visitor).toBeInstanceOf(ValidationVisitor)
    })

    it('should create ValidationVisitor with required fields', () => {
      const visitor = createValidationVisitor(['field1', 'field2'])
      visitor.visitString({ name: 'field1', value: null })
      expect(visitor.getResult().valid).toBe(false)
    })
  })
})


// ============================================================================
// ValidationVisitor 属性测试
// Property 2: ValidationVisitor 错误检测
// **Validates: Requirements 1.7, 1.8, 1.9**
// ============================================================================

describe('ValidationVisitor Property Tests', () => {
  /**
   * Property 2: ValidationVisitor 错误检测
   * *For any* invalid input (missing required field, non-numeric number, invalid date),
   * ValidationVisitor SHALL produce appropriate error messages.
   * **Validates: Requirements 1.7, 1.8, 1.9**
   */
  describe('Property 2: ValidationVisitor 错误检测', () => {
    it('should always detect missing required fields', () => {
      fc.assert(
        fc.property(fieldNameArb, (fieldName) => {
          const visitor = new ValidationVisitor([fieldName])
          const field: FieldInfo = { name: fieldName, value: null }
          visitor.visitString(field)
          const result = visitor.getResult()
          return result.valid === false && result.errors.length > 0
        }),
        { numRuns: 100 }
      )
    })

    it('should always pass for non-empty required string fields', () => {
      fc.assert(
        fc.property(
          fieldNameArb,
          fc.string({ minLength: 1 }),
          (fieldName, value) => {
            const visitor = new ValidationVisitor([fieldName])
            const field: FieldInfo = { name: fieldName, value }
            visitor.visitString(field)
            const result = visitor.getResult()
            return result.valid === true && result.errors.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always detect non-numeric values in number fields', () => {
      const nonNumericArb = fc
        .string({ minLength: 1 })
        .filter((s) => isNaN(Number(s)))

      fc.assert(
        fc.property(fieldNameArb, nonNumericArb, (fieldName, value) => {
          const visitor = new ValidationVisitor()
          const field: FieldInfo = { name: fieldName, value }
          visitor.visitNumber(field)
          const result = visitor.getResult()
          return result.valid === false && result.errors.some((e) => e.message.includes('有效数字'))
        }),
        { numRuns: 100 }
      )
    })

    it('should always pass for valid numeric values', () => {
      fc.assert(
        fc.property(
          fieldNameArb,
          fc.oneof(fc.integer(), fc.double({ noNaN: true, min: -1e10, max: 1e10 })),
          (fieldName, value) => {
            const visitor = new ValidationVisitor()
            const field: FieldInfo = { name: fieldName, value }
            visitor.visitNumber(field)
            const result = visitor.getResult()
            return result.valid === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always pass for valid date values', () => {
      fc.assert(
        fc.property(
          fieldNameArb,
          fc.date({ min: new Date('1970-01-01'), max: new Date('2100-12-31') }),
          (fieldName, value) => {
            const visitor = new ValidationVisitor()
            const field: FieldInfo = { name: fieldName, value }
            visitor.visitDate(field)
            const result = visitor.getResult()
            return result.valid === true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always return ValidationResult with valid boolean and errors array', () => {
      fc.assert(
        fc.property(fieldInfoArb, (field) => {
          const visitor = new ValidationVisitor()
          visitor.visitString(field as FieldInfo)
          const result = visitor.getResult()
          return (
            typeof result.valid === 'boolean' &&
            Array.isArray(result.errors) &&
            result.errors.every((e) => typeof e.field === 'string' && typeof e.message === 'string')
          )
        }),
        { numRuns: 100 }
      )
    })

    it('should reset errors correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fieldNameArb, { minLength: 1, maxLength: 5 }),
          (fieldNames) => {
            const visitor = new ValidationVisitor(fieldNames)
            // Add errors
            for (const name of fieldNames) {
              visitor.visitString({ name, value: null })
            }
            expect(visitor.getResult().valid).toBe(false)
            // Reset
            visitor.reset()
            const result = visitor.getResult()
            return result.valid === true && result.errors.length === 0
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


// ============================================================================
// MeasureVisitor 单元测试
// Requirements: 1.10
// ============================================================================

describe('MeasureVisitor', () => {
  let visitor: MeasureVisitor

  beforeEach(() => {
    visitor = new MeasureVisitor()
  })

  describe('Text measurement', () => {
    /**
     * Requirements: 1.10
     * WHEN a MeasureVisitor measures text content, THE Test_Suite SHALL verify
     * the estimated height is calculated correctly
     */
    it('should measure string field', () => {
      const field: FieldInfo = { name: 'text', value: 'Hello World' }
      visitor.visitString(field)
      const results = visitor.getResult()
      expect(results).toHaveLength(1)
      expect(results[0].field).toBe('text')
      expect(results[0].charCount).toBe(11)
      expect(results[0].lineCount).toBeGreaterThanOrEqual(1)
      expect(results[0].estimatedHeight).toBeGreaterThan(0)
    })

    it('should measure empty string as one line', () => {
      const field: FieldInfo = { name: 'text', value: '' }
      visitor.visitString(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(0)
      expect(results[0].lineCount).toBe(1) // Minimum 1 line
      expect(results[0].estimatedHeight).toBe(5) // Default lineHeight
    })

    it('should measure long text with multiple lines', () => {
      const longText = 'A'.repeat(100) // 100 characters
      const field: FieldInfo = { name: 'text', value: longText }
      visitor.visitString(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(100)
      expect(results[0].lineCount).toBe(3) // 100 / 40 = 2.5, ceil = 3
      expect(results[0].estimatedHeight).toBe(15) // 3 * 5mm
    })
  })

  describe('Height calculation', () => {
    it('should calculate height based on lineHeight', () => {
      const field: FieldInfo = { name: 'text', value: 'Short text' }
      visitor.visitString(field)
      const results = visitor.getResult()
      // Default: lineHeight = 5mm, charsPerLine = 40
      // 10 chars = 1 line = 5mm
      expect(results[0].estimatedHeight).toBe(5)
    })

    it('should use custom lineHeight', () => {
      const customVisitor = new MeasureVisitor({ lineHeight: 10 })
      const field: FieldInfo = { name: 'text', value: 'Short text' }
      customVisitor.visitString(field)
      const results = customVisitor.getResult()
      expect(results[0].estimatedHeight).toBe(10) // 1 line * 10mm
    })

    it('should use custom charsPerLine', () => {
      const customVisitor = new MeasureVisitor({ charsPerLine: 10 })
      const field: FieldInfo = { name: 'text', value: 'A'.repeat(25) }
      customVisitor.visitString(field)
      const results = customVisitor.getResult()
      expect(results[0].lineCount).toBe(3) // 25 / 10 = 2.5, ceil = 3
    })
  })

  describe('getTotalHeight', () => {
    it('should return sum of all field heights', () => {
      visitor.visitString({ name: 'field1', value: 'Short' })
      visitor.visitString({ name: 'field2', value: 'A'.repeat(80) }) // 2 lines
      const totalHeight = visitor.getTotalHeight()
      expect(totalHeight).toBe(5 + 10) // 1 line + 2 lines = 15mm
    })

    it('should return 0 for no fields', () => {
      expect(visitor.getTotalHeight()).toBe(0)
    })
  })

  describe('Different field types', () => {
    it('should measure number field', () => {
      const field: FieldInfo = { name: 'count', value: 12345 }
      visitor.visitNumber(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(5) // "12345"
    })

    it('should measure boolean field', () => {
      const field: FieldInfo = { name: 'checked', value: true }
      visitor.visitBoolean(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(1) // "☑"
    })

    it('should measure date field', () => {
      const field: FieldInfo = { name: 'date', value: new Date('2024-03-15') }
      visitor.visitDate(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(10) // "2024-03-15"
    })

    it('should measure array field', () => {
      const field: FieldInfo = { name: 'tags', value: ['a', 'b', 'c'] }
      visitor.visitArray(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(7) // "a, b, c"
    })

    it('should measure object field', () => {
      const field: FieldInfo = { name: 'data', value: { key: 'value' } }
      visitor.visitObject(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(15) // '{"key":"value"}'
    })

    it('should measure null field', () => {
      const field: FieldInfo = { name: 'empty', value: null }
      visitor.visitNull(field)
      const results = visitor.getResult()
      expect(results[0].charCount).toBe(0)
    })
  })

  describe('reset method', () => {
    it('should clear all results', () => {
      visitor.visitString({ name: 'field1', value: 'text' })
      visitor.visitString({ name: 'field2', value: 'more text' })
      expect(visitor.getResult()).toHaveLength(2)

      visitor.reset()
      expect(visitor.getResult()).toHaveLength(0)
      expect(visitor.getTotalHeight()).toBe(0)
    })
  })

  describe('createMeasureVisitor factory', () => {
    it('should create MeasureVisitor with default options', () => {
      const visitor = createMeasureVisitor()
      expect(visitor).toBeInstanceOf(MeasureVisitor)
    })

    it('should create MeasureVisitor with custom options', () => {
      const visitor = createMeasureVisitor({ lineHeight: 8, charsPerLine: 50 })
      visitor.visitString({ name: 'test', value: 'A'.repeat(100) })
      const results = visitor.getResult()
      expect(results[0].lineCount).toBe(2) // 100 / 50 = 2
      expect(results[0].estimatedHeight).toBe(16) // 2 * 8mm
    })
  })
})


// ============================================================================
// MeasureVisitor 属性测试
// Property 3: MeasureVisitor 高度计算
// **Validates: Requirements 1.10**
// ============================================================================

describe('MeasureVisitor Property Tests', () => {
  /**
   * Property 3: MeasureVisitor 高度计算
   * *For any* text content, MeasureVisitor SHALL calculate estimated height
   * that is positive and proportional to content length.
   * **Validates: Requirements 1.10**
   */
  describe('Property 3: MeasureVisitor 高度计算', () => {
    it('should always produce positive height for any text', () => {
      fc.assert(
        fc.property(fc.string(), fieldNameArb, (value, name) => {
          const visitor = new MeasureVisitor()
          const field: FieldInfo = { name, value }
          visitor.visitString(field)
          const results = visitor.getResult()
          return results.length === 1 && results[0].estimatedHeight > 0
        }),
        { numRuns: 100 }
      )
    })

    it('should produce height proportional to content length', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fieldNameArb,
          (short, long, name) => {
            // Make sure long is actually longer
            const shortText = short
            const longText = short + long

            const visitor1 = new MeasureVisitor()
            const visitor2 = new MeasureVisitor()

            visitor1.visitString({ name, value: shortText })
            visitor2.visitString({ name, value: longText })

            const shortHeight = visitor1.getResult()[0].estimatedHeight
            const longHeight = visitor2.getResult()[0].estimatedHeight

            // Longer text should have >= height
            return longHeight >= shortHeight
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should calculate correct line count based on charsPerLine', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer({ min: 10, max: 100 }),
          fieldNameArb,
          (value, charsPerLine, name) => {
            const visitor = new MeasureVisitor({ charsPerLine })
            visitor.visitString({ name, value })
            const results = visitor.getResult()
            const expectedLines = Math.max(1, Math.ceil(value.length / charsPerLine))
            return results[0].lineCount === expectedLines
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should calculate height as lineCount * lineHeight', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 10, max: 100 }),
          fieldNameArb,
          (value, lineHeight, charsPerLine, name) => {
            const visitor = new MeasureVisitor({ lineHeight, charsPerLine })
            visitor.visitString({ name, value })
            const results = visitor.getResult()
            return results[0].estimatedHeight === results[0].lineCount * lineHeight
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should accumulate total height correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
          (values) => {
            const visitor = new MeasureVisitor()
            values.forEach((value, i) => {
              visitor.visitString({ name: `field${i}`, value })
            })
            const results = visitor.getResult()
            const sumHeight = results.reduce((sum, r) => sum + r.estimatedHeight, 0)
            return visitor.getTotalHeight() === sumHeight
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always have charCount equal to string length', () => {
      fc.assert(
        fc.property(fc.string(), fieldNameArb, (value, name) => {
          const visitor = new MeasureVisitor()
          visitor.visitString({ name, value })
          const results = visitor.getResult()
          return results[0].charCount === value.length
        }),
        { numRuns: 100 }
      )
    })
  })
})


// ============================================================================
// FormDataTraverser 单元测试
// Requirements: 1.11
// ============================================================================

describe('FormDataTraverser', () => {
  let traverser: FormDataTraverser

  beforeEach(() => {
    traverser = new FormDataTraverser()
  })

  describe('Basic traversal', () => {
    /**
     * Requirements: 1.11
     * WHEN a FormDataTraverser traverses form data, THE Test_Suite SHALL verify
     * all fields are visited with correct types
     */
    it('should traverse all fields in form data', () => {
      const data = {
        name: 'John',
        age: 25,
        active: true,
      }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      const formattedData = visitor.getFormattedData()
      expect(formattedData.size).toBe(3)
      expect(formattedData.get('name')).toBe('John')
      expect(formattedData.get('age')).toBe('25')
      expect(formattedData.get('active')).toBe('☑')
    })

    it('should handle empty form data', () => {
      const data = {}
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      const formattedData = visitor.getFormattedData()
      expect(formattedData.size).toBe(0)
    })
  })

  describe('Type inference', () => {
    it('should infer string type', () => {
      const data = { text: 'hello' }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('text')).toBe('hello')
    })

    it('should infer number type', () => {
      const data = { count: 42 }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('count')).toBe('42')
    })

    it('should infer boolean type', () => {
      const data = { checked: true }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('checked')).toBe('☑')
    })

    it('should infer array type', () => {
      const data = { tags: ['a', 'b', 'c'] }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('tags')).toBe('a, b, c')
    })

    it('should infer object type', () => {
      const data = { nested: { key: 'value' } }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('nested')).toBe('{"key":"value"}')
    })

    it('should infer null type', () => {
      const data = { empty: null }
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor)
      expect(visitor.getFormattedData().get('empty')).toBe('')
    })
  })

  describe('extractFieldTypes from sections', () => {
    it('should extract types from info-grid sections', () => {
      const data = { birthDate: '2024-03-15', age: '25' }
      const sections: PrintSection[] = [
        {
          type: 'info-grid',
          config: {
            columns: 2,
            rows: [
              {
                cells: [
                  { label: '出生日期', field: 'birthDate', type: 'date' },
                  { label: '年龄', field: 'age', type: 'number' },
                ],
              },
            ],
          } as InfoGridConfig,
        },
      ]
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor, sections)
      // birthDate should be formatted as date
      expect(visitor.getFormattedData().get('birthDate')).toBe('2024-03-15')
    })

    it('should extract types from table sections', () => {
      const data = { recordDate: '2024-03-15' }
      const sections: PrintSection[] = [
        {
          type: 'table',
          config: {
            dataField: 'records',
            columns: [{ header: '日期', field: 'recordDate', type: 'date' }],
          } as TableConfig,
        },
      ]
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor, sections)
      expect(visitor.getFormattedData().get('recordDate')).toBe('2024-03-15')
    })

    it('should use configured type over inferred type', () => {
      const data = { checked: 'yes' } // String value but configured as checkbox
      const sections: PrintSection[] = [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [
              {
                cells: [{ label: '选中', field: 'checked', type: 'checkbox' }],
              },
            ],
          } as InfoGridConfig,
        },
      ]
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor, sections)
      // Should be formatted as boolean (checkbox)
      expect(visitor.getFormattedData().get('checked')).toBe('☑')
    })

    it('should handle sections without type info', () => {
      const data = { text: 'hello' }
      const sections: PrintSection[] = [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [
              {
                cells: [{ label: '文本', field: 'text' }], // No type specified
              },
            ],
          } as InfoGridConfig,
        },
      ]
      const visitor = new FormatVisitor()
      traverser.traverse(data, visitor, sections)
      expect(visitor.getFormattedData().get('text')).toBe('hello')
    })
  })

  describe('createFormDataTraverser factory', () => {
    it('should create FormDataTraverser', () => {
      const traverser = createFormDataTraverser()
      expect(traverser).toBeInstanceOf(FormDataTraverser)
    })
  })
})


// ============================================================================
// FormDataTraverser 属性测试
// Property 4: FormDataTraverser 遍历完整性
// **Validates: Requirements 1.11**
// ============================================================================

describe('FormDataTraverser Property Tests', () => {
  /**
   * Property 4: FormDataTraverser 遍历完整性
   * *For any* form data object, FormDataTraverser SHALL visit all fields
   * exactly once with correct type inference.
   * **Validates: Requirements 1.11**
   */
  describe('Property 4: FormDataTraverser 遍历完整性', () => {
    it('should visit all fields in form data', () => {
      fc.assert(
        fc.property(formDataArb, (data) => {
          const traverser = new FormDataTraverser()
          const visitor = new FormatVisitor()
          traverser.traverse(data, visitor)
          const formattedData = visitor.getFormattedData()
          // All keys should be visited
          const dataKeys = Object.keys(data)
          return dataKeys.every((key) => formattedData.has(key))
        }),
        { numRuns: 100 }
      )
    })

    it('should visit each field exactly once', () => {
      fc.assert(
        fc.property(formDataArb, (data) => {
          const traverser = new FormDataTraverser()
          const visitedFields: string[] = []

          // Create a custom visitor to track visits
          const trackingVisitor: FormDataVisitor<void> = {
            visitString: (field) => {
              visitedFields.push(field.name)
            },
            visitNumber: (field) => {
              visitedFields.push(field.name)
            },
            visitBoolean: (field) => {
              visitedFields.push(field.name)
            },
            visitDate: (field) => {
              visitedFields.push(field.name)
            },
            visitArray: (field) => {
              visitedFields.push(field.name)
            },
            visitObject: (field) => {
              visitedFields.push(field.name)
            },
            visitNull: (field) => {
              visitedFields.push(field.name)
            },
            getResult: () => {},
          }

          traverser.traverse(data, trackingVisitor)

          // Each field should be visited exactly once
          const uniqueVisits = new Set(visitedFields)
          return visitedFields.length === uniqueVisits.size
        }),
        { numRuns: 100 }
      )
    })

    it('should infer correct type for string values', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fieldNameArb, fc.string()),
          (data) => {
            const traverser = new FormDataTraverser()
            const visitedTypes: Map<string, string> = new Map()

            const typeTrackingVisitor: FormDataVisitor<void> = {
              visitString: (field) => {
                visitedTypes.set(field.name, 'string')
              },
              visitNumber: (field) => {
                visitedTypes.set(field.name, 'number')
              },
              visitBoolean: (field) => {
                visitedTypes.set(field.name, 'boolean')
              },
              visitDate: (field) => {
                visitedTypes.set(field.name, 'date')
              },
              visitArray: (field) => {
                visitedTypes.set(field.name, 'array')
              },
              visitObject: (field) => {
                visitedTypes.set(field.name, 'object')
              },
              visitNull: (field) => {
                visitedTypes.set(field.name, 'null')
              },
              getResult: () => {},
            }

            traverser.traverse(data, typeTrackingVisitor)

            // All string values should be visited as string
            return Object.keys(data).every((key) => visitedTypes.get(key) === 'string')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should infer correct type for number values', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fieldNameArb, fc.integer()),
          (data) => {
            const traverser = new FormDataTraverser()
            const visitedTypes: Map<string, string> = new Map()

            const typeTrackingVisitor: FormDataVisitor<void> = {
              visitString: (field) => {
                visitedTypes.set(field.name, 'string')
              },
              visitNumber: (field) => {
                visitedTypes.set(field.name, 'number')
              },
              visitBoolean: (field) => {
                visitedTypes.set(field.name, 'boolean')
              },
              visitDate: (field) => {
                visitedTypes.set(field.name, 'date')
              },
              visitArray: (field) => {
                visitedTypes.set(field.name, 'array')
              },
              visitObject: (field) => {
                visitedTypes.set(field.name, 'object')
              },
              visitNull: (field) => {
                visitedTypes.set(field.name, 'null')
              },
              getResult: () => {},
            }

            traverser.traverse(data, typeTrackingVisitor)

            // All number values should be visited as number
            return Object.keys(data).every((key) => visitedTypes.get(key) === 'number')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should infer correct type for boolean values', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fieldNameArb, fc.boolean()),
          (data) => {
            const traverser = new FormDataTraverser()
            const visitedTypes: Map<string, string> = new Map()

            const typeTrackingVisitor: FormDataVisitor<void> = {
              visitString: (field) => {
                visitedTypes.set(field.name, 'string')
              },
              visitNumber: (field) => {
                visitedTypes.set(field.name, 'number')
              },
              visitBoolean: (field) => {
                visitedTypes.set(field.name, 'boolean')
              },
              visitDate: (field) => {
                visitedTypes.set(field.name, 'date')
              },
              visitArray: (field) => {
                visitedTypes.set(field.name, 'array')
              },
              visitObject: (field) => {
                visitedTypes.set(field.name, 'object')
              },
              visitNull: (field) => {
                visitedTypes.set(field.name, 'null')
              },
              getResult: () => {},
            }

            traverser.traverse(data, typeTrackingVisitor)

            // All boolean values should be visited as boolean
            return Object.keys(data).every((key) => visitedTypes.get(key) === 'boolean')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should infer correct type for array values', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fieldNameArb, fc.array(fc.string())),
          (data) => {
            const traverser = new FormDataTraverser()
            const visitedTypes: Map<string, string> = new Map()

            const typeTrackingVisitor: FormDataVisitor<void> = {
              visitString: (field) => {
                visitedTypes.set(field.name, 'string')
              },
              visitNumber: (field) => {
                visitedTypes.set(field.name, 'number')
              },
              visitBoolean: (field) => {
                visitedTypes.set(field.name, 'boolean')
              },
              visitDate: (field) => {
                visitedTypes.set(field.name, 'date')
              },
              visitArray: (field) => {
                visitedTypes.set(field.name, 'array')
              },
              visitObject: (field) => {
                visitedTypes.set(field.name, 'object')
              },
              visitNull: (field) => {
                visitedTypes.set(field.name, 'null')
              },
              getResult: () => {},
            }

            traverser.traverse(data, typeTrackingVisitor)

            // All array values should be visited as array
            return Object.keys(data).every((key) => visitedTypes.get(key) === 'array')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle null values correctly', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fieldNameArb, fc.constant(null)),
          (data) => {
            const traverser = new FormDataTraverser()
            const visitedTypes: Map<string, string> = new Map()

            const typeTrackingVisitor: FormDataVisitor<void> = {
              visitString: (field) => {
                visitedTypes.set(field.name, 'string')
              },
              visitNumber: (field) => {
                visitedTypes.set(field.name, 'number')
              },
              visitBoolean: (field) => {
                visitedTypes.set(field.name, 'boolean')
              },
              visitDate: (field) => {
                visitedTypes.set(field.name, 'date')
              },
              visitArray: (field) => {
                visitedTypes.set(field.name, 'array')
              },
              visitObject: (field) => {
                visitedTypes.set(field.name, 'object')
              },
              visitNull: (field) => {
                visitedTypes.set(field.name, 'null')
              },
              getResult: () => {},
            }

            traverser.traverse(data, typeTrackingVisitor)

            // All null values should be visited as null
            return Object.keys(data).every((key) => visitedTypes.get(key) === 'null')
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
