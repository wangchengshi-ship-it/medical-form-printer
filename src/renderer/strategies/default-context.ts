/**
 * @fileoverview 默认策略上下文
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
 * 创建默认策略上下文
 * 包含所有内置区块类型的渲染策略
 * @returns 配置好的策略上下文
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

/** 默认策略上下文单例 */
let defaultContext: StrategyContext | null = null

/**
 * 获取默认策略上下文（单例）
 * @returns 默认策略上下文
 */
export function getDefaultStrategyContext(): StrategyContext {
  if (!defaultContext) {
    defaultContext = createDefaultStrategyContext()
  }
  return defaultContext
}
