/**
 * @fileoverview Visitor pattern - Data formatting
 * @module renderer/visitors
 * 
 * @modified 2023.12.15
 * 
 * @description
 * Uses Visitor pattern to separate data traversal and operation logic.
 * FormDataVisitor interface defines visit methods,
 * Different Visitors implement different operations: formatting, validation, measurement, etc.
 */

import type { FormData, PrintSection, InfoGridConfig, TableConfig } from '../../types/print-schema'
import { formatValue, formatDate, formatNumber } from '../../formatters'

/**
 * Field information
 */
export interface FieldInfo {
  /** Field name */
  name: string
  /** Field value */
  value: unknown
  /** Field type */
  type?: string
  /** Field label */
  label?: string
  /** Parent section */
  section?: PrintSection
}

/**
 * Form data visitor interface (Visitor pattern's Visitor)
 * Defines methods for visiting different data types
 */
export interface FormDataVisitor<T = void> {
  /** Visit string field */
  visitString(field: FieldInfo): T
  /** Visit number field */
  visitNumber(field: FieldInfo): T
  /** Visit boolean field */
  visitBoolean(field: FieldInfo): T
  /** Visit date field */
  visitDate(field: FieldInfo): T
  /** Visit array field */
  visitArray(field: FieldInfo): T
  /** Visit object field */
  visitObject(field: FieldInfo): T
  /** Visit null field */
  visitNull(field: FieldInfo): T
  /** Get result */
  getResult(): T
}

/**
 * Format visitor
 * Formats data into display strings
 */
export class FormatVisitor implements FormDataVisitor<string> {
  private results: Map<string, string> = new Map()
  private dateFormat: string = 'YYYY-MM-DD'
  private booleanSymbols: { true: string; false: string } = { true: '☑', false: '□' }

  constructor(options?: {
    dateFormat?: string
    booleanSymbols?: { true: string; false: string }
  }) {
    if (options?.dateFormat) {
      this.dateFormat = options.dateFormat
    }
    if (options?.booleanSymbols) {
      this.booleanSymbols = options.booleanSymbols
    }
  }

  visitString(field: FieldInfo): string {
    const formatted = String(field.value || '')
    this.results.set(field.name, formatted)
    return formatted
  }

  visitNumber(field: FieldInfo): string {
    const formatted = formatNumber(field.value)
    this.results.set(field.name, formatted)
    return formatted
  }

  visitBoolean(field: FieldInfo): string {
    const value = field.value as boolean
    const formatted = value ? this.booleanSymbols.true : this.booleanSymbols.false
    this.results.set(field.name, formatted)
    return formatted
  }

  visitDate(field: FieldInfo): string {
    const formatted = formatDate(field.value, this.dateFormat)
    this.results.set(field.name, formatted)
    return formatted
  }

  visitArray(field: FieldInfo): string {
    const arr = field.value as unknown[]
    const formatted = arr.map(item => formatValue(item)).join(', ')
    this.results.set(field.name, formatted)
    return formatted
  }

  visitObject(field: FieldInfo): string {
    const formatted = JSON.stringify(field.value)
    this.results.set(field.name, formatted)
    return formatted
  }

  visitNull(field: FieldInfo): string {
    const formatted = ''
    this.results.set(field.name, formatted)
    return formatted
  }

  getResult(): string {
    return Array.from(this.results.values()).join('\n')
  }

  getFormattedData(): Map<string, string> {
    return new Map(this.results)
  }
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
}

/**
 * Validation visitor
 * Validates data integrity
 */
export class ValidationVisitor implements FormDataVisitor<ValidationResult> {
  private errors: Array<{ field: string; message: string }> = []
  private requiredFields: Set<string> = new Set()

  constructor(requiredFields?: string[]) {
    if (requiredFields) {
      this.requiredFields = new Set(requiredFields)
    }
  }

  private checkRequired(field: FieldInfo): void {
    if (this.requiredFields.has(field.name)) {
      if (field.value === null || field.value === undefined || field.value === '') {
        this.errors.push({
          field: field.name,
          message: `${field.label || field.name} is a required field`,
        })
      }
    }
  }

  visitString(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    return this.getResult()
  }

  visitNumber(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    if (field.value !== null && field.value !== undefined) {
      const num = Number(field.value)
      if (isNaN(num)) {
        this.errors.push({
          field: field.name,
          message: `${field.label || field.name} must be a valid number`,
        })
      }
    }
    return this.getResult()
  }

  visitBoolean(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    return this.getResult()
  }

  visitDate(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    if (field.value !== null && field.value !== undefined && field.value !== '') {
      const date = new Date(field.value as string)
      if (isNaN(date.getTime())) {
        this.errors.push({
          field: field.name,
          message: `${field.label || field.name} must be a valid date`,
        })
      }
    }
    return this.getResult()
  }

  visitArray(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    return this.getResult()
  }

  visitObject(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    return this.getResult()
  }

  visitNull(field: FieldInfo): ValidationResult {
    this.checkRequired(field)
    return this.getResult()
  }

  getResult(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
    }
  }

  reset(): void {
    this.errors = []
  }
}

/**
 * Measurement result
 */
export interface MeasureResult {
  /** Field name */
  field: string
  /** Estimated character count */
  charCount: number
  /** Estimated line count */
  lineCount: number
  /** Estimated height (mm) */
  estimatedHeight: number
}

/**
 * Measurement visitor
 * Measures content height (for pagination calculation)
 */
export class MeasureVisitor implements FormDataVisitor<MeasureResult[]> {
  private results: MeasureResult[] = []
  private lineHeight: number = 5 // mm
  private charsPerLine: number = 40

  constructor(options?: {
    lineHeight?: number
    charsPerLine?: number
  }) {
    if (options?.lineHeight) {
      this.lineHeight = options.lineHeight
    }
    if (options?.charsPerLine) {
      this.charsPerLine = options.charsPerLine
    }
  }

  private measure(field: FieldInfo, text: string): MeasureResult {
    const charCount = text.length
    const lineCount = Math.max(1, Math.ceil(charCount / this.charsPerLine))
    const estimatedHeight = lineCount * this.lineHeight

    const result: MeasureResult = {
      field: field.name,
      charCount,
      lineCount,
      estimatedHeight,
    }
    this.results.push(result)
    return result
  }

  visitString(field: FieldInfo): MeasureResult[] {
    this.measure(field, String(field.value || ''))
    return this.getResult()
  }

  visitNumber(field: FieldInfo): MeasureResult[] {
    this.measure(field, formatNumber(field.value))
    return this.getResult()
  }

  visitBoolean(field: FieldInfo): MeasureResult[] {
    this.measure(field, '☑')
    return this.getResult()
  }

  visitDate(field: FieldInfo): MeasureResult[] {
    this.measure(field, formatDate(field.value))
    return this.getResult()
  }

  visitArray(field: FieldInfo): MeasureResult[] {
    const arr = field.value as unknown[]
    this.measure(field, arr.map(item => formatValue(item)).join(', '))
    return this.getResult()
  }

  visitObject(field: FieldInfo): MeasureResult[] {
    this.measure(field, JSON.stringify(field.value))
    return this.getResult()
  }

  visitNull(field: FieldInfo): MeasureResult[] {
    this.measure(field, '')
    return this.getResult()
  }

  getResult(): MeasureResult[] {
    return [...this.results]
  }

  getTotalHeight(): number {
    return this.results.reduce((sum, r) => sum + r.estimatedHeight, 0)
  }

  reset(): void {
    this.results = []
  }
}

/**
 * Data traverser
 * Traverses form data and applies visitor
 */
export class FormDataTraverser {
  /**
   * Traverse form data
   * @param data - Form data
   * @param visitor - Visitor
   * @param sections - Section configuration (optional, for field type info)
   */
  traverse<T>(
    data: FormData,
    visitor: FormDataVisitor<T>,
    sections?: PrintSection[]
  ): void {
    const fieldTypes = sections ? this.extractFieldTypes(sections) : new Map<string, string>()

    for (const [name, value] of Object.entries(data)) {
      const fieldInfo: FieldInfo = {
        name,
        value,
        type: fieldTypes.get(name),
      }

      this.visitField(fieldInfo, visitor)
    }
  }

  /**
   * Visit single field
   */
  private visitField<T>(field: FieldInfo, visitor: FormDataVisitor<T>): void {
    const { value, type } = field

    // Prioritize configured type
    if (type === 'date') {
      visitor.visitDate(field)
      return
    }
    if (type === 'checkbox' || type === 'boolean') {
      visitor.visitBoolean(field)
      return
    }
    if (type === 'number') {
      visitor.visitNumber(field)
      return
    }

    // Infer from value type
    if (value === null || value === undefined) {
      visitor.visitNull(field)
    } else if (typeof value === 'string') {
      visitor.visitString(field)
    } else if (typeof value === 'number') {
      visitor.visitNumber(field)
    } else if (typeof value === 'boolean') {
      visitor.visitBoolean(field)
    } else if (Array.isArray(value)) {
      visitor.visitArray(field)
    } else if (typeof value === 'object') {
      visitor.visitObject(field)
    } else {
      visitor.visitString(field)
    }
  }

  /**
   * Extract field types from section configuration
   */
  private extractFieldTypes(sections: PrintSection[]): Map<string, string> {
    const types = new Map<string, string>()

    for (const section of sections) {
      if (section.type === 'info-grid') {
        const config = section.config as InfoGridConfig
        for (const row of config.rows || []) {
          for (const cell of row.cells || []) {
            if (cell.field && cell.type) {
              types.set(cell.field, cell.type)
            }
          }
        }
      } else if (section.type === 'table') {
        const config = section.config as TableConfig
        for (const col of config.columns || []) {
          if (col.field && col.type) {
            types.set(col.field, col.type)
          }
        }
      }
    }

    return types
  }
}

/**
 * Create format visitor
 */
export function createFormatVisitor(options?: {
  dateFormat?: string
  booleanSymbols?: { true: string; false: string }
}): FormatVisitor {
  return new FormatVisitor(options)
}

/**
 * Create validation visitor
 */
export function createValidationVisitor(requiredFields?: string[]): ValidationVisitor {
  return new ValidationVisitor(requiredFields)
}

/**
 * Create measurement visitor
 */
export function createMeasureVisitor(options?: {
  lineHeight?: number
  charsPerLine?: number
}): MeasureVisitor {
  return new MeasureVisitor(options)
}

/**
 * Create data traverser
 */
export function createFormDataTraverser(): FormDataTraverser {
  return new FormDataTraverser()
}
