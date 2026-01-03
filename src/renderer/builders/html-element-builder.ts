/**
 * @fileoverview HTML Element Builder
 * @module renderer/builders/html-element-builder
 * 
 * @description
 * Uses Builder pattern to chain-build HTML elements.
 * Supports fluent API: builder.tag('div').class('foo').child(...).build()
 */

import { escapeHtml, escapeAttr } from '../../utils'

/** HTML void elements (self-closing tags) */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/** Attribute value type */
type AttributeValue = string | number | boolean | undefined | null

/** Child element type */
type ChildElement = string | HtmlElementBuilder | undefined | null | false

/**
 * HTML Element Builder
 * Provides fluent API for building HTML elements
 */
export class HtmlElementBuilder {
  private tagName: string
  private attributes: Map<string, string> = new Map()
  private classNames: string[] = []
  private styles: Map<string, string> = new Map()
  private children: ChildElement[] = []
  private rawContent: string | null = null

  /**
   * Create builder instance
   * @param tag - Tag name
   */
  constructor(tag: string) {
    this.tagName = tag
  }

  /**
   * Create new builder instance
   * @param tag - Tag name
   * @returns New builder instance
   */
  static tag(tag: string): HtmlElementBuilder {
    return new HtmlElementBuilder(tag)
  }

  /**
   * Set attribute
   * @param name - Attribute name
   * @param value - Attribute value
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
   * @param names - Class names
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
   * Add child elements
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
   * Convert to string
   */
  toString(): string {
    return this.build()
  }
}

// Shortcut methods
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
