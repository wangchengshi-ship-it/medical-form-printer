import type { Meta, StoryObj } from '@storybook/html'
import { renderSectionTitle } from '../../src/renderer/section-renderers/section-title'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'
import type { SectionTitleConfig } from '../../src/types/print-schema'

// 命名空间前缀
const ns = CSS_NAMESPACE

// 包装函数：添加隔离样式（使用内嵌思源宋体）
const wrapWithStyles = (html: string): HTMLElement => {
  const css = generateIsolatedCss()
  
  const container = document.createElement('div')
  container.innerHTML = `
    <div class="${ISOLATION_ROOT_CLASS}">
      <style>${css}</style>
      <div class="${ns}-print-page ${ns}-a4 ${ns}-portrait" style="padding: 20px;">
        ${html}
      </div>
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/SectionTitle',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 左对齐（默认）
export const AlignLeft: Story = {
  name: '左对齐（默认）',
  render: () => {
    const config: SectionTitleConfig = {
      text: '一、基本信息',
      align: 'left',
    }
    const html = renderSectionTitle(config)
    return wrapWithStyles(html)
  },
}

// 居中对齐
export const AlignCenter: Story = {
  name: '居中对齐',
  render: () => {
    const config: SectionTitleConfig = {
      text: '产妇入院评估单',
      align: 'center',
    }
    const html = renderSectionTitle(config)
    return wrapWithStyles(html)
  },
}

// 右对齐
export const AlignRight: Story = {
  name: '右对齐',
  render: () => {
    const config: SectionTitleConfig = {
      text: '附录 A',
      align: 'right',
    }
    const html = renderSectionTitle(config)
    return wrapWithStyles(html)
  },
}

// 自定义字体大小
export const CustomFontSize: Story = {
  name: '自定义字体大小',
  render: () => {
    const config: SectionTitleConfig = {
      text: '重要提示',
      align: 'center',
      fontSize: '18px',
    }
    const html = renderSectionTitle(config)
    return wrapWithStyles(html)
  },
}

// 不加粗
export const NotBold: Story = {
  name: '不加粗',
  render: () => {
    const config: SectionTitleConfig = {
      text: '备注说明',
      align: 'left',
      bold: false,
    }
    const html = renderSectionTitle(config)
    return wrapWithStyles(html)
  },
}

// 多个标题组合
export const MultipleTitles: Story = {
  name: '多个标题组合',
  render: () => {
    const titles: SectionTitleConfig[] = [
      { text: '产后母婴康复机构档案', align: 'center', fontSize: '20px' },
      { text: '一、产妇基本信息', align: 'left' },
      { text: '二、新生儿信息', align: 'left' },
      { text: '三、护理记录', align: 'left' },
    ]
    
    const html = titles.map(config => renderSectionTitle(config)).join('\n')
    return wrapWithStyles(html)
  },
}
