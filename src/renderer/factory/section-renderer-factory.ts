/**
 * @fileoverview 区块渲染器工厂
 * @module renderer/factory/section-renderer-factory
 * 
 * @description
 * 使用 Factory 模式创建区块渲染器实例。
 * 支持注册自定义渲染器，实现渲染器的解耦和扩展。
 */

import type { SectionConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import type { SectionRenderStrategy } from '../strategies'
import {
  InfoGridStrategy,
  TableStrategy,
  CheckboxGridStrategy,
  SignatureAreaStrategy,
  NotesStrategy,
  FreeTextStrategy,
  SectionTitleStrategy,
  MedicalCheckboxRowStrategy,
  InlineRowStrategy,
  ContainerStrategy,
} from '../strategies'

/** 渲染器创建函数类型 */
export type RendererCreator = () => SectionRenderStrategy

/**
 * 区块渲染器工厂
 * 负责创建和管理区块渲染器实例
 */
export class SectionRendererFactory {
  private creators: Map<string, RendererCreator> = new Map()
  private instances: Map<string, SectionRenderStrategy> = new Map()
  private useCache: boolean

  /**
   * 创建工厂实例
   * @param useCache - 是否缓存渲染器实例（默认 true）
   */
  constructor(useCache: boolean = true) {
    this.useCache = useCache
    this.registerBuiltInRenderers()
  }

  /**
   * 注册内置渲染器
   */
  private registerBuiltInRenderers(): void {
    this.register('info-grid', () => new InfoGridStrategy())
    this.register('table', () => new TableStrategy())
    this.register('checkbox-grid', () => new CheckboxGridStrategy())
    this.register('signature-area', () => new SignatureAreaStrategy())
    this.register('notes', () => new NotesStrategy())
    this.register('free-text', () => new FreeTextStrategy())
    this.register('section-title', () => new SectionTitleStrategy())
    this.register('medical-checkbox-row', () => new MedicalCheckboxRowStrategy())
    this.register('inline-row', () => new InlineRowStrategy())
    this.register('container', () => new ContainerStrategy())
  }

  /**
   * 注册渲染器创建函数
   * @param type - 区块类型
   * @param creator - 创建函数
   */
  register(type: string, creator: RendererCreator): void {
    this.creators.set(type, creator)
    // 清除缓存的实例
    this.instances.delete(type)
  }

  /**
   * 注册自定义渲染器实例
   * @param renderer - 渲染器实例
   */
  registerInstance(renderer: SectionRenderStrategy): void {
    this.register(renderer.type, () => renderer)
    if (this.useCache) {
      this.instances.set(renderer.type, renderer)
    }
  }

  /**
   * 创建渲染器实例
   * @param type - 区块类型
   * @returns 渲染器实例，如果类型不存在则返回 undefined
   */
  create(type: string): SectionRenderStrategy | undefined {
    // 检查缓存
    if (this.useCache && this.instances.has(type)) {
      return this.instances.get(type)
    }

    const creator = this.creators.get(type)
    if (!creator) {
      return undefined
    }

    const instance = creator()
    
    // 缓存实例
    if (this.useCache) {
      this.instances.set(type, instance)
    }

    return instance
  }

  /**
   * 检查是否支持指定类型
   * @param type - 区块类型
   * @returns 是否支持
   */
  hasRenderer(type: string): boolean {
    return this.creators.has(type)
  }

  /**
   * 获取所有已注册的类型
   * @returns 类型数组
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.creators.keys())
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
    const renderer = this.create(type)
    if (!renderer) {
      console.warn(`Unknown section type: ${type}`)
      return `<!-- Unknown section type: ${type} -->`
    }
    return renderer.render(config, data, options)
  }

  /**
   * 清除缓存的实例
   */
  clearCache(): void {
    this.instances.clear()
  }
}

/** 默认工厂实例 */
let defaultFactory: SectionRendererFactory | null = null

/**
 * 获取默认工厂实例（单例）
 * @returns 默认工厂实例
 */
export function getDefaultSectionRendererFactory(): SectionRendererFactory {
  if (!defaultFactory) {
    defaultFactory = new SectionRendererFactory()
  }
  return defaultFactory
}
