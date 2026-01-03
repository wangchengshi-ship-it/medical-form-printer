/**
 * @fileoverview 工厂模式测试
 * @module test/factory
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  SectionRendererFactory,
  getDefaultSectionRendererFactory,
  FormatterFactory,
  getDefaultFormatterFactory,
} from '../src/renderer/factory'
import type { SectionRenderStrategy } from '../src/renderer/strategies'

describe('SectionRendererFactory', () => {
  let factory: SectionRendererFactory

  beforeEach(() => {
    factory = new SectionRendererFactory()
  })

  describe('constructor', () => {
    it('should register built-in renderers', () => {
      expect(factory.hasRenderer('info-grid')).toBe(true)
      expect(factory.hasRenderer('table')).toBe(true)
      expect(factory.hasRenderer('checkbox-grid')).toBe(true)
      expect(factory.hasRenderer('signature-area')).toBe(true)
      expect(factory.hasRenderer('notes')).toBe(true)
      expect(factory.hasRenderer('free-text')).toBe(true)
      expect(factory.hasRenderer('section-title')).toBe(true)
      expect(factory.hasRenderer('medical-checkbox-row')).toBe(true)
      expect(factory.hasRenderer('inline-row')).toBe(true)
      expect(factory.hasRenderer('container')).toBe(true)
    })

    it('should have 10 built-in renderers', () => {
      expect(factory.getRegisteredTypes()).toHaveLength(10)
    })
  })

  describe('register', () => {
    it('should register custom renderer creator', () => {
      const customRenderer: SectionRenderStrategy = {
        type: 'custom',
        render: () => '<div>custom</div>'
      }
      
      factory.register('custom', () => customRenderer)
      
      expect(factory.hasRenderer('custom')).toBe(true)
    })

    it('should override existing renderer', () => {
      const customRenderer: SectionRenderStrategy = {
        type: 'info-grid',
        render: () => '<div>custom info-grid</div>'
      }
      
      factory.register('info-grid', () => customRenderer)
      
      const renderer = factory.create('info-grid')
      expect(renderer?.render({}, {})).toBe('<div>custom info-grid</div>')
    })
  })

  describe('registerInstance', () => {
    it('should register renderer instance directly', () => {
      const customRenderer: SectionRenderStrategy = {
        type: 'custom',
        render: () => '<div>custom</div>'
      }
      
      factory.registerInstance(customRenderer)
      
      expect(factory.hasRenderer('custom')).toBe(true)
      expect(factory.create('custom')).toBe(customRenderer)
    })
  })

  describe('create', () => {
    it('should create renderer instance', () => {
      const renderer = factory.create('info-grid')
      
      expect(renderer).toBeDefined()
      expect(renderer?.type).toBe('info-grid')
    })

    it('should return undefined for unknown type', () => {
      const renderer = factory.create('unknown')
      
      expect(renderer).toBeUndefined()
    })

    it('should cache instances by default', () => {
      const renderer1 = factory.create('info-grid')
      const renderer2 = factory.create('info-grid')
      
      expect(renderer1).toBe(renderer2)
    })

    it('should not cache instances when disabled', () => {
      const factoryNoCache = new SectionRendererFactory(false)
      
      const renderer1 = factoryNoCache.create('info-grid')
      const renderer2 = factoryNoCache.create('info-grid')
      
      expect(renderer1).not.toBe(renderer2)
    })
  })

  describe('render', () => {
    it('should render using created renderer', () => {
      const config = {
        columns: 2,
        rows: [{ cells: [{ label: 'Test', field: 'test' }] }]
      }
      const data = { test: 'value' }
      
      const html = factory.render('info-grid', config, data)
      
      expect(html).toContain('info-grid')
      expect(html).toContain('Test')
    })

    it('should return comment for unknown type', () => {
      const html = factory.render('unknown', {}, {})
      
      expect(html).toBe('<!-- Unknown section type: unknown -->')
    })
  })

  describe('clearCache', () => {
    it('should clear cached instances', () => {
      const renderer1 = factory.create('info-grid')
      factory.clearCache()
      const renderer2 = factory.create('info-grid')
      
      expect(renderer1).not.toBe(renderer2)
    })
  })
})

describe('getDefaultSectionRendererFactory', () => {
  it('should return singleton instance', () => {
    const factory1 = getDefaultSectionRendererFactory()
    const factory2 = getDefaultSectionRendererFactory()
    
    expect(factory1).toBe(factory2)
  })

  it('should have all built-in renderers', () => {
    const factory = getDefaultSectionRendererFactory()
    
    expect(factory.hasRenderer('info-grid')).toBe(true)
    expect(factory.hasRenderer('table')).toBe(true)
  })
})

describe('FormatterFactory', () => {
  let factory: FormatterFactory

  beforeEach(() => {
    factory = new FormatterFactory()
  })

  describe('constructor', () => {
    it('should register built-in formatters', () => {
      expect(factory.has('date')).toBe(true)
      expect(factory.has('boolean')).toBe(true)
      expect(factory.has('checkbox')).toBe(true)
      expect(factory.has('number')).toBe(true)
      expect(factory.has('text')).toBe(true)
      expect(factory.has('signature')).toBe(true)
    })
  })

  describe('register', () => {
    it('should register custom formatter', () => {
      factory.register('custom', (value) => `custom: ${value}`)
      
      expect(factory.has('custom')).toBe(true)
      expect(factory.format('test', 'custom')).toBe('custom: test')
    })

    it('should override existing formatter', () => {
      factory.register('text', (value) => `override: ${value}`)
      
      expect(factory.format('test', 'text')).toBe('override: test')
    })
  })

  describe('get', () => {
    it('should return formatter function', () => {
      const formatter = factory.get('date')
      
      expect(formatter).toBeDefined()
      expect(typeof formatter).toBe('function')
    })

    it('should return undefined for unknown type', () => {
      const formatter = factory.get('unknown')
      
      expect(formatter).toBeUndefined()
    })
  })

  describe('format', () => {
    it('should format date value', () => {
      const result = factory.format(new Date('2024-01-15'), 'date')
      
      expect(result).toContain('2024')
    })

    it('should format boolean value', () => {
      expect(factory.format(true, 'boolean')).toBe('☑')
      expect(factory.format(false, 'boolean')).toBe('□')
    })

    it('should format number value', () => {
      expect(factory.format(123.456, 'number')).toBe('123.456')
    })

    it('should format text value', () => {
      expect(factory.format('hello', 'text')).toBe('hello')
    })

    it('should handle empty text value', () => {
      expect(factory.format('', 'text')).toBe('')
      expect(factory.format(null, 'text')).toBe('')
      expect(factory.format(undefined, 'text')).toBe('')
    })

    it('should use emptyPlaceholder from config', () => {
      const factoryWithPlaceholder = new FormatterFactory({
        emptyPlaceholder: '____'
      })
      
      expect(factoryWithPlaceholder.format('', 'text')).toBe('____')
    })

    it('should fallback to generic format for unknown type', () => {
      const result = factory.format('test', 'unknown')
      
      expect(result).toBe('test')
    })
  })

  describe('getRegisteredTypes', () => {
    it('should return all registered types', () => {
      const types = factory.getRegisteredTypes()
      
      expect(types).toContain('date')
      expect(types).toContain('boolean')
      expect(types).toContain('number')
      expect(types).toContain('text')
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      factory.updateConfig({ emptyPlaceholder: '---' })
      
      const config = factory.getConfig()
      expect(config.emptyPlaceholder).toBe('---')
    })

    it('should merge with existing config', () => {
      factory.updateConfig({ emptyPlaceholder: '---' })
      factory.updateConfig({ dateFormat: 'YYYY-MM-DD' })
      
      const config = factory.getConfig()
      expect(config.emptyPlaceholder).toBe('---')
      expect(config.dateFormat).toBe('YYYY-MM-DD')
    })
  })

  describe('getConfig', () => {
    it('should return copy of config', () => {
      const config1 = factory.getConfig()
      const config2 = factory.getConfig()
      
      expect(config1).not.toBe(config2)
      expect(config1).toEqual(config2)
    })
  })
})

describe('getDefaultFormatterFactory', () => {
  it('should return singleton instance', () => {
    const factory1 = getDefaultFormatterFactory()
    const factory2 = getDefaultFormatterFactory()
    
    expect(factory1).toBe(factory2)
  })

  it('should have all built-in formatters', () => {
    const factory = getDefaultFormatterFactory()
    
    expect(factory.has('date')).toBe(true)
    expect(factory.has('boolean')).toBe(true)
  })
})
