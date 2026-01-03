/**
 * @fileoverview 字体模块单元测试
 * @module test/fonts
 * @description 测试字体 Data URL、CSS 生成和加载状态检查功能
 * 
 * _Requirements: 5.1, 5.2_
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFontDataUrl,
  getFontCss,
  isFontLoaded,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_STYLE,
  generateFontFace,
  generateFontOverrideCss,
} from '../src/fonts'
import { _resetFontLoadState } from '../src/fonts/font-loader'

describe('Font Module', () => {
  describe('getFontDataUrl()', () => {
    it('should return a valid data URL', () => {
      const dataUrl = getFontDataUrl()
      
      expect(dataUrl).toBeDefined()
      expect(typeof dataUrl).toBe('string')
      expect(dataUrl.startsWith('data:font/woff2;base64,')).toBe(true)
    })

    it('should return non-empty base64 content', () => {
      const dataUrl = getFontDataUrl()
      const base64Content = dataUrl.replace('data:font/woff2;base64,', '')
      
      expect(base64Content.length).toBeGreaterThan(0)
    })

    it('should return consistent value on multiple calls', () => {
      const dataUrl1 = getFontDataUrl()
      const dataUrl2 = getFontDataUrl()
      
      expect(dataUrl1).toBe(dataUrl2)
    })
  })

  describe('getFontCss()', () => {
    it('should return a non-empty CSS string', () => {
      const css = getFontCss()
      
      expect(css).toBeDefined()
      expect(typeof css).toBe('string')
      expect(css.length).toBeGreaterThan(0)
    })

    it('should contain @font-face declaration', () => {
      const css = getFontCss()
      
      expect(css).toContain('@font-face')
    })

    it('should contain correct font-family', () => {
      const css = getFontCss()
      
      expect(css).toContain(`font-family: '${FONT_FAMILY}'`)
    })

    it('should contain font-display: block', () => {
      const css = getFontCss()
      
      expect(css).toContain('font-display: block')
    })

    it('should contain font-synthesis: none', () => {
      const css = getFontCss()
      
      expect(css).toContain('font-synthesis: none')
    })

    it('should contain !important for font-family override', () => {
      const css = getFontCss()
      
      expect(css).toContain('font-family:')
      expect(css).toContain('!important')
    })

    it('should contain data URL in src', () => {
      const css = getFontCss()
      
      expect(css).toContain("url('data:font/woff2;base64,")
    })

    it('should contain woff2 format declaration', () => {
      const css = getFontCss()
      
      expect(css).toContain("format('woff2')")
    })
  })

  describe('generateFontFace()', () => {
    it('should generate valid @font-face CSS', () => {
      const fontFace = generateFontFace()
      
      expect(fontFace).toContain('@font-face')
      expect(fontFace).toContain(`font-family: '${FONT_FAMILY}'`)
      expect(fontFace).toContain(`font-weight: ${FONT_WEIGHT}`)
      expect(fontFace).toContain(`font-style: ${FONT_STYLE}`)
      expect(fontFace).toContain('font-display: block')
    })
  })

  describe('generateFontOverrideCss()', () => {
    it('should generate font override CSS with !important', () => {
      const overrideCss = generateFontOverrideCss()
      
      expect(overrideCss).toContain('.mpr-root')
      expect(overrideCss).toContain(`font-family: '${FONT_FAMILY}', serif !important`)
      expect(overrideCss).toContain('font-synthesis: none !important')
    })

    it('should include font smoothing rules', () => {
      const overrideCss = generateFontOverrideCss()
      
      expect(overrideCss).toContain('-webkit-font-smoothing')
      expect(overrideCss).toContain('-moz-osx-font-smoothing')
    })
  })

  describe('isFontLoaded()', () => {
    beforeEach(() => {
      // Reset font load state before each test
      _resetFontLoadState()
    })

    it('should return a boolean value', () => {
      const result = isFontLoaded()
      
      expect(typeof result).toBe('boolean')
    })

    it('should return true in Node.js environment (no browser)', () => {
      // In Node.js environment, fonts are embedded and don't need loading
      const result = isFontLoaded()
      
      expect(result).toBe(true)
    })
  })

  describe('Font Constants', () => {
    it('should export correct FONT_FAMILY', () => {
      expect(FONT_FAMILY).toBe('Source Han Serif SC')
    })

    it('should export correct FONT_WEIGHT', () => {
      expect(FONT_WEIGHT).toBe(400)
    })

    it('should export correct FONT_STYLE', () => {
      expect(FONT_STYLE).toBe('normal')
    })
  })
})
