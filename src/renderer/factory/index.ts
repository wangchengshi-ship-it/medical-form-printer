/**
 * @fileoverview 渲染器工厂模块
 * @module renderer/factory
 * 
 * @description
 * 使用 Factory 模式创建渲染器和格式化器实例。
 * 支持注册自定义渲染器和格式化器。
 */

export { SectionRendererFactory, getDefaultSectionRendererFactory } from './section-renderer-factory'
export type { RendererCreator } from './section-renderer-factory'
export { FormatterFactory, getDefaultFormatterFactory } from './formatter-factory'
export type { Formatter, FormatterConfig } from './formatter-factory'
