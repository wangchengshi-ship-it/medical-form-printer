import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

const baseSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '产妇入院评估单',
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
      type: 'notes',
      config: {
        content: '这是一段较长的内容，用于展示水印效果。水印会覆盖在整个页面上，但不会影响内容的可读性。',
        showBorder: true,
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

const baseData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15',
  name: '张三',
  age: 28,
  bloodType: 'A型',
  ethnicity: '汉族',
  birthplace: '天津',
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/Watermark',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(baseSchema, baseData, { watermark })
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 无水印
export const NoWatermark: Story = {
  name: '无水印',
  render: createRenderer(),
}

// 内部使用水印
export const InternalUse: Story = {
  name: '内部使用',
  render: createRenderer('仅供内部使用'),
}

// 草稿水印
export const Draft: Story = {
  name: '草稿',
  render: createRenderer('草稿'),
}

// 机密水印
export const Confidential: Story = {
  name: '机密',
  render: createRenderer('机密'),
}

// 副本水印
export const Copy: Story = {
  name: '副本',
  render: createRenderer('副本'),
}

// 自定义水印
export const Custom: Story = {
  name: '自定义水印',
  render: createRenderer('天津中医药大学第二附属医院'),
}
