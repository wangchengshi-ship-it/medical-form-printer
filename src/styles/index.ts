/**
 * @fileoverview 样式模块导出
 * @module styles
 */

export { defaultTheme, createScaledTheme, createThemeWithBaseUnit, defaultScaledConfig, defaultFonts, defaultColors, defaultMultipliers } from './default-theme'
export { generateCss, mergeTheme, type DeepPartial } from './css-generator'
export {
  DEFAULT_BASE_UNIT,
  UNIT_CONVERSIONS,
  SIZE_MULTIPLIERS,
  scaleValue,
  convertFromMm,
  convertToMm,
  formatSize,
  formatPadding,
  type Unit,
} from './base-unit'
export {
  createInlineStyles,
  styleToString,
  mergeStyles,
  getPageStyles,
  defaultInlineStyles,
  type StyleObject,
  type InlineStyleMap,
} from './inline-styles'
export { PAGE_SIZES, type PageSizeKey } from './page-sizes'
