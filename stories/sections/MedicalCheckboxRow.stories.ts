import type { Meta, StoryObj } from '@storybook/html'
import { renderMedicalCheckboxRow } from '../../src/renderer/section-renderers/medical-checkbox-row'
import { generateCss, mergeTheme } from '../../src/styles'
import type { MedicalCheckboxRowConfig } from '../../src/types/print-schema'

// 包装函数：添加样式
const wrapWithStyles = (html: string): HTMLElement => {
  const theme = mergeTheme()
  const css = generateCss(theme)
  
  const container = document.createElement('div')
  container.innerHTML = `
    <style>
      ${css}
      .medical-checkbox-row {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 8px;
        padding: 4px 0;
      }
      .prefix-label { font-weight: 500; }
      .checkbox-option { margin-right: 12px; }
      .checkbox-symbol { margin-right: 2px; }
      .input-value { 
        border-bottom: 1px solid #000; 
        min-width: 40px; 
        display: inline-block;
        text-align: center;
      }
      .input-label { margin-right: 4px; }
      .extra-label { margin-right: 4px; }
      .extra-suffix { margin-left: 2px; }
      .extra-input { margin-left: 8px; }
    </style>
    <div class="print-page a4 portrait" style="padding: 20px;">
      ${html}
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/MedicalCheckboxRow',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 基础选项勾选
export const BasicOptions: Story = {
  name: '基础选项勾选',
  render: () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '排便情况：',
      field: 'bowelMovement',
      options: [
        { value: 'yes', label: '有' },
        { value: 'no', label: '无' },
      ],
    }
    const data = { bowelMovement: 'yes' }
    const html = renderMedicalCheckboxRow(config, data)
    return wrapWithStyles(html)
  },
}

// 带输入框模板
export const WithInputFormat: Story = {
  name: '带输入框模板',
  render: () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '排便次数：',
      inputFormat: '{input}次/日',
      inputField: 'bowelCount',
    }
    const data = { bowelCount: 3 }
    const html = renderMedicalCheckboxRow(config, data)
    return wrapWithStyles(html)
  },
}

// 带简单输入框标签
export const WithInputLabel: Story = {
  name: '带简单输入框标签',
  render: () => {
    const config: MedicalCheckboxRowConfig = {
      inputLabel: '疾病名称',
      inputLabelField: 'diseaseName',
    }
    const data = { diseaseName: '高血压' }
    const html = renderMedicalCheckboxRow(config, data)
    return wrapWithStyles(html)
  },
}

// 带额外输入项
export const WithExtraInputs: Story = {
  name: '带额外输入项',
  render: () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '体温：',
      extraInputs: [
        { field: 'temperature', suffix: '℃' },
      ],
    }
    const data = { temperature: 36.5 }
    const html = renderMedicalCheckboxRow(config, data)
    return wrapWithStyles(html)
  },
}

// 复杂组合
export const ComplexCombination: Story = {
  name: '复杂组合',
  render: () => {
    const config: MedicalCheckboxRowConfig = {
      prefixLabel: '过敏史：',
      field: 'hasAllergy',
      options: [
        { value: 'yes', label: '有' },
        { value: 'no', label: '无' },
      ],
      inputLabel: '过敏原',
      inputLabelField: 'allergen',
    }
    const data = { 
      hasAllergy: 'yes',
      allergen: '青霉素',
    }
    const html = renderMedicalCheckboxRow(config, data)
    return wrapWithStyles(html)
  },
}

// 真实医疗表单示例
export const RealMedicalExample: Story = {
  name: '真实医疗表单示例',
  render: () => {
    const configs: MedicalCheckboxRowConfig[] = [
      {
        prefixLabel: '大便：',
        field: 'stool',
        options: [
          { value: 'normal', label: '正常' },
          { value: 'abnormal', label: '异常' },
        ],
        inputFormat: '{input}次/日',
        inputField: 'stoolCount',
      },
      {
        prefixLabel: '小便：',
        field: 'urine',
        options: [
          { value: 'normal', label: '正常' },
          { value: 'abnormal', label: '异常' },
        ],
        inputFormat: '{input}次/日',
        inputField: 'urineCount',
      },
      {
        prefixLabel: '睡眠：',
        field: 'sleep',
        options: [
          { value: 'good', label: '好' },
          { value: 'fair', label: '一般' },
          { value: 'poor', label: '差' },
        ],
        inputFormat: '{input}小时',
        inputField: 'sleepHours',
      },
    ]
    
    const data = {
      stool: 'normal',
      stoolCount: 2,
      urine: 'normal',
      urineCount: 6,
      sleep: 'good',
      sleepHours: 8,
    }
    
    const html = configs.map(config => renderMedicalCheckboxRow(config, data)).join('\n')
    return wrapWithStyles(html)
  },
}
