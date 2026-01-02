/**
 * @fileoverview 医疗表单打印渲染库 - 主入口
 * @module @medical/print-renderer
 * @version 0.1.0
 * 
 * @description
 * 将结构化表单数据渲染为可打印的 HTML。
 * 此入口可在浏览器和 Node.js 环境中使用。
 * 
 * @example
 * ```typescript
 * import { renderToHtml } from '@medical/print-renderer'
 * 
 * const html = renderToHtml(printSchema, formData, {
 *   theme: { colors: { primary: '#000' } },
 *   watermark: '仅供内部使用'
 * })
 * ```
 */

// 核心渲染
export { renderToHtml } from './renderer'
export { registerSectionRenderer, getSectionRenderer } from './renderer'
export type { SectionRenderer } from './renderer'

// Strategy 模式
export {
  StrategyContext,
  createDefaultStrategyContext,
} from './renderer'
export type { SectionRenderStrategy } from './renderer'

// Factory 模式
export {
  SectionRendererFactory,
  getDefaultSectionRendererFactory,
  FormatterFactory,
  getDefaultFormatterFactory,
} from './renderer'
export type { RendererCreator, Formatter, FormatterConfig } from './renderer'

// Builder 模式
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

// Composite 模式
export {
  LeafSection,
  ContainerSection,
  SectionTreeTraverser,
  createSectionComponent,
  createSectionTree,
  renderSectionTree,
} from './renderer'
export type { SectionComponent } from './renderer'

// Template Method 模式
export {
  AbstractPageRenderer,
  SinglePageRenderer,
  PaginatedPageRenderer,
  createSinglePageRenderer,
  createPaginatedPageRenderer,
} from './renderer'
export type { PageRenderContext } from './renderer'

// Visitor 模式
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

// 样式
export {
  defaultTheme,
  generateCss,
  mergeTheme,
  // 基准单位系统
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
  // 内联样式
  createInlineStyles,
  styleToString,
  mergeStyles,
  getPageStyles,
  defaultInlineStyles,
} from './styles'
export type { Unit, StyleObject, InlineStyleMap } from './styles'

// 格式化器
export {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
  isChecked,
} from './formatters'

// HTML 构建工具
export {
  HtmlBuilder,
  h,
  fragment,
  when,
  each,
  escapeHtml,
  escapeAttr,
} from './utils'

// 类型
export type {
  // PrintSchema 相关
  PrintSchema,
  PrintHeader,
  PrintFooter,
  PrintSection,
  SectionType,
  SectionConfig,
  PageSize,
  PageOrientation,
  // 区块配置
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
  // 选项
  RenderOptions,
  PdfOptions,
  MergeOptions,
  MergeDocumentItem,
  DateFormatOptions,
} from './types/options'

export type {
  // 主题
  Theme,
  FontConfig,
  ColorConfig,
  SpacingConfig,
  FontSizeConfig,
  SizeMultipliers,
  ScaledThemeConfig,
} from './types/theme'

// 分页模块
export {
  // 页面尺寸预设
  PAGE_16K,
  PAGE_A4,
  PAGE_A5,
  PAGE_PRESETS,
  // 单位转换
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  // 尺寸计算
  calculateUsableHeight,
  calculateUsableWidth,
  calculateUsableHeightMm,
  calculateUsableWidthMm,
  getPageDimensions,
  createPageDimensions,
  // 分页算法
  calculatePageBreaks,
  calculatePageBreaksSimple,
  findTableHeader,
  buildTableHeaderMap,
  validatePageBreakResult,
  getPageContentHeight,
  // 溢出字段处理
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  processOverflowFields,
  hasAnyOverflowContent,
  // 分页渲染器
  renderPaginatedHtml,
  renderPaginatedHtmlSimple,
  generatePaginationCss,
  createRenderConfigFromPaginationConfig,
  DEFAULT_PAGINATED_RENDER_CONFIG,
  // Composable 风格 API
  usePrintPagination,
  // 常量
  DEFAULT_DPI,
  MM_PER_INCH,
} from './pagination'

export type {
  // 分页类型
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
  // 分页渲染器类型
  PaginatedRenderConfig,
  PaginatedRenderContext,
} from './pagination'
