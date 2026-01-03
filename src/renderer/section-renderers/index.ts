/**
 * @fileoverview Section renderer registry
 * @module renderer/section-renderers
 * @modified 2024-04-06
 */

import type { SectionType, SectionConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInfoGrid } from './info-grid'
import { renderTable } from './table'
import { renderCheckboxGrid } from './checkbox-grid'
import { renderSignatureArea } from './signature-area'
import { renderNotes } from './notes'
import { renderFreeText } from './free-text'
import { renderSectionTitle } from './section-title'
import { renderMedicalCheckboxRow } from './medical-checkbox-row'
import { renderInlineRow } from './inline-row'
import { renderContainer } from './container'

/** Section renderer function type */
export type SectionRenderer = (
  config: SectionConfig,
  data: FormData,
  options?: RenderOptions
) => string

/** Section renderer registry */
const renderers: Record<SectionType, SectionRenderer> = {
  'info-grid': renderInfoGrid as SectionRenderer,
  'table': renderTable as SectionRenderer,
  'checkbox-grid': renderCheckboxGrid as SectionRenderer,
  'signature-area': renderSignatureArea as SectionRenderer,
  'notes': renderNotes as SectionRenderer,
  'free-text': renderFreeText as SectionRenderer,
  'section-title': renderSectionTitle as SectionRenderer,
  'medical-checkbox-row': renderMedicalCheckboxRow as SectionRenderer,
  'inline-row': renderInlineRow as SectionRenderer,
  'container': renderContainer as SectionRenderer,
}

/** Custom renderer storage */
const customRenderers: Record<string, SectionRenderer> = {}

/**
 * Register custom section renderer
 */
export function registerSectionRenderer(
  type: string,
  renderer: SectionRenderer
): void {
  customRenderers[type] = renderer
}

/**
 * Get section renderer
 */
export function getSectionRenderer(type: string): SectionRenderer | undefined {
  return customRenderers[type] || renderers[type as SectionType]
}

/**
 * Render section
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
  renderSectionTitle,
  renderMedicalCheckboxRow,
  renderInlineRow,
  renderContainer,
}
