/**
 * @fileoverview Template Method 模式 - 页面渲染流程
 * @module renderer/templates
 * @version 1.2.0
 * @author Kiro
 * @modified 2026-01-03
 *
 * @description
 * 使用 Template Method 模式定义页面渲染的骨架流程。
 * AbstractPageRenderer 定义渲染步骤：renderHeader → renderBody → renderFooter
 * 子类实现具体步骤：SinglePageRenderer、PaginatedPageRenderer
 *
 * v1.2.0 优化：
 * - 增强类型安全，引入 PaginatedPageContext 消除非空断言
 * - 页码格式化提取为可配置项
 * - 提取公共页脚渲染逻辑
 * - 添加 formatPageNumber 工具函数
 *
 * v1.1.0 优化：
 * - 提取公共页眉渲染逻辑到基类
 * - 提取 CSS 类名常量
 * - 改进类型安全（水印选项类型守卫）
 * - 减少子类重复代码
 */

import type { PrintSchema, FormData, PrintSection } from '../../types/print-schema'
import type { RenderOptions, PdfOptions } from '../../types/options'
import { renderSection } from '../section-renderers'
import { escapeHtml, renderWatermarkHtml, extractWatermarkOptions } from '../../utils'

// ==================== CSS 类名常量 ====================

/** CSS 类名常量，避免魔法字符串 */
const CSS = {
  PRINT_PAGE: 'print-page',
  PRINT_HEADER: 'print-header',
  PRINT_BODY: 'print-body',
  PRINT_FOOTER: 'print-footer',
  HOSPITAL_NAME: 'hospital-name',
  DEPARTMENT: 'department',
  FORM_TITLE: 'form-title',
  FOOTER_NOTES: 'footer-notes',
  PAGE_NUMBER: 'page-number',
} as const

// ==================== 工具函数 ====================

/**
 * 格式化页码显示
 * @param current - 当前页码
 * @param total - 总页数
 * @param format - 格式模板，默认 "第 {current} 页 / 共 {total} 页"
 */
function formatPageNumber(
  current: number,
  total: number,
  format = '第 {current} 页 / 共 {total} 页'
): string {
  return format.replace('{current}', String(current)).replace('{total}', String(total))
}

// ==================== 类型定义 ====================

/**
 * 页面渲染上下文（基础）
 * 包含渲染过程中需要的所有数据
 */
export interface PageRenderContext {
  schema: PrintSchema
  data: FormData
  options?: RenderOptions | PdfOptions
  pageNumber?: number
  totalPages?: number
}

/**
 * 分页渲染上下文（类型安全）
 * pageNumber 和 totalPages 为必填，消除非空断言
 */
export interface PaginatedPageContext extends PageRenderContext {
  pageNumber: number
  totalPages: number
}

/**
 * 水印选项类型守卫
 */
function hasWatermarkOptions(
  options?: RenderOptions | PdfOptions
): options is PdfOptions & { watermark?: string; watermarkOpacity?: number } {
  return options !== undefined && 'watermark' in options
}

// ==================== 抽象基类 ====================

/**
 * 抽象页面渲染器（Template Method 模式的 AbstractClass）
 * 定义页面渲染的骨架流程，子类实现具体步骤
 */
export abstract class AbstractPageRenderer {
  /**
   * 渲染页面（Template Method）
   * 定义渲染流程：renderHeader → renderBody → renderFooter
   * @param context - 渲染上下文
   * @returns HTML 字符串
   */
  render(context: PageRenderContext): string {
    const parts: string[] = [
      this.renderPageStart(context),
      this.renderHeader(context),
      this.renderBody(context),
      this.renderFooter(context),
      this.renderPageEnd(context),
    ]
    return parts.filter(Boolean).join('\n')
  }

  /**
   * 渲染页面开始标签
   * @param _context - 渲染上下文（保留用于子类覆盖）
   */
  protected renderPageStart(_context: PageRenderContext): string {
    return `<div class="${CSS.PRINT_PAGE}">`
  }

  /**
   * 渲染页面结束标签
   * @param _context - 渲染上下文（保留用于子类覆盖）
   */
  protected renderPageEnd(_context: PageRenderContext): string {
    return '</div>'
  }

  /**
   * 渲染页眉（抽象方法，子类必须实现）
   * @param context - 渲染上下文
   */
  protected abstract renderHeader(context: PageRenderContext): string

  /**
   * 渲染主体内容（抽象方法，子类必须实现）
   * @param context - 渲染上下文
   */
  protected abstract renderBody(context: PageRenderContext): string

  /**
   * 渲染页脚（抽象方法，子类必须实现）
   * @param context - 渲染上下文
   */
  protected abstract renderFooter(context: PageRenderContext): string

  /**
   * 渲染水印（钩子方法，子类可选覆盖）
   * 使用类型守卫确保类型安全
   * @param context - 渲染上下文
   */
  protected renderWatermark(context: PageRenderContext): string {
    const { options } = context
    if (!hasWatermarkOptions(options)) return ''
    return renderWatermarkHtml(extractWatermarkOptions(options))
  }

  /**
   * 渲染区块列表
   * @param sections - 区块配置数组
   * @param data - 表单数据
   * @param options - 渲染选项
   */
  protected renderSections(
    sections: PrintSection[],
    data: FormData,
    options?: RenderOptions
  ): string {
    return sections
      .map(section => renderSection(section.type, section.config, data, options))
      .join('\n')
  }

  /**
   * 渲染页眉内容（公共逻辑，供子类复用）
   * @param schema - 打印配置
   * @param titleSuffix - 标题后缀（如续页的 "(续)"）
   * @returns 页眉内容 HTML 数组
   */
  protected renderHeaderContent(schema: PrintSchema, titleSuffix = ''): string[] {
    const parts: string[] = []

    if (schema.header?.hospital) {
      parts.push(`<div class="${CSS.HOSPITAL_NAME}">${escapeHtml(schema.header.hospital)}</div>`)
    }
    if (schema.header?.department) {
      parts.push(`<div class="${CSS.DEPARTMENT}">${escapeHtml(schema.header.department)}</div>`)
    }
    if (schema.header?.title) {
      parts.push(`<h1 class="${CSS.FORM_TITLE}">${escapeHtml(schema.header.title)}${titleSuffix}</h1>`)
    }

    return parts
  }

  /**
   * 渲染主体内容包装（公共逻辑，供子类复用）
   * @param context - 渲染上下文
   * @param sections - 要渲染的区块
   * @returns 主体 HTML
   */
  protected renderBodyWrapper(context: PageRenderContext, sections: PrintSection[]): string {
    const { data, options } = context
    const parts: string[] = [`<main class="${CSS.PRINT_BODY}">`]

    const watermark = this.renderWatermark(context)
    if (watermark) {
      parts.push(watermark)
    }

    parts.push(this.renderSections(sections, data, options))
    parts.push('</main>')

    return parts.join('\n')
  }
}

// ==================== 单页渲染器 ====================

/**
 * 单页渲染器
 * 将所有内容渲染到单个页面
 */
export class SinglePageRenderer extends AbstractPageRenderer {
  protected renderHeader(context: PageRenderContext): string {
    const { schema } = context
    const content = this.renderHeaderContent(schema)
    if (content.length === 0) return ''

    return [
      `<header class="${CSS.PRINT_HEADER}">`,
      ...content,
      '</header>',
    ].join('\n')
  }

  protected renderBody(context: PageRenderContext): string {
    return this.renderBodyWrapper(context, context.schema.sections)
  }

  protected renderFooter(context: PageRenderContext): string {
    const { schema } = context
    if (!schema.footer?.notes) return ''

    return [
      `<footer class="${CSS.PRINT_FOOTER}">`,
      `<div class="${CSS.FOOTER_NOTES}">${escapeHtml(schema.footer.notes)}</div>`,
      '</footer>',
    ].join('\n')
  }
}

// ==================== 分页渲染器 ====================

/**
 * 分页渲染器选项
 */
interface PaginatedRenderOptions {
  showHeaderOnEachPage?: boolean
  showFooterOnEachPage?: boolean
  showPageNumber?: boolean
}

/**
 * 分页渲染器
 * 支持多页渲染，每页独立的页眉页脚
 */
export class PaginatedPageRenderer extends AbstractPageRenderer {
  private pages: PrintSection[][] = []
  private options: Required<PaginatedRenderOptions> = {
    showHeaderOnEachPage: true,
    showFooterOnEachPage: true,
    showPageNumber: true,
  }

  /**
   * 设置分页内容
   * @param pages - 每页的区块配置数组
   */
  setPages(pages: PrintSection[][]): void {
    this.pages = pages
  }

  /**
   * 设置分页选项
   */
  setOptions(options: PaginatedRenderOptions): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 渲染所有页面
   * @param context - 渲染上下文
   * @returns HTML 字符串
   */
  renderAll(context: PageRenderContext): string {
    const totalPages = this.pages.length
    return this.pages
      .map((sections, i) => {
        const pageContext: PaginatedPageContext = {
          ...context,
          pageNumber: i + 1,
          totalPages,
        }
        return this.renderPage(pageContext, sections)
      })
      .join('\n')
  }

  /**
   * 渲染单个页面
   * 使用 PaginatedPageContext 确保 pageNumber/totalPages 类型安全
   */
  private renderPage(context: PaginatedPageContext, sections: PrintSection[]): string {
    const parts: string[] = [
      this.renderPageStart(context),
      this.renderHeader(context),
      this.renderBodyWrapper(context, sections),
      this.renderFooter(context),
      this.renderPageEnd(context),
    ]
    return parts.filter(Boolean).join('\n')
  }

  protected renderHeader(context: PaginatedPageContext): string {
    const { schema, pageNumber } = context
    const isFirstPage = pageNumber === 1

    // 非首页且不显示页眉
    if (!isFirstPage && !this.options.showHeaderOnEachPage) {
      return ''
    }

    const titleSuffix = !isFirstPage ? ' (续)' : ''
    const content = this.renderHeaderContent(schema, titleSuffix)
    if (content.length === 0) return ''

    return [
      `<header class="${CSS.PRINT_HEADER}">`,
      ...content,
      '</header>',
    ].join('\n')
  }

  protected renderBody(context: PageRenderContext): string {
    return this.renderBodyWrapper(context, context.schema.sections)
  }

  protected renderFooter(context: PaginatedPageContext): string {
    const { schema, pageNumber, totalPages } = context
    const isLastPage = pageNumber === totalPages

    // 非末页且不显示页脚，但可能需要显示页码
    if (!isLastPage && !this.options.showFooterOnEachPage) {
      return this.options.showPageNumber
        ? this.renderPageNumberOnly(pageNumber, totalPages)
        : ''
    }

    const parts: string[] = [`<footer class="${CSS.PRINT_FOOTER}">`]

    if (schema.footer?.notes) {
      parts.push(`<div class="${CSS.FOOTER_NOTES}">${escapeHtml(schema.footer.notes)}</div>`)
    }

    if (this.options.showPageNumber) {
      parts.push(`<div class="${CSS.PAGE_NUMBER}">${formatPageNumber(pageNumber, totalPages)}</div>`)
    }

    parts.push('</footer>')
    return parts.join('\n')
  }

  /**
   * 仅渲染页码
   */
  private renderPageNumberOnly(pageNumber: number, totalPages: number): string {
    return [
      `<footer class="${CSS.PRINT_FOOTER}">`,
      `  <div class="${CSS.PAGE_NUMBER}">${formatPageNumber(pageNumber, totalPages)}</div>`,
      '</footer>',
    ].join('\n')
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建单页渲染器
 */
export function createSinglePageRenderer(): SinglePageRenderer {
  return new SinglePageRenderer()
}

/**
 * 创建分页渲染器
 */
export function createPaginatedPageRenderer(): PaginatedPageRenderer {
  return new PaginatedPageRenderer()
}

// ==================== 导出类型 ====================

export type { PaginatedRenderOptions }
