/**
 * @fileoverview 格式化器工厂
 * @module renderer/factory/formatter-factory
 * 
 * @description
 * 使用 Factory 模式创建数据格式化器实例。
 * 支持注册自定义格式化器，实现格式化逻辑的解耦和扩展。
 */

import {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
} from '../../formatters'

/** 格式化函数类型 */
export type Formatter<T = unknown> = (value: T, options?: Record<string, unknown>) => string

/** 格式化器配置 */
export interface FormatterConfig {
  /** 日期格式 */
  dateFormat?: string
  /** 空值占位符 */
  emptyPlaceholder?: string
  /** 数字精度 */
  numberPrecision?: number
  /** 布尔值真值显示 */
  booleanTrueSymbol?: string
  /** 布尔值假值显示 */
  booleanFalseSymbol?: string
}

/**
 * 格式化器工厂
 * 负责创建和管理数据格式化器
 */
export class FormatterFactory {
  private formatters: Map<string, Formatter> = new Map()
  private config: FormatterConfig

  /**
   * 创建工厂实例
   * @param config - 格式化器配置
   */
  constructor(config: FormatterConfig = {}) {
    this.config = config
    this.registerBuiltInFormatters()
  }

  /**
   * 注册内置格式化器
   */
  private registerBuiltInFormatters(): void {
    // 日期格式化器
    this.register('date', (value: unknown) => {
      return formatDate(value, this.config.dateFormat)
    })

    // 布尔值格式化器
    this.register('boolean', (value: unknown) => {
      return formatBoolean(value as boolean)
    })
    this.register('checkbox', (value: unknown) => {
      return formatBoolean(value as boolean)
    })

    // 数字格式化器
    this.register('number', (value: unknown) => {
      return formatNumber(value)
    })

    // 文本格式化器
    this.register('text', (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return this.config.emptyPlaceholder || ''
      }
      return String(value)
    })

    // 签名格式化器
    this.register('signature', (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return this.config.emptyPlaceholder || '________'
      }
      return String(value)
    })
  }

  /**
   * 注册格式化器
   * @param type - 格式化器类型
   * @param formatter - 格式化函数
   */
  register(type: string, formatter: Formatter): void {
    this.formatters.set(type, formatter)
  }

  /**
   * 获取格式化器
   * @param type - 格式化器类型
   * @returns 格式化函数，如果不存在则返回 undefined
   */
  get(type: string): Formatter | undefined {
    return this.formatters.get(type)
  }

  /**
   * 检查是否存在指定类型的格式化器
   * @param type - 格式化器类型
   * @returns 是否存在
   */
  has(type: string): boolean {
    return this.formatters.has(type)
  }

  /**
   * 格式化值
   * @param value - 要格式化的值
   * @param type - 格式化器类型
   * @returns 格式化后的字符串
   */
  format(value: unknown, type?: string): string {
    if (type && this.formatters.has(type)) {
      const formatter = this.formatters.get(type)!
      return formatter(value)
    }

    // 使用通用格式化
    return formatValue(value, type, {
      emptyPlaceholder: this.config.emptyPlaceholder,
    })
  }

  /**
   * 获取所有已注册的格式化器类型
   * @returns 类型数组
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.formatters.keys())
  }

  /**
   * 更新配置
   * @param config - 新配置
   */
  updateConfig(config: Partial<FormatterConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): FormatterConfig {
    return { ...this.config }
  }
}

/** 默认工厂实例 */
let defaultFactory: FormatterFactory | null = null

/**
 * 获取默认工厂实例（单例）
 * @returns 默认工厂实例
 */
export function getDefaultFormatterFactory(): FormatterFactory {
  if (!defaultFactory) {
    defaultFactory = new FormatterFactory()
  }
  return defaultFactory
}
