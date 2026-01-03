/**
 * @fileoverview Section render strategy module
 * @module renderer/strategies
 * 
 * @description
 * Implements section rendering using Strategy pattern.
 * Each section type has an independent strategy class, unified dispatch through StrategyContext.
 */

import type { SectionConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'

/**
 * Section render strategy interface
 * All section renderers must implement this interface
 */
export interface SectionRenderStrategy {
  /** Section type supported by this strategy */
  readonly type: string
  
  /**
   * Render section
   * @param config - Section configuration
   * @param data - Form data
   * @param options - Render options
   * @returns HTML string
   */
  render(config: SectionConfig, data: FormData, options?: RenderOptions): string
}

/**
 * Strategy context
 * Manages all section render strategies, selects appropriate strategy based on section type
 */
export class StrategyContext {
  private strategies: Map<string, SectionRenderStrategy> = new Map()

  /**
   * Register render strategy
   * @param strategy - Render strategy instance
   */
  register(strategy: SectionRenderStrategy): void {
    this.strategies.set(strategy.type, strategy)
  }

  /**
   * Batch register render strategies
   * @param strategies - Array of render strategy instances
   */
  registerAll(strategies: SectionRenderStrategy[]): void {
    for (const strategy of strategies) {
      this.register(strategy)
    }
  }

  /**
   * Get render strategy
   * @param type - Section type
   * @returns Render strategy instance, undefined if not found
   */
  getStrategy(type: string): SectionRenderStrategy | undefined {
    return this.strategies.get(type)
  }

  /**
   * Check if type is supported
   * @param type - Section type
   * @returns Whether supported
   */
  hasStrategy(type: string): boolean {
    return this.strategies.has(type)
  }

  /**
   * Render section
   * @param type - Section type
   * @param config - Section configuration
   * @param data - Form data
   * @param options - Render options
   * @returns HTML string
   */
  render(
    type: string,
    config: SectionConfig,
    data: FormData,
    options?: RenderOptions
  ): string {
    const strategy = this.strategies.get(type)
    if (!strategy) {
      console.warn(`Unknown section type: ${type}`)
      return `<!-- Unknown section type: ${type} -->`
    }
    return strategy.render(config, data, options)
  }

  /**
   * Get all registered strategy types
   * @returns Array of strategy types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.strategies.keys())
  }
}

// Export strategy implementations
export { InfoGridStrategy } from './info-grid-strategy'
export { TableStrategy } from './table-strategy'
export { CheckboxGridStrategy } from './checkbox-grid-strategy'
export { SignatureAreaStrategy } from './signature-area-strategy'
export { NotesStrategy } from './notes-strategy'
export { FreeTextStrategy } from './free-text-strategy'
export { SectionTitleStrategy } from './section-title-strategy'
export { MedicalCheckboxRowStrategy } from './medical-checkbox-row-strategy'
export { InlineRowStrategy } from './inline-row-strategy'
export { ContainerStrategy } from './container-strategy'

// Export default strategy context
export { createDefaultStrategyContext } from './default-context'
