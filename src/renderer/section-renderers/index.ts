/**
 * @fileoverview 区块渲染器注册表
 * @module renderer/section-renderers
 */

import type { SectionType, SectionConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInfoGrid } from './info-grid'
import { renderTable } from './table'
import { renderCheckboxGrid } from './checkbox-grid'
import { renderSignatureArea } from './signature-area'
import { renderNotes } from './notes'
import { renderFreeText } from './free-text'

/** 区块渲染函数类型 */
export type SectionRenderer = (
  config: SectionConfig,
  data: FormData,
  options?: RenderOptions
) => string

/** 区块渲染器注册表 */
const renderers: Record<SectionType, SectionRenderer> = {
  'info-grid': renderInfoGrid as SectionRenderer,
  'table': renderTable as SectionRenderer,
  'checkbox-grid': renderCheckboxGrid as SectionRenderer,
  'signature-area': renderSignatureArea as SectionRenderer,
  'notes': renderNotes as SectionRenderer,
  'free-text': renderFreeText as SectionRenderer,
}

/** 自定义渲染器存储 */
const customRenderers: Record<string, SectionRenderer> = {}

/**
 * 注册自定义区块渲染器
 */
export function registerSectionRenderer(
  type: string,
  renderer: SectionRenderer
): void {
  customRenderers[type] = renderer
}

/**
 * 获取区块渲染器
 */
export function getSectionRenderer(type: string): SectionRenderer | undefined {
  return customRenderers[type] || renderers[type as SectionType]
}

/**
 * 渲染区块
 */
export function renderSection(
  type: string,
  config: SectionConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const renderer = getSectionRenderer(type)
  if (!renderer) {
    console.warn(`Unknown section type: ${type}`)
    return `<!-- Unknown section type: ${type} -->`
  }
  return renderer(config, data, options)
}

export {
  renderInfoGrid,
  renderTable,
  renderCheckboxGrid,
  renderSignatureArea,
  renderNotes,
  renderFreeText,
}
