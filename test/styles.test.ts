/**
 * @fileoverview 样式系统测试
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { defaultTheme, generateCss, mergeTheme } from '../src/styles'
import type { Theme } from '../src/types/theme'

describe('defaultTheme', () => {
  it('should have all required properties', () => {
    expect(defaultTheme.fonts).toBeDefined()
    expect(defaultTheme.fonts.body).toBeDefined()
    expect(defaultTheme.fonts.heading).toBeDefined()
    expect(defaultTheme.fonts.mono).toBeDefined()

    expect(defaultTheme.colors).toBeDefined()
    expect(defaultTheme.colors.primary).toBeDefined()
    expect(defaultTheme.colors.border).toBeDefined()
    expect(defaultTheme.colors.background).toBeDefined()
    expect(defaultTheme.colors.text).toBeDefined()

    expect(defaultTheme.spacing).toBeDefined()
    expect(defaultTheme.spacing.pageMargin).toBeDefined()
    expect(defaultTheme.spacing.sectionGap).toBeDefined()
    expect(defaultTheme.spacing.cellPadding).toBeDefined()

    expect(defaultTheme.fontSize).toBeDefined()
    expect(defaultTheme.fontSize.body).toBeDefined()
    expect(defaultTheme.fontSize.hospitalName).toBeDefined()
    expect(defaultTheme.fontSize.formTitle).toBeDefined()

    expect(defaultTheme.borderWidth).toBeDefined()
  })

  it('should use Chinese fonts', () => {
    expect(defaultTheme.fonts.body).toContain('SimSun')
    expect(defaultTheme.fonts.heading).toContain('SimHei')
  })

  it('should use black as primary color', () => {
    expect(defaultTheme.colors.primary).toBe('#000000')
    expect(defaultTheme.colors.text).toBe('#000000')
  })
})

describe('mergeTheme', () => {
  it('should return default theme when no custom theme provided', () => {
    const result = mergeTheme()
    expect(result).toEqual(defaultTheme)
  })

  it('should return default theme when undefined provided', () => {
    const result = mergeTheme(undefined)
    expect(result).toEqual(defaultTheme)
  })

  it('should merge custom colors', () => {
    const customTheme: Partial<Theme> = {
      colors: { primary: '#ff0000' },
    }
    const result = mergeTheme(customTheme)

    expect(result.colors.primary).toBe('#ff0000')
    expect(result.colors.border).toBe(defaultTheme.colors.border) // 保持默认
  })

  it('should merge custom fonts', () => {
    const customTheme: Partial<Theme> = {
      fonts: { body: 'Arial, sans-serif' },
    }
    const result = mergeTheme(customTheme)

    expect(result.fonts.body).toBe('Arial, sans-serif')
    expect(result.fonts.heading).toBe(defaultTheme.fonts.heading)
  })

  it('should merge custom spacing', () => {
    const customTheme: Partial<Theme> = {
      spacing: { pageMargin: '15mm' },
    }
    const result = mergeTheme(customTheme)

    expect(result.spacing.pageMargin).toBe('15mm')
    expect(result.spacing.sectionGap).toBe(defaultTheme.spacing.sectionGap)
  })

  it('should merge custom fontSize', () => {
    const customTheme: Partial<Theme> = {
      fontSize: { body: '12pt' },
    }
    const result = mergeTheme(customTheme)

    expect(result.fontSize.body).toBe('12pt')
    expect(result.fontSize.formTitle).toBe(defaultTheme.fontSize.formTitle)
  })

  it('should merge custom borderWidth', () => {
    const customTheme: Partial<Theme> = {
      borderWidth: '2px',
    }
    const result = mergeTheme(customTheme)

    expect(result.borderWidth).toBe('2px')
  })

  // Property-based test: 合并后的主题应包含所有必需属性
  it('should always produce complete theme', () => {
    fc.assert(
      fc.property(
        fc.record({
          colors: fc.option(fc.record({ primary: fc.hexaString() }), { nil: undefined }),
          borderWidth: fc.option(fc.string(), { nil: undefined }),
        }),
        (partialTheme) => {
          const result = mergeTheme(partialTheme as Partial<Theme>)
          return (
            result.fonts !== undefined &&
            result.colors !== undefined &&
            result.spacing !== undefined &&
            result.fontSize !== undefined &&
            result.borderWidth !== undefined
          )
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('generateCss', () => {
  it('should generate valid CSS string', () => {
    const css = generateCss(defaultTheme)

    expect(css).toContain('.print-page')
    expect(css).toContain('.print-header')
    expect(css).toContain('.info-grid')
    expect(css).toContain('.data-table')
    expect(css).toContain('.checkbox-grid')
    expect(css).toContain('.signature-area')
    expect(css).toContain('.notes-section')
    expect(css).toContain('.free-text')
    expect(css).toContain('.watermark')
  })

  it('should include theme values in CSS', () => {
    const css = generateCss(defaultTheme)

    expect(css).toContain(defaultTheme.fonts.body)
    expect(css).toContain(defaultTheme.colors.text)
    expect(css).toContain(defaultTheme.spacing.pageMargin)
    expect(css).toContain(defaultTheme.fontSize.body)
    expect(css).toContain(defaultTheme.borderWidth)
  })

  it('should include print media query', () => {
    const css = generateCss(defaultTheme)

    expect(css).toContain('@media print')
    expect(css).toContain('@page')
  })

  it('should include page size classes', () => {
    const css = generateCss(defaultTheme)

    expect(css).toContain('.print-page.landscape')
    expect(css).toContain('.print-page.a5')
    expect(css).toContain('.print-page.16k')
    expect(css).toContain('210mm') // A4 width
    expect(css).toContain('297mm') // A4 height
    expect(css).toContain('195mm') // 16K width
    expect(css).toContain('270mm') // 16K height
  })

  it('should use custom theme values', () => {
    const customTheme: Theme = {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, primary: '#ff0000', border: '#0000ff' },
      borderWidth: '3px',
    }
    const css = generateCss(customTheme)

    expect(css).toContain('#0000ff')
    expect(css).toContain('3px')
  })

  // Property-based test: CSS 应该是非空字符串
  it('should always generate non-empty CSS', () => {
    fc.assert(
      fc.property(
        fc.constant(defaultTheme),
        (theme) => {
          const css = generateCss(theme)
          return typeof css === 'string' && css.length > 0
        }
      ),
      { numRuns: 10 }
    )
  })

  // Property-based test: CSS 应包含所有必需的类选择器
  it('should include all required class selectors', () => {
    const requiredClasses = [
      '.print-page',
      '.print-header',
      '.hospital-name',
      '.form-title',
      '.print-section',
      '.section-title',
      '.info-grid',
      '.data-table',
      '.checkbox-grid',
      '.signature-area',
      '.notes-section',
      '.free-text',
      '.print-footer',
      '.watermark',
    ]

    const css = generateCss(defaultTheme)

    requiredClasses.forEach((className) => {
      expect(css).toContain(className)
    })
  })
})
