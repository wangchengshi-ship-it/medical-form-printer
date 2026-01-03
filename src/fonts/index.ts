/**
 * @fileoverview 字体模块入口
 * @module fonts
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 导出字体相关的所有 API，包括：
 * - 字体 Data URL 获取
 * - 字体 CSS 生成
 * - 字体加载状态检查和等待
 *
 * @usedBy
 * - ../styles/css-generator.ts - CSS 生成器
 * - ../renderer/html-renderer.ts - HTML 渲染器
 */

// 字体 CSS 相关
export {
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_STYLE,
  getFontDataUrl,
  getFontCss,
  generateFontFace,
  generateFontOverrideCss,
} from './font-css'

// 字体加载相关
export {
  isFontLoaded,
  waitForFonts,
  FontLoadError,
  type FontLoadOptions,
} from './font-loader'

// 字体数据（仅导出 URL，不导出原始 Base64 数据以减少 bundle 大小）
export { FONT_DATA_URL } from './font-data'
