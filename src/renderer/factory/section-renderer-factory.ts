/**
 * @fileoverview Section Renderer Factory
 * @module renderer/factory/section-renderer-factory
 * 
 * @description
 * Uses Factory pattern to create section renderer instances.
 * Supports registering custom renderers for decoupling and extensibility.
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

/** Renderer creator function type */
export type RendererCreator = () => SectionRenderStrategy

/**
 * Section Renderer Factory
 * Responsible for creating and managing section renderer instances
 */
export class SectionRendererFactory {
  private creators: Map<string, RendererCreator> = new Map()
  private instances: Map<string, SectionRenderStrategy> = new Map()
  private useCache: boolean

  /**
   * Create factory instance
   * @param useCache - Whether to cache renderer instances (default true)
   */
  constructor(useCache: boolean = true) {
    this.useCache = useCache
    this.registerBuiltInRenderers()
  }

  /**
   * Register built-in renderers
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
   * Register renderer creator function
   * @param type - Section type
   * @param creator - Creator function
   */
  register(type: string, creator: RendererCreator): void {
    this.creators.set(type, creator)
    // Clear cached instance
    this.instances.delete(type)
  }

  /**
   * Register custom renderer instance
   * @param renderer - Renderer instance
   */
  registerInstance(renderer: SectionRenderStrategy): void {
    this.register(renderer.type, () => renderer)
    if (this.useCache) {
      this.instances.set(renderer.type, renderer)
    }
  }

  /**
   * Create renderer instance
   * @param type - Section type
   * @returns Renderer instance, or undefined if type doesn't exist
   */
  create(type: string): SectionRenderStrategy | undefined {
    // Check cache
    if (this.useCache && this.instances.has(type)) {
      return this.instances.get(type)
    }

    const creator = this.creators.get(type)
    if (!creator) {
      return undefined
    }

    const instance = creator()
    
    // Cache instance
    if (this.useCache) {
      this.instances.set(type, instance)
    }

    return instance
  }

  /**
   * Check if specified type is supported
   * @param type - Section type
   * @returns Whether supported
   */
  hasRenderer(type: string): boolean {
    return this.creators.has(type)
  }

  /**
   * Get all registered types
   * @returns Type array
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.creators.keys())
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
    const renderer = this.create(type)
    if (!renderer) {
      console.warn(`Unknown section type: ${type}`)
      return `<!-- Unknown section type: ${type} -->`
    }
    return renderer.render(config, data, options)
  }

  /**
   * Clear cached instances
   */
  clearCache(): void {
    this.instances.clear()
  }
}

/** Default factory instance */
let defaultFactory: SectionRendererFactory | null = null

/**
 * Get default factory instance (singleton)
 * @returns Default factory instance
 */
export function getDefaultSectionRendererFactory(): SectionRendererFactory {
  if (!defaultFactory) {
    defaultFactory = new SectionRendererFactory()
  }
  return defaultFactory
}
