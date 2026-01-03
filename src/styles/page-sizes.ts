/**
 * @fileoverview Page size constants (CSS units)
 * @module styles/page-sizes
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Defines page size CSS string constants for CSS generator.
 * Consistent with numeric constants in pagination/page-dimensions.ts.
 *
 * @dependencies
 * - ../pagination/page-dimensions - Source of numeric constants
 *
 * @usedBy
 * - ./css-generator.ts - CSS style generation
 */

/** Page size CSS constants */
export const PAGE_SIZES = {
  /** A4 paper: 210mm × 297mm */
  A4: {
    width: '210mm',
    height: '297mm',
  },
  /** A5 paper: 148mm × 210mm */
  A5: {
    width: '148mm',
    height: '210mm',
  },
  /** 16K paper: 185mm × 260mm (consistent with frontend Vue components) */
  '16K': {
    width: '185mm',
    height: '260mm',
  },
} as const

/** Page size type */
export type PageSizeKey = keyof typeof PAGE_SIZES
