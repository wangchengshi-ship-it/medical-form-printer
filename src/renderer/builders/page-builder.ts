/**
 * @fileoverview 页面构建器
 * @module renderer/builders/page-builder
 * 
 * @description
 * 使用 Builder 模式构建完整的打印页面结构。
 * 支持页眉、内容、页脚、水印等组件。
 */

import { HtmlElementBuilder } from './html-element-builder'
import { escapeHtml } from '../../utils'

/** 页面配置 */
export interface PageConfig {
  /** 页面尺寸 */
  pageSize: string
  /** 页面方向 */
  orientation: string
  /** 语言 */
  lang?: string
}

/** 页眉配置 */
export interface HeaderConfig {
  /** 医院名称 */
  hospital: string
  /** 科室名称 */
  department?: string
  /** 表单标题 */
  title: string
  /** 是否显示 Logo */
  showLogo?: boolean
  /** Logo URL */
  logoUrl?: string
}

/** 页脚配置 */
export interface FooterConfig {
  /** 备注 */
  notes?: string
  /** 是否显示页码 */
  showPageNumber?: boolean
  /** 页码格式 */
  pageNumberFormat?: string
}

/**
 * 页面构建器
 * 构建完整的打印页面结构
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
   * 创建页面构建器
   * @param config - 页面配置
   */
  constructor(config: PageConfig) {
    this.config = config
  }

  /**
   * 设置 CSS 样式
   * @param css - CSS 字符串
   */
  setCSS(css: string): this {
    this.css = css
    return this
  }

  /**
   * 设置页眉
   * @param config - 页眉配置
   */
  setHeader(config: HeaderConfig): this {
    this.headerConfig = config
    return this
  }

  /**
   * 设置页脚
   * @param config: FooterConfig | null
   */
  setFooter(config: FooterConfig | null): this {
    this.footerConfig = config
    return this
  }

  /**
   * 添加区块内容
   * @param html - 区块 HTML
   */
  addSection(html: string): this {
    this.sections.push(html)
    return this
  }

  /**
   * 批量添加区块内容
   * @param htmls - 区块 HTML 数组
   */
  addSections(htmls: string[]): this {
    this.sections.push(...htmls)
    return this
  }

  /**
   * 设置水印
   * @param text - 水印文本
   * @param opacity - 透明度
   */
  setWatermark(text: string, opacity?: number): this {
    this.watermarkText = text
    if (opacity !== undefined) {
      this.watermarkOpacity = opacity
    }
    return this
  }

  /**
   * 构建页眉 HTML
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
   * 构建页脚 HTML
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
   * 构建水印 HTML
   */
  private buildWatermark(): string {
    if (!this.watermarkText) return ''

    const style = `opacity: ${this.watermarkOpacity}`
    return `<div class="watermark" style="${style}">${escapeHtml(this.watermarkText)}</div>`
  }

  /**
   * 构建页面类名
   */
  private buildPageClasses(): string {
    return [
      'print-page',
      this.config.pageSize.toLowerCase(),
      this.config.orientation,
    ].join(' ')
  }

  /**
   * 构建完整页面 HTML
   * @returns 完整的 HTML 文档字符串
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
