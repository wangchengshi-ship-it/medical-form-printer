/**
 * @fileoverview 区块渲染策略模块
 * @module renderer/strategies
 * 
 * @description
 * 使用 Strategy 模式实现区块渲染。
 * 每种区块类型对应一个独立的策略类，通过 StrategyContext 统一调度。
 */

import type { SectionConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'

/**
 * 区块渲染策略接口
 * 所有区块渲染器必须实现此接口
 */
export interface SectionRenderStrategy {
  /** 策略支持的区块类型 */
  readonly type: string
  
  /**
   * 渲染区块
   * @param config - 区块配置
   * @param data - 表单数据
   * @param options - 渲染选项
   * @returns HTML 字符串
   */
  render(config: SectionConfig, data: FormData, options?: RenderOptions): string
}

/**
 * 策略上下文
 * 管理所有区块渲染策略，根据区块类型选择合适的策略执行渲染
 */
export class StrategyContext {
  private strategies: Map<string, SectionRenderStrategy> = new Map()

  /**
   * 注册渲染策略
   * @param strategy - 渲染策略实例
   */
  register(strategy: SectionRenderStrategy): void {
    this.strategies.set(strategy.type, strategy)
  }

  /**
   * 批量注册渲染策略
   * @param strategies - 渲染策略实例数组
   */
  registerAll(strategies: SectionRenderStrategy[]): void {
    for (const strategy of strategies) {
      this.register(strategy)
    }
  }

  /**
   * 获取渲染策略
   * @param type - 区块类型
   * @returns 渲染策略实例，如果不存在则返回 undefined
   */
  getStrategy(type: string): SectionRenderStrategy | undefined {
    return this.strategies.get(type)
  }

  /**
   * 检查是否支持指定类型
   * @param type - 区块类型
   * @returns 是否支持
   */
  hasStrategy(type: string): boolean {
    return this.strategies.has(type)
  }

  /**
   * 渲染区块
   * @param type - 区块类型
   * @param config - 区块配置
   * @param data - 表单数据
   * @param options - 渲染选项
   * @returns HTML 字符串
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
   * 获取所有已注册的策略类型
   * @returns 策略类型数组
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.strategies.keys())
  }
}

// 导出策略实现
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

// 导出默认策略上下文
export { createDefaultStrategyContext } from './default-context'
