/**
 * @fileoverview Template Method Pattern - Page Rendering Flow
 * @module renderer/templates
 * @version 1.2.0
 * @author Kiro
 * @modified 2026-01-03
 *
 * @description
 * Uses Template Method pattern to define the skeleton flow for page rendering.
 * AbstractPageRenderer defines rendering steps: renderHeader → renderBody → renderFooter
 * Subclasses implement specific steps: SinglePageRenderer, PaginatedPageRenderer
 *
 * v1.2.0 optimizations:
 * - Enhanced type safety, introduced PaginatedPageContext to eliminate non-null assertions
 * - Extracted page number formatting as configurable option
 * - Extracted common footer rendering logic
 * - Added formatPageNumber utility function
 *
 * v1.1.0 optimizations:
 * - Extracted common header rendering logic to base class
 * - Extracted CSS class name constants
 * - Improved type safety (watermark options type guard)
 * - Reduced duplicate code in subclasses
 */

import type { PrintSchema, FormData, PrintSection } from '../../types/print-schema'
import type { RenderOptions, PdfOptions } from '../../types/options'
import { renderSection } from '../section-renderers'
import { escapeHtml, renderWatermarkHtml, extractWatermarkOptions } from '../../utils'

// ==================== CSS Class Constants ====================

/** CSS class constants to avoid magic strings */
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

// ==================== Utility Functions ====================

/**
 * Format page number display
 * @param current - Current page number
 * @param total - Total pages
 * @param format - Format template, default "Page {current} of {total}"
 */
function formatPageNumber(
  current: number,
  total: number,
  format = 'Page {current} of {total}'
): string {
  return format.replace('{current}', String(current)).replace('{total}', String(total))
}

// ==================== Type Definitions ====================

/**
 * Page render context (base)
 * Contains all data needed during rendering
 */
export interface PageRenderContext {
  schema: PrintSchema
  data: FormData
  options?: RenderOptions | PdfOptions
  pageNumber?: number
  totalPages?: number
}

/**
 * Paginated render context (type-safe)
 * pageNumber and totalPages are required, eliminating non-null assertions
 */
export interface PaginatedPageContext extends PageRenderContext {
  pageNumber: number
  totalPages: number
}

/**
 * Watermark options type guard
 */
function hasWatermarkOptions(
  options?: RenderOptions | PdfOptions
): options is PdfOptions & { watermark?: string; watermarkOpacity?: number } {
  return options !== undefined && 'watermark' in options
}

// ==================== Abstract Base Class ====================

/**
 * Abstract page renderer (Template Method pattern's AbstractClass)
 * Defines page rendering skeleton, subclasses implement specific steps
 */
export abstract class AbstractPageRenderer {
  /**
   * Render page (Template Method)
   * Defines rendering flow: renderHeader → renderBody → renderFooter
   * @param context - Render context
   * @returns HTML string
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
   * Render page start tag
   * @param _context - Render context (reserved for subclass override)
   */
  protected renderPageStart(_context: PageRenderContext): string {
    return `<div class="${CSS.PRINT_PAGE}">`
  }

  /**
   * Render page end tag
   * @param _context - Render context (reserved for subclass override)
   */
  protected renderPageEnd(_context: PageRenderContext): string {
    return '</div>'
  }

  /**
   * Render header (abstract method, subclass must implement)
   * @param context - Render context
   */
  protected abstract renderHeader(context: PageRenderContext): string

  /**
   * Render body content (abstract method, subclass must implement)
   * @param context - Render context
   */
  protected abstract renderBody(context: PageRenderContext): string

  /**
   * Render footer (abstract method, subclass must implement)
   * @param context - Render context
   */
  protected abstract renderFooter(context: PageRenderContext): string

  /**
   * Render watermark (hook method, subclass can optionally override)
   * Uses type guard for type safety
   * @param context - Render context
   */
  protected renderWatermark(context: PageRenderContext): string {
    const { options } = context
    if (!hasWatermarkOptions(options)) return ''
    return renderWatermarkHtml(extractWatermarkOptions(options))
  }

  /**
   * Render section list
   * @param sections - Section configuration array
   * @param data - Form data
   * @param options - Render options
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
   * Render header content (common logic for subclass reuse)
   * @param schema - Print configuration
   * @param titleSuffix - Title suffix (e.g., "(continued)" for continuation pages)
   * @returns Header content HTML array
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
   * Render body content wrapper (common logic for subclass reuse)
   * @param context - Render context
   * @param sections - Sections to render
   * @returns Body HTML
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

// ==================== Single Page Renderer ====================

/**
 * Single page renderer
 * Renders all content to a single page
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

// ==================== Paginated Renderer ====================

/**
 * Paginated renderer options
 */
interface PaginatedRenderOptions {
  showHeaderOnEachPage?: boolean
  showFooterOnEachPage?: boolean
  showPageNumber?: boolean
}

/**
 * Paginated renderer
 * Supports multi-page rendering with independent header/footer per page
 */
export class PaginatedPageRenderer extends AbstractPageRenderer {
  private pages: PrintSection[][] = []
  private options: Required<PaginatedRenderOptions> = {
    showHeaderOnEachPage: true,
    showFooterOnEachPage: true,
    showPageNumber: true,
  }

  /**
   * Set paginated content
   * @param pages - Array of section configurations per page
   */
  setPages(pages: PrintSection[][]): void {
    this.pages = pages
  }

  /**
   * Set pagination options
   */
  setOptions(options: PaginatedRenderOptions): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * Render all pages
   * @param context - Render context
   * @returns HTML string
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
   * Render single page
   * Uses PaginatedPageContext to ensure pageNumber/totalPages type safety
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

    // Non-first page and header not shown
    if (!isFirstPage && !this.options.showHeaderOnEachPage) {
      return ''
    }

    const titleSuffix = !isFirstPage ? ' (continued)' : ''
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

    // Non-last page and footer not shown, but may need to show page number
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
   * Render page number only
   */
  private renderPageNumberOnly(pageNumber: number, totalPages: number): string {
    return [
      `<footer class="${CSS.PRINT_FOOTER}">`,
      `  <div class="${CSS.PAGE_NUMBER}">${formatPageNumber(pageNumber, totalPages)}</div>`,
      '</footer>',
    ].join('\n')
  }
}

// ==================== Factory Functions ====================

/**
 * Create single page renderer
 */
export function createSinglePageRenderer(): SinglePageRenderer {
  return new SinglePageRenderer()
}

/**
 * Create paginated renderer
 */
export function createPaginatedPageRenderer(): PaginatedPageRenderer {
  return new PaginatedPageRenderer()
}

// ==================== Export Types ====================

export type { PaginatedRenderOptions }
