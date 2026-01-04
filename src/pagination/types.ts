/**
 * @fileoverview Pagination related type definitions
 * @module pagination/types
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-04
 *
 * @description
 * Defines all types for the smart pagination module, including:
 * - Page dimension configuration
 * - Measurable content items
 * - Pagination results
 * - Overflow field configuration
 * - Pagination configuration
 * - Overflow text i18n configuration
 *
 * @requirements
 * - 9.1: Calculate page breaks based on measured content height
 * - 9.5: Support configurable page sizes
 * - 9.7: Support pre-measuring content height
 * - 5.1: Support i18n for overflow text
 *
 * @usedBy
 * - ./page-dimensions.ts - Page dimension configuration
 * - ./page-break-calculator.ts - Core pagination algorithm
 * - ./overflow-handler.ts - Overflow field handling
 * - ./paginated-renderer.ts - Paginated renderer
 * - ./index.ts - Module entry
 */

// ==================== Default Configuration Constants ====================

/**
 * Pagination module default configuration
 */
export const PAGINATION_DEFAULTS = {
  /** Maximum characters for overflow field first page */
  OVERFLOW_FIRST_LINE_CHARS: 60,
  /** Minimum table row height estimate (mm) */
  MIN_ROW_HEIGHT: 8,
  /** Default DPI (dots per inch), standard screen DPI is 96 */
  DPI: 96,
  /** 1 inch = 25.4 millimeters */
  MM_PER_INCH: 25.4,
  /** Default margins (mm) */
  MARGIN: {
    TOP: 8,
    BOTTOM: 8,
    LEFT: 10,
    RIGHT: 10,
  },
} as const

/** @deprecated Use PAGINATION_DEFAULTS.DPI instead */
export const DEFAULT_DPI = PAGINATION_DEFAULTS.DPI

/** @deprecated Use PAGINATION_DEFAULTS.MM_PER_INCH instead */
export const MM_PER_INCH = PAGINATION_DEFAULTS.MM_PER_INCH

// ==================== Measurable Content Item Types ====================

/**
 * Measurable content item type enum
 * @requirements 9.1 - Identify different types of content items
 */
export const MEASURABLE_ITEM_TYPES = {
  HEADER: 'header',
  SECTION: 'section',
  TABLE_HEADER: 'table-header',
  TABLE_ROW: 'table-row',
  SIGNATURE: 'signature',
  FOOTER: 'footer',
} as const

/**
 * Measurable content item type
 * @requirements 9.1 - Identify different types of content items
 */
export type MeasurableItemType =
  (typeof MEASURABLE_ITEM_TYPES)[keyof typeof MEASURABLE_ITEM_TYPES]

// ==================== Page Dimension Types ====================

/**
 * Page dimension configuration
 * @requirements 9.5 - Support configurable page sizes
 */
export interface PageDimensions {
  /** Page width (mm) */
  width: number
  /** Page height (mm) */
  height: number
  /** Top margin (mm) */
  marginTop: number
  /** Bottom margin (mm) */
  marginBottom: number
  /** Left margin (mm) */
  marginLeft: number
  /** Right margin (mm) */
  marginRight: number
}

/**
 * Page size preset names
 * @requirements 3.1 - Support A4, A5, 16K page sizes
 */
export type PageSizePreset = '16K' | 'A4' | 'A5'

/**
 * Pagination mode
 * - auto: Automatic pagination based on content measurement
 * - manual: Manual pagination with specified break points
 */
export type PaginationMode = 'auto' | 'manual'

// ==================== Measurable Content Item Interface ====================

/**
 * Measurable content item
 * @requirements 9.7 - Support pre-measuring content height
 */
export interface MeasurableItem {
  /** Unique identifier */
  id: string
  /** Content type */
  type: MeasurableItemType
  /** Measured height (px) */
  height: number
  /** Parent table ID (only for table-header and table-row) */
  tableId?: string
  /** Original data index */
  dataIndex?: number
}

// ==================== Pagination Result Types ====================

/**
 * Single page content
 * @requirements 9.1 - Pagination result contains page content list
 */
export interface PageContent {
  /** Page number (starting from 1) */
  pageNumber: number
  /** Whether this is a continuation page */
  isContinuation: boolean
  /** List of content item IDs on this page */
  items: string[]
  /** List of table header IDs to repeat */
  repeatedHeaders: string[]
}

/**
 * Pagination result
 * @requirements 9.1 - Return paginated page list
 */
export interface PageBreakResult {
  /** Page list */
  pages: PageContent[]
  /** Total page count */
  totalPages: number
}

// ==================== Overflow Field Configuration ====================

/**
 * Overflow field configuration
 * Specifies which fields need pagination handling when content is too long
 * @requirements 9.7 - Support overflow field pagination
 */
export interface OverflowFieldConfig {
  /** Field name */
  fieldName: string
  /** Maximum characters to show on first page, default 60 */
  maxFirstLineChars?: number
}

// ==================== Pagination Configuration Subtypes ====================

/**
 * Overflow configuration
 * Configures pagination behavior when field content overflows
 */
export interface OverflowConfig {
  /** Which fields should overflow to next page */
  fields?: string[]
  /** Maximum characters to show on first page, default 60 */
  firstLineChars?: number
}

/**
 * Display configuration
 * Configures elements to display on each page
 */
export interface DisplayConfig {
  /** Whether to show header on each page */
  headerOnEachPage?: boolean
  /** Whether to show footer on each page */
  footerOnEachPage?: boolean
  /** Whether to show signature area at bottom of each page */
  signatureOnEachPage?: boolean
  /** Whether to repeat table headers on continuation pages */
  repeatTableHeaders?: boolean
}

/**
 * Page header configuration
 * Configures header display on each page
 */
export interface PageHeaderConfig {
  /** Whether to show header on each page */
  showOnEachPage: boolean
  /** Continuation page title suffix, e.g., "(continued)" */
  continuationSuffix?: string
}

/**
 * Page footer configuration
 * Configures footer display on each page
 */
export interface PageFooterConfig {
  /** Whether to show footer on each page */
  showOnEachPage: boolean
  /** Page number format, e.g., "Page {current} of {total}" */
  pageNumberFormat?: string
}

/**
 * Smart pagination configuration
 * Enables measurement-based smart pagination
 */
export interface SmartPaginationConfig {
  /** Whether to enable smart pagination */
  enabled: boolean
  /** Minimum table row height estimate (mm), for estimation, default 8 */
  minRowHeight?: number
}

// ==================== Main Pagination Configuration Type ====================

/**
 * Pagination configuration
 * @requirements 9.1, 9.5 - Support configurable pagination rules
 */
export interface PaginationConfig {
  /** Whether to enable pagination */
  enabled: boolean
  /** Pagination mode: auto | manual (specify break points) */
  mode?: 'auto' | 'manual'
  /** In manual mode, page break after these section indices (0-based) */
  pageBreaks?: number[]
  /** Overflow configuration */
  overflow?: OverflowConfig
  /** Display configuration */
  display?: DisplayConfig
  /** Smart pagination configuration */
  smartPagination?: SmartPaginationConfig
  /** Header configuration */
  headerConfig?: PageHeaderConfig
  /** Footer configuration */
  footerConfig?: PageFooterConfig

  // ==================== Compatibility Fields (Deprecated) ====================
  /** @deprecated Use overflow.fields instead */
  overflowFields?: string[]
  /** @deprecated Use overflow.firstLineChars instead */
  overflowFirstLineChars?: number
  /** @deprecated Use display.headerOnEachPage instead */
  showHeaderOnEachPage?: boolean
  /** @deprecated Use display.footerOnEachPage instead */
  showFooterOnEachPage?: boolean
  /** @deprecated Use display.signatureOnEachPage instead */
  showSignatureOnEachPage?: boolean
  /** @deprecated Use display.repeatTableHeaders instead */
  repeatTableHeaders?: boolean
}

// ==================== Pagination Calculation Parameter Types ====================

/**
 * Page break calculation options
 * Parameters for calculatePageBreaks function
 * @requirements 9.1 - Pagination calculation parameters
 */
export interface PageBreakOptions {
  /** Available page height (px) */
  pageHeight: number
  /** Header height (px), default 0 */
  headerHeight?: number
  /** Footer height (px), default 0 */
  footerHeight?: number
  /** Whether to repeat table headers, default true */
  repeatTableHeaders?: boolean
}

// ==================== Overflow Text I18n Configuration ====================

/**
 * Overflow text configuration for internationalization
 * Configures user-visible text for overflow field pagination
 *
 * @requirements 5.1 - Support i18n for overflow text
 *
 * @example
 * // Use Chinese (default)
 * const config = { overflowText: DEFAULT_OVERFLOW_TEXT }
 *
 * // Use English
 * const config = { overflowText: ENGLISH_OVERFLOW_TEXT }
 */
export interface OverflowTextConfig {
  /** Continuation marker on first page, e.g., "（续见附页）" */
  seeNextMarker: string
  /** Label suffix on continuation page, e.g., "（续）" */
  continuationSuffix: string
  /** Page title suffix for continuation pages, e.g., "（续）" */
  pageTitleSuffix: string
}

/**
 * Default overflow text configuration (Chinese)
 * @requirements 5.1 - Default Chinese text
 */
export const DEFAULT_OVERFLOW_TEXT: OverflowTextConfig = {
  /** Continuation marker on first page */
  seeNextMarker: '（续见附页）',
  /** Label suffix on continuation page */
  continuationSuffix: '（续）',
  /** Page title suffix for continuation pages */
  pageTitleSuffix: '（续）',
} as const

/**
 * English overflow text configuration
 * @requirements 5.1 - English text option
 */
export const ENGLISH_OVERFLOW_TEXT: OverflowTextConfig = {
  /** Continuation marker on first page */
  seeNextMarker: '(continued on next page)',
  /** Label suffix on continuation page */
  continuationSuffix: '(continued)',
  /** Page title suffix for continuation pages */
  pageTitleSuffix: '(continued)',
} as const
