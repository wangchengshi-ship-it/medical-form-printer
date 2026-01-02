/**
 * @fileoverview 内联样式测试
 * @module test/inline-styles
 */

import { describe, it, expect } from 'vitest'
import {
  createInlineStyles,
  styleToString,
  mergeStyles,
  getPageStyles,
  defaultInlineStyles,
} from '../src/styles/inline-styles'
import { defaultTheme } from '../src/styles/default-theme'

describe('styleToString', () => {
  it('should convert style object to CSS string', () => {
    const styles = {
      color: 'red',
      fontSize: '14px',
    }
    expect(styleToString(styles)).toBe('color: red; font-size: 14px')
  })

  it('should convert camelCase to kebab-case', () => {
    const styles = {
      backgroundColor: 'blue',
      borderTopWidth: '1px',
    }
    expect(styleToString(styles)).toBe('background-color: blue; border-top-width: 1px')
  })

  it('should handle empty object', () => {
    expect(styleToString({})).toBe('')
  })

  it('should handle numeric values', () => {
    const styles = {
      zIndex: 1000,
      opacity: 0.5,
    }
    expect(styleToString(styles)).toBe('z-index: 1000; opacity: 0.5')
  })
})

describe('mergeStyles', () => {
  it('should merge multiple style objects', () => {
    const base = { color: 'red', fontSize: '14px' }
    const override = { color: 'blue', fontWeight: 'bold' }
    
    const result = mergeStyles(base, override)
    
    expect(result).toEqual({
      color: 'blue',
      fontSize: '14px',
      fontWeight: 'bold',
    })
  })

  it('should handle undefined values', () => {
    const base = { color: 'red' }
    const result = mergeStyles(base, undefined, null)
    
    expect(result).toEqual({ color: 'red' })
  })

  it('should handle empty call', () => {
    expect(mergeStyles()).toEqual({})
  })
})

describe('createInlineStyles', () => {
  it('should create inline styles with default theme', () => {
    const styles = createInlineStyles()
    
    expect(styles.printPage).toBeDefined()
    expect(styles.printHeader).toBeDefined()
    expect(styles.infoGridTable).toBeDefined()
    expect(styles.dataTableTable).toBeDefined()
    expect(styles.checkboxGrid).toBeDefined()
    expect(styles.signatureArea).toBeDefined()
    expect(styles.watermark).toBeDefined()
  })

  it('should use theme values', () => {
    const styles = createInlineStyles(defaultTheme)
    
    expect(styles.printPage.fontFamily).toBe(defaultTheme.fonts.body)
    expect(styles.printPage.fontSize).toBe(defaultTheme.fontSize.body)
    expect(styles.printPage.color).toBe(defaultTheme.colors.text)
  })

  it('should create correct page dimensions', () => {
    const styles = createInlineStyles()
    
    // A4 portrait
    expect(styles.printPage.width).toBe('210mm')
    expect(styles.printPage.minHeight).toBe('297mm')
    
    // A4 landscape
    expect(styles.printPageLandscape.width).toBe('297mm')
    expect(styles.printPageLandscape.minHeight).toBe('210mm')
    
    // A5
    expect(styles.printPageA5.width).toBe('148mm')
    expect(styles.printPageA5.minHeight).toBe('210mm')
    
    // 16K
    expect(styles.printPage16K.width).toBe('195mm')
    expect(styles.printPage16K.minHeight).toBe('270mm')
  })

  it('should create correct border styles', () => {
    const styles = createInlineStyles(defaultTheme)
    
    expect(styles.infoGridTd.border).toContain(defaultTheme.borderWidth)
    expect(styles.infoGridTd.border).toContain(defaultTheme.colors.border)
    expect(styles.dataTableTh.border).toContain(defaultTheme.borderWidth)
    expect(styles.signatureLine.borderBottom).toContain(defaultTheme.borderWidth)
  })
})

describe('getPageStyles', () => {
  const styles = createInlineStyles()

  it('should return A4 portrait styles by default', () => {
    const pageStyles = getPageStyles('A4', 'portrait', styles)
    
    expect(pageStyles.width).toBe('210mm')
    expect(pageStyles.minHeight).toBe('297mm')
  })

  it('should return A4 landscape styles', () => {
    const pageStyles = getPageStyles('A4', 'landscape', styles)
    
    expect(pageStyles.width).toBe('297mm')
    expect(pageStyles.minHeight).toBe('210mm')
  })

  it('should return A5 portrait styles', () => {
    const pageStyles = getPageStyles('A5', 'portrait', styles)
    
    expect(pageStyles.width).toBe('148mm')
    expect(pageStyles.minHeight).toBe('210mm')
  })

  it('should return A5 landscape styles', () => {
    const pageStyles = getPageStyles('A5', 'landscape', styles)
    
    expect(pageStyles.width).toBe('210mm')
    expect(pageStyles.minHeight).toBe('148mm')
  })

  it('should return 16K portrait styles', () => {
    const pageStyles = getPageStyles('16K', 'portrait', styles)
    
    expect(pageStyles.width).toBe('195mm')
    expect(pageStyles.minHeight).toBe('270mm')
  })

  it('should return 16K landscape styles', () => {
    const pageStyles = getPageStyles('16K', 'landscape', styles)
    
    expect(pageStyles.width).toBe('270mm')
    expect(pageStyles.minHeight).toBe('195mm')
  })

  it('should be case insensitive for page size', () => {
    const pageStyles = getPageStyles('a5', 'portrait', styles)
    
    expect(pageStyles.width).toBe('148mm')
  })
})

describe('defaultInlineStyles', () => {
  it('should be pre-created with default theme', () => {
    expect(defaultInlineStyles).toBeDefined()
    expect(defaultInlineStyles.printPage).toBeDefined()
    expect(defaultInlineStyles.printPage.fontFamily).toBe(defaultTheme.fonts.body)
  })
})

describe('inline styles completeness', () => {
  const styles = createInlineStyles()

  it('should have all required page styles', () => {
    expect(styles.printPage).toBeDefined()
    expect(styles.printPageLandscape).toBeDefined()
    expect(styles.printPageA5).toBeDefined()
    expect(styles.printPageA5Landscape).toBeDefined()
    expect(styles.printPage16K).toBeDefined()
    expect(styles.printPage16KLandscape).toBeDefined()
  })

  it('should have all required header styles', () => {
    expect(styles.printHeader).toBeDefined()
    expect(styles.hospitalName).toBeDefined()
    expect(styles.departmentName).toBeDefined()
    expect(styles.formTitle).toBeDefined()
  })

  it('should have all required section styles', () => {
    expect(styles.printSection).toBeDefined()
    expect(styles.sectionTitle).toBeDefined()
  })

  it('should have all required info-grid styles', () => {
    expect(styles.infoGridTable).toBeDefined()
    expect(styles.infoGridTd).toBeDefined()
    expect(styles.infoGridLabelCell).toBeDefined()
    expect(styles.infoGridValueCell).toBeDefined()
  })

  it('should have all required data-table styles', () => {
    expect(styles.dataTableTable).toBeDefined()
    expect(styles.dataTableTh).toBeDefined()
    expect(styles.dataTableTd).toBeDefined()
  })

  it('should have all required checkbox-grid styles', () => {
    expect(styles.checkboxGrid).toBeDefined()
    expect(styles.checkboxGridFlex).toBeDefined()
    expect(styles.checkboxItem).toBeDefined()
    expect(styles.checkboxSymbol).toBeDefined()
  })

  it('should have all required signature styles', () => {
    expect(styles.signatureArea).toBeDefined()
    expect(styles.signatureItem).toBeDefined()
    expect(styles.signatureLine).toBeDefined()
  })

  it('should have all required notes styles', () => {
    expect(styles.notesSection).toBeDefined()
    expect(styles.notesSectionBordered).toBeDefined()
  })

  it('should have all required free-text styles', () => {
    expect(styles.freeText).toBeDefined()
  })

  it('should have all required footer styles', () => {
    expect(styles.printFooter).toBeDefined()
  })

  it('should have watermark styles', () => {
    expect(styles.watermark).toBeDefined()
    expect(styles.watermark.position).toBe('fixed')
    expect(styles.watermark.transform).toContain('rotate')
  })
})
