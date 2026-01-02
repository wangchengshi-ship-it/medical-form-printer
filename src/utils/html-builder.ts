/**
 * @fileoverview 类型安全的 HTML 构建器
 * @module utils/html-builder
 * @description 提供链式 API 构建 HTML 元素，统一 HTML 转义处理
 * 
 * @example
 * // 基础用法
 * const html = h('div').class('container').child('Hello').build()
 * // => '<div class="container">Hello</div>'
 * 
 * // 嵌套元素
 * const html = h('table').child(
 *   h('tr').child(
 *     h('td').text('Cell 1'),
 *     h('td').text('Cell 2')
 *   )
 * ).build()
 */

/** HTML 空元素（自闭合标签） */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/** HTML 属性值类型 */
type AttributeValue = string | number | boolean | undefined | null

/** 子元素类型 */
type ChildElement = string | HtmlBuilder | undefined | null | false

/**
 * HTML 转义
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * HTML 属性值转义（用于属性值）
 * @param value - 属性值
 * @returns 转义后的字符串
 */
export function escapeAttr(value: string): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

/**
 * HTML 构建器类
 * 提供链式 API 构建 HTML 元素
 */
export class HtmlBuilder {
  private tagName: string
  private attributes: Map<string, string> = new Map()
  private classNames: string[] = []
  private styles: Map<string, string> = new Map()
  private children: ChildElement[] = []
  private rawContent: string | null = null

  constructor(tag: string) {
    this.tagName = tag
  }

  /**
   * 设置属性
   * @param name - 属性名
   * @param value - 属性值（undefined/null/false 会跳过该属性）
   */
  attr(name: string, value: AttributeValue): this {
    if (value === undefined || value === null || value === false) {
      return this
    }
    if (value === true) {
      this.attributes.set(name, name) // boolean attribute
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
   * @param names - 类名（支持多个参数或空格分隔）
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
   * 添加子元素（自动转义文本）
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
        // boolean attribute
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
   * 转换为字符串（等同于 build）
   */
  toString(): string {
    return this.build()
  }
}

/**
 * 创建 HTML 元素构建器
 * @param tag - 标签名
 * @returns HtmlBuilder 实例
 * 
 * @example
 * h('div').class('container').text('Hello').build()
 */
export function h(tag: string): HtmlBuilder {
  return new HtmlBuilder(tag)
}

/**
 * 创建文档片段（多个元素的容器）
 * @param children - 子元素
 * @returns HTML 字符串
 */
export function fragment(...children: ChildElement[]): string {
  return children
    .filter((c): c is string | HtmlBuilder => c !== undefined && c !== null && c !== false)
    .map(c => typeof c === 'string' ? c : c.build())
    .join('')
}

/**
 * 条件渲染
 * @param condition - 条件
 * @param content - 条件为真时的内容
 * @param fallback - 条件为假时的内容（可选）
 */
export function when(
  condition: boolean,
  content: ChildElement | (() => ChildElement),
  fallback?: ChildElement | (() => ChildElement)
): string {
  const result = condition ? content : fallback
  if (result === undefined || result === null || result === false) {
    return ''
  }
  const resolved = typeof result === 'function' ? result() : result
  if (resolved === undefined || resolved === null || resolved === false) {
    return ''
  }
  return typeof resolved === 'string' ? resolved : resolved.build()
}

/**
 * 列表渲染
 * @param items - 数据数组
 * @param renderer - 渲染函数
 * @returns HTML 字符串
 */
export function each<T>(
  items: T[] | undefined | null,
  renderer: (item: T, index: number) => ChildElement
): string {
  if (!items || items.length === 0) {
    return ''
  }
  return items
    .map((item, index) => {
      const result = renderer(item, index)
      if (result === undefined || result === null || result === false) {
        return ''
      }
      return typeof result === 'string' ? result : result.build()
    })
    .join('')
}

// 常用标签快捷方法
export const div = () => h('div')
export const span = () => h('span')
export const table = () => h('table')
export const thead = () => h('thead')
export const tbody = () => h('tbody')
export const tr = () => h('tr')
export const th = () => h('th')
export const td = () => h('td')
export const p = () => h('p')
export const img = () => h('img')
export const a = () => h('a')
export const ul = () => h('ul')
export const li = () => h('li')
export const header = () => h('header')
export const footer = () => h('footer')
export const main = () => h('main')
export const section = () => h('section')
export const article = () => h('article')
export const nav = () => h('nav')
export const h1 = () => h('h1')
export const h2 = () => h('h2')
export const h3 = () => h('h3')
export const h4 = () => h('h4')
export const h5 = () => h('h5')
export const h6 = () => h('h6')
export const br = () => h('br')
export const hr = () => h('hr')
