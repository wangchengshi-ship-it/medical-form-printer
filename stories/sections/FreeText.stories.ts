import type { Meta, StoryObj } from '@storybook/html'
import { renderFreeText } from '../../src/renderer/section-renderers/free-text'
import { generateCss, mergeTheme } from '../../src/styles'
import type { FreeTextConfig } from '../../src/types/print-schema'

// 包装函数：添加样式
const wrapWithStyles = (html: string): HTMLElement => {
  const theme = mergeTheme()
  const css = generateCss(theme)
  
  const container = document.createElement('div')
  container.innerHTML = `
    <style>${css}</style>
    <div class="print-page a4 portrait" style="padding: 20px;">
      ${html}
    </div>
  `
  return container
}

const meta: Meta = {
  title: 'PrintRenderer/Sections/FreeText',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 基础自由文本
export const Basic: Story = {
  name: '基础自由文本',
  render: () => {
    const config: FreeTextConfig = {
      field: 'description',
    }
    
    const data = {
      description: '患者产后恢复良好，无明显不适。乳汁分泌正常，新生儿吸吮有力。',
    }
    
    const html = renderFreeText(config, data)
    return wrapWithStyles(html)
  },
}

// 带最小高度
export const WithMinHeight: Story = {
  name: '带最小高度',
  render: () => {
    const config: FreeTextConfig = {
      field: 'notes',
      minHeight: '100px',
    }
    
    const data = {
      notes: '短文本内容',
    }
    
    const html = renderFreeText(config, data)
    return wrapWithStyles(html)
  },
}

// 多行文本
export const MultiLine: Story = {
  name: '多行文本',
  render: () => {
    const config: FreeTextConfig = {
      field: 'medicalHistory',
      minHeight: '150px',
    }
    
    const data = {
      medicalHistory: `既往病史：
1. 2020年因阑尾炎行阑尾切除术
2. 无高血压、糖尿病等慢性病史
3. 无药物过敏史
4. 无输血史

家族史：
父亲有高血压病史，母亲健康，无遗传病家族史。`,
    }
    
    const html = renderFreeText(config, data)
    return wrapWithStyles(html)
  },
}

// 空内容
export const EmptyContent: Story = {
  name: '空内容',
  render: () => {
    const config: FreeTextConfig = {
      field: 'remarks',
      minHeight: '80px',
    }
    
    const data = {}
    
    const html = renderFreeText(config, data)
    return wrapWithStyles(html)
  },
}
