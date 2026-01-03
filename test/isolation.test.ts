/**
 * @fileoverview CSS 隔离模块单元测试
 * @module test/isolation
 * @description 测试 CSS 命名空间和隔离容器样式生成功能
 * 
 * _Requirements: 3.2, 3.3, 3.4, 3.6_
 */

import { describe, it, expect } from 'vitest'
import {
  CSS_NAMESPACE,
  ISOLATION_ROOT_CLASS,
  namespaceClass,
  namespaceClasses,
  generateIsolationCss,
  CLASS_NAME_MAP,
  getNamespacedClass,
} from '../src/styles/isolation'

describe('CSS Isolation Module', () => {
  describe('Constants', () => {
    it('should export CSS_NAMESPACE as "mpr"', () => {
      expect(CSS_NAMESPACE).toBe('mpr')
    })

    it('should export ISOLATION_ROOT_CLASS as "mpr-root"', () => {
      expect(ISOLATION_ROOT_CLASS).toBe('mpr-root')
    })
  })

  describe('namespaceClass()', () => {
    it('should add mpr- prefix to class name', () => {
      expect(namespaceClass('print-page')).toBe('mpr-print-page')
    })

    it('should add prefix to simple class names', () => {
      expect(namespaceClass('header')).toBe('mpr-header')
      expect(namespaceClass('footer')).toBe('mpr-footer')
      expect(namespaceClass('content')).toBe('mpr-content')
    })

    it('should not add duplicate prefix if already prefixed', () => {
      expect(namespaceClass('mpr-print-page')).toBe('mpr-print-page')
      expect(namespaceClass('mpr-header')).toBe('mpr-header')
    })

    it('should handle empty string', () => {
      expect(namespaceClass('')).toBe('mpr-')
    })

    it('should handle class names with hyphens', () => {
      expect(namespaceClass('info-grid')).toBe('mpr-info-grid')
      expect(namespaceClass('data-table')).toBe('mpr-data-table')
      expect(namespaceClass('checkbox-grid')).toBe('mpr-checkbox-grid')
    })
  })

  describe('namespaceClasses()', () => {
    it('should add prefix to all class names in array', () => {
      const result = namespaceClasses(['print-page', 'header', 'footer'])
      expect(result).toEqual(['mpr-print-page', 'mpr-header', 'mpr-footer'])
    })

    it('should return empty array for empty input', () => {
      expect(namespaceClasses([])).toEqual([])
    })

    it('should not duplicate prefix for already prefixed classes', () => {
      const result = namespaceClasses(['mpr-header', 'footer'])
      expect(result).toEqual(['mpr-header', 'mpr-footer'])
    })

    it('should handle mixed prefixed and non-prefixed classes', () => {
      const result = namespaceClasses(['mpr-header', 'content', 'mpr-footer'])
      expect(result).toEqual(['mpr-header', 'mpr-content', 'mpr-footer'])
    })
  })

  describe('generateIsolationCss()', () => {
    it('should return non-empty CSS string', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toBeDefined()
      expect(typeof isolationCss).toBe('string')
      expect(isolationCss.length).toBeGreaterThan(0)
    })

    it('should contain mpr-root class selector', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('.mpr-root')
    })

    // Requirement 3.2: all: initial
    it('should contain "all: initial" for style reset', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('all: initial')
    })

    // Requirement 3.3: contain: strict
    it('should contain "contain: strict" for layout containment', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('contain: strict')
    })

    // Requirement 3.4: isolation: isolate
    it('should contain "isolation: isolate" for stacking context', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('isolation: isolate')
    })

    it('should contain display: block', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('display: block')
    })

    it('should contain box-sizing: border-box', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('box-sizing: border-box')
    })

    it('should contain wildcard selector for child elements', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('.mpr-root *')
    })

    it('should contain pseudo-element selectors', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('::before')
      expect(isolationCss).toContain('::after')
    })

    it('should reset margin and padding', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('margin: 0')
      expect(isolationCss).toContain('padding: 0')
    })

    it('should set text direction', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('direction: ltr')
      expect(isolationCss).toContain('text-align: left')
    })

    it('should ensure visibility', () => {
      const isolationCss = generateIsolationCss()
      expect(isolationCss).toContain('visibility: visible')
      expect(isolationCss).toContain('opacity: 1')
    })
  })

  describe('CLASS_NAME_MAP', () => {
    it('should contain all page layout classes', () => {
      expect(CLASS_NAME_MAP['print-page']).toBe('mpr-print-page')
      expect(CLASS_NAME_MAP['print-header']).toBe('mpr-print-header')
      expect(CLASS_NAME_MAP['print-content']).toBe('mpr-print-content')
      expect(CLASS_NAME_MAP['print-footer']).toBe('mpr-print-footer')
    })

    it('should contain all section classes', () => {
      expect(CLASS_NAME_MAP['section-title']).toBe('mpr-section-title')
      expect(CLASS_NAME_MAP['info-grid']).toBe('mpr-info-grid')
      expect(CLASS_NAME_MAP['data-table']).toBe('mpr-data-table')
      expect(CLASS_NAME_MAP['checkbox-grid']).toBe('mpr-checkbox-grid')
    })

    it('should contain signature classes', () => {
      expect(CLASS_NAME_MAP['signature-area']).toBe('mpr-signature-area')
      expect(CLASS_NAME_MAP['signature-item']).toBe('mpr-signature-item')
      expect(CLASS_NAME_MAP['signature-label']).toBe('mpr-signature-label')
      expect(CLASS_NAME_MAP['signature-line']).toBe('mpr-signature-line')
    })

    it('should contain page size modifier classes', () => {
      expect(CLASS_NAME_MAP['landscape']).toBe('mpr-landscape')
      expect(CLASS_NAME_MAP['a5']).toBe('mpr-a5')
      expect(CLASS_NAME_MAP['16k']).toBe('mpr-16k')
    })

    it('should have all values prefixed with mpr-', () => {
      Object.values(CLASS_NAME_MAP).forEach((value) => {
        expect(value.startsWith('mpr-')).toBe(true)
      })
    })
  })

  describe('getNamespacedClass()', () => {
    it('should return mapped class for known class names', () => {
      expect(getNamespacedClass('print-page')).toBe('mpr-print-page')
      expect(getNamespacedClass('info-grid')).toBe('mpr-info-grid')
    })

    it('should add prefix for unknown class names', () => {
      expect(getNamespacedClass('custom-class')).toBe('mpr-custom-class')
      expect(getNamespacedClass('unknown')).toBe('mpr-unknown')
    })

    it('should not duplicate prefix for already prefixed classes', () => {
      expect(getNamespacedClass('mpr-custom')).toBe('mpr-custom')
    })
  })
})
