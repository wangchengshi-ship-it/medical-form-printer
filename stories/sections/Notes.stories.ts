import type { Meta, StoryObj } from '@storybook/html'
import { renderNotes } from '../../src/renderer/section-renderers/notes'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../../src/styles'
import type { NotesConfig } from '../../src/types/print-schema'

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
  title: 'PrintRenderer/Sections/Notes',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 带边框
export const WithBorder: Story = {
  name: '带边框',
  render: () => {
    const config: NotesConfig = {
      content: '注意事项：\n1. 本表由护士填写，入院24小时内完成\n2. 如有特殊情况请及时通知医生\n3. 请保持病房整洁',
      showBorder: true,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}

// 无边框
export const WithoutBorder: Story = {
  name: '无边框',
  render: () => {
    const config: NotesConfig = {
      content: '本表仅供内部使用，请勿外传',
      showBorder: false,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}

// 多行文本
export const MultiLine: Story = {
  name: '多行文本',
  render: () => {
    const config: NotesConfig = {
      content: `填表说明：
1. 产妇入院后24小时内完成本表填写
2. 各项检查结果应如实填写
3. 如有异常情况，应在备注栏详细说明
4. 本表一式两份，一份存档，一份交患者
5. 填写人员应签名并注明日期`,
      showBorder: true,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}

// 简短提示
export const ShortNote: Story = {
  name: '简短提示',
  render: () => {
    const config: NotesConfig = {
      content: '* 以上信息仅供参考',
      showBorder: false,
    }
    
    const html = renderNotes(config)
    return wrapWithStyles(html)
  },
}
