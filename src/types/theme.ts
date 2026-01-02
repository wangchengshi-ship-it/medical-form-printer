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
