/**
 * @fileoverview Base Unit System
 * @module styles/base-unit
 * @modifys 2021-06-01
 *
 * @description
 * Defines base unit constants and unit conversion functions for print rendering.
 * All size values are multiples of BASE_UNIT, allowing overall scaling by modifying BASE_UNIT.
 *
 * Design Principles:
 * - Default base unit is 1mm
 * - All sizes are defined through a multiplier system to maintain proportional relationships
 * - Supports mm, pt, px unit output
 */

/** Supported unit types */
export type Unit = 'mm' | 'pt' | 'px'

/** Default base unit value (millimeters) */
export const DEFAULT_BASE_UNIT = 1

/**
 * Unit conversion constants
 * - 1mm ≈ 2.835pt (72pt / 25.4mm)
 * - 1mm ≈ 3.78px (96px / 25.4mm at 96dpi)
 */
export const UNIT_CONVERSIONS = {
  /** Millimeters to points conversion factor */
  MM_TO_PT: 72 / 25.4, // ≈ 2.835
  /** Millimeters to pixels conversion factor (96dpi) */
  MM_TO_PX: 96 / 25.4, // ≈ 3.78
  /** Points to millimeters conversion factor */
  PT_TO_MM: 25.4 / 72,
  /** Pixels to millimeters conversion factor (96dpi) */
  PX_TO_MM: 25.4 / 96,
} as const

/**
 * Size multiplier configuration
 * Defines multipliers for various sizes relative to the base unit
 */
export const SIZE_MULTIPLIERS = {
  /** Font size multipliers */
  fontSize: {
    /** Body font size - 3.5mm ≈ 10pt */
    body: 3.5,
    /** Small font size - 3mm ≈ 8.5pt */
    small: 3,
    /** Section title - 4.2mm ≈ 12pt */
    sectionTitle: 4.2,
    /** Hospital name - 5mm ≈ 14pt */
    hospitalName: 5,
    /** Form title - 5.6mm ≈ 16pt */
    formTitle: 5.6,
  },
  /** Line height multiplier (relative to font size) */
  lineHeight: 1.5,
  /** Spacing multipliers */
  spacing: {
    /** Page margin - Using 8mm 10mm consistent with Vue component, using 10mm as base */
    pageMargin: 10,
    /** Section gap - 5mm */
    sectionGap: 5,
    /** Cell horizontal padding - 3mm */
    cellPaddingX: 3,
    /** Cell vertical padding - 2mm */
    cellPaddingY: 2,
    /** Header bottom margin - 10mm */
    headerMarginBottom: 10,
    /** Department name top margin - 2mm */
    departmentMarginTop: 2,
    /** Form title top margin - 5mm */
    titleMarginTop: 5,
    /** Signature area gap - 20mm */
    signatureGap: 20,
    /** Signature area top margin - 10mm */
    signatureMarginTop: 10,
    /** Signature line minimum width - 30mm */
    signatureLineWidth: 30,
    /** Free text minimum height - 20mm */
    freeTextMinHeight: 20,
    /** Footer top margin - 10mm */
    footerMarginTop: 10,
    /** Extra small spacing - 2mm */
    xs: 2,
    /** Small spacing - 3mm */
    sm: 3,
  },
  /** Border width multiplier - 0.35mm ≈ 1px */
  borderWidth: 0.35,
} as const

/**
 * Convert millimeter value to specified unit
 * @param mm - Millimeter value
 * @param unit - Target unit
 * @returns Converted numeric value
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
 * Convert value from specified unit to millimeters
 * @param value - Numeric value
 * @param unit - Source unit
 * @returns Millimeter value
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
 * Calculate scaled value
 * @param multiplier - Multiplier
 * @param baseUnit - Base unit value (millimeters)
 * @returns Scaled millimeter value
 */
export function scaleValue(multiplier: number, baseUnit: number = DEFAULT_BASE_UNIT): number {
  return multiplier * baseUnit
}

/**
 * Format size value as CSS string
 * @param mm - Millimeter value
 * @param unit - Output unit
 * @param precision - Decimal precision
 * @returns CSS size string (e.g., "10mm", "28.35pt")
 */
export function formatSize(mm: number, unit: Unit = 'mm', precision: number = 2): string {
  const value = convertFromMm(mm, unit)
  // For integer values, don't show decimal point
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(precision)
  return `${formatted}${unit}`
}

/**
 * Format padding value as CSS string
 * @param vertical - Vertical padding (millimeters)
 * @param horizontal - Horizontal padding (millimeters)
 * @param unit - Output unit
 * @returns CSS padding string (e.g., "2mm 3mm")
 */
export function formatPadding(vertical: number, horizontal: number, unit: Unit = 'mm'): string {
  return `${formatSize(vertical, unit)} ${formatSize(horizontal, unit)}`
}
