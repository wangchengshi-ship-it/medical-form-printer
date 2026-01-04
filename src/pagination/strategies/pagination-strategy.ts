/**
 * @fileoverview Pagination strategy interface and context
 * @module pagination/strategies/pagination-strategy
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Defines the unified pagination strategy interface and context class.
 * Implements the Strategy pattern for different pagination approaches:
 * - Smart pagination (table-based measurement)
 * - Overflow pagination (long text field handling)
 *
 * @requirements
 * - 1.1: Define unified PaginationStrategy interface
 * - 1.2: Interface has name property
 * - 1.3: Interface has shouldApply method
 * - 1.4: Interface has render method
 * - 4.1: PaginationContext accepts strategies in constructor
 * - 4.2: Context provides getApplicableStrategies method
 * - 4.3: Context provides render method
 * - 4.4: Context executes applicable strategies
 *
 * @dependencies
 * - ../../types/print-schema - PrintSchema and FormData types
 * - ../types - PaginationConfig and related types
 *
 * @usedBy
 * - ./smart/smart-pagination-strategy.ts - Smart pagination strategy
 * - ./overflow/overflow-pagination-strategy.ts - Overflow pagination strategy
 * - ../paginated-renderer.ts - Main pagination renderer
 */

import type { PrintSchema, FormData } from '../../types/print-schema'
import type { PaginationConfig, MeasurableItem, OverflowTextConfig } from '../types'

// ==================== Extended Types ====================

/**
 * Extended PrintSchema with pagination configuration
 * @requirements 1.1 - Support pagination configuration in schema
 */
export interface PrintSchemaWithPagination extends PrintSchema {
  /** Pagination configuration */
  pagination?: PaginationConfig
}

/**
 * Pagination render options
 * @requirements 1.4 - Render method options parameter
 */
export interface PaginationRenderOptions {
  /** Whether to render in isolated mode (with CSS namespace) */
  isolated?: boolean
  /** Pre-measured content items for smart pagination */
  measuredItems?: MeasurableItem[]
  /** Overflow text configuration for i18n */
  textConfig?: Partial<OverflowTextConfig>
}

// ==================== Strategy Interface ====================

/**
 * Pagination strategy interface
 * Defines unified API for different pagination approaches
 *
 * @requirements 1.1, 1.2, 1.3, 1.4 - Unified pagination strategy interface
 *
 * @example
 * class MyPaginationStrategy implements PaginationStrategy {
 *   readonly name = 'my-strategy'
 *   
 *   shouldApply(schema: PrintSchemaWithPagination): boolean {
 *     return schema.pagination?.myStrategy?.enabled === true
 *   }
 *   
 *   render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
 *     // Implementation here
 *     return '<div>Rendered content</div>'
 *   }
 * }
 */
export interface PaginationStrategy {
  /**
   * Strategy name identifier
   * @requirements 1.2 - Interface has name property
   */
  readonly name: string

  /**
   * Check if this strategy should be applied to the given schema
   * @param schema - Print schema with pagination configuration
   * @returns Whether this strategy applies
   * @requirements 1.3 - Interface has shouldApply method
   */
  shouldApply(schema: PrintSchemaWithPagination): boolean

  /**
   * Render paginated content using this strategy
   * @param schema - Print schema with pagination configuration
   * @param data - Form data to render
   * @param options - Render options
   * @returns Rendered HTML string
   * @requirements 1.4 - Interface has render method
   */
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string
}

// ==================== Strategy Context ====================

/**
 * Pagination context class
 * Manages strategy selection and execution using the Strategy pattern
 *
 * @requirements 4.1, 4.2, 4.3, 4.4 - Strategy context implementation
 *
 * @example
 * const strategies = [new SmartPaginationStrategy(), new OverflowPaginationStrategy()]
 * const context = new PaginationContext(strategies)
 * 
 * const applicableStrategies = context.getApplicableStrategies(schema)
 * const html = context.render(schema, data, options)
 */
export class PaginationContext {
  private strategies: PaginationStrategy[]

  /**
   * Create pagination context with strategies
   * @param strategies - Array of pagination strategies
   * @requirements 4.1 - Context accepts strategies in constructor
   */
  constructor(strategies: PaginationStrategy[]) {
    this.strategies = strategies
  }

  /**
   * Get strategies that apply to the given schema
   * @param schema - Print schema with pagination configuration
   * @returns Array of applicable strategies
   * @requirements 4.2 - Context provides getApplicableStrategies method
   */
  getApplicableStrategies(schema: PrintSchemaWithPagination): PaginationStrategy[] {
    return this.strategies.filter(strategy => strategy.shouldApply(schema))
  }

  /**
   * Render content using applicable strategies
   * Uses the first applicable strategy, falls back to non-paginated rendering if none apply
   * @param schema - Print schema with pagination configuration
   * @param data - Form data to render
   * @param options - Render options
   * @returns Rendered HTML string
   * @requirements 4.3, 4.4 - Context provides render method and executes strategies
   */
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    const applicableStrategies = this.getApplicableStrategies(schema)
    
    if (applicableStrategies.length === 0) {
      // No applicable strategy, fall back to non-paginated rendering
      // This will be implemented by importing the appropriate renderer
      throw new Error('No applicable pagination strategy found and fallback not implemented yet')
    }

    // Use the first applicable strategy
    const strategy = applicableStrategies[0]
    return strategy.render(schema, data, options)
  }

  /**
   * Add a strategy to the context
   * @param strategy - Strategy to add
   */
  addStrategy(strategy: PaginationStrategy): void {
    this.strategies.push(strategy)
  }

  /**
   * Remove a strategy from the context
   * @param strategyName - Name of strategy to remove
   * @returns Whether strategy was found and removed
   */
  removeStrategy(strategyName: string): boolean {
    const index = this.strategies.findIndex(s => s.name === strategyName)
    if (index >= 0) {
      this.strategies.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Get all registered strategies
   * @returns Array of all strategies
   */
  getAllStrategies(): readonly PaginationStrategy[] {
    return [...this.strategies]
  }

  /**
   * Get strategy by name
   * @param name - Strategy name
   * @returns Strategy if found, undefined otherwise
   */
  getStrategy(name: string): PaginationStrategy | undefined {
    return this.strategies.find(s => s.name === name)
  }
}

// ==================== Factory Functions ====================

/**
 * Create default pagination context with built-in strategies
 * This will be implemented after the strategy adapters are created
 * @returns PaginationContext with default strategies
 */
export function createDefaultPaginationContext(): PaginationContext {
  // This will be implemented in task 5.3 after strategies are created
  return new PaginationContext([])
}