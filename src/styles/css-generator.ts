/**
 * @fileoverview CSS Style Generator
 * @module styles/css-generator
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-02
 * @modified 2026-01-03
 *
 * @description
 * Generates complete CSS style strings based on theme configuration.
 * Supports base unit system, all size values are obtained from theme configuration.
 * Supports CSS isolation mode to ensure styles are not affected by external styles.
 *
 * v2.0.0 Refactoring:
 * - Use configuration-driven approach to eliminate duplicate code
 * - Unify generation logic for normal and isolated modes
 * - Extract common utility functions
 *
 * @dependencies
 * - ../types/theme - Theme type definitions
 * - ./default-theme - Default theme configuration
 * - ./page-sizes - Page size constants
 * - ./isolation - CSS isolation module
 * - ../fonts - Font module
 *
 * @usedBy
 * - ../renderer/index.ts - Renderer main entry
 * - ../pagination/paginated-renderer.ts - Paginated renderer
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'
import { PAGE_SIZES } from './page-sizes'
import { CSS_NAMESPACE, generateIsolationCss } from './isolation'
import { getFontCss, FONT_FAMILY } from '../fonts'

// ==================== Type Definitions ====================

/** Deep partial type */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** Style generation configuration */
interface StyleConfig {
  /** Whether to use namespace prefix */
  namespaced: boolean
  /** Whether to force embedded font (ignore theme font configuration) */
  forceEmbeddedFont: boolean
}

/** Default configuration: normal mode */
const NORMAL_CONFIG: StyleConfig = {
  namespaced: false,
  forceEmbeddedFont: false,
}

/** Isolated mode configuration */
const ISOLATED_CONFIG: StyleConfig = {
  namespaced: true,
  forceEmbeddedFont: true,
}

// ==================== Utility Functions ====================

/**
 * Deep merge two objects
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as T
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (
      sourceValue !== null &&
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as T[keyof T]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T]
    }
  }
  return result
}

/**
 * Deep merge theme configuration
 * 
 * Merges a partial custom theme with the default theme, supporting
 * deep nested property overrides.
 * 
 * @param customTheme - Custom theme configuration (deep partial)
 * @returns Merged complete theme
 * 
 * @example
 * ```typescript
 * import { mergeTheme, defaultTheme } from 'medical-form-printer'
 * 
 * const customTheme = mergeTheme(defaultTheme, {
 *   colors: {
 *     primary: '#1a1a1a',
 *     border: '#333333'
 *   },
 *   fontSize: {
 *     body: '11pt'
 *   }
 * })
 * ```
 */
export function mergeTheme(customTheme?: DeepPartial<Theme>): Theme {
  if (!customTheme) return defaultTheme
  return deepMerge(defaultTheme, customTheme)
}

/**
 * Create class name generation function
 * @param config - Style configuration
 * @returns Class name generation function
 */
function createClassNameFn(config: StyleConfig): (name: string) => string {
  return config.namespaced ? (name: string) => `${CSS_NAMESPACE}-${name}` : (name: string) => name
}

/**
 * Get font family string
 * @param theme - Theme configuration
 * @param config - Style configuration
 * @param type - Font type ('body' | 'heading')
 */
function getFontFamilyStr(theme: Theme, config: StyleConfig, type: 'body' | 'heading'): string {
  if (config.forceEmbeddedFont) {
    return `'${FONT_FAMILY}', serif`
  }
  return type === 'body' ? theme.fonts.body : theme.fonts.heading
}

// ==================== CSS Generation Functions ====================

/**
 * Generate base reset styles
 */
function generateResetStyles(cls: (name: string) => string, config: StyleConfig): string {
  const selector = config.namespaced ? `.${cls('root')} *` : '*'
  return `
/* Base Styles */
${selector} {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`
}

/**
 * Generate page layout styles
 */
function generatePageStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const fontFamily = getFontFamilyStr(theme, config, 'body')
  
  return `
/* Page Layout */
.${cls('print-page')} {
  font-family: ${fontFamily};
  font-size: ${theme.fontSize.body};
  line-height: 1.5;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  padding: ${theme.spacing.pageMargin};
  width: ${PAGE_SIZES.A4.width};
  min-height: ${PAGE_SIZES.A4.height};
}

.${cls('print-page')}.${cls('landscape')} {
  width: ${PAGE_SIZES.A4.height};
  min-height: ${PAGE_SIZES.A4.width};
}

.${cls('print-page')}.${cls('a5')} {
  width: ${PAGE_SIZES.A5.width};
  min-height: ${PAGE_SIZES.A5.height};
}

.${cls('print-page')}.${cls('a5')}.${cls('landscape')} {
  width: ${PAGE_SIZES.A5.height};
  min-height: ${PAGE_SIZES.A5.width};
}

/* 16K paper: fixed height to match physical print size, prevent pagination issues from content overflow */
.${cls('print-page')}.${cls('16k')} {
  width: ${PAGE_SIZES['16K'].width};
  height: ${PAGE_SIZES['16K'].height};
  min-height: ${PAGE_SIZES['16K'].height};
  padding: 8mm 10mm;
  overflow: hidden;
}

.${cls('print-page')}.${cls('16k')}.${cls('landscape')} {
  width: ${PAGE_SIZES['16K'].height};
  height: ${PAGE_SIZES['16K'].width};
  min-height: ${PAGE_SIZES['16K'].width};
  padding: 10mm 8mm;
  overflow: hidden;
}`
}

/**
 * Generate header styles
 */
function generateHeaderStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const headingFont = getFontFamilyStr(theme, config, 'heading')
  
  return `
/* Header */
.${cls('print-header')} {
  text-align: center;
  margin-bottom: 3mm;
  padding-bottom: 2mm;
}

.${cls('header-row')} {
  display: flex;
  justify-content: space-between;
  font-size: 10.5pt;
  font-weight: 600;
  margin-bottom: 1mm;
}

.${cls('hospital-name')} {
  font-family: ${headingFont};
  font-size: 10.5pt;
  font-weight: 600;
}

.${cls('department-name')} {
  font-size: 10.5pt;
  font-weight: 600;
}

.${cls('form-title')} {
  font-family: ${headingFont};
  font-size: 14pt;
  font-weight: bold;
  margin: 2mm 0 1mm 0;
  letter-spacing: 2pt;
}`
}

/**
 * Generate section common styles
 */
function generateSectionStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const headingFont = getFontFamilyStr(theme, config, 'heading')
  
  return `
/* Section Common */
.${cls('print-section')} {
  margin-bottom: ${theme.spacing.sectionGap};
}

.${cls('section-title')} {
  font-family: ${headingFont};
  font-size: ${theme.fontSize.sectionTitle};
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs};
  text-align: center;
}`
}

/**
 * Generate info grid styles (underline fill-in style)
 * @param _theme - Theme configuration (reserved for extension, currently unused)
 * @param cls - Class name generation function
 */
function generateInfoGridStyles(_theme: Theme, cls: (name: string) => string): string {
  return `
/* Info Grid - Underline Fill-in Style */
.${cls('info-grid')} {
  margin-bottom: 0.5mm;
}

/* Each row is a line, using flex layout */
.${cls('info-row')} {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 0.5mm;
  line-height: 1.8;
}

.${cls('info-item')} {
  display: inline-flex;
  align-items: baseline;
  margin-right: 2mm;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Last item automatically fills remaining space */
.${cls('info-item')}:last-child {
  flex: 1;
  margin-right: 0;
}

.${cls('info-item')}.${cls('span-2')} {
  margin-right: 3mm;
}

.${cls('label')} {
  letter-spacing: 0;
}

/* Field value container: text + underline */
.${cls('field-value')} {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 12mm;
  vertical-align: bottom;
  flex: 1;
}

.${cls('field-value')}.${cls('custom-width')} {
  min-width: unset;
  flex: none;
}

.${cls('field-value')} .${cls('text')} {
  min-height: 1.1em;
  display: block;
  padding: 0 0.5mm;
}

.${cls('field-value')} .${cls('text')}:empty::before {
  content: '\\00a0';
}

.${cls('field-value')} .${cls('line')} {
  width: 100%;
  border-bottom: 0.5pt solid #000;
}

/* Full width underline (for empty label rows) */
.${cls('field-value')}.${cls('full-width')} {
  width: 100%;
  flex: 1;
}

.${cls('checkbox-inline')} {
  margin-left: 1mm;
}

/* checkbox-text type: checkbox symbol + text */
.${cls('checkbox-text-item')} {
  display: block;
  width: 100%;
  white-space: normal;
  line-height: 1.6;
}

.${cls('checkbox-text')} {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* textarea type: label + content with natural line breaks */
.${cls('textarea-item')} {
  display: block;
  width: 100%;
  white-space: normal;
  line-height: 1.6;
}

.${cls('textarea-item')} .${cls('label')} {
  white-space: nowrap;
}

.${cls('textarea-content')} {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}`
}

/**
 * Generate data table styles
 */
function generateTableStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* Data Table */
.${cls('data-table')} table {
  width: 100%;
  border-collapse: collapse;
}

.${cls('data-table')} th,
.${cls('data-table')} td {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  text-align: center;
}

.${cls('data-table')} th {
  background: ${theme.colors.labelBackground};
  font-weight: normal;
}`
}

/**
 * Generate checkbox grid styles
 * @param _theme - Theme configuration (reserved for extension, currently unused)
 * @param cls - Class name generation function
 */
function generateCheckboxStyles(_theme: Theme, cls: (name: string) => string): string {
  return `
/* Checkbox Grid */
.${cls('checkbox-grid')} {
  margin: 0.5mm 0;
  line-height: 1.8;
}

/* Grid layout */
.${cls('checkbox-grid')}.${cls('checkbox-grid-grid')} {
  display: grid;
  gap: 0.5mm 2mm;
}

/* Flex layout */
.${cls('checkbox-grid')}.${cls('checkbox-grid-flex')} {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5mm 1.5mm;
}

.${cls('checkbox-item')} {
  display: flex;
  align-items: baseline;
  gap: 0.3mm;
  white-space: nowrap;
}

.${cls('prefix-label')} {
  flex-shrink: 0;
}

.${cls('checkbox-symbol')} {
  font-family: "SimSun", serif;
  font-size: 10pt;
}

.${cls('checkbox-label')} {
  flex-shrink: 0;
}

.${cls('text-input-item')} {
  display: flex;
  align-items: baseline;
}

.${cls('text-input-label')} {
  flex-shrink: 0;
}

.${cls('input-line')} {
  min-width: 15mm;
  border-bottom: 0.5pt solid #000;
  padding: 0 1mm;
  margin-left: 1mm;
  text-align: center;
}`
}

/**
 * Generate signature area styles
 */
function generateSignatureStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* Signature Area */
.${cls('signature-area')} {
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.signatureGap};
  margin-top: ${theme.spacing.signatureMarginTop};
}

.${cls('signature-item')} {
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.xs};
}

.${cls('signature-label')} {
  white-space: nowrap;
}

.${cls('signature-line')} {
  display: inline-block;
  min-width: ${theme.spacing.signatureLineWidth};
  border-bottom: ${theme.borderWidth} solid ${theme.colors.border};
  line-height: 1.5;
}

.${cls('signature-line')}:empty::before {
  content: '\\00a0';
}`
}

/**
 * Generate notes and free text styles
 */
function generateNotesStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* Notes Area */
.${cls('notes-section')} {
  padding: ${theme.spacing.cellPadding};
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}

.${cls('notes-section')}.${cls('bordered')} {
  border: ${theme.borderWidth} solid ${theme.colors.border};
}

/* Free Text */
.${cls('free-text')} {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  min-height: ${theme.spacing.freeTextMinHeight};
  white-space: pre-wrap;
}`
}

/**
 * Generate footer styles
 */
function generateFooterStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* Footer */
.${cls('print-footer')} {
  margin-top: ${theme.spacing.footerMarginTop};
  min-height: ${theme.fontSize.small};
  display: flex;
  justify-content: space-between;
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}`
}

/**
 * Generate print media query styles
 */
function generatePrintStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  // Additional print styles for isolated mode
  const isolatedPrintStyles = config.namespaced
    ? `
  /* Disable font smoothing for clearer print output */
  .${cls('root')},
  .${cls('root')} * {
    -webkit-font-smoothing: subpixel-antialiased !important;
    -moz-osx-font-smoothing: auto !important;
  }`
    : ''

  return `
/* Print Styles */
@media print {
  .${cls('print-page')} {
    padding: 0;
    width: 100%;
    min-height: auto;
  }
  
  @page {
    margin: ${theme.spacing.pageMargin};
  }

  /* Pagination Control */
  .${cls('page-break-before')} {
    page-break-before: always;
  }

  .${cls('page-break-after')} {
    page-break-after: always;
  }

  .${cls('no-page-break')} {
    page-break-inside: avoid;
  }

  /* Avoid page break in middle of table rows */
  .${cls('data-table')} tr {
    page-break-inside: avoid;
  }

  /* Avoid page break after section title */
  .${cls('section-title')} {
    page-break-after: avoid;
  }

  /* Signature area avoid page break */
  .${cls('signature-area')} {
    page-break-inside: avoid;
  }

  /* Table header avoid separation from content */
  .${cls('data-table')} thead {
    display: table-header-group;
  }

  /* Table footer avoid separation from content */
  .${cls('data-table')} tfoot {
    display: table-footer-group;
  }${isolatedPrintStyles}
}`
}

/**
 * Generate watermark styles
 */
function generateWatermarkStyles(cls: (name: string) => string): string {
  return `
/* Watermark */
.${cls('watermark')} {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 48pt;
  color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}`
}

// ==================== Core Generation Functions ====================

/**
 * Generate component styles (internal function)
 * @param theme - Theme configuration
 * @param config - Style configuration
 * @returns CSS string
 */
function generateComponentStyles(theme: Theme, config: StyleConfig): string {
  const cls = createClassNameFn(config)

  return [
    generateResetStyles(cls, config),
    generatePageStyles(theme, cls, config),
    generateHeaderStyles(theme, cls, config),
    generateSectionStyles(theme, cls, config),
    generateInfoGridStyles(theme, cls),
    generateTableStyles(theme, cls),
    generateCheckboxStyles(theme, cls),
    generateSignatureStyles(theme, cls),
    generateNotesStyles(theme, cls),
    generateFooterStyles(theme, cls),
    generatePrintStyles(theme, cls, config),
    generateWatermarkStyles(cls),
  ].join('\n')
}

// ==================== Public API ====================

/**
 * Generate CSS style string (normal mode)
 * 
 * @param theme - Theme configuration
 * @returns Complete CSS style string
 *
 * @description
 * Generated CSS includes:
 * - Base styles (reset, page layout)
 * - Header and footer styles
 * - Section type styles (info-grid, table, checkbox-grid, etc.)
 * - Print media queries
 * - Watermark styles
 *
 * All size values are obtained from theme configuration, supporting overall scaling through base unit system.
 * 
 * @example
 * ```typescript
 * import { generateCss, defaultTheme, mergeTheme } from 'medical-form-printer'
 * 
 * // Use default theme
 * const css = generateCss(defaultTheme)
 * 
 * // Use custom theme
 * const customTheme = mergeTheme(defaultTheme, {
 *   colors: { primary: '#1a1a1a' }
 * })
 * const customCss = generateCss(customTheme)
 * ```
 */
export function generateCss(theme: Theme): string {
  return generateComponentStyles(theme, NORMAL_CONFIG)
}

/**
 * Generate complete isolated CSS with embedded fonts and namespaced classes
 *
 * @param customTheme - Custom theme configuration (font configuration will be ignored)
 * @returns Complete CSS including font, isolation and component styles
 *
 * @description
 * Generated CSS includes:
 * 1. @font-face declaration (embedded Base64 font)
 * 2. Font force override rules
 * 3. CSS isolation container styles
 * 4. All component styles (with mpr- prefix)
 * 5. Print media queries
 *
 * Note: The fonts property in the passed theme configuration will be ignored,
 * always uses embedded Source Han Serif SC.
 * 
 * @example
 * ```typescript
 * import { generateIsolatedCss, ISOLATION_ROOT_CLASS } from 'medical-form-printer'
 * 
 * const css = generateIsolatedCss()
 * 
 * // Use in HTML
 * const html = `
 *   <style>${css}</style>
 *   <div class="${ISOLATION_ROOT_CLASS}">
 *     <!-- Rendered content -->
 *   </div>
 * `
 * ```
 */
export function generateIsolatedCss(customTheme?: DeepPartial<Theme>): string {
  const theme = mergeTheme(customTheme)

  return [
    // 1. Font CSS (@font-face + force override)
    getFontCss(),
    // 2. Isolation container styles
    generateIsolationCss(),
    // 3. Component styles (with namespace)
    generateComponentStyles(theme, ISOLATED_CONFIG),
  ].join('\n')
}
