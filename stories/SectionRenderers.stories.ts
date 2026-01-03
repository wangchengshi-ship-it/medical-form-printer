import type { Meta, StoryObj } from '@storybook/html'
import { renderInfoGrid } from '../src/renderer/section-renderers/info-grid'
import { renderTable } from '../src/renderer/section-renderers/table'
import { renderCheckboxGrid } from '../src/renderer/section-renderers/checkbox-grid'
import { renderSignatureArea } from '../src/renderer/section-renderers/signature-area'
import { renderNotes } from '../src/renderer/section-renderers/notes'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../src/styles'
import type { InfoGridConfig, TableConfig, CheckboxGridConfig, SignatureConfig, NotesConfig } from '../src/types/print-schema'

// 命名空间前缀
const ns = CSS_NAMESPACE

// 包装函数：添加隔离样式（使用内嵌思源宋体）
const wrapWithStyles = (html: string): HTMLElement => {
  const css = generateIsolatedCss()
  
  const container = document.createElement('div')
  container.innerHTML = `
    <div class="${ISOLATION_ROOT_CLASS}">
      <style>${css}</style>
      <div class="${ns}-print-page ${ns}-a4 ${ns}-portrait" style="padding: 20px;">
        ${html}
      </div>
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/区块渲染器',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// Info Grid 示例
export const InfoGrid: Story = {
  render: () => {
    const config: InfoGridConfig = {
      columns: 4,
      rows: [
        {
          cells: [
            { label: '姓名', field: 'name', type: 'text' },
            { label: '年龄', field: 'age', type: 'number' },
            { label: '性别', field: 'gender', type: 'text' },
            { label: '血型', field: 'bloodType', type: 'text' },
          ],
        },
        {
          cells: [
            { label: '入院日期', field: 'admissionDate', type: 'date' },
            { label: '已确认', field: 'confirmed', type: 'checkbox' },
            { label: '联系电话', field: 'phone', type: 'text', span: 2 },
          ],
        },
      ],
    }
    
    const data = {
      name: '张三',
      age: 28,
      gender: '女',
      bloodType: 'A型',
      admissionDate: '2024-01-15',
      confirmed: true,
      phone: '13800138000',
    }
    
    const html = renderInfoGrid(config, data)
    return wrapWithStyles(html)
  },
}

// Table 示例
export const Table: Story = {
  render: () => {
    const config: TableConfig = {
      dataField: 'records',
      showRowNumber: true,
      columns: [
        { header: '日期', field: 'date', type: 'date', width: '100px' },
        { header: '体温(℃)', field: 'temperature', type: 'number', width: '80px' },
        { header: '血压', field: 'bloodPressure', type: 'text', width: '100px' },
        { header: '已检查', field: 'checked', type: 'checkbox', width: '60px' },
        { header: '备注', field: 'notes', type: 'text' },
      ],
    }
    
    const data = {
      records: [
        { date: '2024-01-15', temperature: 36.5, bloodPressure: '120/80', checked: true, notes: '状态良好' },
        { date: '2024-01-16', temperature: 36.8, bloodPressure: '118/78', checked: true, notes: '' },
        { date: '2024-01-17', temperature: 36.6, bloodPressure: '122/82', checked: false, notes: '待复查' },
      ],
    }
    
    const html = renderTable(config, data)
    return wrapWithStyles(html)
  },
}

// Checkbox Grid 示例
export const CheckboxGrid: Story = {
  render: () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      columns: 4,
      options: [
        { value: 'fever', label: '发热' },
        { value: 'cough', label: '咳嗽' },
        { value: 'headache', label: '头痛' },
        { value: 'fatigue', label: '乏力' },
        { value: 'nausea', label: '恶心' },
        { value: 'vomiting', label: '呕吐' },
        { value: 'diarrhea', label: '腹泻' },
        { value: 'other', label: '其他', hasInput: true, inputField: 'otherSymptom' },
      ],
    }
    
    const data = {
      symptoms: ['fever', 'fatigue', 'other'],
      otherSymptom: '腰痛',
    }
    
    const html = renderCheckboxGrid(config, data)
    return wrapWithStyles(html)
  },
}

// Signature Area 示例
export const SignatureArea: Story = {
  render: () => {
    const config: SignatureConfig = {
      fields: [
        { label: '主治医师', field: 'doctorSignature', showDate: true },
        { label: '护士长', field: 'headNurseSignature', showDate: true },
        { label: '患者/家属', field: 'patientSignature', showDate: false },
      ],
    }
    
    const data = {
      doctorSignature: '王医生',
      doctorSignatureDate: '2024-01-15',
      headNurseSignature: '李护士长',
      headNurseSignatureDate: '2024-01-15',
      patientSignature: '张三',
    }
    
    const html = renderSignatureArea(config, data)
    return wrapWithStyles(html)
  },
}

// Notes 示例
export const Notes: Story = {
  render: () => {
    const config: NotesConfig = {
      content: '注意事项：\n1. 本表由护士填写，入院24小时内完成\n2. 如有特殊情况请及时通知医生\n3. 请保持病房整洁',
      showBorder: true,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}

// Notes 无边框
export const NotesNoBorder: Story = {
  render: () => {
    const config: NotesConfig = {
      content: '本表仅供内部使用，请勿外传',
      showBorder: false,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}
