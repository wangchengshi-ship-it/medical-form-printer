/**
 * @fileoverview Template Method 模式 - 页面渲染流程
 * @module renderer/templates
 * 
 * @description
 * 使用 Template Method 模式定义页面渲染的骨架流程。
 * AbstractPageRenderer 定义渲染步骤：renderHeader → renderBody → renderFooter
 * 子类实现具体步骤：SinglePageRenderer、PaginatedPageRenderer
 */

import type { PrintSchema, FormData, PrintSection } from '../../types/print-schema'
import type { RenderOptions, PdfOptions } from '../../types/options'
import { renderSection } from '../section-renderers'
import { escapeHtml } from '../../utils'

/**
 * 页面渲染上下文
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
    const parts: string[] = []
    
    // 1. 渲染页面开始
    parts.push(this.renderPageStart(context))
    
    // 2. 渲染页眉
    parts.push(this.renderHeader(context))
    
    // 3. 渲染主体内容
    parts.push(this.renderBody(context))
    
    // 4. 渲染页脚
    parts.push(this.renderFooter(context))
    
    // 5. 渲染页面结束
    parts.push(this.renderPageEnd(context))
    
    return parts.filter(Boolean).join('\n')
  }

  /**
   * 渲染页面开始标签
   * @param context - 渲染上下文
   */
  protected renderPageStart(context: PageRenderContext): string {
    return '<div class="print-page">'
  }

  /**
   * 渲染页面结束标签
   * @param context - 渲染上下文
   */
  protected renderPageEnd(context: PageRenderContext): string {
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
   * @param context - 渲染上下文
   */
  protected renderWatermark(context: PageRenderContext): string {
    const { options } = context
    // 检查是否为 PdfOptions 且启用了水印
    const pdfOptions = options as PdfOptions | undefined
    if (!pdfOptions?.watermark) {
      return ''
    }
    return `<div class="watermark">${escapeHtml(pdfOptions.watermark)}</div>`
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
    return sections.map(section => renderSection(section.type, section.config, data, options)).join('\n')
  }
}

/**
 * 单页渲染器
 * 将所有内容渲染到单个页面
 */
export class SinglePageRenderer extends AbstractPageRenderer {
  protected renderHeader(context: PageRenderContext): string {
    const { schema } = context
    const parts: string[] = ['<header class="print-header">']
    
    if (schema.header?.hospital) {
      parts.push(`<div class="hospital-name">${escapeHtml(schema.header.hospital)}</div>`)
    }
    if (schema.header?.department) {
      parts.push(`<div class="department">${escapeHtml(schema.header.department)}</div>`)
    }
    if (schema.header?.title) {
      parts.push(`<h1 class="form-title">${escapeHtml(schema.header.title)}</h1>`)
    }
    
    parts.push('</header>')
    return parts.join('\n')
  }

  protected renderBody(context: PageRenderContext): string {
    const { schema, data, options } = context
    const parts: string[] = ['<main class="print-body">']
    
    // 渲染水印
    const watermark = this.renderWatermark(context)
    if (watermark) {
      parts.push(watermark)
    }
    
    // 渲染所有区块
    parts.push(this.renderSections(schema.sections, data, options))
    
    parts.push('</main>')
    return parts.join('\n')
  }

  protected renderFooter(context: PageRenderContext): string {
    const { schema } = context
    if (!schema.footer) {
      return ''
    }
    
    const parts: string[] = ['<footer class="print-footer">']
    
    if (schema.footer.notes) {
      parts.push(`<div class="footer-notes">${escapeHtml(schema.footer.notes)}</div>`)
    }
    
    parts.push('</footer>')
    return parts.join('\n')
  }
}

/**
 * 分页渲染器
 * 支持多页渲染，每页独立的页眉页脚
 */
export class PaginatedPageRenderer extends AbstractPageRenderer {
  private pages: PrintSection[][] = []
  private showHeaderOnEachPage: boolean = true
  private showFooterOnEachPage: boolean = true
  private showPageNumber: boolean = true

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
  setOptions(options: {
    showHeaderOnEachPage?: boolean
    showFooterOnEachPage?: boolean
    showPageNumber?: boolean
  }): void {
    if (options.showHeaderOnEachPage !== undefined) {
      this.showHeaderOnEachPage = options.showHeaderOnEachPage
    }
    if (options.showFooterOnEachPage !== undefined) {
      this.showFooterOnEachPage = options.showFooterOnEachPage
    }
    if (options.showPageNumber !== undefined) {
      this.showPageNumber = options.showPageNumber
    }
  }

  /**
   * 渲染所有页面
   * @param context - 渲染上下文
   * @returns HTML 字符串
   */
  renderAll(context: PageRenderContext): string {
    const totalPages = this.pages.length
    const renderedPages: string[] = []

    for (let i = 0; i < totalPages; i++) {
      const pageContext: PageRenderContext = {
        ...context,
        pageNumber: i + 1,
        totalPages,
      }
      // 临时存储当前页的区块
      const currentPageSections = this.pages[i]
      renderedPages.push(this.renderPage(pageContext, currentPageSections))
    }

    return renderedPages.join('\n')
  }

  /**
   * 渲染单个页面
   */
  private renderPage(context: PageRenderContext, sections: PrintSection[]): string {
    const parts: string[] = []
    
    parts.push(this.renderPageStart(context))
    parts.push(this.renderHeader(context))
    parts.push(this.renderBodyWithSections(context, sections))
    parts.push(this.renderFooter(context))
    parts.push(this.renderPageEnd(context))
    
    return parts.filter(Boolean).join('\n')
  }

  protected renderHeader(context: PageRenderContext): string {
    const { schema, pageNumber } = context
    const isFirstPage = pageNumber === 1
    
    // 非首页且不显示页眉
    if (!isFirstPage && !this.showHeaderOnEachPage) {
      return ''
    }
    
    const parts: string[] = ['<header class="print-header">']
    
    if (schema.header?.hospital) {
      parts.push(`<div class="hospital-name">${escapeHtml(schema.header.hospital)}</div>`)
    }
    if (schema.header?.department) {
      parts.push(`<div class="department">${escapeHtml(schema.header.department)}</div>`)
    }
    if (schema.header?.title) {
      const titleSuffix = !isFirstPage ? ' (续)' : ''
      parts.push(`<h1 class="form-title">${escapeHtml(schema.header.title)}${titleSuffix}</h1>`)
    }
    
    parts.push('</header>')
    return parts.join('\n')
  }

  protected renderBody(context: PageRenderContext): string {
    // 默认实现，实际使用 renderBodyWithSections
    return this.renderBodyWithSections(context, context.schema.sections)
  }

  private renderBodyWithSections(context: PageRenderContext, sections: PrintSection[]): string {
    const { data, options } = context
    const parts: string[] = ['<main class="print-body">']
    
    // 渲染水印
    const watermark = this.renderWatermark(context)
    if (watermark) {
      parts.push(watermark)
    }
    
    // 渲染当前页的区块
    parts.push(this.renderSections(sections, data, options))
    
    parts.push('</main>')
    return parts.join('\n')
  }

  protected renderFooter(context: PageRenderContext): string {
    const { schema, pageNumber, totalPages } = context
    const isLastPage = pageNumber === totalPages
    
    // 非末页且不显示页脚
    if (!isLastPage && !this.showFooterOnEachPage) {
      // 但仍然显示页码
      if (this.showPageNumber) {
        return this.renderPageNumber(context)
      }
      return ''
    }
    
    const parts: string[] = ['<footer class="print-footer">']
    
    if (schema.footer?.notes) {
      parts.push(`<div class="footer-notes">${escapeHtml(schema.footer.notes)}</div>`)
    }
    
    // 页码
    if (this.showPageNumber) {
      parts.push(`<div class="page-number">第 ${pageNumber} 页 / 共 ${totalPages} 页</div>`)
    }
    
    parts.push('</footer>')
    return parts.join('\n')
  }

  private renderPageNumber(context: PageRenderContext): string {
    const { pageNumber, totalPages } = context
    return `<footer class="print-footer">
  <div class="page-number">第 ${pageNumber} 页 / 共 ${totalPages} 页</div>
</footer>`
  }
}

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
