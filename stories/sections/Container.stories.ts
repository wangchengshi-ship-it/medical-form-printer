import type { Meta, StoryObj } from '@storybook/html'
import { renderContainer } from '../../src/renderer/section-renderers/container'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'
import type { ContainerConfig, NotesConfig, SectionTitleConfig, CheckboxGridConfig, InfoGridConfig } from '../../src/types/print-schema'

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
        .container-item { width: 100%; }
        .checkbox-grid-flex { display: flex; flex-wrap: wrap; gap: 8px; }
        .checkbox-item { display: inline-flex; align-items: center; }
        .checkbox-symbol { margin-right: 2px; }
        .prefix-label { font-weight: 500; margin-right: 8px; }
      </style>
      <div class="${ns}-print-page ${ns}-a4 ${ns}-portrait" style="padding: 20px;">
        ${html}
      </div>
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/Container',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 垂直布局（默认）
export const ColumnDirection: Story = {
  name: '垂直布局（默认）',
  render: () => {
    const config: ContainerConfig = {
      direction: 'column',
      gap: '12px',
      children: [
        {
          type: 'section-title',
          config: { text: '第一部分', align: 'left' } as SectionTitleConfig,
        },
        {
          type: 'notes',
          config: { content: '这是第一部分的内容', showBorder: true } as NotesConfig,
        },
        {
          type: 'section-title',
          config: { text: '第二部分', align: 'left' } as SectionTitleConfig,
        },
        {
          type: 'notes',
          config: { content: '这是第二部分的内容', showBorder: true } as NotesConfig,
        },
      ],
    }
    
    const html = renderContainer(config, {})
    return wrapWithStyles(html)
  },
}

// 水平布局
export const RowDirection: Story = {
  name: '水平布局',
  render: () => {
    const config: ContainerConfig = {
      direction: 'row',
      gap: '16px',
      children: [
        {
          type: 'notes',
          config: { content: '左侧内容', showBorder: true } as NotesConfig,
        },
        {
          type: 'notes',
          config: { content: '右侧内容', showBorder: true } as NotesConfig,
        },
      ],
    }
    
    const html = renderContainer(config, {})
    return wrapWithStyles(html)
  },
}

// 带边框
export const WithBorder: Story = {
  name: '带边框',
  render: () => {
    const config: ContainerConfig = {
      direction: 'column',
      gap: '8px',
      border: true,
      padding: '12px',
      children: [
        {
          type: 'section-title',
          config: { text: '带边框的容器', align: 'center' } as SectionTitleConfig,
        },
        {
          type: 'notes',
          config: { content: '容器内的内容会被边框包围' } as NotesConfig,
        },
      ],
    }
    
    const html = renderContainer(config, {})
    return wrapWithStyles(html)
  },
}

// 嵌套容器
export const NestedContainers: Story = {
  name: '嵌套容器',
  render: () => {
    const config: ContainerConfig = {
      direction: 'column',
      gap: '12px',
      border: true,
      padding: '12px',
      children: [
        {
          type: 'section-title',
          config: { text: '外层容器', align: 'center' } as SectionTitleConfig,
        },
        {
          type: 'container',
          config: {
            direction: 'row',
            gap: '8px',
            border: '1px solid #ccc',
            padding: '8px',
            children: [
              {
                type: 'notes',
                config: { content: '嵌套容器 - 左' } as NotesConfig,
              },
              {
                type: 'notes',
                config: { content: '嵌套容器 - 右' } as NotesConfig,
              },
            ],
          } as ContainerConfig,
        },
      ],
    }
    
    const html = renderContainer(config, {})
    return wrapWithStyles(html)
  },
}

// 真实医疗表单示例
export const RealMedicalExample: Story = {
  name: '真实医疗表单示例',
  render: () => {
    const config: ContainerConfig = {
      direction: 'column',
      gap: '16px',
      border: true,
      padding: '16px',
      children: [
        {
          type: 'section-title',
          config: { text: '产妇基本信息', align: 'center', fontSize: '16px' } as SectionTitleConfig,
        },
        {
          type: 'info-grid',
          config: {
            columns: 4,
            rows: [
              {
                cells: [
                  { label: '姓名', field: 'name', type: 'text' },
                  { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
                  { label: '入院日期', field: 'admissionDate', type: 'date' },
                  { label: '床号', field: 'bedNumber', type: 'text' },
                ],
              },
            ],
          } as InfoGridConfig,
        },
        {
          type: 'container',
          config: {
            direction: 'row',
            gap: '16px',
            children: [
              {
                type: 'checkbox-grid',
                config: {
                  field: 'deliveryMethod',
                  layout: 'flex',
                  prefixLabel: '分娩方式：',
                  options: [
                    { value: 'natural', label: '顺产' },
                    { value: 'cesarean', label: '剖宫产' },
                  ],
                } as CheckboxGridConfig,
              },
              {
                type: 'checkbox-grid',
                config: {
                  field: 'feedingMethod',
                  layout: 'flex',
                  prefixLabel: '喂养方式：',
                  options: [
                    { value: 'breast', label: '母乳' },
                    { value: 'formula', label: '配方奶' },
                    { value: 'mixed', label: '混合' },
                  ],
                } as CheckboxGridConfig,
              },
            ],
          } as ContainerConfig,
        },
      ],
    }
    
    const data = {
      name: '张三',
      age: 28,
      admissionDate: '2024-01-15',
      bedNumber: 'A-101',
      deliveryMethod: ['natural'],
      feedingMethod: ['breast'],
    }
    
    const html = renderContainer(config, data)
    return wrapWithStyles(html)
  },
}
