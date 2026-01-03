/**
 * @fileoverview 默认主题配置
 * @module styles/default-theme
 *
 * @description
 * 定义默认主题配置，使用基准单位系统实现可缩放的尺寸。
 * 所有尺寸值都是基准单位的倍数，通过修改基准单位可实现整体放大/缩小。
 */

import type { Theme, FontConfig, ColorConfig, SizeMultipliers, ScaledThemeConfig } from '../types/theme'
import {
  DEFAULT_BASE_UNIT,
  SIZE_MULTIPLIERS,
  scaleValue,
  formatSize,
  formatPadding,
} from './base-unit'

/** 默认字体配置 */
export const defaultFonts: FontConfig = {
  body: '"SimSun", "宋体", "Songti SC", serif',
  heading: '"SimHei", "黑体", "Heiti SC", sans-serif',
  mono: '"Courier New", monospace',
}

/** 默认颜色配置 */
export const defaultColors: ColorConfig = {
  primary: '#000000',
  border: '#000000',
  background: '#ffffff',
  labelBackground: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
}

/** 默认尺寸倍数配置 */
export const defaultMultipliers: SizeMultipliers = SIZE_MULTIPLIERS

/** 默认缩放主题配置 */
export const defaultScaledConfig: ScaledThemeConfig = {
  baseUnit: DEFAULT_BASE_UNIT,
  multipliers: defaultMultipliers,
  fonts: defaultFonts,
  colors: defaultColors,
}

/**
 * 根据基准单位和倍数配置生成完整主题
 * @param config - 缩放主题配置
 * @returns 完整的主题对象
 */
export function createScaledTheme(config: ScaledThemeConfig = defaultScaledConfig): Theme {
  const { baseUnit, multipliers, fonts, colors } = config
  const s = multipliers.spacing

  // 计算各尺寸的毫米值
  const fontSizeMm = {
    body: scaleValue(multipliers.fontSize.body, baseUnit),
    small: scaleValue(multipliers.fontSize.small, baseUnit),
    sectionTitle: scaleValue(multipliers.fontSize.sectionTitle, baseUnit),
    hospitalName: scaleValue(multipliers.fontSize.hospitalName, baseUnit),
    formTitle: scaleValue(multipliers.fontSize.formTitle, baseUnit),
  }

  const borderWidthMm = scaleValue(multipliers.borderWidth, baseUnit)

  // 生成主题对象，使用 pt 作为字号单位（更适合打印）
  return {
    fonts,
    colors,
    spacing: {
      pageMargin: formatSize(scaleValue(s.pageMargin, baseUnit), 'mm'),
      sectionGap: formatSize(scaleValue(s.sectionGap, baseUnit), 'mm'),
      cellPadding: formatPadding(
        scaleValue(s.cellPaddingY, baseUnit),
        scaleValue(s.cellPaddingX, baseUnit),
        'mm'
      ),
      headerMarginBottom: formatSize(scaleValue(s.headerMarginBottom, baseUnit), 'mm'),
      departmentMarginTop: formatSize(scaleValue(s.departmentMarginTop, baseUnit), 'mm'),
      titleMarginTop: formatSize(scaleValue(s.titleMarginTop, baseUnit), 'mm'),
      signatureGap: formatSize(scaleValue(s.signatureGap, baseUnit), 'mm'),
      signatureMarginTop: formatSize(scaleValue(s.signatureMarginTop, baseUnit), 'mm'),
      signatureLineWidth: formatSize(scaleValue(s.signatureLineWidth, baseUnit), 'mm'),
      freeTextMinHeight: formatSize(scaleValue(s.freeTextMinHeight, baseUnit), 'mm'),
      footerMarginTop: formatSize(scaleValue(s.footerMarginTop, baseUnit), 'mm'),
      xs: formatSize(scaleValue(s.xs, baseUnit), 'mm'),
      sm: formatSize(scaleValue(s.sm, baseUnit), 'mm'),
    },
    fontSize: {
      body: formatSize(fontSizeMm.body, 'pt'),
      small: formatSize(fontSizeMm.small, 'pt'),
      sectionTitle: formatSize(fontSizeMm.sectionTitle, 'pt'),
      hospitalName: formatSize(fontSizeMm.hospitalName, 'pt'),
      formTitle: formatSize(fontSizeMm.formTitle, 'pt'),
    },
    borderWidth: formatSize(borderWidthMm, 'px'),
  }
}

/**
 * 根据基准单位值快速创建缩放主题
 * @param baseUnit - 基准单位值（毫米），默认为 1
 * @returns 完整的主题对象
 */
export function createThemeWithBaseUnit(baseUnit: number = DEFAULT_BASE_UNIT): Theme {
  return createScaledTheme({
    ...defaultScaledConfig,
    baseUnit,
  })
}

/** 默认主题 - 标准医疗表单样式（基准单位 = 1mm） */
export const defaultTheme: Theme = createScaledTheme(defaultScaledConfig)
