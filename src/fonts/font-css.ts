/**
 * @fileoverview Font CSS generator
 * @module fonts/font-css
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * Generates @font-face CSS declarations using embedded Base64 font data.
 * Enforces Source Han Serif SC font and disables font synthesis.
 *
 * @dependencies
 * - ./font-data - Base64 encoded font data
 */

import { FONT_DATA_URL } from './font-data'

/** Font family name (immutable) */
export const FONT_FAMILY = 'Source Han Serif SC'

/** Font weight */
export const FONT_WEIGHT = 400

/** Font style */
export const FONT_STYLE = 'normal'

/**
 * Get font Data URL
 * @returns woff2 format data URL
 */
export function getFontDataUrl(): string {
  return FONT_DATA_URL
}

/**
 * Generate @font-face CSS declaration
 * @returns @font-face CSS string
 */
export function generateFontFace(): string {
  return `@font-face {
  font-family: '${FONT_FAMILY}';
  src: url('${FONT_DATA_URL}') format('woff2');
  font-weight: ${FONT_WEIGHT};
  font-style: ${FONT_STYLE};
  font-display: block;
}`
}

/**
 * Generate font override CSS
 * Ensures all text elements use the specified font, disables font synthesis
 * @returns Font override CSS string
 */
export function generateFontOverrideCss(): string {
  return `/* Font override - prevent external modification */
.mpr-root,
.mpr-root * {
  font-family: '${FONT_FAMILY}', serif !important;
  font-synthesis: none !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}`
}

/**
 * Get complete font CSS (includes @font-face and override rules)
 * @returns Complete font CSS string
 */
export function getFontCss(): string {
  return `${generateFontFace()}

${generateFontOverrideCss()}`
}
