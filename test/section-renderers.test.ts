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
  renderSectionTitle,
  renderMedicalCheckboxRow,
  renderInlineRow,
  renderContainer,
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
  SectionTitleConfig,
  MedicalCheckboxRowConfig,
  InlineRowConfig,
  ContainerConfig,
  CheckboxItem,
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

  it('should render info grid with underline style', () => {
    const data: FormData = { name: 'Jane Doe', age: 30 }
    const html = renderInfoGrid(basicConfig, data)

    // 新的下划线填空样式
    expect(html).toContain('class="print-section info-grid"')
    expect(html).toContain('class="info-row"')
    expect(html).toContain('class="info-item"')
    expect(html).toContain('class="label"')
    expect(html).toContain('class="field-value"')
    expect(html).toContain('class="text"')
    expect(html).toContain('class="line"')
    expect(html).toContain('姓名')
    expect(html).toContain('Jane Doe')
    expect(html).toContain('年龄')
    expect(html).toContain('30')
  })

  it('should render span-2 class for colspan', () => {
    const config: InfoGridConfig = {
      columns: 2,
      rows: [{ cells: [{ label: '备注', field: 'notes', type: 'text', span: 2 }] }],
    }
    const data = { notes: '测试备注' }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('span-2')
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

  it('should render empty label as full-width underline', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{ cells: [{ label: '', field: 'content', type: 'text' }] }],
    }
    const data = { content: '内容' }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('full-width')
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

    expect(html).toContain('class="print-section checkbox-grid')
    expect(html).toContain('发热')
    expect(html).toContain('咳嗽')
    expect(html).toContain('头痛')
  })

  it('should show checked symbols for selected values', () => {
    const data: FormData = { symptoms: ['fever'] }
    const html = renderCheckboxGrid(basicConfig, data)

    // 应该有一个选中和两个未选中
    const checkedCount = (html.match(/☑/g) || []).length
    const uncheckedCount = (html.match(/□/g) || []).length

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
      nurseSignature: 'Nurse Smith',
      doctorSignature: 'Dr. Williams',
      doctorSignatureDate: '2024-03-15',
    }
    const html = renderSignatureArea(basicConfig, data)

    expect(html).toContain('class="print-section signature-area"')
    expect(html).toContain('护士签名')
    expect(html).toContain('Nurse Smith')
    expect(html).toContain('医生签名')
    expect(html).toContain('Dr. Williams')
  })

  it('should render date when showDate is true', () => {
    const data: FormData = {
      doctorSignature: 'Dr. Williams',
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
    const html = renderNotes(config, {})

    expect(html).toContain('class="print-section notes-section"')
    expect(html).toContain('注意事项：请按时服药')
  })

  it('should add bordered class when showBorder is true', () => {
    const config: NotesConfig = { content: '备注', showBorder: true }
    const html = renderNotes(config, {})

    expect(html).toContain('bordered')
  })

  it('should escape HTML in content', () => {
    const config: NotesConfig = { content: '<script>alert(1)</script>' }
    const html = renderNotes(config, {})

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


// ============================================
// 扩展区块渲染器测试
// ============================================

describe('renderSectionTitle', () => {
  it('should render section title with default alignment', () => {
    const config: SectionTitleConfig = { text: '基本信息' }
    const html = renderSectionTitle(config, {})

    expect(html).toContain('class="print-section section-title"')
    expect(html).toContain('基本信息')
    expect(html).toContain('text-align: left')
    expect(html).toContain('font-weight: bold')
  })

  it('should render center aligned title', () => {
    const config: SectionTitleConfig = { text: '居中标题', align: 'center' }
    const html = renderSectionTitle(config, {})

    expect(html).toContain('text-align: center')
  })

  it('should render right aligned title', () => {
    const config: SectionTitleConfig = { text: '右对齐标题', align: 'right' }
    const html = renderSectionTitle(config, {})

    expect(html).toContain('text-align: right')
  })

  it('should apply custom font size', () => {
    const config: SectionTitleConfig = { text: '大标题', fontSize: '18px' }
    const html = renderSectionTitle(config, {})

    expect(html).toContain('font-size: 18px')
  })

  it('should render non-bold title when bold is false', () => {
    const config: SectionTitleConfig = { text: '普通标题', bold: false }
    const html = renderSectionTitle(config, {})

    expect(html).not.toContain('font-weight: bold')
  })

  it('should escape HTML in title text', () => {
    const config: SectionTitleConfig = { text: '<script>alert(1)</script>' }
    const html = renderSectionTitle(config, {})

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert')
  })
})

describe('renderMedicalCheckboxRow', () => {
  it('should render prefix label', () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '排便情况：',
    }
    const html = renderMedicalCheckboxRow(config, {})

    expect(html).toContain('class="print-section medical-checkbox-row"')
    expect(html).toContain('class="prefix-label"')
    expect(html).toContain('排便情况：')
  })

  it('should render options with checkbox symbols', () => {
    const config: MedicalCheckboxRowConfig = {
      field: 'bowelMovement',
      options: [
        { value: 'yes', label: '有' },
        { value: 'no', label: '无' },
      ],
    }
    const data: FormData = { bowelMovement: ['yes'] }
    const html = renderMedicalCheckboxRow(config, data)

    expect(html).toContain('class="options-group"')
    expect(html).toContain('☑')
    expect(html).toContain('□')
    expect(html).toContain('有')
    expect(html).toContain('无')
  })

  it('should render input format with value', () => {
    const config: MedicalCheckboxRowConfig = {
      inputFormat: '{input}次/日',
      inputField: 'frequency',
    }
    const data: FormData = { frequency: 3 }
    const html = renderMedicalCheckboxRow(config, data)

    expect(html).toContain('class="input-format"')
    expect(html).toContain('class="input-value"')
    expect(html).toContain('3')
    expect(html).toContain('次/日')
  })

  it('should render input format with placeholder when empty', () => {
    const config: MedicalCheckboxRowConfig = {
      inputFormat: '{input}次/日',
      inputField: 'frequency',
    }
    const html = renderMedicalCheckboxRow(config, {})

    expect(html).toContain('____')
  })

  it('should render input label with value', () => {
    const config: MedicalCheckboxRowConfig = {
      inputLabel: '疾病名称',
      inputLabelField: 'diseaseName',
    }
    const data: FormData = { diseaseName: '高血压' }
    const html = renderMedicalCheckboxRow(config, data)

    expect(html).toContain('class="input-label-group"')
    expect(html).toContain('疾病名称：')
    expect(html).toContain('高血压')
  })

  it('should render extra inputs', () => {
    const config: MedicalCheckboxRowConfig = {
      extraInputs: [
        { label: '体温', field: 'temperature', suffix: '℃' },
        { field: 'weight', suffix: 'kg' },
      ],
    }
    const data: FormData = { temperature: 36.5, weight: 65 }
    const html = renderMedicalCheckboxRow(config, data)

    expect(html).toContain('class="extra-inputs"')
    expect(html).toContain('体温')
    expect(html).toContain('36.5')
    expect(html).toContain('℃')
    expect(html).toContain('65')
    expect(html).toContain('kg')
  })

  it('should escape HTML in all text content', () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '<b>标签</b>',
      options: [{ value: 'test', label: '<script>alert(1)</script>' }],
      field: 'test',
    }
    const html = renderMedicalCheckboxRow(config, {})

    expect(html).toContain('&lt;b&gt;')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })
})

describe('renderInfoGrid - Extended Types', () => {
  it('should render checkbox-inline type', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '过敏史',
          field: 'hasAllergy',
          type: 'checkbox-inline',
          inlineOptions: ['无', '有'],
        }],
      }],
    }
    const data: FormData = { hasAllergy: true }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('class="checkbox-inline"')
    expect(html).toContain('无')
    expect(html).toContain('有')
    // true 应该选中 '有'（index 1）
    expect(html).toContain('☑')
    expect(html).toContain('□')
  })

  it('should render checkbox-inline with string value', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '性别',
          field: 'gender',
          type: 'checkbox-inline',
          inlineOptions: ['男', '女'],
        }],
      }],
    }
    const data: FormData = { gender: '女' }
    const html = renderInfoGrid(config, data)

    // '女' 应该被选中
    const checkedCount = (html.match(/☑/g) || []).length
    expect(checkedCount).toBe(1)
  })

  it('should render compound type', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '血压',
          field: 'bloodPressure',
          type: 'compound',
          compoundFormat: '{systolic}/{diastolic}mmHg',
          compoundFields: {
            systolic: 'bp_systolic',
            diastolic: 'bp_diastolic',
          },
        }],
      }],
    }
    const data: FormData = { bp_systolic: 120, bp_diastolic: 80 }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('120/80mmHg')
  })

  it('should render textarea type', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '病史',
          field: 'medicalHistory',
          type: 'textarea',
        }],
      }],
    }
    const data: FormData = { medicalHistory: '无特殊病史' }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('textarea-item')
    expect(html).toContain('textarea-content')
    expect(html).toContain('无特殊病史')
  })

  it('should render checkbox-text type', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '其他',
          field: 'other',
          type: 'checkbox-text',
          text: '其他说明',
        }],
      }],
    }
    const data: FormData = { other: true }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('checkbox-text-item')
    expect(html).toContain('checkbox-text')
    expect(html).toContain('☑')
    expect(html).toContain('其他说明')
  })

  it('should render suffix', () => {
    const config: InfoGridConfig = {
      columns: 1,
      rows: [{
        cells: [{
          label: '体温',
          field: 'temperature',
          type: 'number',
          suffix: '℃',
        }],
      }],
    }
    const data: FormData = { temperature: 36.5 }
    const html = renderInfoGrid(config, data)

    expect(html).toContain('℃')
    expect(html).toContain('36.5')
  })

  it('should apply custom width', () => {
    const config: InfoGridConfig = {
      columns: 2,
      rows: [{
        cells: [{
          label: '姓名',
          field: 'name',
          type: 'text',
          width: '150px',
        }],
      }],
    }
    const html = renderInfoGrid(config, { name: 'Jane Doe' })

    expect(html).toContain('style="width: 150px"')
    expect(html).toContain('custom-width')
  })
})

describe('renderCheckboxGrid - Items Mode', () => {
  it('should render items mode with checkbox type', () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      items: [
        { type: 'checkbox', value: 'fever', label: '发热' },
        { type: 'checkbox', value: 'cough', label: '咳嗽' },
      ],
    }
    const data: FormData = { symptoms: ['fever'] }
    const html = renderCheckboxGrid(config, data)

    expect(html).toContain('发热')
    expect(html).toContain('咳嗽')
    expect(html).toContain('☑')
    expect(html).toContain('□')
  })

  it('should render items mode with text-input type', () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      items: [
        { type: 'text-input', label: '其他', inputField: 'otherSymptom' },
      ],
    }
    const data: FormData = { otherSymptom: '头晕' }
    const html = renderCheckboxGrid(config, data)

    expect(html).toContain('class="checkbox-item text-input-item"')
    expect(html).toContain('其他')
    expect(html).toContain('头晕')
  })

  it('should render items with hasInput', () => {
    const config: CheckboxGridConfig = {
      field: 'options',
      items: [
        { type: 'checkbox', value: 'other', label: '其他', hasInput: true, inputField: 'otherDetail' },
      ],
    }
    const data: FormData = { options: ['other'], otherDetail: '详细说明' }
    const html = renderCheckboxGrid(config, data)

    expect(html).toContain('☑')
    expect(html).toContain('其他')
    expect(html).toContain('详细说明')
    expect(html).toContain('class="input-line"')
  })

  it('should render with flex layout', () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      layout: 'flex',
      items: [
        { type: 'checkbox', value: 'fever', label: '发热' },
      ],
    }
    const html = renderCheckboxGrid(config, {})

    expect(html).toContain('checkbox-grid-flex')
  })

  it('should render with grid layout', () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      layout: 'grid',
      columns: 3,
      items: [
        { type: 'checkbox', value: 'fever', label: '发热' },
      ],
    }
    const html = renderCheckboxGrid(config, {})

    expect(html).toContain('checkbox-grid-grid')
  })

  it('should render prefix label', () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      prefixLabel: '症状：',
      options: [{ value: 'fever', label: '发热' }],
    }
    const html = renderCheckboxGrid(config, {})

    expect(html).toContain('class="prefix-label"')
    expect(html).toContain('症状：')
  })
})

describe('renderInlineRow', () => {
  it('should render inline row with children', () => {
    const config: InlineRowConfig = {
      children: [
        {
          type: 'section-title',
          config: { text: '左侧标题' } as SectionTitleConfig,
        },
        {
          type: 'section-title',
          config: { text: '右侧标题' } as SectionTitleConfig,
        },
      ],
    }
    const html = renderInlineRow(config, {})

    expect(html).toContain('class="print-section inline-row"')
    expect(html).toContain('display: flex')
    expect(html).toContain('class="inline-row-item"')
    expect(html).toContain('左侧标题')
    expect(html).toContain('右侧标题')
  })

  it('should apply column proportions', () => {
    const config: InlineRowConfig = {
      columns: [1, 2, 1],
      children: [
        { type: 'section-title', config: { text: '1' } as SectionTitleConfig },
        { type: 'section-title', config: { text: '2' } as SectionTitleConfig },
        { type: 'section-title', config: { text: '3' } as SectionTitleConfig },
      ],
    }
    const html = renderInlineRow(config, {})

    // 1:2:1 比例，总权重 4
    expect(html).toContain('flex: 1 1 25%')
    expect(html).toContain('flex: 2 1 50%')
  })

  it('should apply custom gap', () => {
    const config: InlineRowConfig = {
      gap: '16px',
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderInlineRow(config, {})

    expect(html).toContain('gap: 16px')
  })

  it('should render nested info-grid', () => {
    const config: InlineRowConfig = {
      children: [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [{ cells: [{ label: '姓名', field: 'name', type: 'text' }] }],
          } as InfoGridConfig,
        },
      ],
    }
    const data: FormData = { name: 'Jane Doe' }
    const html = renderInlineRow(config, data)

    expect(html).toContain('姓名')
    expect(html).toContain('Jane Doe')
  })
})

describe('renderContainer', () => {
  it('should render container with children', () => {
    const config: ContainerConfig = {
      children: [
        { type: 'section-title', config: { text: '标题1' } as SectionTitleConfig },
        { type: 'section-title', config: { text: '标题2' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('class="print-section container-section"')
    expect(html).toContain('class="container-item"')
    expect(html).toContain('标题1')
    expect(html).toContain('标题2')
  })

  it('should render with column direction (default)', () => {
    const config: ContainerConfig = {
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('flex-direction: column')
  })

  it('should render with row direction', () => {
    const config: ContainerConfig = {
      direction: 'row',
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('flex-direction: row')
  })

  it('should apply border when true', () => {
    const config: ContainerConfig = {
      border: true,
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('border: 1px solid #000')
  })

  it('should apply custom border string', () => {
    const config: ContainerConfig = {
      border: '2px dashed red',
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('border: 2px dashed red')
  })

  it('should apply padding', () => {
    const config: ContainerConfig = {
      padding: '10px',
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('padding: 10px')
  })

  it('should apply gap', () => {
    const config: ContainerConfig = {
      gap: '20px',
      children: [
        { type: 'section-title', config: { text: '测试' } as SectionTitleConfig },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('gap: 20px')
  })

  it('should render nested containers', () => {
    const config: ContainerConfig = {
      children: [
        {
          type: 'container',
          config: {
            border: true,
            children: [
              { type: 'section-title', config: { text: '嵌套标题' } as SectionTitleConfig },
            ],
          } as ContainerConfig,
        },
      ],
    }
    const html = renderContainer(config, {})

    expect(html).toContain('嵌套标题')
    // 应该有两个 container-section
    const containerCount = (html.match(/container-section/g) || []).length
    expect(containerCount).toBe(2)
  })

  it('should pass data to nested children', () => {
    const config: ContainerConfig = {
      children: [
        {
          type: 'info-grid',
          config: {
            columns: 1,
            rows: [{ cells: [{ label: '姓名', field: 'name', type: 'text' }] }],
          } as InfoGridConfig,
        },
      ],
    }
    const data: FormData = { name: 'John Doe' }
    const html = renderContainer(config, data)

    expect(html).toContain('John Doe')
  })
})

describe('Extended Section Renderers - Registry', () => {
  it('should get section-title renderer', () => {
    expect(getSectionRenderer('section-title')).toBeDefined()
  })

  it('should get medical-checkbox-row renderer', () => {
    expect(getSectionRenderer('medical-checkbox-row')).toBeDefined()
  })

  it('should get inline-row renderer', () => {
    expect(getSectionRenderer('inline-row')).toBeDefined()
  })

  it('should get container renderer', () => {
    expect(getSectionRenderer('container')).toBeDefined()
  })

  it('should render section-title via renderSection', () => {
    const html = renderSection('section-title', { text: '测试标题' } as SectionTitleConfig, {})
    expect(html).toContain('测试标题')
  })

  it('should render medical-checkbox-row via renderSection', () => {
    const html = renderSection(
      'medical-checkbox-row',
      { prefixLabel: '测试：' } as MedicalCheckboxRowConfig,
      {}
    )
    expect(html).toContain('测试：')
  })

  it('should render inline-row via renderSection', () => {
    const config: InlineRowConfig = {
      children: [
        { type: 'section-title', config: { text: '子元素' } as SectionTitleConfig },
      ],
    }
    const html = renderSection('inline-row', config, {})
    expect(html).toContain('子元素')
  })

  it('should render container via renderSection', () => {
    const config: ContainerConfig = {
      children: [
        { type: 'section-title', config: { text: '容器内容' } as SectionTitleConfig },
      ],
    }
    const html = renderSection('container', config, {})
    expect(html).toContain('容器内容')
  })
})
