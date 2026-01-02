import type { Meta, StoryObj } from '@storybook/html'
import { renderInlineRow } from '../../src/renderer/section-renderers/inline-row'
import { generateCss, mergeTheme } from '../../src/styles'
import type { InlineRowConfig, NotesConfig, SectionTitleConfig, CheckboxGridConfig } from '../../src/types/print-schema'

// 包装函数：添加样式
const wrapWithStyles = (html: string): HTMLElement => {
  const theme = mergeTheme()
  const css = generateCss(theme)
  
  const container = document.createElement('div')
  container.innerHTML = `
    <style>
      ${css}
      .inline-row-item { overflow: hidden; }
      .checkbox-grid-flex { display: flex; flex-wrap: wrap; gap: 8px; }
      .checkbox-item { display: inline-flex; align-items: center; }
      .checkbox-symbol { margin-right: 2px; }
      .prefix-label { font-weight: 500; margin-right: 8px; }
    </style>
    <div class="print-page a4 portrait" style="padding: 20px;">
      ${html}
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/InlineRow',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 等分两列
export const TwoEqualColumns: Story = {
  name: '等分两列',
  render: () => {
    const config: InlineRowConfig = {
      columns: [1, 1],
      gap: '16px',
      children: [
        {
          type: 'notes',
          config: { content: '左侧内容区域', showBorder: true } as NotesConfig,
        },
        {
          type: 'notes',
          config: { content: '右侧内容区域', showBorder: true } as NotesConfig,
        },
      ],
    }
    
    const html = renderInlineRow(config, {})
    return wrapWithStyles(html)
  },
}

// 1:2:1 比例
export const OneTwoOneRatio: Story = {
  name: '1:2:1 比例',
  render: () => {
    const config: InlineRowConfig = {
      columns: [1, 2, 1],
      gap: '12px',
      children: [
        {
          type: 'notes',
          config: { content: '左侧 (1)', showBorder: true } as NotesConfig,
        },
        {
          type: 'notes',
          config: { content: '中间 (2)', showBorder: true } as NotesConfig,
        },
        {
          type: 'notes',
          config: { content: '右侧 (1)', showBorder: true } as NotesConfig,
        },
      ],
    }
    
    const html = renderInlineRow(config, {})
    return wrapWithStyles(html)
  },
}

// 2:1 比例
export const TwoOneRatio: Story = {
  name: '2:1 比例',
  render: () => {
    const config: InlineRowConfig = {
      columns: [2, 1],
      gap: '16px',
      children: [
        {
          type: 'notes',
          config: { content: '主要内容区域（占 2/3）\n这里可以放置更多内容', showBorder: true } as NotesConfig,
        },
        {
          type: 'notes',
          config: { content: '侧边栏（占 1/3）', showBorder: true } as NotesConfig,
        },
      ],
    }
    
    const html = renderInlineRow(config, {})
    return wrapWithStyles(html)
  },
}

// 混合区块类型
export const MixedSectionTypes: Story = {
  name: '混合区块类型',
  render: () => {
    const config: InlineRowConfig = {
      columns: [1, 1],
      gap: '16px',
      children: [
        {
          type: 'section-title',
          config: { text: '左侧标题', align: 'center' } as SectionTitleConfig,
        },
        {
          type: 'checkbox-grid',
          config: {
            field: 'options',
            layout: 'flex',
            options: [
              { value: 'a', label: '选项A' },
              { value: 'b', label: '选项B' },
              { value: 'c', label: '选项C' },
            ],
          } as CheckboxGridConfig,
        },
      ],
    }
    
    const data = { options: ['a', 'c'] }
    const html = renderInlineRow(config, data)
    return wrapWithStyles(html)
  },
}

// 真实医疗表单示例
export const RealMedicalExample: Story = {
  name: '真实医疗表单示例',
  render: () => {
    const config: InlineRowConfig = {
      columns: [1, 1, 1],
      gap: '12px',
      children: [
        {
          type: 'checkbox-grid',
          config: {
            field: 'stool',
            layout: 'flex',
            prefixLabel: '大便：',
            options: [
              { value: 'normal', label: '正常' },
              { value: 'abnormal', label: '异常' },
            ],
          } as CheckboxGridConfig,
        },
        {
          type: 'checkbox-grid',
          config: {
            field: 'urine',
            layout: 'flex',
            prefixLabel: '小便：',
            options: [
              { value: 'normal', label: '正常' },
              { value: 'abnormal', label: '异常' },
            ],
          } as CheckboxGridConfig,
        },
        {
          type: 'checkbox-grid',
          config: {
            field: 'sleep',
            layout: 'flex',
            prefixLabel: '睡眠：',
            options: [
              { value: 'good', label: '好' },
              { value: 'fair', label: '一般' },
              { value: 'poor', label: '差' },
            ],
          } as CheckboxGridConfig,
        },
      ],
    }
    
    const data = {
      stool: ['normal'],
      urine: ['normal'],
      sleep: ['good'],
    }
    
    const html = renderInlineRow(config, data)
    return wrapWithStyles(html)
  },
}
