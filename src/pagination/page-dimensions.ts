/**
 * @fileoverview Page dimension configuration and unit conversion
 * @module pagination/page-dimensions
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Provides page size presets and unit conversion functions:
 * - 16K (Sixteen-mo): 185mm × 260mm - Common format for medical forms
 * - A4: 210mm × 297mm
 * - A5: 148mm × 210mm
 * - mm to px unit conversion
 * - Usable height/width calculation
 *
 * @requirements
 * - 3.1: Support A4, A5, 16K page sizes
 * - 3.6: Use 16K as default page size
 * - 9.5: Support configurable page sizes
 *
 * @dependencies
 * - ./types.ts - Type definitions and constants
 *
 * @usedBy
 * - ./index.ts - Module entry
 * - ./page-break-calculator.ts - Pagination algorithm
 * - ../renderer/paginated-renderer.ts - Paginated renderer
 */

import type { PageDimensions, PageSizePreset } from './types'
import { PAGINATION_DEFAULTS } from './types'

// ==================== Page Size Presets ====================

/**
 * 16K (Sixteen-mo) paper configuration
 * Size: 185mm × 260mm
 * Common format for medical forms
 * @requirements 3.6 - Use 16K as default page size
 */
export const PAGE_16K: PageDimensions = {
  width: 185,
  height: 260,
  marginTop: PAGINATION_DEFAULTS.MARGIN.TOP,
  marginBottom: PAGINATION_DEFAULTS.MARGIN.BOTTOM,
  marginLeft: PAGINATION_DEFAULTS.MARGIN.LEFT,
  marginRight: PAGINATION_DEFAULTS.MARGIN.RIGHT,
}

/**
 * A4 paper configuration
 * Size: 210mm × 297mm
 * @requirements 3.1 - Support A4 page size
 */
export const PAGE_A4: PageDimensions = {
  width: 210,
  height: 297,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 15,
  marginRight: 15,
}

/**
 * A5 paper configuration
 * Size: 148mm × 210mm
 * @requirements 3.1 - Support A5 page size
 */
export const PAGE_A5: PageDimensions = {
  width: 148,
  height: 210,
  marginTop: PAGINATION_DEFAULTS.MARGIN.TOP,
  marginBottom: PAGINATION_DEFAULTS.MARGIN.BOTTOM,
  marginLeft: PAGINATION_DEFAULTS.MARGIN.LEFT,
  marginRight: PAGINATION_DEFAULTS.MARGIN.RIGHT,
}

/**
 * Page size preset mapping
 */
export const PAGE_PRESETS: Record<PageSizePreset, PageDimensions> = {
  '16K': PAGE_16K,
  A4: PAGE_A4,
  A5: PAGE_A5,
}

// ==================== Unit Conversion Functions ====================

/**
 * Convert millimeters to pixels
 * @param mm - Millimeter value
 * @param dpi - DPI, default 96
 * @returns Pixel value
 *
 * @example
 * mmToPx(185) // => 699.21...
 * mmToPx(260) // => 982.68...
 */
export function mmToPx(
  mm: number,
  dpi: number = PAGINATION_DEFAULTS.DPI
): number {
  return (mm / PAGINATION_DEFAULTS.MM_PER_INCH) * dpi
}

/**
 * Convert pixels to millimeters
 * @param px - Pixel value
 * @param dpi - DPI, default 96
 * @returns Millimeter value
 *
 * @example
 * pxToMm(699.21) // => 185
 */
export function pxToMm(
  px: number,
  dpi: number = PAGINATION_DEFAULTS.DPI
): number {
  return (px / dpi) * PAGINATION_DEFAULTS.MM_PER_INCH
}

/**
 * Convert millimeters to points (pt)
 * 1pt = 1/72 inch
 * @param mm - Millimeter value
 * @returns Point value
 */
export function mmToPt(mm: number): number {
  return (mm / PAGINATION_DEFAULTS.MM_PER_INCH) * 72
}

/**
 * Convert points (pt) to millimeters
 * @param pt - Point value
 * @returns Millimeter value
 */
export function ptToMm(pt: number): number {
  return (pt / 72) * PAGINATION_DEFAULTS.MM_PER_INCH
}

// ==================== Page Size Calculation Functions ====================

/**
 * Calculate usable content height (pixels)
 * @requirements 9.5 - Support configurable page sizes
 *
 * @param dimensions - Page size configuration
 * @param dpi - DPI, default 96
 * @returns Usable content height (pixels)
 */
export function calculateUsableHeight(
  dimensions: PageDimensions = PAGE_16K,
  dpi: number = PAGINATION_DEFAULTS.DPI
): number {
  const usableHeightMm =
    dimensions.height - dimensions.marginTop - dimensions.marginBottom
  return mmToPx(usableHeightMm, dpi)
}

/**
 * Calculate usable content width (pixels)
 * @requirements 9.5 - Support configurable page sizes
 *
 * @param dimensions - Page size configuration
 * @param dpi - DPI, default 96
 * @returns Usable content width (pixels)
 */
export function calculateUsableWidth(
  dimensions: PageDimensions = PAGE_16K,
  dpi: number = PAGINATION_DEFAULTS.DPI
): number {
  const usableWidthMm =
    dimensions.width - dimensions.marginLeft - dimensions.marginRight
  return mmToPx(usableWidthMm, dpi)
}

/**
 * Calculate usable content height (millimeters)
 * @param dimensions - Page size configuration
 * @returns Usable content height (millimeters)
 */
export function calculateUsableHeightMm(
  dimensions: PageDimensions = PAGE_16K
): number {
  return dimensions.height - dimensions.marginTop - dimensions.marginBottom
}

/**
 * Calculate usable content width (millimeters)
 * @param dimensions - Page size configuration
 * @returns Usable content width (millimeters)
 */
export function calculateUsableWidthMm(
  dimensions: PageDimensions = PAGE_16K
): number {
  return dimensions.width - dimensions.marginLeft - dimensions.marginRight
}

/**
 * Get preset configuration by page size name
 * @param pageSize - Page size name ('16K' | 'A4' | 'A5')
 * @returns Page size configuration
 */
export function getPageDimensions(
  pageSize: PageSizePreset = '16K'
): PageDimensions {
  return PAGE_PRESETS[pageSize] ?? PAGE_16K
}

/**
 * Create custom page size configuration
 * @param width - Page width (mm)
 * @param height - Page height (mm)
 * @param margins - Margin configuration
 * @returns Page size configuration
 */
export function createPageDimensions(
  width: number,
  height: number,
  margins: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  } = {}
): PageDimensions {
  return {
    width,
    height,
    marginTop: margins.top ?? PAGINATION_DEFAULTS.MARGIN.TOP,
    marginBottom: margins.bottom ?? PAGINATION_DEFAULTS.MARGIN.BOTTOM,
    marginLeft: margins.left ?? PAGINATION_DEFAULTS.MARGIN.LEFT,
    marginRight: margins.right ?? PAGINATION_DEFAULTS.MARGIN.RIGHT,
  }
}
