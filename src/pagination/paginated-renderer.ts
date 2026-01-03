/**
 * @fileoverview Paginated renderer
 * @module pagination/paginated-renderer
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-02
 * @modified 2026-01-03
 *
 * @description
 * Renders pagination results to multi-page HTML, each page independent and printable.
 * Supports:
 * - Independent .print-page element for each page
 * - Header rendering on each page (continuation pages add "(continued)" marker)
 * - Footer rendering on each page (page number display)
 * - Automatic table header insertion on continuation pages
 * - CSS pagination rules
 *
 * @requirements
 * - 11.1: Render each page as independent .print-page element
 * - 11.2: Automatically insert table headers on continuation pages
 * - 11.3: Display page numbers ("Page X of Y")
 * - 11.4: Add "(continued)" marker to continuation page titles
 * - 11.5: Support CSS page-break rules
 * - 11.6: Maintain consistent styles across pages
 *
 * @dependencies
 * - ./types.ts - Type definitions
 * - ./page-break-calculator.ts - Pagination algorithm
 * - ../renderer/section-renderers - Section renderers
 * - ../styles - Style system
 * - ../utils/html-builder.ts - HTML builder
 *
 * @usedBy
 * - ../index.ts - Library main entry
 * - international-postpartum-frontend - Frontend print module
 */

import type { PrintSchema, FormData, PrintSection } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import type { Theme } from '../types/theme'
import type { PageBreakResult, PageContent, MeasurableItem, PaginationConfig, PageDimensions } from './types'
import { renderSection } from '../renderer/section-renderers'
import { generateCss, generateIsolatedCss, mergeTheme, namespaceClass, ISOLATION_ROOT_CLASS } from '../styles'
import { escapeHtml, h, div, header, footer, main, renderWatermarkHtml, extractWatermarkOptions } from '../utils'
import { PAGE_16K } from './page-dimensions'

// ==================== Type Definitions ====================

/**
 * Paginated render configuration
 */
export interface PaginatedRenderConfig {
  /** Whether to show header on each page */
  showHeaderOnEachPage?: boolean
  /** Whether to show footer on each page */
  showFooterOnEachPage?: boolean
  /** Whether to show signature area on each page */
  showSignatureOnEachPage?: boolean
  /** Continuation page title suffix, default "(continued)" */
  continuationSuffix?: string
  /** Page number format, default "Page {current} of {total}" */
  pageNumberFormat?: string
  /** Page dimensions configuration */
  pageDimensions?: PageDimensions
  /**
   * Whether to enable isolation mode
   * When enabled:
   * - All class names have mpr- prefix
   * - Styles are fully isolated, unaffected by external styles
   * - Fonts forced to use embedded Source Han Serif SC
   * @default false
   */
  isolated?: boolean
}

/**
 * Paginated render context
 */
export interface PaginatedRenderContext {
  /** Print layout configuration */
  schema: PrintSchema
  /** Form data */
  data: FormData
  /** Render options */
  options?: RenderOptions
  /** Pagination result */
  pageBreakResult: PageBreakResult
  /** All measurable content items */
  measuredItems: MeasurableItem[]
  /** Paginated render configuration */
  config?: PaginatedRenderConfig
}

/**
 * Single page render context
 */
interface SinglePageContext {
  /** Page content */
  page: PageContent
  /** Current page number */
  pageNumber: number
  /** Total pages */
  totalPages: number
  /** Whether this is the first page */
  isFirstPage: boolean
  /** Whether this is the last page */
  isLastPage: boolean
  /** Print layout configuration */
  schema: PrintSchema
  /** Form data */
  data: FormData
  /** Render options */
  options?: RenderOptions
  /** All measurable content items */
  measuredItems: MeasurableItem[]
  /** Paginated render configuration */
  config: Required<PaginatedRenderConfig>
  /** Theme configuration */
  theme: Theme
}

// ==================== CSS Class Name Constants ====================

/** CSS class name constants to avoid magic strings */
const CSS_CLASSES = {
  // Page structure
  PRINT_PAGE: 'print-page',
  CONTINUATION_PAGE: 'continuation-page',
  PRINT_HEADER: 'print-header',
  PRINT_FOOTER: 'print-footer',
  PRINT_CONTENT: 'print-content',
  
  // Header elements
  HEADER_LOGO: 'header-logo',
  HOSPITAL_NAME: 'hospital-name',
  DEPARTMENT_NAME: 'department-name',
  FORM_TITLE: 'form-title',
  
  // Footer elements
  FOOTER_NOTES: 'footer-notes',
  PAGE_NUMBER: 'page-number',
  
  // Table
  DATA_TABLE: 'data-table',
  REPEATED_HEADER: 'repeated-header',
  SECTION_TITLE: 'section-title',
  SIGNATURE_AREA: 'signature-area',
  
  // Pagination control
  PAGE_BREAK_BEFORE: 'page-break-before',
  PAGE_BREAK_AFTER: 'page-break-after',
  NO_PAGE_BREAK: 'no-page-break',
  
  // Watermark
  WATERMARK: 'watermark',
} as const

/** Non-isolated mode document root class name */
const PAGINATED_DOCUMENT_CLASS = 'paginated-document'

// ==================== Type Definitions ====================

/** Class name generator function type */
type ClassNameFn = (name: string) => string

/** Watermark render options type */
type WatermarkRenderOptions = RenderOptions & { watermark?: string; watermarkOpacity?: number }

// ==================== Default Configuration ====================

/**
 * Default paginated render configuration
 */
export const DEFAULT_PAGINATED_RENDER_CONFIG: Required<PaginatedRenderConfig> = {
  showHeaderOnEachPage: true,
  showFooterOnEachPage: true,
  showSignatureOnEachPage: false,
  continuationSuffix: '(continued)',
  pageNumberFormat: 'Page {current} of {total}',
  pageDimensions: PAGE_16K,
  isolated: false,
}

// ==================== Helper Functions ====================

/**
 * Merge paginated render configuration
 */
function mergeConfig(config?: PaginatedRenderConfig): Required<PaginatedRenderConfig> {
  return {
    ...DEFAULT_PAGINATED_RENDER_CONFIG,
    ...config,
  }
}

/** Identity function for non-isolated mode */
const identity = (name: string): string => name

/**
 * Create class name generator function
 * @param isolated - Whether to enable isolation mode
 * @returns Class name generator function
 */
function createClassNameFn(isolated: boolean): ClassNameFn {
  return isolated ? namespaceClass : identity
}

/**
 * Format page number
 * @param format - Page number format string
 * @param current - Current page number
 * @param total - Total pages
 */
function formatPageNumber(format: string, current: number, total: number): string {
  return format
    .replace('{current}', String(current))
    .replace('{total}', String(total))
}

/**
 * Get page CSS class names
 */
function getPageClasses(schema: PrintSchema, pageNumber: number, cls: ClassNameFn): string {
  const classes = [
    cls(CSS_CLASSES.PRINT_PAGE),
    cls(schema.pageSize.toLowerCase()),
    cls(schema.orientation),
  ]
  if (pageNumber > 1) {
    classes.push(cls(CSS_CLASSES.CONTINUATION_PAGE))
  }
  return classes.join(' ')
}

// ==================== Header Rendering ====================

/**
 * Render page header
 * @requirements 3.3, 11.4 - Header rendering on each page, add "(continued)" marker on continuation pages
 */
function renderPageHeader(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, isFirstPage, config } = ctx
  const { header: headerConfig } = schema

  // Not first page and don't show header
  if (!isFirstPage && !config.showHeaderOnEachPage) {
    return ''
  }

  const parts: string[] = []

  // Logo
  if (headerConfig.showLogo && headerConfig.logoUrl) {
    parts.push(
      h('img')
        .class(cls(CSS_CLASSES.HEADER_LOGO))
        .attr('src', headerConfig.logoUrl)
        .attr('alt', 'Logo')
        .build()
    )
  }

  // Hospital name
  if (headerConfig.hospital) {
    parts.push(
      div().class(cls(CSS_CLASSES.HOSPITAL_NAME)).text(headerConfig.hospital).build()
    )
  }

  // Department name
  if (headerConfig.department) {
    parts.push(
      div().class(cls(CSS_CLASSES.DEPARTMENT_NAME)).text(headerConfig.department).build()
    )
  }

  // Form title (add suffix on continuation pages)
  if (headerConfig.title) {
    const titleText = isFirstPage
      ? headerConfig.title
      : `${headerConfig.title} ${config.continuationSuffix}`
    parts.push(
      h('h1').class(cls(CSS_CLASSES.FORM_TITLE)).text(titleText).build()
    )
  }

  return header().class(cls(CSS_CLASSES.PRINT_HEADER)).raw(parts.join('\n')).build()
}

// ==================== Footer Rendering ====================

/**
 * Render signature area
 * @requirements 11.3 - Support showSignatureOnEachPage configuration
 */
function renderSignatureArea(ctx: SinglePageContext): string {
  const { schema, data, options, isLastPage, config } = ctx

  // Only show signature on last page, unless configured to show on each page
  if (!isLastPage && !config.showSignatureOnEachPage) {
    return ''
  }

  // Find signature area section
  const signatureSection = schema.sections.find(s => s.type === 'signature-area')
  if (!signatureSection) {
    return ''
  }

  // Use section renderer to render signature area
  return renderSection(signatureSection.type, signatureSection.config, data, options)
}

/**
 * Render page footer
 * @requirements 3.4, 11.3 - Footer rendering on each page, page number display
 */
function renderPageFooter(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, pageNumber, totalPages, isLastPage, config } = ctx
  const { footer: footerConfig } = schema

  // Not last page and don't show footer (but still show page number)
  const showFooterContent = isLastPage || config.showFooterOnEachPage

  const parts: string[] = []

  // Notes (only when showing footer content)
  if (showFooterContent && footerConfig?.notes) {
    parts.push(
      h('span').class(cls(CSS_CLASSES.FOOTER_NOTES)).text(footerConfig.notes).build()
    )
  }

  // Page number (always show)
  if (footerConfig?.showPageNumber !== false) {
    const pageNumberText = formatPageNumber(
      config.pageNumberFormat,
      pageNumber,
      totalPages
    )
    parts.push(
      h('span').class(cls(CSS_CLASSES.PAGE_NUMBER)).text(pageNumberText).build()
    )
  }

  if (parts.length === 0) {
    return ''
  }

  return footer().class(cls(CSS_CLASSES.PRINT_FOOTER)).raw(parts.join('\n')).build()
}

// ==================== Table Header Repetition Rendering ====================

/**
 * Render repeated table headers
 * @requirements 11.2 - Automatically insert table headers on continuation pages
 */
function renderRepeatedHeaders(
  ctx: SinglePageContext,
  sectionMap: Map<string, PrintSection>,
  cls: ClassNameFn
): string {
  const { page, measuredItems } = ctx

  if (page.repeatedHeaders.length === 0) {
    return ''
  }

  const parts: string[] = []

  for (const headerId of page.repeatedHeaders) {
    // Find corresponding measured item
    const measuredItem = measuredItems.find(item => item.id === headerId)
    if (!measuredItem || !measuredItem.tableId) continue

    // Find corresponding table section
    const tableSection = sectionMap.get(measuredItem.tableId)
    if (!tableSection || tableSection.type !== 'table') continue

    // Render table header (only thead part)
    const tableConfig = tableSection.config as { columns: Array<{ header: string; width?: string }> }
    const headerCells = tableConfig.columns
      .map((col: { header: string; width?: string }) => h('th').style('width', col.width || null).text(col.header).build())
      .join('')
    
    parts.push(
      h('table')
        .class(cls(CSS_CLASSES.DATA_TABLE), cls(CSS_CLASSES.REPEATED_HEADER))
        .child(h('thead').child(h('tr').raw(headerCells)))
        .build()
    )
  }

  return parts.join('\n')
}

// ==================== Content Rendering ====================

/**
 * Render section with title
 * @param section - PrintSection configuration
 * @param data - Form data
 * @param options - Render options
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 */
function renderSectionWithTitle(
  section: PrintSection,
  data: FormData,
  options: RenderOptions | undefined,
  cls: ClassNameFn
): string {
  const titleHtml = section.title
    ? div().class(cls(CSS_CLASSES.SECTION_TITLE)).text(section.title).build()
    : ''
  const content = renderSection(section.type, section.config, data, options)
  return `${titleHtml}${content}`
}

/**
 * Content item render strategy mapping
 * Uses strategy pattern for easy extension of new content types
 */
type ContentRenderer = (
  item: MeasurableItem,
  sectionMap: Map<string, PrintSection>,
  data: FormData,
  options: RenderOptions | undefined,
  cls: ClassNameFn
) => string

const contentRenderers: Record<MeasurableItem['type'], ContentRenderer> = {
  section: (item, sectionMap, data, options, cls) => {
    const section = sectionMap.get(item.id)
    if (!section) return ''
    return renderSectionWithTitle(section, data, options, cls)
  },
  // Table row rendering needs to be wrapped in table, recommend using renderAllSections fallback
  'table-row': () => '',
  // Table headers are usually handled in repeatedHeaders
  'table-header': () => '',
  // Following types are handled in dedicated functions
  header: () => '',
  footer: () => '',
  signature: () => '',
}

/**
 * Render corresponding section based on content item ID
 * Note: This function is for fine-grained pagination rendering based on measured items
 * For simple scenarios, it will automatically fallback to renderAllSections
 *
 * @param itemId - Content item ID
 * @param itemMap - Pre-built measured item map (avoid repeated lookups)
 * @param sectionMap - Section ID to PrintSection mapping
 * @param data - Form data
 * @param options - Render options
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 */
function renderContentItem(
  itemId: string,
  itemMap: Map<string, MeasurableItem>,
  sectionMap: Map<string, PrintSection>,
  data: FormData,
  options: RenderOptions | undefined,
  cls: ClassNameFn
): string {
  const item = itemMap.get(itemId)
  if (!item) return ''

  const renderer = contentRenderers[item.type]
  return renderer ? renderer(item, sectionMap, data, options, cls) : ''
}

/**
 * Render all sections (fallback mode)
 * When fine-grained pagination is not available, render all sections (except signature area)
 *
 * @param ctx - Single page render context
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 */
function renderAllSections(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, data, options } = ctx
  const parts: string[] = []

  for (const section of schema.sections) {
    // Skip signature area (handled in footer)
    if (section.type === 'signature-area') continue
    parts.push(renderSectionWithTitle(section, data, options, cls))
  }

  return parts.join('\n')
}

/**
 * Render page body content
 * Prioritize fine-grained pagination rendering, fallback to full rendering when no valid measured items
 *
 * @param ctx - Single page render context
 * @param sectionMap - Section ID to PrintSection mapping
 * @param cls - Class name generator function
 * @returns Rendered HTML string
 */
function renderPageBody(
  ctx: SinglePageContext,
  sectionMap: Map<string, PrintSection>,
  cls: ClassNameFn
): string {
  const { page, data, options, measuredItems } = ctx

  const parts: string[] = []

  // Render repeated headers
  const repeatedHeaders = renderRepeatedHeaders(ctx, sectionMap, cls)
  if (repeatedHeaders) {
    parts.push(repeatedHeaders)
  }

  // Pre-build measured item map to avoid repeated O(n) lookups
  const itemMap = new Map(measuredItems.map(m => [m.id, m]))

  // Check if there are valid content item mappings
  const hasValidItems = page.items.length > 0 && page.items.some(itemId => {
    const item = itemMap.get(itemId)
    return item?.type === 'section'
  })

  if (hasValidItems) {
    // Use measured items for fine-grained rendering
    for (const itemId of page.items) {
      const content = renderContentItem(itemId, itemMap, sectionMap, data, options, cls)
      if (content) {
        parts.push(content)
      }
    }
  } else {
    // Fallback: render all sections
    parts.push(renderAllSections(ctx, cls))
  }

  return main().class(cls(CSS_CLASSES.PRINT_CONTENT)).raw(parts.join('\n')).build()
}

// ==================== Single Page Rendering ====================

/**
 * Render watermark
 */
function renderWatermark(options: WatermarkRenderOptions | undefined, cls: ClassNameFn): string {
  return renderWatermarkHtml({
    ...extractWatermarkOptions(options),
    className: cls(CSS_CLASSES.WATERMARK),
  })
}

/**
 * Render single page
 * @requirements 11.1 - Render each page as independent .print-page element
 */
function renderSinglePage(
  ctx: SinglePageContext,
  sectionMap: Map<string, PrintSection>,
  cls: ClassNameFn
): string {
  const { schema, pageNumber, options } = ctx

  const pageClasses = getPageClasses(schema, pageNumber, cls)

  // Assemble page parts
  const watermark = renderWatermark(options as WatermarkRenderOptions, cls)
  const headerHtml = renderPageHeader(ctx, cls)
  const bodyHtml = renderPageBody(ctx, sectionMap, cls)
  const signatureHtml = renderSignatureArea(ctx)
  const footerHtml = renderPageFooter(ctx, cls)

  const parts = [watermark, headerHtml, bodyHtml, signatureHtml, footerHtml]
    .filter(Boolean)
    .join('\n')

  return div()
    .class(pageClasses)
    .attr('data-page', pageNumber)
    .raw(parts)
    .build()
}

// ==================== Main Render Function ====================

/**
 * Build section ID to PrintSection mapping
 */
function buildSectionMap(
  schema: PrintSchema,
  measuredItems: MeasurableItem[]
): Map<string, PrintSection> {
  const map = new Map<string, PrintSection>()
  
  // Create mapping for each section
  schema.sections.forEach((section, index) => {
    const sectionId = `section-${index}`
    map.set(sectionId, section)
    
    // If it's a table, also use tableId as key
    if (section.type === 'table') {
      const tableConfig = section.config as { dataField: string }
      map.set(`table-${tableConfig.dataField}`, section)
    }
  })
  
  // Extract tableId mapping from measuredItems
  for (const item of measuredItems) {
    if (item.tableId && !map.has(item.tableId)) {
      // Try to find corresponding table section
      const tableSection = schema.sections.find(s => {
        if (s.type !== 'table') return false
        const config = s.config as { dataField: string }
        return `table-${config.dataField}` === item.tableId
      })
      if (tableSection) {
        map.set(item.tableId, tableSection)
      }
    }
  }
  
  return map
}

/**
 * Generate HTML document structure
 * @param title - Document title
 * @param css - CSS styles
 * @param bodyContent - Body content
 * @param isolated - Whether in isolation mode
 */
function generateHtmlDocument(
  title: string,
  css: string,
  bodyContent: string,
  isolated: boolean
): string {
  const headStyle = isolated ? '' : `\n<style>\n${css}\n</style>`
  const bodyClass = isolated ? '' : PAGINATED_DOCUMENT_CLASS

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>${headStyle}
</head>
<body class="${bodyClass}">
${bodyContent}
</body>
</html>`
}

/**
 * Generate isolated mode body content
 */
function generateIsolatedBodyContent(css: string, pagesHtml: string): string {
  return `<div class="${ISOLATION_ROOT_CLASS}">
<style>
${css}
</style>
${pagesHtml}
</div>`
}

/**
 * Render paginated HTML
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 * @requirements 3.1, 4.2 - CSS isolation and font embedding (isolation mode)
 *
 * @param context - Paginated render context
 * @returns Complete paginated HTML string
 *
 * @example
 * // Normal mode
 * const html = renderPaginatedHtml({
 *   schema: printSchema,
 *   data: formData,
 *   pageBreakResult: calculatePageBreaks(items, options),
 *   measuredItems: items,
 *   config: { showHeaderOnEachPage: true }
 * })
 *
 * @example
 * // Isolation mode - all class names have mpr- prefix, styles fully isolated
 * const html = renderPaginatedHtml({
 *   schema: printSchema,
 *   data: formData,
 *   pageBreakResult: calculatePageBreaks(items, options),
 *   measuredItems: items,
 *   config: { isolated: true }
 * })
 */
export function renderPaginatedHtml(context: PaginatedRenderContext): string {
  const { schema, data, options, pageBreakResult, measuredItems, config } = context

  const mergedConfig = mergeConfig(config)
  const theme = mergeTheme(options?.theme)
  const cls = createClassNameFn(mergedConfig.isolated)
  
  // Select CSS generation method based on isolation mode
  const baseCss = mergedConfig.isolated
    ? generateIsolatedCss(options?.theme)
    : generateCss(theme)
  const paginationCss = generatePaginationCss(mergedConfig.isolated)
  const fullCss = `${baseCss}\n${paginationCss}`

  // Build section mapping
  const sectionMap = buildSectionMap(schema, measuredItems)

  // Render each page
  const { totalPages } = pageBreakResult
  const pages = pageBreakResult.pages.map((page, i) => {
    const pageNumber = i + 1
    const pageCtx: SinglePageContext = {
      page,
      pageNumber,
      totalPages,
      isFirstPage: pageNumber === 1,
      isLastPage: pageNumber === totalPages,
      schema,
      data,
      options,
      measuredItems,
      config: mergedConfig,
      theme,
    }
    return renderSinglePage(pageCtx, sectionMap, cls)
  })

  const pagesHtml = pages.join('\n')
  
  // Generate different body content based on isolation mode
  const bodyContent = mergedConfig.isolated
    ? generateIsolatedBodyContent(fullCss, pagesHtml)
    : pagesHtml

  return generateHtmlDocument(schema.header.title, fullCss, bodyContent, mergedConfig.isolated)
}

// ==================== CSS Pagination Rules ====================

/**
 * Generate pagination-related CSS rules
 * @requirements 11.5, 11.6 - CSS page-break rules
 * @param isolated - Whether to enable isolation mode (class names have mpr- prefix)
 */
export function generatePaginationCss(isolated: boolean = false): string {
  const cls = createClassNameFn(isolated)
  const rootSelector = isolated ? `.${ISOLATION_ROOT_CLASS}` : `.${PAGINATED_DOCUMENT_CLASS}`
  
  const printPage = cls(CSS_CLASSES.PRINT_PAGE)
  const continuationPage = cls(CSS_CLASSES.CONTINUATION_PAGE)
  const formTitle = cls(CSS_CLASSES.FORM_TITLE)
  const repeatedHeader = cls(CSS_CLASSES.REPEATED_HEADER)
  const dataTable = cls(CSS_CLASSES.DATA_TABLE)
  const pageNumber = cls(CSS_CLASSES.PAGE_NUMBER)
  const sectionTitle = cls(CSS_CLASSES.SECTION_TITLE)
  const signatureArea = cls(CSS_CLASSES.SIGNATURE_AREA)
  const pageBreakBefore = cls(CSS_CLASSES.PAGE_BREAK_BEFORE)
  const pageBreakAfter = cls(CSS_CLASSES.PAGE_BREAK_AFTER)
  const noPageBreak = cls(CSS_CLASSES.NO_PAGE_BREAK)
  
  return `
/* Paginated document styles */
${rootSelector} {
  background: #f0f0f0;
}

/* Each page styles */
${rootSelector} .${printPage} {
  background: white;
  margin: 10mm auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Continuation page marker */
.${continuationPage} .${formTitle}::after {
  content: '';
}

/* Repeated header styles */
.${repeatedHeader} {
  margin-bottom: 0;
  border-bottom: none;
}

.${repeatedHeader} + .${dataTable} {
  border-top: none;
}

.${repeatedHeader} thead {
  background: #f5f5f5;
}

/* Page number styles */
.${pageNumber} {
  text-align: right;
  flex: 1;
}

/* Print styles */
@media print {
  ${rootSelector} {
    background: white;
  }

  ${rootSelector} .${printPage} {
    margin: 0;
    box-shadow: none;
    page-break-after: always;
    page-break-inside: avoid;
  }

  ${rootSelector} .${printPage}:last-child {
    page-break-after: auto;
  }

  /* Avoid page break in middle of table rows */
  .${dataTable} tr {
    page-break-inside: avoid;
  }

  /* Avoid page break after section titles */
  .${sectionTitle} {
    page-break-after: avoid;
  }

  /* Signature area avoid page break */
  .${signatureArea} {
    page-break-inside: avoid;
  }
}

/* Pagination control classes */
.${pageBreakBefore} {
  page-break-before: always;
}

.${pageBreakAfter} {
  page-break-after: always;
}

.${noPageBreak} {
  page-break-inside: avoid;
}
`
}

// ==================== Simplified API ====================

/**
 * Simplified paginated render function
 * For scenarios where pagination result is already available
 */
export function renderPaginatedHtmlSimple(
  schema: PrintSchema,
  data: FormData,
  pageBreakResult: PageBreakResult,
  measuredItems: MeasurableItem[],
  options?: RenderOptions,
  config?: PaginatedRenderConfig
): string {
  return renderPaginatedHtml({
    schema,
    data,
    options,
    pageBreakResult,
    measuredItems,
    config,
  })
}

/**
 * Create PaginatedRenderConfig from PaginationConfig
 */
export function createRenderConfigFromPaginationConfig(
  paginationConfig?: PaginationConfig
): PaginatedRenderConfig {
  if (!paginationConfig) {
    return {}
  }

  return {
    showHeaderOnEachPage: paginationConfig.display?.headerOnEachPage,
    showFooterOnEachPage: paginationConfig.display?.footerOnEachPage,
    showSignatureOnEachPage: paginationConfig.display?.signatureOnEachPage,
    continuationSuffix: paginationConfig.headerConfig?.continuationSuffix,
    pageNumberFormat: paginationConfig.footerConfig?.pageNumberFormat,
  }
}
