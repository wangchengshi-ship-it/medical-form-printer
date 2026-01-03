import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 单页表单示例
const singlePageSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: 'Maternal Admission Assessment',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '房号', field: 'roomNumber', type: 'text' },
              { label: '住院号', field: 'hospitalNumber', type: 'text' },
              { label: '入院时间', field: 'admissionTime', type: 'date' },
              { label: '姓名', field: 'name', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '年龄', field: 'age', type: 'number' },
              { label: '血型', field: 'bloodType', type: 'text' },
              { label: '民族', field: 'ethnicity', type: 'text' },
              { label: '籍贯', field: 'birthplace', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '过敏史',
      config: {
        field: 'allergies',
        columns: 4,
        options: [
          { value: 'none', label: '无' },
          { value: 'penicillin', label: '青霉素' },
          { value: 'sulfa', label: '磺胺类' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'allergyOther' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '评估护士', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，入院24小时内完成',
  },
}

const singlePageData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: '张三',
  age: 28,
  bloodType: 'A型',
  ethnicity: '汉族',
  birthplace: '天津',
  allergies: ['none'],
  nurseSignature: '李护士',
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/SinglePage',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (schema: PrintSchema, data: FormData) => {
  return () => {
    const html = renderToIsolatedHtml(schema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 单页表单
export const Basic: Story = {
  name: '单页表单',
  render: createRenderer(singlePageSchema, singlePageData),
}

// 空数据表单
export const EmptyData: Story = {
  name: '空数据表单',
  render: createRenderer(singlePageSchema, {}),
}

// A4 纸张
export const A4Paper: Story = {
  name: 'A4 纸张',
  render: () => {
    const schema: PrintSchema = {
      ...singlePageSchema,
      pageSize: 'A4',
    }
    const html = renderToIsolatedHtml(schema, singlePageData)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '700px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
}

// 横向布局
export const Landscape: Story = {
  name: '横向布局',
  render: () => {
    const schema: PrintSchema = {
      ...singlePageSchema,
      orientation: 'landscape',
    }
    const html = renderToIsolatedHtml(schema, singlePageData)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '500px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
}
