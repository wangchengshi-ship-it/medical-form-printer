/**
 * @fileoverview 页面尺寸配置和单位转换
 * @module pagination/page-dimensions
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 提供页面尺寸预设配置和单位转换函数：
 * - 十六开 (16K): 185mm × 260mm - 医疗表单常用规格
 * - A4: 210mm × 297mm
 * - A5: 148mm × 210mm
 * - mm 到 px 的单位转换
 * - 可用高度/宽度计算
 *
 * @requirements
 * - 3.1: 支持 A4、A5、16K 页面尺寸
 * - 3.6: 使用 16K 作为默认页面尺寸
 * - 9.5: 支持可配置的页面尺寸
 *
 * @dependencies
 * - ./types.ts - 类型定义和常量
 *
 * @usedBy
 * - ./index.ts - 模块入口
 * - ./page-break-calculator.ts - 分页算法
 * - ../renderer/paginated-renderer.ts - 分页渲染器（待实现）
 */

import type { PageDimensions, PageSizePreset } from './types'
import { PAGINATION_DEFAULTS } from './types'

// ==================== 页面尺寸预设 ====================

/**
 * 十六开纸张配置
 * 尺寸: 185mm × 260mm
 * 医疗表单常用规格
 * @requirements 3.6 - 使用 16K 作为默认页面尺寸
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
 * A4 纸张配置
 * 尺寸: 210mm × 297mm
 * @requirements 3.1 - 支持 A4 页面尺寸
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
 * A5 纸张配置
 * 尺寸: 148mm × 210mm
 * @requirements 3.1 - 支持 A5 页面尺寸
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
 * 页面尺寸预设映射
 */
export const PAGE_PRESETS: Record<PageSizePreset, PageDimensions> = {
  '16K': PAGE_16K,
  A4: PAGE_A4,
  A5: PAGE_A5,
}

// ==================== 单位转换函数 ====================

/**
 * 将毫米转换为像素
 * @param mm - 毫米值
 * @param dpi - DPI，默认 96
 * @returns 像素值
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
 * 将像素转换为毫米
 * @param px - 像素值
 * @param dpi - DPI，默认 96
 * @returns 毫米值
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
 * 将毫米转换为点 (pt)
 * 1pt = 1/72 inch
 * @param mm - 毫米值
 * @returns 点值
 */
export function mmToPt(mm: number): number {
  return (mm / PAGINATION_DEFAULTS.MM_PER_INCH) * 72
}

/**
 * 将点 (pt) 转换为毫米
 * @param pt - 点值
 * @returns 毫米值
 */
export function ptToMm(pt: number): number {
  return (pt / 72) * PAGINATION_DEFAULTS.MM_PER_INCH
}

// ==================== 页面尺寸计算函数 ====================

/**
 * 计算页面可用内容高度（像素）
 * @requirements 9.5 - 支持可配置的页面尺寸
 *
 * @param dimensions - 页面尺寸配置
 * @param dpi - DPI，默认 96
 * @returns 可用内容高度（像素）
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
 * 计算页面可用内容宽度（像素）
 * @requirements 9.5 - 支持可配置的页面尺寸
 *
 * @param dimensions - 页面尺寸配置
 * @param dpi - DPI，默认 96
 * @returns 可用内容宽度（像素）
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
 * 计算页面可用内容高度（毫米）
 * @param dimensions - 页面尺寸配置
 * @returns 可用内容高度（毫米）
 */
export function calculateUsableHeightMm(
  dimensions: PageDimensions = PAGE_16K
): number {
  return dimensions.height - dimensions.marginTop - dimensions.marginBottom
}

/**
 * 计算页面可用内容宽度（毫米）
 * @param dimensions - 页面尺寸配置
 * @returns 可用内容宽度（毫米）
 */
export function calculateUsableWidthMm(
  dimensions: PageDimensions = PAGE_16K
): number {
  return dimensions.width - dimensions.marginLeft - dimensions.marginRight
}

/**
 * 根据页面尺寸名称获取预设配置
 * @param pageSize - 页面尺寸名称 ('16K' | 'A4' | 'A5')
 * @returns 页面尺寸配置
 */
export function getPageDimensions(
  pageSize: PageSizePreset = '16K'
): PageDimensions {
  return PAGE_PRESETS[pageSize] ?? PAGE_16K
}

/**
 * 创建自定义页面尺寸配置
 * @param width - 页面宽度 (mm)
 * @param height - 页面高度 (mm)
 * @param margins - 边距配置
 * @returns 页面尺寸配置
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
