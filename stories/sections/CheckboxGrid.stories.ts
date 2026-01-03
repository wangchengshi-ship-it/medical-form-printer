import type { Meta, StoryObj } from '@storybook/html'
import { renderCheckboxGrid } from '../../src/renderer/section-renderers/checkbox-grid'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'
import type { CheckboxGridConfig } from '../../src/types/print-schema'

// 命名空间前缀
const ns = CSS_NAMESPACE

// 包装函数：添加隔离样式（使用内嵌思源宋体）
const wrapWithStyles = (html: string): HTMLElement => {
  const css = generateIsolatedCss()
  
  const container = document.createElement('div')
  container.innerHTML = `
    <div class="${ISOLATION_ROOT_CLASS}">
      <style>
        ${css}
        .checkbox-grid-grid { display: flex; flex-wrap: wrap; }
        .checkbox-grid-flex { display: flex; flex-wrap: wrap; gap: 12px; }
        .checkbox-item { display: inline-flex; align-items: center; padding: 4px 0; }
        .checkbox-symbol { margin-right: 2px; }
        .checkbox-label { margin-right: 4px; }
        .input-line { border-bottom: 1px solid #000; min-width: 60px; display: inline-block; text-align: center; }
        .prefix-label { font-weight: 500; margin-right: 8px; }
        .text-input-item { display: inline-flex; align-items: center; }
        .text-input-label { margin-right: 4px; }
      </style>
      <div class="${ns}-print-page ${ns}-a4 ${ns}-portrait" style="padding: 20px;">
        ${html}
      </div>
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/CheckboxGrid',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// options 模式
export const OptionsMode: Story = {
  name: 'options 模式',
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

// items 模式
export const ItemsMode: Story = {
  name: 'items 模式',
  render: () => {
    const config: CheckboxGridConfig = {
      field: 'symptoms',
      columns: 4,
      items: [
        { type: 'checkbox', value: 'fever', label: '发热' },
        { type: 'checkbox', value: 'cough', label: '咳嗽' },
        { type: 'checkbox', value: 'other', label: '其他', hasInput: true, inputField: 'otherSymptom' },
        { type: 'text-input', label: '备注', inputField: 'symptomNote' },
      ],
    }
    
    const data = {
      symptoms: ['fever', 'other'],
      otherSymptom: '腰痛',
      symptomNote: '需要进一步检查',
    }
    
    const html = renderCheckboxGrid(config, data)
    return wrapWithStyles(html)
  },
}

// flex 布局
export const FlexLayout: Story = {
  name: 'flex 布局',
  render: () => {
    const config: CheckboxGridConfig = {
      field: 'deliveryMethod',
      layout: 'flex',
      options: [
        { value: 'natural', label: '顺产' },
        { value: 'cesarean', label: '剖宫产' },
        { value: 'forceps', label: '产钳助产' },
        { value: 'vacuum', label: '吸引器助产' },
      ],
    }
    
    const data = {
      deliveryMethod: ['natural'],
    }
    
    const html = renderCheckboxGrid(config, data)
    return wrapWithStyles(html)
  },
}

// 带前缀标签
export const WithPrefixLabel: Story = {
  name: '带前缀标签',
  render: () => {
    const config: CheckboxGridConfig = {
      field: 'feedingMethod',
      layout: 'flex',
      prefixLabel: '喂养方式：',
      options: [
        { value: 'breast', label: '母乳' },
        { value: 'formula', label: '配方奶' },
        { value: 'mixed', label: '混合喂养' },
      ],
    }
    
    const data = {
      feedingMethod: ['breast'],
    }
    
    const html = renderCheckboxGrid(config, data)
    return wrapWithStyles(html)
  },
}

// text-input 纯文本输入项
export const TextInputItems: Story = {
  name: 'text-input 纯文本输入项',
  render: () => {
    const config: CheckboxGridConfig = {
      field: 'vitalSigns',
      layout: 'flex',
      items: [
        { type: 'text-input', label: '体温', inputField: 'temperature' },
        { type: 'text-input', label: '脉搏', inputField: 'pulse' },
        { type: 'text-input', label: '呼吸', inputField: 'respiration' },
        { type: 'text-input', label: '血压', inputField: 'bloodPressure' },
      ],
    }
    
    const data = {
      temperature: '36.5℃',
      pulse: '72次/分',
      respiration: '18次/分',
      bloodPressure: '120/80mmHg',
    }
    
    const html = renderCheckboxGrid(config, data)
    return wrapWithStyles(html)
  },
}
