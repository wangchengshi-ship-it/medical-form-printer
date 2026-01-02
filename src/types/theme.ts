/**
 * @fileoverview 主题类型定义
 * @module types/theme
 */

/** 字体配置 */
export interface FontConfig {
  /** 正文字体 */
  body: string
  /** 标题字体 */
  heading: string
  /** 等宽字体 */
  mono: string
}

/** 颜色配置 */
export interface ColorConfig {
  /** 主色 */
  primary: string
  /** 边框颜色 */
  border: string
  /** 背景色 */
  background: string
  /** 标签背景色 */
  labelBackground: string
  /** 文字颜色 */
  text: string
  /** 次要文字颜色 */
  textSecondary: string
}

/** 间距配置 */
export interface SpacingConfig {
  /** 页面边距 */
  pageMargin: string
  /** 区块间距 */
  sectionGap: string
  /** 单元格内边距 */
  cellPadding: string
}

/** 字号配置 */
export interface FontSizeConfig {
  /** 医院名称 */
  hospitalName: string
  /** 表单标题 */
  formTitle: string
  /** 区块标题 */
  sectionTitle: string
  /** 正文 */
  body: string
  /** 小字 */
  small: string
}

/** 主题配置 */
export interface Theme {
  /** 字体 */
  fonts: FontConfig
  /** 颜色 */
  colors: ColorConfig
  /** 间距 */
  spacing: SpacingConfig
  /** 字号 */
  fontSize: FontSizeConfig
  /** 边框宽度 */
  borderWidth: string
}

/**
 * 尺寸倍数配置（用于基准单位系统）
 * 所有数值都是相对于基准单位的倍数
 */
export interface SizeMultipliers {
  /** 字号倍数 */
  fontSize: {
    /** 正文字号倍数 */
    body: number
    /** 小字号倍数 */
    small: number
    /** 区块标题倍数 */
    sectionTitle: number
    /** 医院名称倍数 */
    hospitalName: number
    /** 表单标题倍数 */
    formTitle: number
  }
  /** 行高倍数（相对于字号） */
  lineHeight: number
  /** 间距倍数 */
  spacing: {
    /** 页面边距倍数 */
    pageMargin: number
    /** 区块间距倍数 */
    sectionGap: number
    /** 单元格水平内边距倍数 */
    cellPaddingX: number
    /** 单元格垂直内边距倍数 */
    cellPaddingY: number
  }
  /** 边框宽度倍数 */
  borderWidth: number
}

/**
 * 缩放主题配置
 * 包含基准单位和倍数配置，用于生成最终的 Theme
 */
export interface ScaledThemeConfig {
  /** 基准单位值（毫米） */
  baseUnit: number
  /** 尺寸倍数配置 */
  multipliers: SizeMultipliers
  /** 字体配置 */
  fonts: FontConfig
  /** 颜色配置 */
  colors: ColorConfig
}
