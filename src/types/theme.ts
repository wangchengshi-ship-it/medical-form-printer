/**
 * @fileoverview Theme type definitions
 * @module types/theme
 */

/** Font configuration */
export interface FontConfig {
  /** Body font */
  body: string
  /** Heading font */
  heading: string
  /** Monospace font */
  mono: string
}

/** Color configuration */
export interface ColorConfig {
  /** Primary color */
  primary: string
  /** Border color */
  border: string
  /** Background color */
  background: string
  /** Label background color */
  labelBackground: string
  /** Text color */
  text: string
  /** Secondary text color */
  textSecondary: string
}

/** Spacing configuration */
export interface SpacingConfig {
  /** Page margin */
  pageMargin: string
  /** Section gap */
  sectionGap: string
  /** Cell padding */
  cellPadding: string
  /** Header bottom margin */
  headerMarginBottom: string
  /** Department name top margin */
  departmentMarginTop: string
  /** Form title top margin */
  titleMarginTop: string
  /** Signature area gap */
  signatureGap: string
  /** Signature area top margin */
  signatureMarginTop: string
  /** Signature line minimum width */
  signatureLineWidth: string
  /** Free text minimum height */
  freeTextMinHeight: string
  /** Footer top margin */
  footerMarginTop: string
  /** Extra small spacing (2mm) */
  xs: string
  /** Small spacing (3mm) */
  sm: string
}

/** Font size configuration */
export interface FontSizeConfig {
  /** Hospital name */
  hospitalName: string
  /** Form title */
  formTitle: string
  /** Section title */
  sectionTitle: string
  /** Body text */
  body: string
  /** Small text */
  small: string
}

/** Theme configuration */
export interface Theme {
  /** Fonts */
  fonts: FontConfig
  /** Colors */
  colors: ColorConfig
  /** Spacing */
  spacing: SpacingConfig
  /** Font sizes */
  fontSize: FontSizeConfig
  /** Border width */
  borderWidth: string
}

/**
 * Size multipliers configuration (for base unit system)
 * All values are multipliers relative to the base unit
 */
export interface SizeMultipliers {
  /** Font size multipliers */
  fontSize: {
    /** Body font size multiplier */
    body: number
    /** Small font size multiplier */
    small: number
    /** Section title multiplier */
    sectionTitle: number
    /** Hospital name multiplier */
    hospitalName: number
    /** Form title multiplier */
    formTitle: number
  }
  /** Line height multiplier (relative to font size) */
  lineHeight: number
  /** Spacing multipliers */
  spacing: {
    /** Page margin multiplier */
    pageMargin: number
    /** Section gap multiplier */
    sectionGap: number
    /** Cell horizontal padding multiplier */
    cellPaddingX: number
    /** Cell vertical padding multiplier */
    cellPaddingY: number
    /** Header bottom margin multiplier */
    headerMarginBottom: number
    /** Department name top margin multiplier */
    departmentMarginTop: number
    /** Form title top margin multiplier */
    titleMarginTop: number
    /** Signature area gap multiplier */
    signatureGap: number
    /** Signature area top margin multiplier */
    signatureMarginTop: number
    /** Signature line minimum width multiplier */
    signatureLineWidth: number
    /** Free text minimum height multiplier */
    freeTextMinHeight: number
    /** Footer top margin multiplier */
    footerMarginTop: number
    /** Extra small spacing multiplier */
    xs: number
    /** Small spacing multiplier */
    sm: number
  }
  /** Border width multiplier */
  borderWidth: number
}

/**
 * Scaled theme configuration
 * Contains base unit and multiplier configuration for generating final Theme
 */
export interface ScaledThemeConfig {
  /** Base unit value (millimeters) */
  baseUnit: number
  /** Size multiplier configuration */
  multipliers: SizeMultipliers
  /** Font configuration */
  fonts: FontConfig
  /** Color configuration */
  colors: ColorConfig
}
