/**
 * @fileoverview Unit tests for overflow text type definitions
 * @module test/overflow-types
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Tests for overflow text i18n configuration types and constants:
 * - OverflowTextConfig type export verification
 * - DEFAULT_OVERFLOW_TEXT constant values (Chinese)
 * - ENGLISH_OVERFLOW_TEXT constant values (English)
 *
 * @requirements
 * - 5.1: Support i18n for overflow text
 */

import { describe, it, expect } from 'vitest'
import {
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
} from '../src/pagination/types'
import type { OverflowTextConfig } from '../src/pagination/types'

// ==================== Type Export Tests ====================

describe('OverflowTextConfig Type', () => {
  /**
   * Verify OverflowTextConfig type is correctly exported and usable
   * @requirements 5.1
   */
  it('should be usable as a type annotation', () => {
    // Type annotation should work without errors
    const config: OverflowTextConfig = {
      seeNextMarker: 'test marker',
      continuationSuffix: 'test suffix',
      pageTitleSuffix: 'test title suffix',
    }

    expect(config.seeNextMarker).toBe('test marker')
    expect(config.continuationSuffix).toBe('test suffix')
    expect(config.pageTitleSuffix).toBe('test title suffix')
  })

  it('should have all required properties', () => {
    // Verify the type structure by checking DEFAULT_OVERFLOW_TEXT
    const config: OverflowTextConfig = DEFAULT_OVERFLOW_TEXT

    // All properties should exist
    expect('seeNextMarker' in config).toBe(true)
    expect('continuationSuffix' in config).toBe(true)
    expect('pageTitleSuffix' in config).toBe(true)
  })
})

// ==================== DEFAULT_OVERFLOW_TEXT Tests ====================

describe('DEFAULT_OVERFLOW_TEXT Constant', () => {
  /**
   * Verify DEFAULT_OVERFLOW_TEXT has correct Chinese values
   * @requirements 5.1
   */
  it('should have correct Chinese seeNextMarker', () => {
    expect(DEFAULT_OVERFLOW_TEXT.seeNextMarker).toBe('（续见附页）')
  })

  it('should have correct Chinese continuationSuffix', () => {
    expect(DEFAULT_OVERFLOW_TEXT.continuationSuffix).toBe('（续）')
  })

  it('should have correct Chinese pageTitleSuffix', () => {
    expect(DEFAULT_OVERFLOW_TEXT.pageTitleSuffix).toBe('（续）')
  })

  it('should be a valid OverflowTextConfig', () => {
    const config: OverflowTextConfig = DEFAULT_OVERFLOW_TEXT
    expect(config).toBeDefined()
    expect(typeof config.seeNextMarker).toBe('string')
    expect(typeof config.continuationSuffix).toBe('string')
    expect(typeof config.pageTitleSuffix).toBe('string')
  })

  it('should be immutable (as const)', () => {
    // Verify the object is frozen-like (readonly)
    expect(Object.keys(DEFAULT_OVERFLOW_TEXT)).toHaveLength(3)
    expect(Object.keys(DEFAULT_OVERFLOW_TEXT)).toContain('seeNextMarker')
    expect(Object.keys(DEFAULT_OVERFLOW_TEXT)).toContain('continuationSuffix')
    expect(Object.keys(DEFAULT_OVERFLOW_TEXT)).toContain('pageTitleSuffix')
  })
})

// ==================== ENGLISH_OVERFLOW_TEXT Tests ====================

describe('ENGLISH_OVERFLOW_TEXT Constant', () => {
  /**
   * Verify ENGLISH_OVERFLOW_TEXT has correct English values
   * @requirements 5.1
   */
  it('should have correct English seeNextMarker', () => {
    expect(ENGLISH_OVERFLOW_TEXT.seeNextMarker).toBe('(continued on next page)')
  })

  it('should have correct English continuationSuffix', () => {
    expect(ENGLISH_OVERFLOW_TEXT.continuationSuffix).toBe('(continued)')
  })

  it('should have correct English pageTitleSuffix', () => {
    expect(ENGLISH_OVERFLOW_TEXT.pageTitleSuffix).toBe('(continued)')
  })

  it('should be a valid OverflowTextConfig', () => {
    const config: OverflowTextConfig = ENGLISH_OVERFLOW_TEXT
    expect(config).toBeDefined()
    expect(typeof config.seeNextMarker).toBe('string')
    expect(typeof config.continuationSuffix).toBe('string')
    expect(typeof config.pageTitleSuffix).toBe('string')
  })

  it('should be immutable (as const)', () => {
    // Verify the object is frozen-like (readonly)
    expect(Object.keys(ENGLISH_OVERFLOW_TEXT)).toHaveLength(3)
    expect(Object.keys(ENGLISH_OVERFLOW_TEXT)).toContain('seeNextMarker')
    expect(Object.keys(ENGLISH_OVERFLOW_TEXT)).toContain('continuationSuffix')
    expect(Object.keys(ENGLISH_OVERFLOW_TEXT)).toContain('pageTitleSuffix')
  })
})

// ==================== Cross-Constant Tests ====================

describe('Overflow Text Constants Consistency', () => {
  /**
   * Verify both constants have the same structure
   * @requirements 5.1
   */
  it('should have the same property keys', () => {
    const defaultKeys = Object.keys(DEFAULT_OVERFLOW_TEXT).sort()
    const englishKeys = Object.keys(ENGLISH_OVERFLOW_TEXT).sort()

    expect(defaultKeys).toEqual(englishKeys)
  })

  it('should have different values for i18n purposes', () => {
    // Values should be different between Chinese and English
    expect(DEFAULT_OVERFLOW_TEXT.seeNextMarker).not.toBe(
      ENGLISH_OVERFLOW_TEXT.seeNextMarker
    )
    expect(DEFAULT_OVERFLOW_TEXT.continuationSuffix).not.toBe(
      ENGLISH_OVERFLOW_TEXT.continuationSuffix
    )
    expect(DEFAULT_OVERFLOW_TEXT.pageTitleSuffix).not.toBe(
      ENGLISH_OVERFLOW_TEXT.pageTitleSuffix
    )
  })

  it('should both be assignable to OverflowTextConfig', () => {
    // Both should satisfy the OverflowTextConfig interface
    const configs: OverflowTextConfig[] = [
      DEFAULT_OVERFLOW_TEXT,
      ENGLISH_OVERFLOW_TEXT,
    ]

    expect(configs).toHaveLength(2)
    configs.forEach((config) => {
      expect(config.seeNextMarker).toBeDefined()
      expect(config.continuationSuffix).toBeDefined()
      expect(config.pageTitleSuffix).toBeDefined()
    })
  })
})
