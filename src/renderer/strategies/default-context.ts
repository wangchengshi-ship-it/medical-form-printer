/**
 * @fileoverview Default Strategy Context
 * @module renderer/strategies/default-context
 */

import { StrategyContext } from './index'
import { InfoGridStrategy } from './info-grid-strategy'
import { TableStrategy } from './table-strategy'
import { CheckboxGridStrategy } from './checkbox-grid-strategy'
import { SignatureAreaStrategy } from './signature-area-strategy'
import { NotesStrategy } from './notes-strategy'
import { FreeTextStrategy } from './free-text-strategy'
import { SectionTitleStrategy } from './section-title-strategy'
import { MedicalCheckboxRowStrategy } from './medical-checkbox-row-strategy'
import { InlineRowStrategy } from './inline-row-strategy'
import { ContainerStrategy } from './container-strategy'

/**
 * Create default strategy context
 * Contains render strategies for all built-in section types
 * @returns Configured strategy context
 */
export function createDefaultStrategyContext(): StrategyContext {
  const context = new StrategyContext()
  
  context.registerAll([
    new InfoGridStrategy(),
    new TableStrategy(),
    new CheckboxGridStrategy(),
    new SignatureAreaStrategy(),
    new NotesStrategy(),
    new FreeTextStrategy(),
    new SectionTitleStrategy(),
    new MedicalCheckboxRowStrategy(),
    new InlineRowStrategy(),
    new ContainerStrategy(),
  ])
  
  return context
}

/** Default strategy context singleton */
let defaultContext: StrategyContext | null = null

/**
 * Get default strategy context (singleton)
 * @returns Default strategy context
 */
export function getDefaultStrategyContext(): StrategyContext {
  if (!defaultContext) {
    defaultContext = createDefaultStrategyContext()
  }
  return defaultContext
}
