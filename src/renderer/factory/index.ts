/**
 * @fileoverview Renderer factory module
 * @module renderer/factory
 * 
 * @description
 * Uses Factory pattern to create renderer and formatter instances.
 * Supports registering custom renderers and formatters.
 */

export { SectionRendererFactory, getDefaultSectionRendererFactory } from './section-renderer-factory'
export type { RendererCreator } from './section-renderer-factory'
export { FormatterFactory, getDefaultFormatterFactory } from './formatter-factory'
export type { Formatter, FormatterConfig } from './formatter-factory'
