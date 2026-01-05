/**
 * @fileoverview Section renderer registry
 * @module renderer/section-renderers
 * @version 1.1.0
 * @author Kiro
 * @created 2024-04-06
 * @modified 2026-01-05
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

/**
 * Section renderer function type
 * 
 * A function that takes section configuration, form data, and optional render options,
 * and returns an HTML string representing the rendered section.
 * 
 * @param config - The section configuration object
 * @param data - The form data containing field values
 * @param options - Optional render options (theme, locale, formatters, etc.)
 * @returns HTML string for the rendered section
 */
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
 * Register a custom section renderer for a new section type
 * 
 * @param type - The section type identifier (e.g., 'custom-chart', 'vital-signs')
 * @param renderer - The renderer function that generates HTML for this section type
 * @returns void
 * 
 * @example
 * ```typescript
 * registerSectionRenderer('vital-signs-chart', (config, data, options) => {
 *   const values = data[config.dataField] || []
 *   return `<div class="vital-signs-chart">...</div>`
 * })
 * ```
 */
export function registerSectionRenderer(
  type: string,
  renderer: SectionRenderer
): void {
  customRenderers[type] = renderer
}

/**
 * Get a registered section renderer by type
 * 
 * @param type - The section type identifier
 * @returns The renderer function if found, undefined otherwise
 * 
 * @example
 * ```typescript
 * const renderer = getSectionRenderer('info-grid')
 * if (renderer) {
 *   const html = renderer(config, data, options)
 * }
 * ```
 */
export function getSectionRenderer(type: string): SectionRenderer | undefined {
  return customRenderers[type] || renderers[type as SectionType]
}

/**
 * Render a section to HTML string
 * 
 * @param type - The section type identifier
 * @param config - The section configuration
 * @param data - The form data
 * @param options - Optional render options
 * @returns HTML string for the section
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

export type { PartialTableOptions } from './table'
