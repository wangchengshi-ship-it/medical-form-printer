/**
 * @fileoverview Page Builder
 * @module renderer/builders/page-builder
 * @version 1.0.0
 *
 * @description
 * Uses Builder pattern to construct complete print page structure.
 * Supports header, content, footer, watermark and other components.
 *
 * @example
 * ```typescript
 * const builder = new PageBuilder({ pageSize: '16K', orientation: 'portrait' })
 * const html = builder
 *   .setCSS(css)
 *   .setHeader({ hospital: 'Sample Hospital', title: 'Form Title' })
 *   .addSection('<div>Content</div>')
 *   .setWatermark('DRAFT', 0.1)
 *   .build()
 * ```
 *
 * @dependencies
 * - ../../utils - HTML escape utilities
 *
 * @usedBy
 * - ../index.ts - Main renderer module
 */

import { escapeHtml } from '../../utils'

/** Page configuration */
export interface PageConfig {
  /** Page size */
  pageSize: string
  /** Page orientation */
  orientation: string
  /** Language */
  lang?: string
}

/** Header configuration */
export interface HeaderConfig {
  /** Hospital name */
  hospital: string
  /** Department name */
  department?: string
  /** Form title */
  title: string
  /** Whether to show logo */
  showLogo?: boolean
  /** Logo URL */
  logoUrl?: string
}

/** Footer configuration */
export interface FooterConfig {
  /** Notes */
  notes?: string
  /** Whether to show page number */
  showPageNumber?: boolean
  /** Page number format */
  pageNumberFormat?: string
}

/**
 * Page Builder
 * Constructs complete print page structure using fluent Builder pattern.
 *
 * @example
 * ```typescript
 * const html = new PageBuilder({ pageSize: '16K', orientation: 'portrait' })
 *   .setCSS(generateCss())
 *   .setHeader({ hospital: 'Hospital', title: 'Form' })
 *   .addSections(sectionHtmls)
 *   .setFooter({ showPageNumber: true })
 *   .build()
 * ```
 */
export class PageBuilder {
  /** Page configuration */
  private config: PageConfig
  /** CSS styles */
  private css: string = ''
  /** Header configuration */
  private headerConfig: HeaderConfig | null = null
  /** Footer configuration */
  private footerConfig: FooterConfig | null = null
  /** Section HTML contents */
  private sections: string[] = []
  /** Watermark text */
  private watermarkText: string | null = null
  /** Watermark opacity (0-1) */
  private watermarkOpacity: number = 0.1

  /**
   * Create page builder
   * @param config - Page configuration
   */
  constructor(config: PageConfig) {
    this.config = config
  }

  /**
   * Set CSS styles
   * @param css - CSS string to include in the page
   * @returns this for method chaining
   */
  setCSS(css: string): this {
    this.css = css
    return this
  }

  /**
   * Set header configuration
   * @param config - Header configuration including hospital, department, title
   * @returns this for method chaining
   */
  setHeader(config: HeaderConfig): this {
    this.headerConfig = config
    return this
  }

  /**
   * Set footer configuration
   * @param config - Footer configuration including notes and page number settings
   * @returns this for method chaining
   */
  setFooter(config: FooterConfig | null): this {
    this.footerConfig = config
    return this
  }

  /**
   * Add a single section content
   * @param html - Section HTML string
   * @returns this for method chaining
   */
  addSection(html: string): this {
    this.sections.push(html)
    return this
  }

  /**
   * Add multiple section contents at once
   * @param htmls - Array of section HTML strings
   * @returns this for method chaining
   */
  addSections(htmls: string[]): this {
    this.sections.push(...htmls)
    return this
  }

  /**
   * Set watermark text and opacity
   * @param text - Watermark text to display
   * @param opacity - Opacity value between 0 and 1 (default: 0.1)
   * @returns this for method chaining
   */
  setWatermark(text: string, opacity?: number): this {
    this.watermarkText = text
    if (opacity !== undefined) {
      this.watermarkOpacity = opacity
    }
    return this
  }

  /**
   * Build header HTML from configuration
   * @returns Header HTML string or empty string if no header configured
   * @private
   */
  private buildHeader(): string {
    if (!this.headerConfig) return ''

    const { hospital, department, title, showLogo, logoUrl } = this.headerConfig

    const parts: string[] = []

    if (showLogo && logoUrl) {
      parts.push(`<img src="${escapeHtml(logoUrl)}" alt="Logo" class="header-logo" />`)
    }

    parts.push(`<div class="hospital-name">${escapeHtml(hospital)}</div>`)

    if (department) {
      parts.push(`<div class="department-name">${escapeHtml(department)}</div>`)
    }

    parts.push(`<h1 class="form-title">${escapeHtml(title)}</h1>`)

    return `<header class="print-header">\n${parts.join('\n')}\n</header>`
  }

  /**
   * Build footer HTML from configuration
   * @returns Footer HTML string or empty string if no footer configured
   * @private
   */
  private buildFooter(): string {
    if (!this.footerConfig) return ''

    const { notes, showPageNumber } = this.footerConfig
    const parts: string[] = []

    if (notes) {
      parts.push(`<span class="footer-notes">${escapeHtml(notes)}</span>`)
    }

    if (showPageNumber) {
      parts.push('<span class="page-number"></span>')
    }

    if (parts.length === 0) return ''

    return `<footer class="print-footer">\n${parts.join('\n')}\n</footer>`
  }

  /**
   * Build watermark HTML element
   * @returns Watermark HTML string or empty string if no watermark set
   * @private
   */
  private buildWatermark(): string {
    if (!this.watermarkText) return ''

    const style = `opacity: ${this.watermarkOpacity}`
    return `<div class="watermark" style="${style}">${escapeHtml(this.watermarkText)}</div>`
  }

  /**
   * Build CSS class names for the page container
   * @returns Space-separated class names string
   * @private
   */
  private buildPageClasses(): string {
    return [
      'print-page',
      this.config.pageSize.toLowerCase(),
      this.config.orientation,
    ].join(' ')
  }

  /**
   * Build complete page HTML
   * @returns Complete HTML document string
   */
  build(): string {
    const lang = this.config.lang || 'zh-CN'
    const title = this.headerConfig?.title || 'Document'
    const pageClasses = this.buildPageClasses()

    const watermark = this.buildWatermark()
    const header = this.buildHeader()
    const content = this.sections.join('\n')
    const footer = this.buildFooter()

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>
${this.css}
</style>
</head>
<body>
<div class="${pageClasses}">
${watermark}
${header}
<main class="print-content">
${content}
</main>
${footer}
</div>
</body>
</html>`
  }
}
