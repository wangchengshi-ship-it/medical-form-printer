/**
 * @fileoverview 设计模式重构测试
 * @module test/design-patterns
 * 
 * @description
 * 验证 GoF 设计模式实现的正确性：
 * - Composite 模式 - 区块嵌套
 * - Template Method 模式 - 页面渲染流程
 * - Visitor 模式 - 数据格式化
 */

import { describe, it, expect } from 'vitest'
import {
  // Composite 模式
  LeafSection,
  ContainerSection,
  SectionTreeTraverser,
  createSectionComponent,
  createSectionTree,
  renderSectionTree,
  // Template Method 模式
  SinglePageRenderer,
  PaginatedPageRenderer,
  createSinglePageRenderer,
  createPaginatedPageRenderer,
  // Visitor 模式
  FormatVisitor,
  ValidationVisitor,
  MeasureVisitor,
  FormDataTraverser,
  createFormatVisitor,
  createValidationVisitor,
  createMeasureVisitor,
  createFormDataTraverser,
} from '../src/renderer'
import type { PrintSection, PrintSchema, FormData, ContainerConfig, FreeTextConfig } from '../src/types/print-schema'
import type { PdfOptions } from '../src/types/options'

describe('Composite 模式 - 区块嵌套', () => {
  describe('LeafSection', () => {
    it('should create leaf section from config', () => {
      const leaf = new LeafSection('info-grid', {
        columns: 2,
        rows: [{ cells: [{ label: '姓名', field: 'name' }] }],
      })
      
      expect(leaf.getType()).toBe('info-grid')
      expect(leaf.isContainer()).toBe(false)
    })

    it('should render leaf section', () => {
      const leaf = new LeafSection('free-text', { field: 'content' })
      const html = leaf.render({ content: '测试内容' })
      
      expect(html).toContain('测试内容')
    })
  })

  describe('ContainerSection', () => {
    it('should create container section with children', () => {
      const config: ContainerConfig = {
        children: [
          { type: 'free-text', config: { field: 'a' } as FreeTextConfig },
          { type: 'free-text', config: { field: 'b' } as FreeTextConfig },
        ],
      }
      const container = new ContainerSection('container', config)
      
      expect(container.getType()).toBe('container')
      expect(container.isContainer()).toBe(true)
      expect(container.getChildren()).toHaveLength(2)
    })

    it('should render container with children', () => {
      const config: ContainerConfig = {
        children: [
          { type: 'free-text', config: { field: 'contentA' } as FreeTextConfig },
        ],
      }
      const container = new ContainerSection('container', config)
      const html = container.render({ contentA: '内容A' })
      
      expect(html).toContain('内容A')
    })

    it('should add and remove children', () => {
      const config: ContainerConfig = {
        children: [],
      }
      const container = new ContainerSection('container', config)
      const child = new LeafSection('free-text', { field: 'test' })
      
      container.addChild(child)
      expect(container.getChildren()).toHaveLength(1)
      
      container.removeChild(child)
      expect(container.getChildren()).toHaveLength(0)
    })
  })

  describe('createSectionComponent', () => {
    it('should create LeafSection for non-container types', () => {
      const section: PrintSection = { type: 'info-grid', config: { columns: 2, rows: [] } }
      const component = createSectionComponent(section)
      expect(component.isContainer()).toBe(false)
    })

    it('should create ContainerSection for container type', () => {
      const section: PrintSection = { type: 'container', config: { children: [] } }
      const component = createSectionComponent(section)
      expect(component.isContainer()).toBe(true)
    })

    it('should create ContainerSection for inline-row type', () => {
      const section: PrintSection = { type: 'inline-row', config: { children: [] } }
      const component = createSectionComponent(section)
      expect(component.isContainer()).toBe(true)
    })
  })

  describe('SectionTreeTraverser', () => {
    it('should traverse tree depth-first', () => {
      const config: ContainerConfig = {
        children: [
          { type: 'free-text', config: { field: 'a' } as FreeTextConfig },
          {
            type: 'container',
            config: {
              children: [
                { type: 'free-text', config: { field: 'b' } as FreeTextConfig },
              ],
            } as ContainerConfig,
          },
        ],
      }
      const root = new ContainerSection('container', config)
      const traverser = new SectionTreeTraverser()
      const visited: string[] = []
      
      traverser.traverse(root, (component, depth) => {
        visited.push(`${component.getType()}:${depth}`)
      })
      
      expect(visited).toEqual(['container:0', 'free-text:1', 'container:1', 'free-text:2'])
    })

    it('should collect all leaves', () => {
      const config: ContainerConfig = {
        children: [
          { type: 'free-text', config: { field: 'a' } as FreeTextConfig },
          { type: 'info-grid', config: { columns: 2, rows: [] } },
        ],
      }
      const root = new ContainerSection('container', config)
      const traverser = new SectionTreeTraverser()
      const leaves = traverser.collectLeaves(root)
      
      expect(leaves).toHaveLength(2)
      expect(leaves[0].getType()).toBe('free-text')
      expect(leaves[1].getType()).toBe('info-grid')
    })

    it('should calculate tree depth', () => {
      const config: ContainerConfig = {
        children: [
          {
            type: 'container',
            config: {
              children: [
                { type: 'free-text', config: { field: 'deep' } as FreeTextConfig },
              ],
            } as ContainerConfig,
          },
        ],
      }
      const root = new ContainerSection('container', config)
      const traverser = new SectionTreeTraverser()
      
      expect(traverser.getDepth(root)).toBe(2)
    })
  })

  describe('createSectionTree & renderSectionTree', () => {
    it('should create tree from section array', () => {
      const sections: PrintSection[] = [
        { type: 'free-text', config: { field: 'a' } },
        { type: 'free-text', config: { field: 'b' } },
      ]
      const tree = createSectionTree(sections)
      
      expect(tree).toHaveLength(2)
    })

    it('should render section tree', () => {
      const sections: PrintSection[] = [
        { type: 'free-text', config: { field: 'content1' } },
        { type: 'free-text', config: { field: 'content2' } },
      ]
      const tree = createSectionTree(sections)
      const html = renderSectionTree(tree, { content1: '内容1', content2: '内容2' })
      
      expect(html).toContain('内容1')
      expect(html).toContain('内容2')
    })
  })
})

describe('Template Method 模式 - 页面渲染流程', () => {
  const mockSchema: PrintSchema = {
    pageSize: 'A4',
    orientation: 'portrait',
    header: {
      hospital: '测试医院',
      department: '产科',
      title: '入院评估单',
    },
    sections: [
      { type: 'free-text', config: { field: 'content' } },
    ],
    footer: {
      notes: '© 2024',
    },
  }

  describe('SinglePageRenderer', () => {
    it('should render complete page structure', () => {
      const renderer = createSinglePageRenderer()
      const html = renderer.render({
        schema: mockSchema,
        data: { content: '测试内容' },
      })
      
      expect(html).toContain('print-page')
      expect(html).toContain('print-header')
      expect(html).toContain('print-body')
      expect(html).toContain('print-footer')
    })

    it('should render header with hospital info', () => {
      const renderer = new SinglePageRenderer()
      const html = renderer.render({
        schema: mockSchema,
        data: { content: '测试内容' },
      })
      
      expect(html).toContain('测试医院')
      expect(html).toContain('产科')
      expect(html).toContain('入院评估单')
    })

    it('should render body with sections', () => {
      const renderer = new SinglePageRenderer()
      const html = renderer.render({
        schema: mockSchema,
        data: { content: '测试内容' },
      })
      
      expect(html).toContain('测试内容')
    })

    it('should render footer with notes', () => {
      const renderer = new SinglePageRenderer()
      const html = renderer.render({
        schema: mockSchema,
        data: { content: '测试内容' },
      })
      
      expect(html).toContain('© 2024')
    })

    it('should render watermark when enabled', () => {
      const renderer = new SinglePageRenderer()
      const html = renderer.render({
        schema: mockSchema,
        data: { content: '测试内容' },
        options: { watermark: '机密文件' },
      })
      
      expect(html).toContain('watermark')
      expect(html).toContain('机密文件')
    })
  })

  describe('PaginatedPageRenderer', () => {
    it('should render multiple pages', () => {
      const renderer = createPaginatedPageRenderer()
      renderer.setPages([
        [{ type: 'free-text', config: { field: 'page1' } }],
        [{ type: 'free-text', config: { field: 'page2' } }],
      ])
      
      const html = renderer.renderAll({
        schema: mockSchema,
        data: { page1: '第一页', page2: '第二页' },
      })
      
      expect(html).toContain('第一页')
      expect(html).toContain('第二页')
      expect((html.match(/print-page/g) || []).length).toBe(2)
    })

    it('should add continuation mark on subsequent pages', () => {
      const renderer = new PaginatedPageRenderer()
      renderer.setPages([
        [{ type: 'free-text', config: { field: 'p1' } }],
        [{ type: 'free-text', config: { field: 'p2' } }],
      ])
      
      const html = renderer.renderAll({
        schema: mockSchema,
        data: { p1: '页1', p2: '页2' },
      })
      
      expect(html).toContain('入院评估单')
      expect(html).toContain('(续)')
    })

    it('should show page numbers', () => {
      const renderer = new PaginatedPageRenderer()
      renderer.setPages([
        [{ type: 'free-text', config: { field: 'p1' } }],
        [{ type: 'free-text', config: { field: 'p2' } }],
      ])
      renderer.setOptions({ showPageNumber: true })
      
      const html = renderer.renderAll({
        schema: mockSchema,
        data: { p1: '页1', p2: '页2' },
      })
      
      expect(html).toContain('第 1 页 / 共 2 页')
      expect(html).toContain('第 2 页 / 共 2 页')
    })

    it('should respect showHeaderOnEachPage option', () => {
      const renderer = new PaginatedPageRenderer()
      renderer.setPages([
        [{ type: 'free-text', config: { field: 'p1' } }],
        [{ type: 'free-text', config: { field: 'p2' } }],
      ])
      renderer.setOptions({ showHeaderOnEachPage: false })
      
      const html = renderer.renderAll({
        schema: mockSchema,
        data: { p1: '页1', p2: '页2' },
      })
      
      // 第一页有页眉，第二页没有
      const pages = html.split('print-page')
      expect(pages[1]).toContain('测试医院')
      // 第二页不应该有医院名
      expect(pages[2]).not.toContain('测试医院')
    })
  })
})

describe('Visitor 模式 - 数据格式化', () => {
  describe('FormatVisitor', () => {
    it('should format string values', () => {
      const visitor = createFormatVisitor()
      const result = visitor.visitString({ name: 'name', value: 'Jane Doe' })
      
      expect(result).toBe('Jane Doe')
    })

    it('should format number values', () => {
      const visitor = new FormatVisitor()
      const result = visitor.visitNumber({ name: 'age', value: 25 })
      
      expect(result).toBe('25')
    })

    it('should format boolean values with custom symbols', () => {
      const visitor = new FormatVisitor({
        booleanSymbols: { true: '是', false: '否' },
      })
      
      expect(visitor.visitBoolean({ name: 'active', value: true })).toBe('是')
      expect(visitor.visitBoolean({ name: 'active', value: false })).toBe('否')
    })

    it('should format date values', () => {
      const visitor = new FormatVisitor({ dateFormat: 'YYYY-MM-DD' })
      const result = visitor.visitDate({ name: 'birthDate', value: '2024-01-15' })
      
      expect(result).toBe('2024-01-15')
    })

    it('should format array values', () => {
      const visitor = new FormatVisitor()
      const result = visitor.visitArray({ name: 'tags', value: ['A', 'B', 'C'] })
      
      expect(result).toBe('A, B, C')
    })

    it('should return formatted data map', () => {
      const visitor = new FormatVisitor()
      visitor.visitString({ name: 'name', value: 'Jane Doe' })
      visitor.visitNumber({ name: 'age', value: 30 })
      
      const data = visitor.getFormattedData()
      expect(data.get('name')).toBe('Jane Doe')
      expect(data.get('age')).toBe('30')
    })
  })

  describe('ValidationVisitor', () => {
    it('should validate required fields', () => {
      const visitor = createValidationVisitor(['name', 'age'])
      
      visitor.visitString({ name: 'name', value: '', label: '姓名' })
      visitor.visitNumber({ name: 'age', value: 25, label: '年龄' })
      
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].field).toBe('name')
    })

    it('should pass when all required fields are filled', () => {
      const visitor = new ValidationVisitor(['name'])
      visitor.visitString({ name: 'name', value: 'Jane Doe' })
      
      const result = visitor.getResult()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate number format', () => {
      const visitor = new ValidationVisitor()
      visitor.visitNumber({ name: 'age', value: 'not-a-number', label: '年龄' })
      
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('有效数字')
    })

    it('should validate date format', () => {
      const visitor = new ValidationVisitor()
      visitor.visitDate({ name: 'date', value: 'invalid-date', label: '日期' })
      
      const result = visitor.getResult()
      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain('有效日期')
    })

    it('should reset errors', () => {
      const visitor = new ValidationVisitor(['name'])
      visitor.visitString({ name: 'name', value: '' })
      expect(visitor.getResult().valid).toBe(false)
      
      visitor.reset()
      expect(visitor.getResult().valid).toBe(true)
    })
  })

  describe('MeasureVisitor', () => {
    it('should measure string content', () => {
      const visitor = createMeasureVisitor({ lineHeight: 5, charsPerLine: 10 })
      visitor.visitString({ name: 'content', value: '这是一段测试文本内容' })
      
      const results = visitor.getResult()
      expect(results).toHaveLength(1)
      expect(results[0].charCount).toBe(10)
      expect(results[0].lineCount).toBe(1)
      expect(results[0].estimatedHeight).toBe(5)
    })

    it('should calculate multi-line content', () => {
      const visitor = new MeasureVisitor({ lineHeight: 5, charsPerLine: 5 })
      visitor.visitString({ name: 'content', value: '1234567890' }) // 10 chars, 2 lines
      
      const results = visitor.getResult()
      expect(results[0].lineCount).toBe(2)
      expect(results[0].estimatedHeight).toBe(10)
    })

    it('should calculate total height', () => {
      const visitor = new MeasureVisitor({ lineHeight: 5, charsPerLine: 10 })
      visitor.visitString({ name: 'a', value: '12345' })
      visitor.visitString({ name: 'b', value: '67890' })
      
      expect(visitor.getTotalHeight()).toBe(10) // 2 lines * 5mm
    })

    it('should reset measurements', () => {
      const visitor = new MeasureVisitor()
      visitor.visitString({ name: 'a', value: 'test' })
      expect(visitor.getResult()).toHaveLength(1)
      
      visitor.reset()
      expect(visitor.getResult()).toHaveLength(0)
    })
  })

  describe('FormDataTraverser', () => {
    it('should traverse form data and apply visitor', () => {
      const data: FormData = {
        name: 'Jane Doe',
        age: 30,
        active: true,
      }
      const visitor = new FormatVisitor()
      const traverser = createFormDataTraverser()
      
      traverser.traverse(data, visitor)
      
      const formatted = visitor.getFormattedData()
      expect(formatted.get('name')).toBe('Jane Doe')
      expect(formatted.get('age')).toBe('30')
      expect(formatted.get('active')).toBe('☑')
    })

    it('should use field types from sections', () => {
      const data: FormData = {
        birthDate: '2024-01-15',
      }
      const sections: PrintSection[] = [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [{ cells: [{ label: '出生日期', field: 'birthDate', type: 'date' }] }],
          },
        },
      ]
      const visitor = new FormatVisitor()
      const traverser = new FormDataTraverser()
      
      traverser.traverse(data, visitor, sections)
      
      const formatted = visitor.getFormattedData()
      expect(formatted.get('birthDate')).toBe('2024-01-15')
    })

    it('should handle null values', () => {
      const data: FormData = {
        name: null as unknown as string,
        age: undefined as unknown as number,
      }
      const visitor = new FormatVisitor()
      const traverser = new FormDataTraverser()
      
      traverser.traverse(data, visitor)
      
      const formatted = visitor.getFormattedData()
      expect(formatted.get('name')).toBe('')
      expect(formatted.get('age')).toBe('')
    })

    it('should handle array values', () => {
      const data: FormData = {
        tags: ['A', 'B'],
      }
      const visitor = new FormatVisitor()
      const traverser = new FormDataTraverser()
      
      traverser.traverse(data, visitor)
      
      const formatted = visitor.getFormattedData()
      expect(formatted.get('tags')).toBe('A, B')
    })
  })
})
