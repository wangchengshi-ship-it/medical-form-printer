import type { Meta, StoryObj } from '@storybook/html'
import { renderInfoGrid } from '../../src/renderer/section-renderers/info-grid'
import { generateCss, mergeTheme } from '../../src/styles'
import type { InfoGridConfig } from '../../src/types/print-schema'

// 包装函数：添加样式
const wrapWithStyles = (html: string): HTMLElement => {
  const theme = mergeTheme()
  const css = generateCss(theme)
  
  const container = document.createElement('div')
  container.innerHTML = `
    <style>
      ${css}
      .checkbox-inline-group { display: inline-flex; gap: 12px; }
      .checkbox-inline-item { display: inline-flex; align-items: center; }
      .checkbox-symbol { margin-right: 2px; }
      .suffix { margin-left: 2px; color: #666; }
      .textarea-value { 
        white-space: pre-wrap; 
        min-height: 60px; 
        padding: 4px;
        border: 1px solid #ddd;
      }
      .checkbox-text-group { display: inline-flex; align-items: center; gap: 4px; }
      .text-value { border-bottom: 1px solid #000; min-width: 100px; }
    </style>
    <div class="print-page a4 portrait" style="padding: 20px;">
      ${html}
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/InfoGrid',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 基础信息网格
export const Basic: Story = {
  name: '基础信息网格',
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

// checkbox-inline 类型
export const CheckboxInline: Story = {
  name: 'checkbox-inline（内联勾选框）',
  render: () => {
    const config: InfoGridConfig = {
      columns: 4,
      rows: [
        {
          cells: [
            { 
              label: '过敏史', 
              field: 'hasAllergy', 
              type: 'checkbox-inline',
              inlineOptions: ['无', '有'],
            },
            { 
              label: '手术史', 
              field: 'hasSurgery', 
              type: 'checkbox-inline',
              inlineOptions: ['无', '有'],
            },
          ],
        },
      ],
    }
    
    const data = {
      hasAllergy: true,
      hasSurgery: false,
    }
    
    const html = renderInfoGrid(config, data)
    return wrapWithStyles(html)
  },
}

// compound 类型
export const Compound: Story = {
  name: 'compound（复合字段）',
  render: () => {
    const config: InfoGridConfig = {
      columns: 4,
      rows: [
        {
          cells: [
            { 
              label: '血压', 
              field: 'bloodPressure', 
              type: 'compound',
              compoundFormat: '{systolic}/{diastolic}mmHg',
              compoundFields: {
                systolic: 'bp_systolic',
                diastolic: 'bp_diastolic',
              },
            },
          ],
        },
      ],
    }
    
    const data = {
      bp_systolic: 120,
      bp_diastolic: 80,
    }
    
    const html = renderInfoGrid(config, data)
    return wrapWithStyles(html)
  },
}

// textarea 类型
export const Textarea: Story = {
  name: 'textarea（多行文本）',
  render: () => {
    const config: InfoGridConfig = {
      columns: 2,
      rows: [
        {
          cells: [
            { 
              label: '主诉', 
              field: 'chiefComplaint', 
              type: 'textarea',
              minHeight: '80px',
              span: 1,
            },
          ],
        },
      ],
    }
    
    const data = {
      chiefComplaint: '产后3天，乳房胀痛2天。',
    }
    
    const html = renderInfoGrid(config, data)
    return wrapWithStyles(html)
  },
}

// 带后缀
export const WithSuffix: Story = {
  name: '带后缀',
  render: () => {
    const config: InfoGridConfig = {
      columns: 4,
      rows: [
        {
          cells: [
            { label: '体温', field: 'temperature', type: 'number', suffix: '℃' },
            { label: '体重', field: 'weight', type: 'number', suffix: 'kg' },
            { label: '身高', field: 'height', type: 'number', suffix: 'cm' },
            { label: '心率', field: 'heartRate', type: 'number', suffix: '次/分' },
          ],
        },
      ],
    }
    
    const data = {
      temperature: 36.5,
      weight: 55,
      height: 165,
      heartRate: 72,
    }
    
    const html = renderInfoGrid(config, data)
    return wrapWithStyles(html)
  },
}
