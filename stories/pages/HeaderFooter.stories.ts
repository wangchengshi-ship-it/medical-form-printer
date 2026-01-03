import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

const baseSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: '测试表单',
  },
  sections: [
    {
      type: 'notes',
      config: {
        content: '这是表单内容区域',
        showBorder: true,
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '页脚备注信息',
  },
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/HeaderFooter',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (schema: PrintSchema) => {
  return () => {
    const html = renderToIsolatedHtml(schema, {})
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 完整页眉页脚
export const FullHeaderFooter: Story = {
  name: '完整页眉页脚',
  render: createRenderer(baseSchema),
}

// 仅医院名称
export const HospitalOnly: Story = {
  name: '仅医院名称',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      header: {
        hospital: 'Sample Hospital',
        title: '测试表单',
      },
    }
    return createRenderer(schema)()
  },
}

// 带 Logo
export const WithLogo: Story = {
  name: '带 Logo（占位）',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      header: {
        ...baseSchema.header,
        showLogo: true,
        logoUrl: 'https://via.placeholder.com/100x50?text=Logo',
      },
    }
    return createRenderer(schema)()
  },
}

// 无页脚
export const NoFooter: Story = {
  name: '无页脚',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: undefined,
    }
    return createRenderer(schema)()
  },
}

// 仅页码
export const PageNumberOnly: Story = {
  name: '仅页码',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: {
        showPageNumber: true,
      },
    }
    return createRenderer(schema)()
  },
}

// 仅备注
export const NotesOnly: Story = {
  name: '仅备注',
  render: () => {
    const schema: PrintSchema = {
      ...baseSchema,
      footer: {
        showPageNumber: false,
        notes: '本表仅供内部使用，请勿外传',
      },
    }
    return createRenderer(schema)()
  },
}
