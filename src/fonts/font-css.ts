/**
 * @fileoverview 字体 CSS 生成器
 * @module fonts/font-css
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 生成 @font-face CSS 声明，使用内嵌的 Base64 字体数据。
 * 强制使用思源宋体 SC，禁止字体合成。
 *
 * @dependencies
 * - ./font-data - Base64 编码的字体数据
 */

import { FONT_DATA_URL } from './font-data'

/** 字体家族名称（不可修改） */
export const FONT_FAMILY = 'Source Han Serif SC'

/** 字体粗细 */
export const FONT_WEIGHT = 400

/** 字体样式 */
export const FONT_STYLE = 'normal'

/**
 * 获取字体 Data URL
 * @returns woff2 格式的 data URL
 */
export function getFontDataUrl(): string {
  return FONT_DATA_URL
}

/**
 * 生成 @font-face CSS 声明
 * @returns @font-face CSS 字符串
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
 * 生成字体强制覆盖 CSS
 * 确保所有文本元素使用指定字体，禁止字体合成
 * @returns 字体强制覆盖 CSS 字符串
 */
export function generateFontOverrideCss(): string {
  return `/* 字体强制覆盖 - 禁止外部修改 */
.mpr-root,
.mpr-root * {
  font-family: '${FONT_FAMILY}', serif !important;
  font-synthesis: none !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
}`
}

/**
 * 获取完整的字体 CSS（包含 @font-face 和强制覆盖规则）
 * @returns 完整的字体 CSS 字符串
 */
export function getFontCss(): string {
  return `${generateFontFace()}

${generateFontOverrideCss()}`
}
