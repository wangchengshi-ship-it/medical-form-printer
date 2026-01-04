/**
 * @fileoverview Medical form print renderer library - Main entry
 * @module medical-form-printer
 * @version 0.1.0
 *
 * @description
 * Renders structured form data to printable HTML.
 * This entry point can be used in both browser and Node.js environments.
 *
 * @example
 * ```typescript
 * import { renderToHtml } from 'medical-form-printer'
 *
 * const html = renderToHtml(printSchema, formData, {
 *   theme: { colors: { primary: '#000' } },
 *   watermark: 'Internal Use Only'
 * })
 * ```
 */

// Core rendering
export { renderToHtml, renderToIsolatedHtml, renderToIsolatedFragment } from './renderer'
export type { IsolatedRenderOptions } from './renderer/isolated-html-renderer'
export { registerSectionRenderer, getSectionRenderer } from './renderer'
export type { SectionRenderer } from './renderer'

// Font module
export {
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_STYLE,
  getFontDataUrl,
  getFontCss,
  isFontLoaded,
  waitForFonts,
  FontLoadError,
} from './fonts'
export type { FontLoadOptions } from './fonts'

// Strategy pattern
export {
  StrategyContext,
  createDefaultStrategyContext,
} from './renderer'
export type { SectionRenderStrategy } from './renderer'

// Factory pattern
export {
  SectionRendererFactory,
  getDefaultSectionRendererFactory,
  FormatterFactory,
  getDefaultFormatterFactory,
} from './renderer'
export type { RendererCreator, Formatter, FormatterConfig } from './renderer'

// Builder pattern
export {
  HtmlElementBuilder,
  PageBuilder,
  TableBuilder,
  div,
  span,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  p,
  header,
  footer,
  main,
  h1,
} from './renderer'
export type { PageConfig, HeaderConfig, FooterConfig, ColumnConfig } from './renderer'

// Composite pattern
export {
  LeafSection,
  ContainerSection,
  SectionTreeTraverser,
  createSectionComponent,
  createSectionTree,
  renderSectionTree,
} from './renderer'
export type { SectionComponent } from './renderer'

// Template Method pattern
export {
  AbstractPageRenderer,
  SinglePageRenderer,
  PaginatedPageRenderer,
  createSinglePageRenderer,
  createPaginatedPageRenderer,
} from './renderer'
export type { PageRenderContext } from './renderer'

// Visitor pattern
export {
  FormatVisitor,
  ValidationVisitor,
  MeasureVisitor,
  FormDataTraverser,
  createFormatVisitor,
  createValidationVisitor,
  createMeasureVisitor,
  createFormDataTraverser,
} from './renderer'
export type {
  FormDataVisitor,
  FieldInfo,
  ValidationResult,
  MeasureResult,
} from './renderer'

// Styles
export {
  defaultTheme,
  generateCss,
  generateIsolatedCss,
  mergeTheme,
  // CSS isolation
  CSS_NAMESPACE,
  ISOLATION_ROOT_CLASS,
  namespaceClass,
  namespaceClasses,
  getNamespacedClass,
  // Base unit system
  createScaledTheme,
  createThemeWithBaseUnit,
  defaultScaledConfig,
  defaultFonts,
  defaultColors,
  defaultMultipliers,
  DEFAULT_BASE_UNIT,
  UNIT_CONVERSIONS,
  SIZE_MULTIPLIERS,
  scaleValue,
  convertFromMm,
  convertToMm,
  formatSize,
  formatPadding,
  // Inline styles
  createInlineStyles,
  styleToString,
  mergeStyles,
  getPageStyles,
  defaultInlineStyles,
} from './styles'
export type { Unit, StyleObject, InlineStyleMap } from './styles'

// Formatters
export {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
  isChecked,
} from './formatters'

// HTML builder utilities
export {
  HtmlBuilder,
  h,
  fragment,
  when,
  each,
  escapeHtml,
  escapeAttr,
  // Watermark utilities
  clamp,
  normalizeOpacity,
  renderWatermarkHtml,
  extractWatermarkOptions,
} from './utils'
export type { WatermarkOptions } from './utils'

// Types
export type {
  // PrintSchema related
  PrintSchema,
  PrintHeader,
  PrintFooter,
  PrintSection,
  SectionType,
  SectionConfig,
  PageSize,
  PageOrientation,
  // Section configs
  InfoGridConfig,
  InfoGridRow,
  InfoGridCell,
  TableConfig,
  TableColumn,
  CheckboxGridConfig,
  CheckboxOption,
  SignatureConfig,
  SignatureField,
  NotesConfig,
  FreeTextConfig,
  CellType,
  FormData,
} from './types/print-schema'

export type {
  // Options
  RenderOptions,
  PdfOptions,
  MergeOptions,
  MergeDocumentItem,
  DateFormatOptions,
} from './types/options'

export type {
  // Theme
  Theme,
  FontConfig,
  ColorConfig,
  SpacingConfig,
  FontSizeConfig,
  SizeMultipliers,
  ScaledThemeConfig,
} from './types/theme'

// Pagination module
export {
  // Page size presets
  PAGE_16K,
  PAGE_A4,
  PAGE_A5,
  PAGE_PRESETS,
  // Unit conversion
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  // Dimension calculation
  calculateUsableHeight,
  calculateUsableWidth,
  calculateUsableHeightMm,
  calculateUsableWidthMm,
  getPageDimensions,
  createPageDimensions,
  // Pagination algorithm
  calculatePageBreaks,
  calculatePageBreaksSimple,
  findTableHeader,
  buildTableHeaderMap,
  validatePageBreakResult,
  getPageContentHeight,
  // Overflow field handling
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  processOverflowFields,
  hasAnyOverflowContent,
  // Overflow pagination rendering
  isOverflowSection,
  findOverflowFieldLabel,
  findOverflowFieldCell,
  getOverflowFieldsFromConfig,
  getOverflowFieldNames,
  renderOverflowFirstLine,
  renderOverflowContinuation,
  renderOverflowContinuationPage,
  mergeOverflowTextConfig,
  hasAnyContinuationContent,
  OVERFLOW_CSS_CLASSES,
  // Paginated renderer (deprecated - use strategy pattern instead)
  /** @deprecated Use createDefaultPaginationContext().render() or strategy.render() instead */
  renderPaginatedHtml,
  /** @deprecated Use createDefaultPaginationContext().render() or strategy.render() instead */
  renderPaginatedHtmlSimple,
  generatePaginationCss,
  createRenderConfigFromPaginationConfig,
  DEFAULT_PAGINATED_RENDER_CONFIG,
  // Composable style API (deprecated - use strategy pattern instead)
  /** @deprecated Use createDefaultPaginationContext() or strategy classes instead */
  usePrintPagination,
  // Constants
  DEFAULT_DPI,
  MM_PER_INCH,
  PAGINATION_DEFAULTS,
  MEASURABLE_ITEM_TYPES,
  // Overflow text i18n constants
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
  // Strategy pattern (recommended API)
  PaginationContext,
  createDefaultPaginationContext,
  SmartPaginationStrategy,
  OverflowPaginationStrategy,
} from './pagination'

export type {
  // Pagination types
  PageDimensions,
  MeasurableItemType,
  MeasurableItem,
  PageContent,
  PageBreakResult,
  OverflowFieldConfig,
  PageHeaderConfig,
  PageFooterConfig,
  SmartPaginationConfig,
  PaginationConfig,
  PageBreakOptions,
  OverflowFieldResult,
  // Overflow text i18n type
  OverflowTextConfig,
  // Overflow pagination types
  OverflowRenderContext,
  OverflowContinuationPageContext,
  // Paginated renderer types
  PaginatedRenderConfig,
  PaginatedRenderContext,
  // Strategy pattern types
  PaginationStrategy,
  PrintSchemaWithPagination,
  PaginationRenderOptions,
} from './pagination'
