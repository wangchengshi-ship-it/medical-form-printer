/**
 * @fileoverview Type-safe HTML builder
 * @module utils/html-builder
 * @description Provides chainable API for building HTML elements with unified HTML escaping
 * 
 * @example
 * // Basic usage
 * const html = h('div').class('container').child('Hello').build()
 * // => '<div class="container">Hello</div>'
 * 
 * // Nested elements
 * const html = h('table').child(
 *   h('tr').child(
 *     h('td').text('Cell 1'),
 *     h('td').text('Cell 2')
 *   )
 * ).build()
 */

/** HTML void elements (self-closing tags) */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/** HTML attribute value type */
type AttributeValue = string | number | boolean | undefined | null

/** Child element type */
type ChildElement = string | HtmlBuilder | undefined | null | false

/**
 * Escape HTML special characters
 * @param str - String to escape
 * @returns Escaped string
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
 * Escape HTML attribute value
 * @param value - Attribute value
 * @returns Escaped string
 */
export function escapeAttr(value: string): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

/**
 * HTML builder class
 * Provides chainable API for building HTML elements
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
   * Set attribute
   * @param name - Attribute name
   * @param value - Attribute value (undefined/null/false will skip the attribute)
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
   * Set multiple attributes
   * @param attrs - Attributes object
   */
  attrs(attrs: Record<string, AttributeValue>): this {
    for (const [name, value] of Object.entries(attrs)) {
      this.attr(name, value)
    }
    return this
  }

  /**
   * Add CSS class names
   * @param names - Class names (supports multiple arguments or space-separated)
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
   * Set ID
   * @param id - Element ID
   */
  id(id: string): this {
    return this.attr('id', id)
  }

  /**
   * Set single style
   * @param property - CSS property name
   * @param value - CSS property value
   */
  style(property: string, value: string | undefined | null): this {
    if (value !== undefined && value !== null && value !== '') {
      this.styles.set(property, value)
    }
    return this
  }

  /**
   * Set multiple styles
   * @param styles - Styles object
   */
  css(styles: Record<string, string | undefined | null>): this {
    for (const [property, value] of Object.entries(styles)) {
      this.style(property, value)
    }
    return this
  }

  /**
   * Add child elements (auto-escapes text)
   * @param children - Child elements
   */
  child(...children: ChildElement[]): this {
    this.children.push(...children)
    return this
  }

  /**
   * Add text content (auto-escaped)
   * @param text - Text content
   */
  text(text: string | number | undefined | null): this {
    if (text !== undefined && text !== null) {
      this.children.push(escapeHtml(String(text)))
    }
    return this
  }

  /**
   * Add raw HTML (not escaped)
   * @param html - Raw HTML string
   */
  raw(html: string): this {
    this.rawContent = html
    return this
  }

  /**
   * Conditional rendering
   * @param condition - Condition
   * @param builder - Builder function to execute when condition is true
   */
  when(condition: boolean, builder: (b: this) => void): this {
    if (condition) {
      builder(this)
    }
    return this
  }

  /**
   * Build HTML string
   * @returns HTML string
   */
  build(): string {
    const parts: string[] = []
    
    // Opening tag
    parts.push(`<${this.tagName}`)
    
    // Class names
    if (this.classNames.length > 0) {
      parts.push(` class="${escapeAttr(this.classNames.join(' '))}"`)
    }
    
    // Styles
    if (this.styles.size > 0) {
      const styleStr = Array.from(this.styles.entries())
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ')
      parts.push(` style="${escapeAttr(styleStr)}"`)
    }
    
    // Other attributes
    for (const [name, value] of this.attributes) {
      if (name === value) {
        // boolean attribute
        parts.push(` ${name}`)
      } else {
        parts.push(` ${name}="${escapeAttr(value)}"`)
      }
    }
    
    // Void elements
    if (VOID_ELEMENTS.has(this.tagName)) {
      parts.push(' />')
      return parts.join('')
    }
    
    parts.push('>')
    
    // Content
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
    
    // Closing tag
    parts.push(`</${this.tagName}>`)
    
    return parts.join('')
  }

  /**
   * Convert to string (equivalent to build)
   */
  toString(): string {
    return this.build()
  }
}

/**
 * Create HTML element builder
 * @param tag - Tag name
 * @returns HtmlBuilder instance
 * 
 * @example
 * h('div').class('container').text('Hello').build()
 */
export function h(tag: string): HtmlBuilder {
  return new HtmlBuilder(tag)
}

/**
 * Create document fragment (container for multiple elements)
 * @param children - Child elements
 * @returns HTML string
 */
export function fragment(...children: ChildElement[]): string {
  return children
    .filter((c): c is string | HtmlBuilder => c !== undefined && c !== null && c !== false)
    .map(c => typeof c === 'string' ? c : c.build())
    .join('')
}

/**
 * Conditional rendering
 * @param condition - Condition
 * @param content - Content when condition is true
 * @param fallback - Content when condition is false (optional)
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
 * List rendering
 * @param items - Data array
 * @param renderer - Render function
 * @returns HTML string
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

// Common tag shortcut methods
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
