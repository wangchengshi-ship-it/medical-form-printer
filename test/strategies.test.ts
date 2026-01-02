/**
 * @fileoverview 策略模式测试
 * @module test/strategies
 */

import { describe, it, expect } from 'vitest'
import {
  StrategyContext,
  createDefaultStrategyContext,
  InfoGridStrategy,
  TableStrategy,
  CheckboxGridStrategy,
  SignatureAreaStrategy,
  NotesStrategy,
  FreeTextStrategy,
  SectionTitleStrategy,
  MedicalCheckboxRowStrategy,
  InlineRowStrategy,
  ContainerStrategy,
} from '../src/renderer/strategies'
import type { SectionRenderStrategy } from '../src/renderer/strategies'

describe('StrategyContext', () => {
  describe('register', () => {
    it('should register a strategy', () => {
      const context = new StrategyContext()
      const strategy = new InfoGridStrategy()
      
      context.register(strategy)
      
      expect(context.hasStrategy('info-grid')).toBe(true)
    })

    it('should allow registering multiple strategies', () => {
      const context = new StrategyContext()
      
      context.register(new InfoGridStrategy())
      context.register(new TableStrategy())
      
      expect(context.hasStrategy('info-grid')).toBe(true)
      expect(context.hasStrategy('table')).toBe(true)
    })
  })

  describe('registerAll', () => {
    it('should register multiple strategies at once', () => {
      const context = new StrategyContext()
      
      context.registerAll([
        new InfoGridStrategy(),
        new TableStrategy(),
        new CheckboxGridStrategy(),
      ])
      
      expect(context.hasStrategy('info-grid')).toBe(true)
      expect(context.hasStrategy('table')).toBe(true)
      expect(context.hasStrategy('checkbox-grid')).toBe(true)
    })
  })

  describe('getStrategy', () => {
    it('should return registered strategy', () => {
      const context = new StrategyContext()
      const strategy = new InfoGridStrategy()
      
      context.register(strategy)
      
      expect(context.getStrategy('info-grid')).toBe(strategy)
    })

    it('should return undefined for unregistered type', () => {
      const context = new StrategyContext()
      
      expect(context.getStrategy('unknown')).toBeUndefined()
    })
  })

  describe('hasStrategy', () => {
    it('should return true for registered type', () => {
      const context = new StrategyContext()
      context.register(new InfoGridStrategy())
      
      expect(context.hasStrategy('info-grid')).toBe(true)
    })

    it('should return false for unregistered type', () => {
      const context = new StrategyContext()
      
      expect(context.hasStrategy('unknown')).toBe(false)
    })
  })

  describe('render', () => {
    it('should render using registered strategy', () => {
      const context = new StrategyContext()
      context.register(new InfoGridStrategy())
      
      const config = {
        columns: 2,
        rows: [
          { cells: [{ label: '姓名', field: 'name' }] }
        ]
      }
      const data = { name: '张三' }
      
      const html = context.render('info-grid', config, data)
      
      expect(html).toContain('info-grid')
      expect(html).toContain('姓名')
      expect(html).toContain('张三')
    })

    it('should return comment for unknown type', () => {
      const context = new StrategyContext()
      
      const html = context.render('unknown', {}, {})
      
      expect(html).toBe('<!-- Unknown section type: unknown -->')
    })
  })

  describe('getRegisteredTypes', () => {
    it('should return all registered types', () => {
      const context = new StrategyContext()
      context.register(new InfoGridStrategy())
      context.register(new TableStrategy())
      
      const types = context.getRegisteredTypes()
      
      expect(types).toContain('info-grid')
      expect(types).toContain('table')
      expect(types).toHaveLength(2)
    })

    it('should return empty array when no strategies registered', () => {
      const context = new StrategyContext()
      
      expect(context.getRegisteredTypes()).toEqual([])
    })
  })
})

describe('createDefaultStrategyContext', () => {
  it('should create context with all built-in strategies', () => {
    const context = createDefaultStrategyContext()
    
    expect(context.hasStrategy('info-grid')).toBe(true)
    expect(context.hasStrategy('table')).toBe(true)
    expect(context.hasStrategy('checkbox-grid')).toBe(true)
    expect(context.hasStrategy('signature-area')).toBe(true)
    expect(context.hasStrategy('notes')).toBe(true)
    expect(context.hasStrategy('free-text')).toBe(true)
    expect(context.hasStrategy('section-title')).toBe(true)
    expect(context.hasStrategy('medical-checkbox-row')).toBe(true)
    expect(context.hasStrategy('inline-row')).toBe(true)
    expect(context.hasStrategy('container')).toBe(true)
  })

  it('should have 10 registered strategies', () => {
    const context = createDefaultStrategyContext()
    
    expect(context.getRegisteredTypes()).toHaveLength(10)
  })
})

describe('Strategy implementations', () => {
  describe('InfoGridStrategy', () => {
    it('should have correct type', () => {
      const strategy = new InfoGridStrategy()
      expect(strategy.type).toBe('info-grid')
    })

    it('should render info-grid', () => {
      const strategy = new InfoGridStrategy()
      const config = {
        columns: 2,
        rows: [{ cells: [{ label: 'Test', field: 'test' }] }]
      }
      const html = strategy.render(config, { test: 'value' })
      
      expect(html).toContain('info-grid')
      expect(html).toContain('Test')
    })
  })

  describe('TableStrategy', () => {
    it('should have correct type', () => {
      const strategy = new TableStrategy()
      expect(strategy.type).toBe('table')
    })

    it('should render table', () => {
      const strategy = new TableStrategy()
      const config = {
        dataField: 'items',
        columns: [{ field: 'name', header: 'Name' }]
      }
      const html = strategy.render(config, { items: [{ name: 'Test' }] })
      
      expect(html).toContain('data-table')
      expect(html).toContain('Name')
    })
  })

  describe('CheckboxGridStrategy', () => {
    it('should have correct type', () => {
      const strategy = new CheckboxGridStrategy()
      expect(strategy.type).toBe('checkbox-grid')
    })
  })

  describe('SignatureAreaStrategy', () => {
    it('should have correct type', () => {
      const strategy = new SignatureAreaStrategy()
      expect(strategy.type).toBe('signature-area')
    })
  })

  describe('NotesStrategy', () => {
    it('should have correct type', () => {
      const strategy = new NotesStrategy()
      expect(strategy.type).toBe('notes')
    })

    it('should render notes', () => {
      const strategy = new NotesStrategy()
      const config = { content: 'Test note' }
      const html = strategy.render(config, {})
      
      expect(html).toContain('notes-section')
      expect(html).toContain('Test note')
    })
  })

  describe('FreeTextStrategy', () => {
    it('should have correct type', () => {
      const strategy = new FreeTextStrategy()
      expect(strategy.type).toBe('free-text')
    })
  })

  describe('SectionTitleStrategy', () => {
    it('should have correct type', () => {
      const strategy = new SectionTitleStrategy()
      expect(strategy.type).toBe('section-title')
    })

    it('should render section title', () => {
      const strategy = new SectionTitleStrategy()
      const config = { text: 'Test Title' }
      const html = strategy.render(config, {})
      
      expect(html).toContain('section-title')
      expect(html).toContain('Test Title')
    })
  })

  describe('MedicalCheckboxRowStrategy', () => {
    it('should have correct type', () => {
      const strategy = new MedicalCheckboxRowStrategy()
      expect(strategy.type).toBe('medical-checkbox-row')
    })
  })

  describe('InlineRowStrategy', () => {
    it('should have correct type', () => {
      const strategy = new InlineRowStrategy()
      expect(strategy.type).toBe('inline-row')
    })
  })

  describe('ContainerStrategy', () => {
    it('should have correct type', () => {
      const strategy = new ContainerStrategy()
      expect(strategy.type).toBe('container')
    })
  })
})

describe('Custom strategy', () => {
  it('should allow registering custom strategy', () => {
    const context = new StrategyContext()
    
    const customStrategy: SectionRenderStrategy = {
      type: 'custom',
      render: (_config, _data) => `<div class="custom">custom content</div>`
    }
    
    context.register(customStrategy)
    
    expect(context.hasStrategy('custom')).toBe(true)
    
    const html = context.render('custom', { columns: 1, rows: [] }, {})
    expect(html).toContain('custom')
  })
})
