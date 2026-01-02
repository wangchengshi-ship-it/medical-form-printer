/**
 * @fileoverview 区块渲染器测试
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  renderInfoGrid,
  renderTable,
  renderCheckboxGrid,
  renderSignatureArea,
  renderNotes,
  renderFreeText,
  registerSectionRenderer,
  getSectionRenderer,
  renderSection,
} from '../src/renderer/section-renderers'
import type {
  InfoGridConfig,
  TableConfig,
  CheckboxGridConfig,
  SignatureConfig,
  NotesConfig,
  FreeTextConfig,
  FormData,
} from '../src/types/print-schema'

describe('renderInfoGrid', () => {
  const basicConfig: InfoGridConfig = {
    columns: 2,
    rows: [
      {
        cells: [
          { label: '姓名', field: 'name', type: 'text' },
          { label: '年龄', field: 'age', type: 'number' },
        ],
      },
    ],
  }

  it('should render info grid with data', () => {
    const data: FormData = { name: '张三', age: 30 }
    const html = renderInfoGrid(basicConfig, data)

    expect(html).toContain('class="print-section info-grid"')
    expect(html).toContain('姓名')
    expect(html).toContain('张三')
    expect(html).toContain('年龄')
    expect(html).toContain('30')
  })

  it('should render checkbox type as symbol', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{ cells: [{ label: '已确认', field: 'confirmed', type: 'checkbox' }] }],
    }
    const data = { confirmed: true }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('☑')
  })

  it('should handle colspan', () => {
    const config: InfoGridConfig = {
      columns: 2,
      rows: [{ cells: [{ label: '备注', field: 'notes', type: 'text', span: 3 }] }],
    }
    const data = { notes: '测试备注' }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('colspan="3"')
  })

  it('should escape HTML in labels and values', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{ cells: [{ label: '<b>标签</b>', field: 'value', type: 'text' }] }],
    }
    const data = { value: '<script>alert(1)</script>' }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('&lt;b&gt;标签&lt;/b&gt;')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('should use empty placeholder', () => {
    const data: FormData = { name: '张三' } // age is missing
    const html = renderInfoGrid(basicConfig, data, { emptyPlaceholder: '—' })

    expect(html).toContain('—')
  })

  // Property-based test: 所有标签都应出现在输出中
  it('should include all labels in output', () => {
    // 使用字母数字字符串避免特殊字符转义问题
    const labelArb = fc.stringMatching(/^[a-zA-Z\u4e00-\u9fa5]{1,10}$/)

    fc.assert(
      fc.property(
        fc.array(labelArb, { minLength: 1, maxLength: 5 }),
        (labels) => {
          const config: InfoGridConfig = {
            columns: 2,
            rows: [
              {
                cells: labels.map((label, i) => ({
                  label,
                  field: `field${i}`,
                  type: 'text' as const,
                })),
              },
            ],
          }
          const data: FormData = {}
          const html = renderInfoGrid(config, data)

          // 所有标签都应该出现
          return labels.every((label) => html.includes(label))
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('renderTable', () => {
  const basicConfig: TableConfig = {
    dataField: 'records',
    columns: [
      { header: '日期', field: 'date', type: 'text' },
      { header: '内容', field: 'content', type: 'text' },
    ],
  }

  it('should render table with data', () => {
    const data: FormData = {
      records: [
        { date: '2024-01-01', content: '记录1' },
        { date: '2024-01-02', content: '记录2' },
      ],
    }
    const html = renderTable(basicConfig, data)

    expect(html).toContain('class="print-section data-table"')
    expect(html).toContain('<thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('日期')
    expect(html).toContain('内容')
    expect(html).toContain('2024-01-01')
    expect(html).toContain('记录1')
  })

  it('should render row numbers when enabled', () => {
    const config: TableConfig = { ...basicConfig, showRowNumber: true }
    const data: FormData = {
      records: [{ date: '2024-01-01', content: '记录1' }],
    }
    const html = renderTable(config, data)

    expect(html).toContain('序号')
    expect(html).toContain('>1<')
  })

  it('should handle empty data array', () => {
    const data: FormData = { records: [] }
    const html = renderTable(basicConfig, data)

    expect(html).toContain('<tbody>')
    expect(html).toContain('</tbody>')
  })

  it('should handle missing data field', () => {
    const data: FormData = {}
    const html = renderTable(basicConfig, data)

    expect(html).toContain('<tbody>')
  })

  it('should apply column width', () => {
    const config: TableConfig = {
      dataField: 'records',
      columns: [{ header: '日期', field: 'date', type: 'text', width: '100px' }],
    }
    const data: FormData = { records: [] }
    const html = renderTable(config, data)

    expect(html).toContain('style="width: 100px"')
  })

  // Property-based test: 行数应与数据数组长度一致
  it('should render correct number of rows', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ date: fc.string(), content: fc.string() }), { maxLength: 10 }),
        (records) => {
          const data: FormData = { records }
          const html = renderTable(basicConfig, data)
          const rowCount = (html.match(/<tr>/g) || []).length
          // 1 header row + data rows
          return rowCount === records.length + 1
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('renderCheckboxGrid', () => {
  const basicConfig: CheckboxGridConfig = {
    field: 'symptoms',
    columns: 3,
    options: [
      { label: '发热', value: 'fever' },
      { label: '咳嗽', value: 'cough' },
      { label: '头痛', value: 'headache' },
    ],
  }

  it('should render checkbox grid', () => {
    const data: FormData = { symptoms: ['fever', 'cough'] }
    const html = renderCheckboxGrid(basicConfig, data)

    expect(html).toContain('class="print-section checkbox-grid"')
    expect(html).toContain('发热')
    expect(html).toContain('咳嗽')
    expect(html).toContain('头痛')
  })

  it('should show checked symbols for selected values', () => {
    const data: FormData = { symptoms: ['fever'] }
    const html = renderCheckboxGrid(basicConfig, data)

    // 应该有一个选中和两个未选中
    const checkedCount = (html.match(/☑/g) || []).length
    const uncheckedCount = (html.match(/☐/g) || []).length

    expect(checkedCount).toBe(1)
    expect(uncheckedCount).toBe(2)
  })

  it('should handle single value (not array)', () => {
    const data: FormData = { symptoms: 'fever' }
    const html = renderCheckboxGrid(basicConfig, data)

    expect(html).toContain('☑')
  })

  it('should render input field when hasInput is true', () => {
    const config: CheckboxGridConfig = {
      field: 'options',
      columns: 2,
      options: [
        { label: '其他', value: 'other', hasInput: true, inputField: 'otherDetail' },
      ],
    }
    const data: FormData = { options: ['other'], otherDetail: '自定义内容' }
    const html = renderCheckboxGrid(config, data)

    expect(html).toContain('自定义内容')
    expect(html).toContain('class="input-line"')
  })

  // Property-based test: 选中数量应与数据数组长度一致
  it('should have correct number of checked items', () => {
    fc.assert(
      fc.property(
        fc.subarray(['fever', 'cough', 'headache']),
        (selected) => {
          const data: FormData = { symptoms: selected }
          const html = renderCheckboxGrid(basicConfig, data)
          const checkedCount = (html.match(/☑/g) || []).length
          return checkedCount === selected.length
        }
      ),
      { numRuns: 20 }
    )
  })
})

describe('renderSignatureArea', () => {
  const basicConfig: SignatureConfig = {
    fields: [
      { label: '护士签名', field: 'nurseSignature' },
      { label: '医生签名', field: 'doctorSignature', showDate: true },
    ],
  }

  it('should render signature area', () => {
    const data: FormData = {
      nurseSignature: '李护士',
      doctorSignature: '王医生',
      doctorSignatureDate: '2024-03-15',
    }
    const html = renderSignatureArea(basicConfig, data)

    expect(html).toContain('class="print-section signature-area"')
    expect(html).toContain('护士签名')
    expect(html).toContain('李护士')
    expect(html).toContain('医生签名')
    expect(html).toContain('王医生')
  })

  it('should render date when showDate is true', () => {
    const data: FormData = {
      doctorSignature: '王医生',
      doctorSignatureDate: '2024-03-15',
    }
    const html = renderSignatureArea(basicConfig, data)

    expect(html).toContain('日期：')
    expect(html).toContain('2024-03-15')
  })

  it('should handle empty signature', () => {
    const data: FormData = {}
    const html = renderSignatureArea(basicConfig, data)

    expect(html).toContain('护士签名')
    expect(html).toContain('class="signature-line"')
  })
})

describe('renderNotes', () => {
  it('should render notes content', () => {
    const config: NotesConfig = { content: '注意事项：请按时服药' }
    const html = renderNotes(config)

    expect(html).toContain('class="print-section notes-section"')
    expect(html).toContain('注意事项：请按时服药')
  })

  it('should add bordered class when showBorder is true', () => {
    const config: NotesConfig = { content: '备注', showBorder: true }
    const html = renderNotes(config)

    expect(html).toContain('bordered')
  })

  it('should escape HTML in content', () => {
    const config: NotesConfig = { content: '<script>alert(1)</script>' }
    const html = renderNotes(config)

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert')
  })
})

describe('renderFreeText', () => {
  const basicConfig: FreeTextConfig = { field: 'description' }

  it('should render free text content', () => {
    const data: FormData = { description: '这是一段自由文本' }
    const html = renderFreeText(basicConfig, data)

    expect(html).toContain('class="print-section free-text"')
    expect(html).toContain('这是一段自由文本')
  })

  it('should apply minHeight style', () => {
    const config: FreeTextConfig = { field: 'description', minHeight: '50mm' }
    const data: FormData = { description: '内容' }
    const html = renderFreeText(config, data)

    expect(html).toContain('style="min-height: 50mm"')
  })

  it('should use empty placeholder', () => {
    const data: FormData = {}
    const html = renderFreeText(basicConfig, data, { emptyPlaceholder: '（无）' })

    expect(html).toContain('（无）')
  })

  it('should escape HTML', () => {
    const data: FormData = { description: '<b>粗体</b>' }
    const html = renderFreeText(basicConfig, data)

    expect(html).toContain('&lt;b&gt;')
    expect(html).not.toContain('<b>')
  })
})

describe('Section Renderer Registry', () => {
  it('should get built-in renderers', () => {
    expect(getSectionRenderer('info-grid')).toBeDefined()
    expect(getSectionRenderer('table')).toBeDefined()
    expect(getSectionRenderer('checkbox-grid')).toBeDefined()
    expect(getSectionRenderer('signature-area')).toBeDefined()
    expect(getSectionRenderer('notes')).toBeDefined()
    expect(getSectionRenderer('free-text')).toBeDefined()
  })

  it('should return undefined for unknown type', () => {
    expect(getSectionRenderer('unknown-type')).toBeUndefined()
  })

  it('should register and use custom renderer', () => {
    const customRenderer = () => '<div class="custom">Custom Content</div>'
    registerSectionRenderer('custom-section', customRenderer)

    const renderer = getSectionRenderer('custom-section')
    expect(renderer).toBeDefined()
    expect(renderer!({} as any, {})).toContain('Custom Content')
  })

  it('should render section with renderSection function', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{ cells: [{ label: '测试', field: 'test', type: 'text' }] }],
    }
    const html = renderSection('info-grid', config, { test: '值' })

    expect(html).toContain('测试')
    expect(html).toContain('值')
  })

  it('should return comment for unknown section type', () => {
    const html = renderSection('unknown', {} as any, {})

    expect(html).toContain('<!-- Unknown section type: unknown -->')
  })
})
