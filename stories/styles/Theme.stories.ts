import type { Meta, StoryObj } from '@storybook/html'
import { defaultTheme, mergeTheme, type DeepPartial } from '../../src/styles'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData, Theme } from '../../src/types'

const sampleSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: '主题配置演示',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
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
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '症状',
      config: {
        field: 'symptoms',
        columns: 4,
        options: [
          { value: 'fever', label: '发热' },
          { value: 'cough', label: '咳嗽' },
          { value: 'headache', label: '头痛' },
          { value: 'fatigue', label: '乏力' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: '这是一段示例文本，用于展示不同主题配置下的样式效果。',
        showBorder: true,
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

const sampleData: FormData = {
  name: '张三',
  age: 28,
  gender: '女',
  bloodType: 'A型',
  symptoms: ['fever', 'fatigue'],
}

const meta: Meta = {
  title: 'PrintRenderer/Styles/Theme',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (customTheme: DeepPartial<Theme>, label: string) => {
  return () => {
    const theme = mergeTheme(customTheme)
    const html = renderToIsolatedHtml(sampleSchema, sampleData, { theme })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        <strong>主题:</strong> ${label}
      </div>
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: 500px; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `
    
    return container
  }
}

// 默认主题
export const Default: Story = {
  name: '默认主题',
  render: createRenderer({}, '默认'),
}

// 蓝色主题
export const BlueTheme: Story = {
  name: '蓝色主题',
  render: createRenderer({
    colors: {
      primary: '#1976d2',
      border: '#90caf9',
      background: '#ffffff',
      labelBackground: '#e3f2fd',
      text: '#1565c0',
      textSecondary: '#64b5f6',
    },
  }, '蓝色'),
}

// 绿色主题
export const GreenTheme: Story = {
  name: '绿色主题',
  render: createRenderer({
    colors: {
      primary: '#388e3c',
      border: '#a5d6a7',
      background: '#ffffff',
      labelBackground: '#e8f5e9',
      text: '#2e7d32',
      textSecondary: '#81c784',
    },
  }, '绿色'),
}

// 紧凑主题
export const CompactTheme: Story = {
  name: '紧凑主题',
  render: createRenderer({
    spacing: {
      pageMargin: '8mm',
      sectionGap: '4mm',
      cellPadding: '2mm',
    },
    fontSize: {
      hospitalName: '14pt',
      formTitle: '12pt',
      sectionTitle: '10pt',
      body: '9pt',
      small: '8pt',
    },
  }, '紧凑'),
}

// 宽松主题
export const SpacedTheme: Story = {
  name: '宽松主题',
  render: createRenderer({
    spacing: {
      pageMargin: '15mm',
      sectionGap: '10mm',
      cellPadding: '5mm',
    },
    fontSize: {
      hospitalName: '20pt',
      formTitle: '16pt',
      sectionTitle: '14pt',
      body: '12pt',
      small: '10pt',
    },
  }, '宽松'),
}

// 显示默认主题配置
export const ThemeConfig: Story = {
  name: '主题配置详情',
  render: () => {
    const container = document.createElement('div')
    container.style.fontFamily = 'monospace'
    container.style.fontSize = '12px'
    container.style.padding = '16px'
    container.style.background = '#f5f5f5'
    container.style.borderRadius = '4px'
    container.style.overflow = 'auto'
    container.style.maxHeight = '600px'
    
    container.innerHTML = `
      <h3 style="margin-top: 0;">默认主题配置</h3>
      <pre>${JSON.stringify(defaultTheme, null, 2)}</pre>
    `
    
    return container
  },
}
