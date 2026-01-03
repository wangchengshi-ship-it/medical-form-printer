/**
 * @fileoverview Content measurer type definitions
 * @module pagination/measurer-types
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Defines all types for the content measurer, including:
 * - Measurement configuration (MeasureConfig)
 * - Measurement result (MeasureResult)
 * - Element measurement options (MeasureElementOptions)
 *
 * The content measurer is used to measure actual rendered element heights
 * in browser environment for precise pagination calculation.
 *
 * @requirements
 * - 10.1: Create hidden container matching print styles for measurement
 *
 * @usedBy
 * - ./content-measurer.ts - Content measurer implementation
 * - ./index.ts - Module entry
 */

import type { MeasurableItemType } from './types'

// ==================== Measurement Configuration ====================

/**
 * Measurement configuration
 * Used to configure measurement container styles to match print styles
 * @requirements 10.1 - Create hidden container matching print styles
 */
export interface MeasureConfig {
  /** Container width (px), should match print width */
  containerWidth: number
  /** Font size, default '10pt' */
  fontSize?: string
  /** Line height, default 1.8 */
  lineHeight?: number
  /** Font family, default Song Ti */
  fontFamily?: string
}

/**
 * Complete measurement configuration (all fields required)
 */
export interface RequiredMeasureConfig {
  /** Container width (px) */
  containerWidth: number
  /** Font size */
  fontSize: string
  /** Line height */
  lineHeight: number
  /** Font family */
  fontFamily: string
}

// ==================== Measurement Result ====================

/**
 * Single element measurement result
 * @requirements 10.2 - Measure actual rendered height
 */
export interface MeasureResult {
  /** Element unique identifier */
  id: string
  /** Measured height (px) */
  height: number
}

// ==================== Element Measurement Options ====================

/**
 * Element measurement options
 * Used to specify metadata for measured elements
 * @requirements 10.5 - Support batch measuring multiple elements
 */
export interface MeasureElementOptions {
  /** Element unique identifier */
  id: string
  /** Content type */
  type: MeasurableItemType
  /** Parent table ID (only for table-header and table-row) */
  tableId?: string
  /** Original data index */
  dataIndex?: number
}

// ==================== Table Measurement Options ====================

/**
 * Table measurement options
 * @requirements 10.3 - Support measuring variable height table rows
 */
export interface MeasureTableOptions {
  /** Table unique identifier */
  tableId: string
  /** Whether to include header measurement, default true */
  includeHeader?: boolean
  /** Whether to include body row measurement, default true */
  includeRows?: boolean
}

// ==================== Text Estimation Options ====================

/**
 * Text height estimation options
 * Fallback for non-DOM environments
 * @requirements 10.4 - Handle text wrapping estimation
 */
export interface TextEstimateOptions {
  /** Container width (px) */
  containerWidth: number
  /** Font size (px), default 13.33 (10pt ≈ 13.33px) */
  fontSize?: number
  /** Line height, default 1.8 */
  lineHeight?: number
  /** Whether text is Chinese, default true (affects character width estimation) */
  isChinese?: boolean
}

// ==================== Measurement Container Options ====================

/**
 * Measurement container creation options
 * @requirements 10.1 - Create hidden container
 */
export interface MeasureContainerOptions {
  /** Container CSS class name, default 'print-measure-container' */
  className?: string
  /** Whether to append to document.body, default true */
  appendToBody?: boolean
  /** Custom styles */
  customStyles?: Partial<CSSStyleDeclaration>
}

// ==================== Batch Measurement Options ====================

/**
 * Batch measurement options
 * @requirements 10.5 - Support batch measuring multiple elements
 */
export interface MeasureAllOptions {
  /** Whether to measure header, default true */
  measureHeader?: boolean
  /** Whether to measure footer, default true */
  measureFooter?: boolean
  /** Whether to measure signature area, default true */
  measureSignature?: boolean
  /** Whether to measure tables, default true */
  measureTables?: boolean
  /** Whether to measure sections, default true */
  measureSections?: boolean
}

// ==================== Default Configuration Constants ====================

/**
 * Default measurement configuration
 */
export const DEFAULT_MEASURE_CONFIG: RequiredMeasureConfig = {
  containerWidth: 624, // Approximately 165mm @ 96dpi (16K paper usable width)
  fontSize: '10pt',
  lineHeight: 1.8,
  fontFamily: "'Source Han Serif SC', 'SimSun', 'Song Ti', serif",
}

/**
 * Default CSS class name for measurement container
 */
export const MEASURE_CONTAINER_CLASS = 'print-measure-container'

/**
 * Default text estimation configuration
 */
export const DEFAULT_TEXT_ESTIMATE_OPTIONS: Required<TextEstimateOptions> = {
  containerWidth: 624,
  fontSize: 13.33, // 10pt ≈ 13.33px
  lineHeight: 1.8,
  isChinese: true,
}

// ==================== CSS Selector Constants ====================

/**
 * CSS selectors used by content measurer
 * Used to find various measurable elements in DOM
 */
export const MEASURE_SELECTORS = {
  /** Header selector */
  HEADER: ':scope > .print-header',
  /** Page body selector */
  BODY: ':scope > .print-body',
  /** Section title selector */
  SECTION_TITLE: ':scope > .section-title-block',
  /** Info grid wrapper selector */
  INFO_GRID_WRAPPER: ':scope > .info-grid-wrapper[data-section-id]',
  /** Data table wrapper selector */
  TABLE_WRAPPER: ':scope > .data-table-wrapper[data-section-id]',
  /** Checkbox grid wrapper selector */
  CHECKBOX_GRID_WRAPPER: ':scope > .checkbox-grid-wrapper[data-section-id]',
  /** Medical checkbox row wrapper selector */
  MEDICAL_CHECKBOX_ROW_WRAPPER: ':scope > .medical-checkbox-row-wrapper[data-section-id]',
  /** Notes selector */
  NOTES: ':scope > .notes-text',
  /** Signature area selector */
  SIGNATURE: ':scope > .signature-area',
  /** Table header selector */
  TABLE_HEADER: 'thead',
  /** Table rows selector */
  TABLE_ROWS: 'tbody tr',
} as const

// ==================== Type Guards ====================

/**
 * Check if valid measurement configuration
 * @param config - Configuration to check
 * @returns Whether configuration is valid
 */
export function isValidMeasureConfig(config: unknown): config is MeasureConfig {
  if (typeof config !== 'object' || config === null) {
    return false
  }
  const c = config as Record<string, unknown>
  return (
    typeof c.containerWidth === 'number' &&
    c.containerWidth > 0 &&
    (c.fontSize === undefined || typeof c.fontSize === 'string') &&
    (c.lineHeight === undefined || typeof c.lineHeight === 'number') &&
    (c.fontFamily === undefined || typeof c.fontFamily === 'string')
  )
}

/**
 * Check if valid measurement result
 * @param result - Result to check
 * @returns Whether result is valid
 */
export function isValidMeasureResult(result: unknown): result is MeasureResult {
  if (typeof result !== 'object' || result === null) {
    return false
  }
  const r = result as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    typeof r.height === 'number' &&
    r.height >= 0
  )
}
