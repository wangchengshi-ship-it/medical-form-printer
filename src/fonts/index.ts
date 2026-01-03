/**
 * @fileoverview Font module entry point
 * @module fonts
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Exports all font-related APIs, including:
 * - Font Data URL retrieval
 * - Font CSS generation
 * - Font loading state checking and waiting
 *
 * @usedBy
 * - ../styles/css-generator.ts - CSS generator
 * - ../renderer/html-renderer.ts - HTML renderer
 */

// Font CSS related
export {
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_STYLE,
  getFontDataUrl,
  getFontCss,
  generateFontFace,
  generateFontOverrideCss,
} from './font-css'

// Font loading related
export {
  isFontLoaded,
  waitForFonts,
  FontLoadError,
  type FontLoadOptions,
} from './font-loader'

// Font data (only export URL, not raw Base64 data to reduce bundle size)
export { FONT_DATA_URL } from './font-data'
