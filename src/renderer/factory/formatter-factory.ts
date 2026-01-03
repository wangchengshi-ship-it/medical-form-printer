/**
 * @fileoverview Formatter Factory
 * @module renderer/factory/formatter-factory
 * 
 * @description
 * Uses Factory pattern to create data formatter instances.
 * Supports registering custom formatters for decoupling and extensibility.
 */

import {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
} from '../../formatters'

/** Formatter function type */
export type Formatter<T = unknown> = (value: T, options?: Record<string, unknown>) => string

/** Formatter configuration */
export interface FormatterConfig {
  /** Date format */
  dateFormat?: string
  /** Empty value placeholder */
  emptyPlaceholder?: string
  /** Number precision */
  numberPrecision?: number
  /** Boolean true value display */
  booleanTrueSymbol?: string
  /** Boolean false value display */
  booleanFalseSymbol?: string
}

/**
 * Formatter Factory
 * Responsible for creating and managing data formatters
 */
export class FormatterFactory {
  private formatters: Map<string, Formatter> = new Map()
  private config: FormatterConfig

  /**
   * Create factory instance
   * @param config - Formatter configuration
   */
  constructor(config: FormatterConfig = {}) {
    this.config = config
    this.registerBuiltInFormatters()
  }

  /**
   * Register built-in formatters
   */
  private registerBuiltInFormatters(): void {
    // Date formatter
    this.register('date', (value: unknown) => {
      return formatDate(value, this.config.dateFormat)
    })

    // Boolean formatter
    this.register('boolean', (value: unknown) => {
      return formatBoolean(value as boolean)
    })
    this.register('checkbox', (value: unknown) => {
      return formatBoolean(value as boolean)
    })

    // Number formatter
    this.register('number', (value: unknown) => {
      return formatNumber(value)
    })

    // Text formatter
    this.register('text', (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return this.config.emptyPlaceholder || ''
      }
      return String(value)
    })

    // Signature formatter
    this.register('signature', (value: unknown) => {
      if (value === undefined || value === null || value === '') {
        return this.config.emptyPlaceholder || '________'
      }
      return String(value)
    })
  }

  /**
   * Register formatter
   * @param type - Formatter type
   * @param formatter - Formatter function
   */
  register(type: string, formatter: Formatter): void {
    this.formatters.set(type, formatter)
  }

  /**
   * Get formatter
   * @param type - Formatter type
   * @returns Formatter function, or undefined if not found
   */
  get(type: string): Formatter | undefined {
    return this.formatters.get(type)
  }

  /**
   * Check if formatter of specified type exists
   * @param type - Formatter type
   * @returns Whether exists
   */
  has(type: string): boolean {
    return this.formatters.has(type)
  }

  /**
   * Format value
   * @param value - Value to format
   * @param type - Formatter type
   * @returns Formatted string
   */
  format(value: unknown, type?: string): string {
    if (type && this.formatters.has(type)) {
      const formatter = this.formatters.get(type)!
      return formatter(value)
    }

    // Use generic formatting
    return formatValue(value, type, {
      emptyPlaceholder: this.config.emptyPlaceholder,
    })
  }

  /**
   * Get all registered formatter types
   * @returns Type array
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.formatters.keys())
  }

  /**
   * Update configuration
   * @param config - New configuration
   */
  updateConfig(config: Partial<FormatterConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig(): FormatterConfig {
    return { ...this.config }
  }
}

/** Default factory instance */
let defaultFactory: FormatterFactory | null = null

/**
 * Get default factory instance (singleton)
 * @returns Default factory instance
 */
export function getDefaultFormatterFactory(): FormatterFactory {
  if (!defaultFactory) {
    defaultFactory = new FormatterFactory()
  }
  return defaultFactory
}
