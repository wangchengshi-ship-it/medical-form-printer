/**
 * @fileoverview 基准单位系统
 * @module styles/base-unit
 *
 * @description
 * 定义打印渲染的基准单位常量和单位转换函数。
 * 所有尺寸值都是 BASE_UNIT 的倍数，通过修改 BASE_UNIT 可实现整体放大/缩小。
 *
 * 设计原则：
 * - 基准单位默认为 1mm
 * - 所有尺寸通过倍数系统定义，保持比例关系
 * - 支持 mm、pt、px 单位输出
 */

/** 支持的单位类型 */
export type Unit = 'mm' | 'pt' | 'px'

/** 默认基准单位值（毫米） */
export const DEFAULT_BASE_UNIT = 1

/**
 * 单位转换常量
 * - 1mm ≈ 2.835pt (72pt / 25.4mm)
 * - 1mm ≈ 3.78px (96px / 25.4mm at 96dpi)
 */
export const UNIT_CONVERSIONS = {
  /** 毫米到点的转换系数 */
  MM_TO_PT: 72 / 25.4, // ≈ 2.835
  /** 毫米到像素的转换系数（96dpi） */
  MM_TO_PX: 96 / 25.4, // ≈ 3.78
  /** 点到毫米的转换系数 */
  PT_TO_MM: 25.4 / 72,
  /** 像素到毫米的转换系数（96dpi） */
  PX_TO_MM: 25.4 / 96,
} as const

/**
 * 尺寸倍数配置
 * 定义各种尺寸相对于基准单位的倍数
 */
export const SIZE_MULTIPLIERS = {
  /** 字号倍数 */
  fontSize: {
    /** 正文字号 - 3.5mm ≈ 10pt */
    body: 3.5,
    /** 小字号 - 3mm ≈ 8.5pt */
    small: 3,
    /** 区块标题 - 4.2mm ≈ 12pt */
    sectionTitle: 4.2,
    /** 医院名称 - 5mm ≈ 14pt */
    hospitalName: 5,
    /** 表单标题 - 5.6mm ≈ 16pt */
    formTitle: 5.6,
  },
  /** 行高倍数（相对于字号） */
  lineHeight: 1.5,
  /** 间距倍数 */
  spacing: {
    /** 页面边距 - 20mm */
    pageMargin: 20,
    /** 区块间距 - 5mm */
    sectionGap: 5,
    /** 单元格水平内边距 - 3mm */
    cellPaddingX: 3,
    /** 单元格垂直内边距 - 2mm */
    cellPaddingY: 2,
  },
  /** 边框宽度倍数 - 0.35mm ≈ 1px */
  borderWidth: 0.35,
} as const

/**
 * 将毫米值转换为指定单位
 * @param mm - 毫米值
 * @param unit - 目标单位
 * @returns 转换后的数值
 */
export function convertFromMm(mm: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return mm
    case 'pt':
      return mm * UNIT_CONVERSIONS.MM_TO_PT
    case 'px':
      return mm * UNIT_CONVERSIONS.MM_TO_PX
  }
}

/**
 * 将指定单位的值转换为毫米
 * @param value - 数值
 * @param unit - 源单位
 * @returns 毫米值
 */
export function convertToMm(value: number, unit: Unit): number {
  switch (unit) {
    case 'mm':
      return value
    case 'pt':
      return value * UNIT_CONVERSIONS.PT_TO_MM
    case 'px':
      return value * UNIT_CONVERSIONS.PX_TO_MM
  }
}

/**
 * 计算缩放后的值
 * @param multiplier - 倍数
 * @param baseUnit - 基准单位值（毫米）
 * @returns 缩放后的毫米值
 */
export function scaleValue(multiplier: number, baseUnit: number = DEFAULT_BASE_UNIT): number {
  return multiplier * baseUnit
}

/**
 * 格式化尺寸值为 CSS 字符串
 * @param mm - 毫米值
 * @param unit - 输出单位
 * @param precision - 小数精度
 * @returns CSS 尺寸字符串（如 "10mm", "28.35pt"）
 */
export function formatSize(mm: number, unit: Unit = 'mm', precision: number = 2): string {
  const value = convertFromMm(mm, unit)
  // 对于整数值，不显示小数点
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(precision)
  return `${formatted}${unit}`
}

/**
 * 格式化内边距值为 CSS 字符串
 * @param vertical - 垂直内边距（毫米）
 * @param horizontal - 水平内边距（毫米）
 * @param unit - 输出单位
 * @returns CSS 内边距字符串（如 "2mm 3mm"）
 */
export function formatPadding(vertical: number, horizontal: number, unit: Unit = 'mm'): string {
  return `${formatSize(vertical, unit)} ${formatSize(horizontal, unit)}`
}
