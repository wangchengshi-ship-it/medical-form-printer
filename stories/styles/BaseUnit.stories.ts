import type { Meta, StoryObj } from '@storybook/html'
import { createThemeWithBaseUnit } from '../../src/styles'
import { DEFAULT_BASE_UNIT } from '../../src/styles/base-unit'
import { renderToHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

const sampleSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '基准单位缩放演示',
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
      type: 'notes',
      config: {
        content: '这是一段示例文本，用于展示不同基准单位下的字体大小和间距效果。',
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
}

const meta: Meta = {
  title: 'PrintRenderer/Styles/BaseUnit',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (baseUnit: number, label: string) => {
  return () => {
    const theme = createThemeWithBaseUnit(baseUnit)
    const html = renderToHtml(sampleSchema, sampleData, { theme })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        <strong>基准单位:</strong> ${baseUnit}mm (${label})
        <br>
        <small>默认基准单位: ${DEFAULT_BASE_UNIT}mm</small>
      </div>
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: 500px; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `
    
    return container
  }
}

// 默认大小
export const Default: Story = {
  name: '默认大小 (1mm)',
  render: createRenderer(1, '默认'),
}

// 缩小 20%
export const Smaller: Story = {
  name: '缩小 20% (0.8mm)',
  render: createRenderer(0.8, '缩小 20%'),
}

// 放大 20%
export const Larger: Story = {
  name: '放大 20% (1.2mm)',
  render: createRenderer(1.2, '放大 20%'),
}

// 放大 50%
export const MuchLarger: Story = {
  name: '放大 50% (1.5mm)',
  render: createRenderer(1.5, '放大 50%'),
}

// 缩小 40%
export const MuchSmaller: Story = {
  name: '缩小 40% (0.6mm)',
  render: createRenderer(0.6, '缩小 40%'),
}

// 对比展示
export const Comparison: Story = {
  name: '对比展示',
  render: () => {
    const sizes = [0.7, 1.0, 1.3]
    const labels = ['缩小 30%', '默认', '放大 30%']
    
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.gap = '16px'
    container.style.flexWrap = 'wrap'
    
    sizes.forEach((size, index) => {
      const theme = createThemeWithBaseUnit(size)
      const html = renderToHtml(sampleSchema, sampleData, { theme })
      
      const wrapper = document.createElement('div')
      wrapper.style.flex = '1'
      wrapper.style.minWidth = '300px'
      wrapper.innerHTML = `
        <div style="margin-bottom: 8px; padding: 4px 8px; background: #e3f2fd; border-radius: 4px; text-align: center;">
          <strong>${labels[index]}</strong> (${size}mm)
        </div>
        <iframe 
          srcdoc="${html.replace(/"/g, '&quot;')}" 
          style="width: 100%; height: 400px; border: 1px solid #ccc; background: #fff;"
        ></iframe>
      `
      
      container.appendChild(wrapper)
    })
    
    return container
  },
}
