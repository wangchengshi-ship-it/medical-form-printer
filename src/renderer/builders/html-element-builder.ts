/**
 * @fileoverview HTML 元素构建器
 * @module renderer/builders/html-element-builder
 * 
 * @description
 * 使用 Builder 模式链式构建 HTML 元素。
 * 支持 fluent API：builder.tag('div').class('foo').child(...).build()
 */

import { escapeHtml, escapeAttr } from '../../utils'

/** HTML 空元素（自闭合标签） */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/** 属性值类型 */
type AttributeValue = string | number | boolean | undefined | null

/** 子元素类型 */
type ChildElement = string | HtmlElementBuilder | undefined | null | false

/**
 * HTML 元素构建器
 * 提供链式 API 构建 HTML 元素
 */
export class HtmlElementBuilder {
  private tagName: string
  private attributes: Map<string, string> = new Map()
  private classNames: string[] = []
  private styles: Map<string, string> = new Map()
  private children: ChildElement[] = []
  private rawContent: string | null = null

  /**
   * 创建构建器实例
   * @param tag - 标签名
   */
  constructor(tag: string) {
    this.tagName = tag
  }

  /**
   * 创建新的构建器实例
   * @param tag - 标签名
   * @returns 新的构建器实例
   */
  static tag(tag: string): HtmlElementBuilder {
    return new HtmlElementBuilder(tag)
  }

  /**
   * 设置属性
   * @param name - 属性名
   * @param value - 属性值
   */
  attr(name: string, value: AttributeValue): this {
    if (value === undefined || value === null || value === false) {
      return this
    }
    if (value === true) {
      this.attributes.set(name, name)
    } else {
      this.attributes.set(name, String(value))
    }
    return this
  }

  /**
   * 批量设置属性
   * @param attrs - 属性对象
   */
  attrs(attrs: Record<string, AttributeValue>): this {
    for (const [name, value] of Object.entries(attrs)) {
      this.attr(name, value)
    }
    return this
  }

  /**
   * 添加 CSS 类名
   * @param names - 类名
   */
  class(...names: (string | undefined | null | false)[]): this {
    for (const name of names) {
      if (name) {
        this.classNames.push(...name.split(/\s+/).filter(Boolean))
      }
    }
    return this
  }

  /**
   * 设置 ID
   * @param id - 元素 ID
   */
  id(id: string): this {
    return this.attr('id', id)
  }

  /**
   * 设置单个样式
   * @param property - CSS 属性名
   * @param value - CSS 属性值
   */
  style(property: string, value: string | undefined | null): this {
    if (value !== undefined && value !== null && value !== '') {
      this.styles.set(property, value)
    }
    return this
  }

  /**
   * 批量设置样式
   * @param styles - 样式对象
   */
  css(styles: Record<string, string | undefined | null>): this {
    for (const [property, value] of Object.entries(styles)) {
      this.style(property, value)
    }
    return this
  }

  /**
   * 添加子元素
   * @param children - 子元素
   */
  child(...children: ChildElement[]): this {
    this.children.push(...children)
    return this
  }

  /**
   * 添加文本内容（自动转义）
   * @param text - 文本内容
   */
  text(text: string | number | undefined | null): this {
    if (text !== undefined && text !== null) {
      this.children.push(escapeHtml(String(text)))
    }
    return this
  }

  /**
   * 添加原始 HTML（不转义）
   * @param html - 原始 HTML 字符串
   */
  raw(html: string): this {
    this.rawContent = html
    return this
  }

  /**
   * 条件渲染
   * @param condition - 条件
   * @param builder - 条件为真时执行的构建函数
   */
  when(condition: boolean, builder: (b: this) => void): this {
    if (condition) {
      builder(this)
    }
    return this
  }

  /**
   * 构建 HTML 字符串
   * @returns HTML 字符串
   */
  build(): string {
    const parts: string[] = []
    
    // 开始标签
    parts.push(`<${this.tagName}`)
    
    // 类名
    if (this.classNames.length > 0) {
      parts.push(` class="${escapeAttr(this.classNames.join(' '))}"`)
    }
    
    // 样式
    if (this.styles.size > 0) {
      const styleStr = Array.from(this.styles.entries())
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ')
      parts.push(` style="${escapeAttr(styleStr)}"`)
    }
    
    // 其他属性
    for (const [name, value] of this.attributes) {
      if (name === value) {
        parts.push(` ${name}`)
      } else {
        parts.push(` ${name}="${escapeAttr(value)}"`)
      }
    }
    
    // 空元素
    if (VOID_ELEMENTS.has(this.tagName)) {
      parts.push(' />')
      return parts.join('')
    }
    
    parts.push('>')
    
    // 内容
    if (this.rawContent !== null) {
      parts.push(this.rawContent)
    } else {
      for (const child of this.children) {
        if (child === undefined || child === null || child === false) {
          continue
        }
        if (typeof child === 'string') {
          parts.push(child)
        } else {
          parts.push(child.build())
        }
      }
    }
    
    // 结束标签
    parts.push(`</${this.tagName}>`)
    
    return parts.join('')
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this.build()
  }
}

// 快捷方法
export const div = () => new HtmlElementBuilder('div')
export const span = () => new HtmlElementBuilder('span')
export const table = () => new HtmlElementBuilder('table')
export const thead = () => new HtmlElementBuilder('thead')
export const tbody = () => new HtmlElementBuilder('tbody')
export const tr = () => new HtmlElementBuilder('tr')
export const th = () => new HtmlElementBuilder('th')
export const td = () => new HtmlElementBuilder('td')
export const p = () => new HtmlElementBuilder('p')
export const header = () => new HtmlElementBuilder('header')
export const footer = () => new HtmlElementBuilder('footer')
export const main = () => new HtmlElementBuilder('main')
export const h1 = () => new HtmlElementBuilder('h1')
