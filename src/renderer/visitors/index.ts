/**
 * @fileoverview Visitor 模式 - 数据格式化
 * @module renderer/visitors
 * 
 * @modified 2023.12.15
 * 
 * @description
 * 使用 Visitor 模式分离数据遍历和操作逻辑。
 * FormDataVisitor 接口定义访问方法，
 * 不同的 Visitor 实现不同的操作：格式化、验证、测量等。
 */

import type { FormData, PrintSection, InfoGridConfig, TableConfig } from '../../types/print-schema'
import { formatValue, formatDate, formatNumber } from '../../formatters'

/**
 * 字段信息
 */
export interface FieldInfo {
  /** 字段名 */
  name: string
  /** 字段值 */
  value: unknown
  /** 字段类型 */
  type?: string
  /** 字段标签 */
  label?: string
  /** 所属区块 */
  section?: PrintSection
}

/**
 * 表单数据访问者接口（Visitor 模式的 Visitor）
 * 定义访问不同类型数据的方法
 */
export interface FormDataVisitor<T = void> {
  /** 访问字符串字段 */
  visitString(field: FieldInfo): T
  /** 访问数字字段 */
  visitNumber(field: FieldInfo): T
  /** 访问布尔字段 */
  visitBoolean(field: FieldInfo): T
  /** 访问日期字段 */
  visitDate(field: FieldInfo): T
  /** 访问数组字段 */
  visitArray(field: FieldInfo): T
  /** 访问对象字段 */
  visitObject(field: FieldInfo): T
  /** 访问空值字段 */
  visitNull(field: FieldInfo): T
  /** 获取结果 */
  getResult(): T
}

/**
 * 格式化访问者
 * 将数据格式化为显示字符串
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
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
}

/**
 * 验证访问者
 * 验证数据完整性
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
          message: `${field.label || field.name} 是必填字段`,
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
          message: `${field.label || field.name} 必须是有效数字`,
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
          message: `${field.label || field.name} 必须是有效日期`,
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
 * 测量结果
 */
export interface MeasureResult {
  /** 字段名 */
  field: string
  /** 估算字符数 */
  charCount: number
  /** 估算行数 */
  lineCount: number
  /** 估算高度（mm） */
  estimatedHeight: number
}

/**
 * 测量访问者
 * 测量内容高度（用于分页计算）
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
 * 数据遍历器
 * 遍历表单数据并应用访问者
 */
export class FormDataTraverser {
  /**
   * 遍历表单数据
   * @param data - 表单数据
   * @param visitor - 访问者
   * @param sections - 区块配置（可选，用于获取字段类型信息）
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
   * 访问单个字段
   */
  private visitField<T>(field: FieldInfo, visitor: FormDataVisitor<T>): void {
    const { value, type } = field

    // 优先使用配置的类型
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

    // 根据值类型推断
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
   * 从区块配置中提取字段类型
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
 * 创建格式化访问者
 */
export function createFormatVisitor(options?: {
  dateFormat?: string
  booleanSymbols?: { true: string; false: string }
}): FormatVisitor {
  return new FormatVisitor(options)
}

/**
 * 创建验证访问者
 */
export function createValidationVisitor(requiredFields?: string[]): ValidationVisitor {
  return new ValidationVisitor(requiredFields)
}

/**
 * 创建测量访问者
 */
export function createMeasureVisitor(options?: {
  lineHeight?: number
  charsPerLine?: number
}): MeasureVisitor {
  return new MeasureVisitor(options)
}

/**
 * 创建数据遍历器
 */
export function createFormDataTraverser(): FormDataTraverser {
  return new FormDataTraverser()
}
