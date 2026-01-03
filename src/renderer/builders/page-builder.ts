/**
 * @fileoverview Page Builder
 * @module renderer/builders/page-builder
 * 
 * @description
 * Uses Builder pattern to construct complete print page structure.
 * Supports header, content, footer, watermark and other components.
 */

import { HtmlElementBuilder } from './html-element-builder'
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
 * Constructs complete print page structure
 */
export class PageBuilder {
  private config: PageConfig
  private css: string = ''
  private headerConfig: HeaderConfig | null = null
  private footerConfig: FooterConfig | null = null
  private sections: string[] = []
  private watermarkText: string | null = null
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
   * @param css - CSS string
   */
  setCSS(css: string): this {
    this.css = css
    return this
  }

  /**
   * Set header
   * @param config - Header configuration
   */
  setHeader(config: HeaderConfig): this {
    this.headerConfig = config
    return this
  }

  /**
   * Set footer
   * @param config - Footer configuration
   */
  setFooter(config: FooterConfig | null): this {
    this.footerConfig = config
    return this
  }

  /**
   * Add section content
   * @param html - Section HTML
   */
  addSection(html: string): this {
    this.sections.push(html)
    return this
  }

  /**
   * Add multiple section contents
   * @param htmls - Section HTML array
   */
  addSections(htmls: string[]): this {
    this.sections.push(...htmls)
    return this
  }

  /**
   * Set watermark
   * @param text - Watermark text
   * @param opacity - Opacity
   */
  setWatermark(text: string, opacity?: number): this {
    this.watermarkText = text
    if (opacity !== undefined) {
      this.watermarkOpacity = opacity
    }
    return this
  }

  /**
   * Build header HTML
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
   * Build footer HTML
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
   * Build watermark HTML
   */
  private buildWatermark(): string {
    if (!this.watermarkText) return ''

    const style = `opacity: ${this.watermarkOpacity}`
    return `<div class="watermark" style="${style}">${escapeHtml(this.watermarkText)}</div>`
  }

  /**
   * Build page class names
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
