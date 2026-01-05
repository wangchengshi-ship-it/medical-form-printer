/**
 * @fileoverview 内容测量器测试
 * @module test/content-measurer
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 测试内容测量器的各项功能：
 * - 类型定义和常量
 * - 文本高度估算（不需要 DOM）
 * - 环境检测
 *
 * 注意：由于测试环境是 Node.js，无法测试需要 DOM 的功能。
 * DOM 相关功能需要在浏览器环境或使用 jsdom 进行测试。
 *
 * @requirements
 * - 10.1: 创建隐藏容器匹配打印样式
 * - 10.4: 处理文本换行估算
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  // 类型守卫
  isValidMeasureConfig,
  isValidMeasureResult,
  // 常量
  DEFAULT_MEASURE_CONFIG,
  MEASURE_CONTAINER_CLASS,
  DEFAULT_TEXT_ESTIMATE_OPTIONS,
  MEASURE_SELECTORS,
  // 文本估算
  estimateTextHeight,
  estimateMultipleTextHeights,
  estimateTableRowHeight,
  // 环境检测
  isBrowserEnvironment,
} from '../src/pagination/content-measurer'

// ==================== 常量测试 ====================

describe('Content Measurer Constants', () => {
  describe('DEFAULT_MEASURE_CONFIG', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_MEASURE_CONFIG).toHaveProperty('containerWidth')
      expect(DEFAULT_MEASURE_CONFIG).toHaveProperty('fontSize')
      expect(DEFAULT_MEASURE_CONFIG).toHaveProperty('lineHeight')
      expect(DEFAULT_MEASURE_CONFIG).toHaveProperty('fontFamily')
    })

    it('should have valid default values', () => {
      expect(DEFAULT_MEASURE_CONFIG.containerWidth).toBeGreaterThan(0)
      expect(DEFAULT_MEASURE_CONFIG.fontSize).toBe('10pt')
      expect(DEFAULT_MEASURE_CONFIG.lineHeight).toBe(1.8)
      expect(DEFAULT_MEASURE_CONFIG.fontFamily).toContain('Source Han Serif SC')
    })
  })

  describe('MEASURE_CONTAINER_CLASS', () => {
    it('should be a non-empty string', () => {
      expect(typeof MEASURE_CONTAINER_CLASS).toBe('string')
      expect(MEASURE_CONTAINER_CLASS.length).toBeGreaterThan(0)
    })
  })

  describe('DEFAULT_TEXT_ESTIMATE_OPTIONS', () => {
    it('should have all required properties', () => {
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS).toHaveProperty('containerWidth')
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS).toHaveProperty('fontSize')
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS).toHaveProperty('lineHeight')
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS).toHaveProperty('isChinese')
    })

    it('should have valid default values', () => {
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS.containerWidth).toBeGreaterThan(0)
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize).toBeCloseTo(13.33, 1)
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS.lineHeight).toBe(1.8)
      expect(DEFAULT_TEXT_ESTIMATE_OPTIONS.isChinese).toBe(true)
    })
  })

  describe('MEASURE_SELECTORS', () => {
    it('should have all required selectors', () => {
      expect(MEASURE_SELECTORS).toHaveProperty('HEADER')
      expect(MEASURE_SELECTORS).toHaveProperty('BODY')
      expect(MEASURE_SELECTORS).toHaveProperty('SECTION_TITLE')
      expect(MEASURE_SELECTORS).toHaveProperty('INFO_GRID_WRAPPER')
      expect(MEASURE_SELECTORS).toHaveProperty('TABLE_WRAPPER')
      expect(MEASURE_SELECTORS).toHaveProperty('CHECKBOX_GRID_WRAPPER')
      expect(MEASURE_SELECTORS).toHaveProperty('MEDICAL_CHECKBOX_ROW_WRAPPER')
      expect(MEASURE_SELECTORS).toHaveProperty('NOTES')
      expect(MEASURE_SELECTORS).toHaveProperty('SIGNATURE')
      expect(MEASURE_SELECTORS).toHaveProperty('TABLE_HEADER')
      expect(MEASURE_SELECTORS).toHaveProperty('TABLE_ROWS')
    })

    it('should have valid CSS selectors', () => {
      // All selectors should be non-empty strings
      Object.values(MEASURE_SELECTORS).forEach((selector) => {
        expect(typeof selector).toBe('string')
        expect(selector.length).toBeGreaterThan(0)
      })
    })
  })
})

// ==================== 类型守卫测试 ====================

describe('Type Guards', () => {
  describe('isValidMeasureConfig', () => {
    it('should return true for valid config', () => {
      expect(isValidMeasureConfig({ containerWidth: 624 })).toBe(true)
      expect(
        isValidMeasureConfig({
          containerWidth: 624,
          fontSize: '10pt',
          lineHeight: 1.8,
          fontFamily: 'serif',
        })
      ).toBe(true)
    })

    it('should return false for invalid config', () => {
      expect(isValidMeasureConfig(null)).toBe(false)
      expect(isValidMeasureConfig(undefined)).toBe(false)
      expect(isValidMeasureConfig({})).toBe(false)
      expect(isValidMeasureConfig({ containerWidth: -1 })).toBe(false)
      expect(isValidMeasureConfig({ containerWidth: 'invalid' })).toBe(false)
      expect(isValidMeasureConfig({ containerWidth: 624, fontSize: 123 })).toBe(false)
    })
  })

  describe('isValidMeasureResult', () => {
    it('should return true for valid result', () => {
      expect(isValidMeasureResult({ id: 'test', height: 100 })).toBe(true)
      expect(isValidMeasureResult({ id: 'test', height: 0 })).toBe(true)
    })

    it('should return false for invalid result', () => {
      expect(isValidMeasureResult(null)).toBe(false)
      expect(isValidMeasureResult(undefined)).toBe(false)
      expect(isValidMeasureResult({})).toBe(false)
      expect(isValidMeasureResult({ id: '', height: 100 })).toBe(false)
      expect(isValidMeasureResult({ id: 'test', height: -1 })).toBe(false)
      expect(isValidMeasureResult({ id: 'test', height: 'invalid' })).toBe(false)
    })
  })
})

// ==================== 环境检测测试 ====================

describe('Environment Detection', () => {
  describe('isBrowserEnvironment', () => {
    it('should return false in Node.js environment', () => {
      expect(isBrowserEnvironment()).toBe(false)
    })
  })
})

// ==================== 文本高度估算测试 ====================

describe('Text Height Estimation', () => {
  describe('estimateTextHeight', () => {
    it('should return 0 for empty text', () => {
      expect(estimateTextHeight('')).toBe(0)
      expect(estimateTextHeight('', { containerWidth: 624 })).toBe(0)
    })

    it('should estimate height for single line text', () => {
      const height = estimateTextHeight('测试', {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // Single line: 1 * 13.33 * 1.8 ≈ 24
      expect(height).toBeCloseTo(24, 0)
    })

    it('should estimate height for multi-line text', () => {
      const height = estimateTextHeight('第一行\n第二行\n第三行', {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // 3 lines: 3 * 13.33 * 1.8 ≈ 72
      expect(height).toBeCloseTo(72, 0)
    })

    it('should handle text wrapping for long lines', () => {
      // Create a long text that should wrap
      const longText = '这是一段很长的中文文本，需要自动换行处理。'.repeat(10)
      const height = estimateTextHeight(longText, {
        containerWidth: 200, // Narrow container
        fontSize: 13.33,
        lineHeight: 1.8,
        isChinese: true,
      })
      // Should be multiple lines
      expect(height).toBeGreaterThan(24)
    })

    it('should use default options when not provided', () => {
      const height = estimateTextHeight('测试文本')
      expect(height).toBeGreaterThan(0)
    })

    it('should handle empty lines', () => {
      const height = estimateTextHeight('\n\n\n', {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // 4 empty lines (including the implicit first one)
      expect(height).toBeGreaterThan(0)
    })
  })

  describe('estimateMultipleTextHeights', () => {
    it('should return 0 for empty array', () => {
      expect(estimateMultipleTextHeights([])).toBe(0)
    })

    it('should sum heights of multiple texts', () => {
      const texts = ['第一段', '第二段', '第三段']
      const totalHeight = estimateMultipleTextHeights(texts, {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // 3 single-line texts: 3 * 13.33 * 1.8 ≈ 72
      expect(totalHeight).toBeCloseTo(72, 0)
    })

    it('should handle mixed empty and non-empty texts', () => {
      const texts = ['文本', '', '另一段文本']
      const totalHeight = estimateMultipleTextHeights(texts, {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // 2 non-empty texts: 2 * 13.33 * 1.8 ≈ 48
      expect(totalHeight).toBeCloseTo(48, 0)
    })
  })

  describe('estimateTableRowHeight', () => {
    it('should return minimum height for empty cells', () => {
      const height = estimateTableRowHeight([], {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // Minimum height is fontSize + padding
      expect(height).toBeGreaterThan(0)
    })

    it('should estimate height based on tallest cell', () => {
      const cells = ['短文本', '这是一段比较长的文本内容\n包含换行']
      const height = estimateTableRowHeight(cells, {
        containerWidth: 200,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // Should be based on the taller cell
      expect(height).toBeGreaterThan(24)
    })

    it('should include padding in height calculation', () => {
      const height = estimateTableRowHeight(['测试'], {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      })
      // Height should include padding (fontSize * 0.5 * 2)
      const textHeight = 13.33 * 1.8
      const padding = 13.33 * 0.5 * 2
      expect(height).toBeCloseTo(textHeight + padding, 0)
    })
  })
})

// ==================== 属性测试 ====================

describe('Property-Based Tests', () => {
  describe('Text Height Estimation Properties', () => {
    it('should always return non-negative height', () => {
      const testCases = [
        '',
        'a',
        '测试',
        'Hello World',
        '这是一段很长的中文文本'.repeat(100),
        '\n'.repeat(10),
        '   ',
      ]

      testCases.forEach((text) => {
        const height = estimateTextHeight(text)
        expect(height).toBeGreaterThanOrEqual(0)
      })
    })

    it('should increase height with more lines', () => {
      const options = {
        containerWidth: 624,
        fontSize: 13.33,
        lineHeight: 1.8,
      }

      const height1 = estimateTextHeight('一行', options)
      const height2 = estimateTextHeight('一行\n两行', options)
      const height3 = estimateTextHeight('一行\n两行\n三行', options)

      expect(height2).toBeGreaterThan(height1)
      expect(height3).toBeGreaterThan(height2)
    })

    it('should increase height with narrower container', () => {
      const longText = '这是一段需要换行的长文本内容测试'

      const heightWide = estimateTextHeight(longText, {
        containerWidth: 1000,
        fontSize: 13.33,
        lineHeight: 1.8,
      })

      const heightNarrow = estimateTextHeight(longText, {
        containerWidth: 100,
        fontSize: 13.33,
        lineHeight: 1.8,
      })

      expect(heightNarrow).toBeGreaterThanOrEqual(heightWide)
    })
  })
})


// ==================== JSDOM 测试 ====================

import { JSDOM } from 'jsdom'

describe('Content Measurer with JSDOM', () => {
  let dom: JSDOM
  let originalWindow: typeof globalThis.window
  let originalDocument: typeof globalThis.document

  beforeEach(() => {
    // Save original globals
    originalWindow = globalThis.window
    originalDocument = globalThis.document

    // Create JSDOM instance
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      pretendToBeVisual: true,
    })

    // Set up global DOM environment
    globalThis.window = dom.window as unknown as typeof globalThis.window
    globalThis.document = dom.window.document
  })

  afterEach(() => {
    // Restore original globals
    globalThis.window = originalWindow
    globalThis.document = originalDocument
  })

  describe('MEASURE_SELECTORS.FOOTER', () => {
    it('should be defined', () => {
      expect(MEASURE_SELECTORS.FOOTER).toBeDefined()
    })

    it('should match .print-footer class', () => {
      const container = document.createElement('div')
      container.innerHTML = '<div class="print-footer">Footer</div>'
      document.body.appendChild(container)

      const footer = container.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).not.toBeNull()
      expect(footer?.textContent).toBe('Footer')

      document.body.removeChild(container)
    })

    it('should match .mpr-print-footer class (isolated mode)', () => {
      const container = document.createElement('div')
      container.innerHTML = '<div class="mpr-print-footer">Isolated Footer</div>'
      document.body.appendChild(container)

      const footer = container.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).not.toBeNull()
      expect(footer?.textContent).toBe('Isolated Footer')

      document.body.removeChild(container)
    })

    it('should match both class variants in same container', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <div class="print-footer">Normal Footer</div>
        <div class="mpr-print-footer">Isolated Footer</div>
      `
      document.body.appendChild(container)

      const footers = container.querySelectorAll(MEASURE_SELECTORS.FOOTER)
      expect(footers.length).toBe(2)

      document.body.removeChild(container)
    })
  })

  describe('Footer selector in page structure', () => {
    it('should find print-footer in complete page structure', () => {
      const pageContainer = document.createElement('div')
      pageContainer.innerHTML = `
        <div class="print-page">
          <div class="print-header">Header</div>
          <div class="print-body">
            <div class="info-grid" data-section-id="0">Content</div>
          </div>
          <div class="print-footer">
            <span class="page-number">Page 1 of 1</span>
          </div>
        </div>
      `
      document.body.appendChild(pageContainer)

      // Find print-page first
      const printPage = pageContainer.querySelector('.print-page')
      expect(printPage).not.toBeNull()

      // Find footer within print-page
      const footer = printPage?.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).not.toBeNull()
      expect(footer?.querySelector('.page-number')?.textContent).toBe('Page 1 of 1')

      document.body.removeChild(pageContainer)
    })

    it('should not find footer when print-footer is missing', () => {
      const pageContainer = document.createElement('div')
      pageContainer.innerHTML = `
        <div class="print-page">
          <div class="print-header">Header</div>
          <div class="print-body">
            <div class="info-grid" data-section-id="0">Content</div>
          </div>
        </div>
      `
      document.body.appendChild(pageContainer)

      const printPage = pageContainer.querySelector('.print-page')
      const footer = printPage?.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).toBeNull()

      document.body.removeChild(pageContainer)
    })

    it('should find mpr-print-footer in isolated mode page structure', () => {
      const pageContainer = document.createElement('div')
      pageContainer.innerHTML = `
        <div class="mpr-print-page">
          <div class="mpr-print-header">Header</div>
          <div class="mpr-print-body">
            <div class="mpr-info-grid" data-section-id="0">Content</div>
          </div>
          <div class="mpr-print-footer">
            <span class="page-number">Page 1 of 1</span>
          </div>
        </div>
      `
      document.body.appendChild(pageContainer)

      const printPage = pageContainer.querySelector('.mpr-print-page')
      expect(printPage).not.toBeNull()

      const footer = printPage?.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).not.toBeNull()
      expect(footer?.classList.contains('mpr-print-footer')).toBe(true)

      document.body.removeChild(pageContainer)
    })

    it('should find both footer and notes in same page', () => {
      const pageContainer = document.createElement('div')
      pageContainer.innerHTML = `
        <div class="print-page">
          <div class="print-header">Header</div>
          <div class="print-body">
            <div class="info-grid" data-section-id="0">Content</div>
            <div class="notes-section">Notes content</div>
          </div>
          <div class="print-footer">
            <span class="page-number">Page 1 of 1</span>
          </div>
        </div>
      `
      document.body.appendChild(pageContainer)

      const printPage = pageContainer.querySelector('.print-page')
      const printBody = printPage?.querySelector('.print-body')

      // Find footer
      const footer = printPage?.querySelector(MEASURE_SELECTORS.FOOTER)
      expect(footer).not.toBeNull()

      // Find notes
      const notes = printBody?.querySelectorAll(MEASURE_SELECTORS.NOTES)
      expect(notes?.length).toBeGreaterThan(0)

      document.body.removeChild(pageContainer)
    })
  })
})
