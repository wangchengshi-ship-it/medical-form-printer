/**
 * @fileoverview 分页渲染器
 * @module pagination/paginated-renderer
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-02
 * @modified 2026-01-03
 *
 * @description
 * 将分页结果渲染为多页 HTML，每页独立且可打印。
 * 支持：
 * - 每页独立的 .print-page 元素
 * - 每页页眉渲染（续页添加 "(续)" 标记）
 * - 每页页脚渲染（页码显示）
 * - 续页自动插入表格表头
 * - CSS 分页规则
 *
 * @requirements
 * - 11.1: 每页渲染为独立的 .print-page 元素
 * - 11.2: 续页自动插入表格表头
 * - 11.3: 显示页码（"第 X 页 / 共 Y 页"）
 * - 11.4: 续页标题添加 "(续)" 标记
 * - 11.5: 支持 CSS page-break 规则
 * - 11.6: 保持跨页样式一致性
 *
 * @dependencies
 * - ./types.ts - 类型定义
 * - ./page-break-calculator.ts - 分页算法
 * - ../renderer/section-renderers - 区块渲染器
 * - ../styles - 样式系统
 * - ../utils/html-builder.ts - HTML 构建器
 *
 * @usedBy
 * - ../index.ts - 库主入口
 * - international-postpartum-frontend - 前端打印模块
 */

import type { PrintSchema, FormData, PrintSection } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import type { Theme } from '../types/theme'
import type { PageBreakResult, PageContent, MeasurableItem, PaginationConfig, PageDimensions } from './types'
import { renderSection } from '../renderer/section-renderers'
import { generateCss, generateIsolatedCss, mergeTheme, namespaceClass, ISOLATION_ROOT_CLASS } from '../styles'
import { escapeHtml, h, div, header, footer, main, renderWatermarkHtml, extractWatermarkOptions } from '../utils'
import { PAGE_16K } from './page-dimensions'

// ==================== 类型定义 ====================

/**
 * 分页渲染配置
 */
export interface PaginatedRenderConfig {
  /** 是否在每页显示页眉 */
  showHeaderOnEachPage?: boolean
  /** 是否在每页显示页脚 */
  showFooterOnEachPage?: boolean
  /** 是否在每页显示签名区域 */
  showSignatureOnEachPage?: boolean
  /** 续页标题后缀，默认 "(续)" */
  continuationSuffix?: string
  /** 页码格式，默认 "第 {current} 页 / 共 {total} 页" */
  pageNumberFormat?: string
  /** 页面尺寸配置 */
  pageDimensions?: PageDimensions
  /**
   * 是否启用隔离模式
   * 启用后：
   * - 所有类名带 mpr- 前缀
   * - 样式完全隔离，不受外部影响
   * - 字体强制使用内嵌的思源宋体 SC
   * @default false
   */
  isolated?: boolean
}

/**
 * 分页渲染上下文
 */
export interface PaginatedRenderContext {
  /** 打印布局配置 */
  schema: PrintSchema
  /** 表单数据 */
  data: FormData
  /** 渲染选项 */
  options?: RenderOptions
  /** 分页结果 */
  pageBreakResult: PageBreakResult
  /** 所有可测量内容项 */
  measuredItems: MeasurableItem[]
  /** 分页渲染配置 */
  config?: PaginatedRenderConfig
}

/**
 * 单页渲染上下文
 */
interface SinglePageContext {
  /** 页面内容 */
  page: PageContent
  /** 当前页码 */
  pageNumber: number
  /** 总页数 */
  totalPages: number
  /** 是否为首页 */
  isFirstPage: boolean
  /** 是否为末页 */
  isLastPage: boolean
  /** 打印布局配置 */
  schema: PrintSchema
  /** 表单数据 */
  data: FormData
  /** 渲染选项 */
  options?: RenderOptions
  /** 所有可测量内容项 */
  measuredItems: MeasurableItem[]
  /** 分页渲染配置 */
  config: Required<PaginatedRenderConfig>
  /** 主题配置 */
  theme: Theme
}

// ==================== CSS 类名常量 ====================

/** CSS 类名常量，避免魔法字符串 */
const CSS_CLASSES = {
  // 页面结构
  PRINT_PAGE: 'print-page',
  CONTINUATION_PAGE: 'continuation-page',
  PRINT_HEADER: 'print-header',
  PRINT_FOOTER: 'print-footer',
  PRINT_CONTENT: 'print-content',
  
  // 页眉元素
  HEADER_LOGO: 'header-logo',
  HOSPITAL_NAME: 'hospital-name',
  DEPARTMENT_NAME: 'department-name',
  FORM_TITLE: 'form-title',
  
  // 页脚元素
  FOOTER_NOTES: 'footer-notes',
  PAGE_NUMBER: 'page-number',
  
  // 表格
  DATA_TABLE: 'data-table',
  REPEATED_HEADER: 'repeated-header',
  SECTION_TITLE: 'section-title',
  SIGNATURE_AREA: 'signature-area',
  
  // 分页控制
  PAGE_BREAK_BEFORE: 'page-break-before',
  PAGE_BREAK_AFTER: 'page-break-after',
  NO_PAGE_BREAK: 'no-page-break',
  
  // 水印
  WATERMARK: 'watermark',
} as const

/** 非隔离模式的文档根类名 */
const PAGINATED_DOCUMENT_CLASS = 'paginated-document'

// ==================== 类型定义 ====================

/** 类名生成函数类型 */
type ClassNameFn = (name: string) => string

/** 水印渲染选项类型 */
type WatermarkRenderOptions = RenderOptions & { watermark?: string; watermarkOpacity?: number }

// ==================== 默认配置 ====================

/**
 * 默认分页渲染配置
 */
export const DEFAULT_PAGINATED_RENDER_CONFIG: Required<PaginatedRenderConfig> = {
  showHeaderOnEachPage: true,
  showFooterOnEachPage: true,
  showSignatureOnEachPage: false,
  continuationSuffix: '(续)',
  pageNumberFormat: '第 {current} 页 / 共 {total} 页',
  pageDimensions: PAGE_16K,
  isolated: false,
}

// ==================== 辅助函数 ====================

/**
 * 合并分页渲染配置
 */
function mergeConfig(config?: PaginatedRenderConfig): Required<PaginatedRenderConfig> {
  return {
    ...DEFAULT_PAGINATED_RENDER_CONFIG,
    ...config,
  }
}

/** 恒等函数，用于非隔离模式 */
const identity = (name: string): string => name

/**
 * 创建类名生成函数
 * @param isolated - 是否启用隔离模式
 * @returns 类名生成函数
 */
function createClassNameFn(isolated: boolean): ClassNameFn {
  return isolated ? namespaceClass : identity
}

/**
 * 格式化页码
 * @param format - 页码格式字符串
 * @param current - 当前页码
 * @param total - 总页数
 */
function formatPageNumber(format: string, current: number, total: number): string {
  return format
    .replace('{current}', String(current))
    .replace('{total}', String(total))
}

/**
 * 获取页面 CSS 类名
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

// ==================== 页眉渲染 ====================

/**
 * 渲染页眉
 * @requirements 3.3, 11.4 - 每页页眉渲染，续页添加 "(续)" 标记
 */
function renderPageHeader(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, isFirstPage, config } = ctx
  const { header: headerConfig } = schema

  // 非首页且不显示页眉
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

  // 医院名称
  if (headerConfig.hospital) {
    parts.push(
      div().class(cls(CSS_CLASSES.HOSPITAL_NAME)).text(headerConfig.hospital).build()
    )
  }

  // 科室名称
  if (headerConfig.department) {
    parts.push(
      div().class(cls(CSS_CLASSES.DEPARTMENT_NAME)).text(headerConfig.department).build()
    )
  }

  // 表单标题（续页添加后缀）
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

// ==================== 页脚渲染 ====================

/**
 * 渲染签名区域
 * @requirements 11.3 - 支持 showSignatureOnEachPage 配置
 */
function renderSignatureArea(ctx: SinglePageContext): string {
  const { schema, data, options, isLastPage, config } = ctx

  // 只在末页显示签名，除非配置了每页显示
  if (!isLastPage && !config.showSignatureOnEachPage) {
    return ''
  }

  // 查找签名区域 section
  const signatureSection = schema.sections.find(s => s.type === 'signature-area')
  if (!signatureSection) {
    return ''
  }

  // 使用 section renderer 渲染签名区域
  return renderSection(signatureSection.type, signatureSection.config, data, options)
}

/**
 * 渲染页脚
 * @requirements 3.4, 11.3 - 每页页脚渲染，页码显示
 */
function renderPageFooter(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, pageNumber, totalPages, isLastPage, config } = ctx
  const { footer: footerConfig } = schema

  // 非末页且不显示页脚（但仍显示页码）
  const showFooterContent = isLastPage || config.showFooterOnEachPage

  const parts: string[] = []

  // 备注（仅在显示页脚内容时）
  if (showFooterContent && footerConfig?.notes) {
    parts.push(
      h('span').class(cls(CSS_CLASSES.FOOTER_NOTES)).text(footerConfig.notes).build()
    )
  }

  // 页码（始终显示）
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

// ==================== 表头重复渲染 ====================

/**
 * 渲染重复的表格表头
 * @requirements 11.2 - 续页自动插入表格表头
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
    // 找到对应的测量项
    const measuredItem = measuredItems.find(item => item.id === headerId)
    if (!measuredItem || !measuredItem.tableId) continue

    // 找到对应的表格 section
    const tableSection = sectionMap.get(measuredItem.tableId)
    if (!tableSection || tableSection.type !== 'table') continue

    // 渲染表格表头（只渲染 thead 部分）
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

// ==================== 内容渲染 ====================

/**
 * 渲染带标题的 section
 * @param section - PrintSection 配置
 * @param data - 表单数据
 * @param options - 渲染选项
 * @param cls - 类名生成函数
 * @returns 渲染后的 HTML 字符串
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
 * 内容项渲染策略映射
 * 使用策略模式便于扩展新的内容类型
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
  // 表格行渲染需要包裹在表格中，建议使用 renderAllSections 降级处理
  'table-row': () => '',
  // 表格表头通常在 repeatedHeaders 中处理
  'table-header': () => '',
  // 以下类型在其他专用函数中处理
  header: () => '',
  footer: () => '',
  signature: () => '',
}

/**
 * 根据内容项 ID 渲染对应的区块
 * 注意：此函数用于基于测量项的精细分页渲染
 * 对于简单场景，会自动降级到 renderAllSections
 *
 * @param itemId - 内容项 ID
 * @param itemMap - 预构建的测量项映射（避免重复查找）
 * @param sectionMap - section ID 到 PrintSection 的映射
 * @param data - 表单数据
 * @param options - 渲染选项
 * @param cls - 类名生成函数
 * @returns 渲染后的 HTML 字符串
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
 * 渲染所有 sections（降级模式）
 * 当精细分页不可用时，渲染所有 sections（除签名区域外）
 *
 * @param ctx - 单页渲染上下文
 * @param cls - 类名生成函数
 * @returns 渲染后的 HTML 字符串
 */
function renderAllSections(ctx: SinglePageContext, cls: ClassNameFn): string {
  const { schema, data, options } = ctx
  const parts: string[] = []

  for (const section of schema.sections) {
    // 跳过签名区域（在页脚处理）
    if (section.type === 'signature-area') continue
    parts.push(renderSectionWithTitle(section, data, options, cls))
  }

  return parts.join('\n')
}

/**
 * 渲染页面主体内容
 * 优先使用精细分页渲染，无有效测量项时降级到全量渲染
 *
 * @param ctx - 单页渲染上下文
 * @param sectionMap - section ID 到 PrintSection 的映射
 * @param cls - 类名生成函数
 * @returns 渲染后的 HTML 字符串
 */
function renderPageBody(
  ctx: SinglePageContext,
  sectionMap: Map<string, PrintSection>,
  cls: ClassNameFn
): string {
  const { page, data, options, measuredItems } = ctx

  const parts: string[] = []

  // 渲染重复的表头
  const repeatedHeaders = renderRepeatedHeaders(ctx, sectionMap, cls)
  if (repeatedHeaders) {
    parts.push(repeatedHeaders)
  }

  // 预构建测量项映射，避免重复 O(n) 查找
  const itemMap = new Map(measuredItems.map(m => [m.id, m]))

  // 检查是否有有效的内容项映射
  const hasValidItems = page.items.length > 0 && page.items.some(itemId => {
    const item = itemMap.get(itemId)
    return item?.type === 'section'
  })

  if (hasValidItems) {
    // 使用测量项精细渲染
    for (const itemId of page.items) {
      const content = renderContentItem(itemId, itemMap, sectionMap, data, options, cls)
      if (content) {
        parts.push(content)
      }
    }
  } else {
    // 降级：渲染所有 sections
    parts.push(renderAllSections(ctx, cls))
  }

  return main().class(cls(CSS_CLASSES.PRINT_CONTENT)).raw(parts.join('\n')).build()
}

// ==================== 单页渲染 ====================

/**
 * 渲染水印
 */
function renderWatermark(options: WatermarkRenderOptions | undefined, cls: ClassNameFn): string {
  return renderWatermarkHtml({
    ...extractWatermarkOptions(options),
    className: cls(CSS_CLASSES.WATERMARK),
  })
}

/**
 * 渲染单个页面
 * @requirements 11.1 - 每页渲染为独立的 .print-page 元素
 */
function renderSinglePage(
  ctx: SinglePageContext,
  sectionMap: Map<string, PrintSection>,
  cls: ClassNameFn
): string {
  const { schema, pageNumber, options } = ctx

  const pageClasses = getPageClasses(schema, pageNumber, cls)

  // 组装页面各部分
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

// ==================== 主渲染函数 ====================

/**
 * 构建 section ID 到 PrintSection 的映射
 */
function buildSectionMap(
  schema: PrintSchema,
  measuredItems: MeasurableItem[]
): Map<string, PrintSection> {
  const map = new Map<string, PrintSection>()
  
  // 为每个 section 创建映射
  schema.sections.forEach((section, index) => {
    const sectionId = `section-${index}`
    map.set(sectionId, section)
    
    // 如果是表格，也用 tableId 作为键
    if (section.type === 'table') {
      const tableConfig = section.config as { dataField: string }
      map.set(`table-${tableConfig.dataField}`, section)
    }
  })
  
  // 从 measuredItems 中提取 tableId 映射
  for (const item of measuredItems) {
    if (item.tableId && !map.has(item.tableId)) {
      // 尝试找到对应的表格 section
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
 * 生成 HTML 文档结构
 * @param title - 文档标题
 * @param css - CSS 样式
 * @param bodyContent - body 内容
 * @param isolated - 是否隔离模式
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
 * 生成隔离模式的 body 内容
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
 * 渲染分页 HTML
 * @requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 * @requirements 3.1, 4.2 - CSS 隔离和字体嵌入（隔离模式）
 *
 * @param context - 分页渲染上下文
 * @returns 完整的分页 HTML 字符串
 *
 * @example
 * // 普通模式
 * const html = renderPaginatedHtml({
 *   schema: printSchema,
 *   data: formData,
 *   pageBreakResult: calculatePageBreaks(items, options),
 *   measuredItems: items,
 *   config: { showHeaderOnEachPage: true }
 * })
 *
 * @example
 * // 隔离模式 - 所有类名带 mpr- 前缀，样式完全隔离
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
  
  // 根据隔离模式选择 CSS 生成方式
  const baseCss = mergedConfig.isolated
    ? generateIsolatedCss(options?.theme)
    : generateCss(theme)
  const paginationCss = generatePaginationCss(mergedConfig.isolated)
  const fullCss = `${baseCss}\n${paginationCss}`

  // 构建 section 映射
  const sectionMap = buildSectionMap(schema, measuredItems)

  // 渲染每一页
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
  
  // 根据隔离模式生成不同的 body 内容
  const bodyContent = mergedConfig.isolated
    ? generateIsolatedBodyContent(fullCss, pagesHtml)
    : pagesHtml

  return generateHtmlDocument(schema.header.title, fullCss, bodyContent, mergedConfig.isolated)
}

// ==================== CSS 分页规则 ====================

/**
 * 生成分页相关的 CSS 规则
 * @requirements 11.5, 11.6 - CSS page-break 规则
 * @param isolated - 是否启用隔离模式（类名带 mpr- 前缀）
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
/* 分页文档样式 */
${rootSelector} {
  background: #f0f0f0;
}

/* 每页样式 */
${rootSelector} .${printPage} {
  background: white;
  margin: 10mm auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 续页标记 */
.${continuationPage} .${formTitle}::after {
  content: '';
}

/* 重复的表头样式 */
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

/* 页码样式 */
.${pageNumber} {
  text-align: right;
  flex: 1;
}

/* 打印样式 */
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

  /* 避免在表格行中间分页 */
  .${dataTable} tr {
    page-break-inside: avoid;
  }

  /* 避免在区块标题后分页 */
  .${sectionTitle} {
    page-break-after: avoid;
  }

  /* 签名区域避免分页 */
  .${signatureArea} {
    page-break-inside: avoid;
  }
}

/* 分页控制类 */
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

// ==================== 简化 API ====================

/**
 * 简化的分页渲染函数
 * 适用于已经有分页结果的场景
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
 * 从 PaginationConfig 创建 PaginatedRenderConfig
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
