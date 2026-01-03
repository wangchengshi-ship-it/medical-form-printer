/**
 * @fileoverview 页面尺寸常量（CSS 单位）
 * @module styles/page-sizes
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 定义页面尺寸的 CSS 字符串常量，用于 CSS 生成器。
 * 与 pagination/page-dimensions.ts 中的数值常量保持一致。
 *
 * @dependencies
 * - ../pagination/page-dimensions - 数值常量来源
 *
 * @usedBy
 * - ./css-generator.ts - CSS 样式生成
 */

/** 页面尺寸 CSS 常量 */
export const PAGE_SIZES = {
  /** A4 纸张: 210mm × 297mm */
  A4: {
    width: '210mm',
    height: '297mm',
  },
  /** A5 纸张: 148mm × 210mm */
  A5: {
    width: '148mm',
    height: '210mm',
  },
  /** 十六开纸张: 185mm × 260mm (与前端 Vue 组件一致) */
  '16K': {
    width: '185mm',
    height: '260mm',
  },
} as const

/** 页面尺寸类型 */
export type PageSizeKey = keyof typeof PAGE_SIZES
