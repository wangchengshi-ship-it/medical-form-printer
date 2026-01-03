/**
 * @fileoverview Default Theme Configuration
 * @module styles/default-theme
 *
 * @description
 * Defines default theme configuration using base unit system for scalable sizes.
 * All size values are multiples of the base unit, allowing overall scaling by modifying the base unit.
 */

import type { Theme, FontConfig, ColorConfig, SizeMultipliers, ScaledThemeConfig } from '../types/theme'
import {
  DEFAULT_BASE_UNIT,
  SIZE_MULTIPLIERS,
  scaleValue,
  formatSize,
  formatPadding,
} from './base-unit'

/** Default font configuration */
export const defaultFonts: FontConfig = {
  body: '"SimSun", "Songti SC", serif',
  heading: '"SimHei", "Heiti SC", sans-serif',
  mono: '"Courier New", monospace',
}

/** Default color configuration */
export const defaultColors: ColorConfig = {
  primary: '#000000',
  border: '#000000',
  background: '#ffffff',
  labelBackground: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
}

/** Default size multiplier configuration */
export const defaultMultipliers: SizeMultipliers = SIZE_MULTIPLIERS

/** Default scaled theme configuration */
export const defaultScaledConfig: ScaledThemeConfig = {
  baseUnit: DEFAULT_BASE_UNIT,
  multipliers: defaultMultipliers,
  fonts: defaultFonts,
  colors: defaultColors,
}

/**
 * Generate complete theme from base unit and multiplier configuration
 * @param config - Scaled theme configuration
 * @returns Complete theme object
 */
export function createScaledTheme(config: ScaledThemeConfig = defaultScaledConfig): Theme {
  const { baseUnit, multipliers, fonts, colors } = config
  const s = multipliers.spacing

  // Calculate millimeter values for each size
  const fontSizeMm = {
    body: scaleValue(multipliers.fontSize.body, baseUnit),
    small: scaleValue(multipliers.fontSize.small, baseUnit),
    sectionTitle: scaleValue(multipliers.fontSize.sectionTitle, baseUnit),
    hospitalName: scaleValue(multipliers.fontSize.hospitalName, baseUnit),
    formTitle: scaleValue(multipliers.fontSize.formTitle, baseUnit),
  }

  const borderWidthMm = scaleValue(multipliers.borderWidth, baseUnit)

  // Generate theme object, using pt as font size unit (more suitable for printing)
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
 * Quickly create scaled theme from base unit value
 * @param baseUnit - Base unit value (millimeters), default is 1
 * @returns Complete theme object
 */
export function createThemeWithBaseUnit(baseUnit: number = DEFAULT_BASE_UNIT): Theme {
  return createScaledTheme({
    ...defaultScaledConfig,
    baseUnit,
  })
}

/** Default theme - Standard medical form style (base unit = 1mm) */
export const defaultTheme: Theme = createScaledTheme(defaultScaledConfig)
