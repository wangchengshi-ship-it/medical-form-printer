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

// 样式
export { defaultTheme, generateCss, mergeTheme } from './styles'

// 格式化器
export {
  formatDate,
  formatBoolean,
  formatNumber,
  formatValue,
  isChecked,
} from './formatters'

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
} from './types/theme'
