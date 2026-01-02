/**
 * @fileoverview Builder 模式测试
 * @module test/builders
 */

import { describe, it, expect } from 'vitest'
import {
  HtmlElementBuilder,
  PageBuilder,
  TableBuilder,
  div,
  span,
  table,
  tr,
  td,
  th,
} from '../src/renderer/builders'

describe('HtmlElementBuilder', () => {
  describe('static tag', () => {
    it('should create builder instance', () => {
      const builder = HtmlElementBuilder.tag('div')
      expect(builder).toBeInstanceOf(HtmlElementBuilder)
    })
  })

  describe('build', () => {
    it('should build simple element', () => {
      const html = new HtmlElementBuilder('div').build()
      expect(html).toBe('<div></div>')
    })

    it('should build element with class', () => {
      const html = div().class('container').build()
      expect(html).toBe('<div class="container"></div>')
    })

    it('should build element with multiple classes', () => {
      const html = div().class('foo', 'bar').build()
      expect(html).toBe('<div class="foo bar"></div>')
    })

    it('should build element with id', () => {
      const html = div().id('main').build()
      expect(html).toBe('<div id="main"></div>')
    })

    it('should build element with style', () => {
      const html = div().style('color', 'red').build()
      expect(html).toBe('<div style="color: red"></div>')
    })

    it('should build element with text', () => {
      const html = span().text('Hello').build()
      expect(html).toBe('<span>Hello</span>')
    })

    it('should escape text content', () => {
      const html = span().text('<script>').build()
      expect(html).toBe('<span>&lt;script&gt;</span>')
    })

    it('should build element with children', () => {
      const html = div().child(span().text('A'), span().text('B')).build()
      expect(html).toBe('<div><span>A</span><span>B</span></div>')
    })

    it('should build void element', () => {
      const html = new HtmlElementBuilder('br').build()
      expect(html).toBe('<br />')
    })
  })

  describe('shortcut functions', () => {
    it('div should create div element', () => {
      expect(div().build()).toBe('<div></div>')
    })

    it('span should create span element', () => {
      expect(span().build()).toBe('<span></span>')
    })

    it('table should create table element', () => {
      expect(table().build()).toBe('<table></table>')
    })

    it('tr should create tr element', () => {
      expect(tr().build()).toBe('<tr></tr>')
    })

    it('td should create td element', () => {
      expect(td().build()).toBe('<td></td>')
    })

    it('th should create th element', () => {
      expect(th().build()).toBe('<th></th>')
    })
  })
})

describe('PageBuilder', () => {
  describe('build', () => {
    it('should build basic page structure', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.setHeader({
        hospital: '测试医院',
        title: '测试表单'
      })
      
      const html = builder.build()
      
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="zh-CN">')
      expect(html).toContain('测试医院')
      expect(html).toContain('测试表单')
      expect(html).toContain('class="print-page a4 portrait"')
    })

    it('should include CSS', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.setCSS('.test { color: red; }')
      
      const html = builder.build()
      
      expect(html).toContain('<style>')
      expect(html).toContain('.test { color: red; }')
    })

    it('should include department', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.setHeader({
        hospital: '测试医院',
        department: '产科',
        title: '测试表单'
      })
      
      const html = builder.build()
      
      expect(html).toContain('产科')
      expect(html).toContain('class="department-name"')
    })

    it('should include sections', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.addSection('<div class="section-1">Section 1</div>')
      builder.addSection('<div class="section-2">Section 2</div>')
      
      const html = builder.build()
      
      expect(html).toContain('Section 1')
      expect(html).toContain('Section 2')
    })

    it('should include footer', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.setFooter({
        notes: '备注信息',
        showPageNumber: true
      })
      
      const html = builder.build()
      
      expect(html).toContain('备注信息')
      expect(html).toContain('class="page-number"')
    })

    it('should include watermark', () => {
      const builder = new PageBuilder({
        pageSize: 'A4',
        orientation: 'portrait'
      })
      
      builder.setWatermark('仅供内部使用', 0.2)
      
      const html = builder.build()
      
      expect(html).toContain('仅供内部使用')
      expect(html).toContain('class="watermark"')
      expect(html).toContain('opacity: 0.2')
    })

    it('should handle different page sizes', () => {
      const builder = new PageBuilder({
        pageSize: '16K',
        orientation: 'landscape'
      })
      
      const html = builder.build()
      
      expect(html).toContain('class="print-page 16k landscape"')
    })
  })
})

describe('TableBuilder', () => {
  describe('build', () => {
    it('should build basic table', () => {
      const builder = new TableBuilder()
      
      builder.addColumns([
        { header: '姓名', field: 'name' },
        { header: '年龄', field: 'age' }
      ])
      
      builder.setRows([
        { name: '张三', age: 30 },
        { name: '李四', age: 25 }
      ])
      
      const html = builder.build()
      
      expect(html).toContain('<table>')
      expect(html).toContain('<thead>')
      expect(html).toContain('<tbody>')
      expect(html).toContain('姓名')
      expect(html).toContain('年龄')
      expect(html).toContain('张三')
      expect(html).toContain('30')
    })

    it('should include row numbers', () => {
      const builder = new TableBuilder({
        showRowNumber: true,
        rowNumberHeader: '序号'
      })
      
      builder.addColumn({ header: '姓名', field: 'name' })
      builder.setRows([{ name: '张三' }, { name: '李四' }])
      
      const html = builder.build()
      
      expect(html).toContain('序号')
      expect(html).toContain('<td>1</td>')
      expect(html).toContain('<td>2</td>')
    })

    it('should apply column width', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '姓名', field: 'name', width: '100px' })
      
      const html = builder.build()
      
      expect(html).toContain('style="width: 100px"')
    })

    it('should use custom formatter', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({
        header: '金额',
        field: 'amount',
        formatter: (value) => `¥${value}`
      })
      
      builder.setRows([{ amount: 100 }])
      
      const html = builder.build()
      
      expect(html).toContain('¥100')
    })

    it('should handle empty values', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '姓名', field: 'name' })
      builder.setRows([{ name: null }, { name: undefined }, { name: '' }])
      
      const html = builder.build()
      
      // Should not throw and should have empty cells
      expect(html).toContain('<td></td>')
    })

    it('should escape HTML in values', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '内容', field: 'content' })
      builder.setRows([{ content: '<script>alert("xss")</script>' }])
      
      const html = builder.build()
      
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('should build table only', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '姓名', field: 'name' })
      
      const html = builder.buildTable()
      
      expect(html).toContain('<table>')
      expect(html).not.toContain('print-section')
    })

    it('should add custom header rows', () => {
      const builder = new TableBuilder()
      
      builder.addHeaderRow(['合并标题'])
      builder.addColumn({ header: '姓名', field: 'name' })
      
      const html = builder.build()
      
      expect(html).toContain('合并标题')
    })

    it('should add footer rows', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '金额', field: 'amount' })
      builder.setRows([{ amount: 100 }])
      builder.addFooterRow(['合计: 100'])
      
      const html = builder.build()
      
      expect(html).toContain('<tfoot>')
      expect(html).toContain('合计: 100')
    })
  })

  describe('addRow', () => {
    it('should add single row', () => {
      const builder = new TableBuilder()
      
      builder.addColumn({ header: '姓名', field: 'name' })
      builder.addRow({ name: '张三' })
      builder.addRow({ name: '李四' })
      
      const html = builder.build()
      
      expect(html).toContain('张三')
      expect(html).toContain('李四')
    })
  })

  describe('setConfig', () => {
    it('should update config', () => {
      const builder = new TableBuilder()
      
      builder.setConfig({ showRowNumber: true })
      builder.addColumn({ header: '姓名', field: 'name' })
      builder.setRows([{ name: '张三' }])
      
      const html = builder.build()
      
      expect(html).toContain('<td>1</td>')
    })
  })
})
