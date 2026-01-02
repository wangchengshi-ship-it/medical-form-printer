/**
 * @fileoverview HTML 渲染器测试
 */

import { describe, it, expect } from 'vitest'
import { renderToHtml } from '../src/renderer'
import type { PrintSchema, FormData } from '../src/types/print-schema'

describe('renderToHtml', () => {
  const basicSchema: PrintSchema = {
    pageSize: 'A4',
    orientation: 'portrait',
    header: {
      hospital: '测试医院',
      department: '测试科室',
      title: '测试表单',
    },
    sections: [],
  }

  const basicData: FormData = {
    name: '张三',
    age: 30,
  }

  it('should render basic HTML structure', () => {
    const html = renderToHtml(basicSchema, basicData)
    
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="zh-CN">')
    expect(html).toContain('测试医院')
    expect(html).toContain('测试科室')
    expect(html).toContain('测试表单')
  })

  it('should include CSS styles', () => {
    const html = renderToHtml(basicSchema, basicData)
    
    expect(html).toContain('<style>')
    expect(html).toContain('.print-page')
    expect(html).toContain('.print-header')
  })

  it('should apply page size class', () => {
    const html = renderToHtml(basicSchema, basicData)
    expect(html).toContain('class="print-page a4 portrait"')
  })

  it('should apply landscape orientation', () => {
    const landscapeSchema = { ...basicSchema, orientation: 'landscape' as const }
    const html = renderToHtml(landscapeSchema, basicData)
    expect(html).toContain('class="print-page a4 landscape"')
  })

  it('should render watermark when provided', () => {
    const html = renderToHtml(basicSchema, basicData, {
      watermark: '仅供内部使用',
    })
    
    expect(html).toContain('class="watermark"')
    expect(html).toContain('仅供内部使用')
  })

  it('should render info-grid section', () => {
    const schemaWithInfoGrid: PrintSchema = {
      ...basicSchema,
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 2,
            rows: [
              {
                cells: [
                  { label: '姓名', field: 'name', type: 'text' },
                  { label: '年龄', field: 'age', type: 'number' },
                ],
              },
            ],
          },
        },
      ],
    }

    const html = renderToHtml(schemaWithInfoGrid, basicData)
    
    expect(html).toContain('class="print-section info-grid"')
    expect(html).toContain('姓名')
    expect(html).toContain('张三')
    expect(html).toContain('年龄')
    expect(html).toContain('30')
  })

  it('should render checkbox as symbol', () => {
    const schemaWithCheckbox: PrintSchema = {
      ...basicSchema,
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [
              {
                cells: [
                  { label: '已确认', field: 'confirmed', type: 'checkbox' },
                ],
              },
            ],
          },
        },
      ],
    }

    const dataWithCheckbox = { confirmed: true }
    const html = renderToHtml(schemaWithCheckbox, dataWithCheckbox)
    
    expect(html).toContain('☑')
  })

  it('should render table section', () => {
    const schemaWithTable: PrintSchema = {
      ...basicSchema,
      sections: [
        {
          type: 'table',
          title: '记录列表',
          config: {
            dataField: 'records',
            columns: [
              { header: '日期', field: 'date', type: 'text' },
              { header: '内容', field: 'content', type: 'text' },
            ],
          },
        },
      ],
    }

    const dataWithTable = {
      records: [
        { date: '2024-01-01', content: '记录1' },
        { date: '2024-01-02', content: '记录2' },
      ],
    }

    const html = renderToHtml(schemaWithTable, dataWithTable)
    
    expect(html).toContain('class="print-section data-table"')
    expect(html).toContain('记录列表')
    expect(html).toContain('日期')
    expect(html).toContain('内容')
    expect(html).toContain('2024-01-01')
    expect(html).toContain('记录1')
  })

  it('should escape HTML in values', () => {
    const schemaWithField: PrintSchema = {
      ...basicSchema,
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [
              {
                cells: [
                  { label: '姓名', field: 'name', type: 'text' },
                ],
              },
            ],
          },
        },
      ],
    }
    const dataWithHtml = { name: '<script>alert("xss")</script>' }
    const html = renderToHtml(schemaWithField, dataWithHtml)
    
    expect(html).not.toContain('<script>alert')
    expect(html).toContain('&lt;script&gt;')
  })
})
