/**
 * @fileoverview 字体隔离功能 Storybook 示例
 * @module stories/FontIsolation
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 展示字体隔离功能的 Storybook 示例，包括：
 * - 隔离渲染模式
 * - 字体加载状态展示
 * - 与外部样式的隔离效果
 *
 * @requirements
 * - Requirements 4.1: 浏览器预览与 PDF 生成输出一致
 */

import type { Meta, StoryObj } from '@storybook/html'
import {
  renderToIsolatedHtml,
  renderToIsolatedFragment,
  isFontLoaded,
  waitForFonts,
  FONT_FAMILY,
  CSS_NAMESPACE,
  ISOLATION_ROOT_CLASS,
} from '../src'
import type { PrintSchema, FormData } from '../src/types/print-schema'

// ==================== 示例数据 ====================

const sampleSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '字体隔离测试表单',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '房号', field: 'roomNumber', type: 'text' },
              { label: '住院号', field: 'hospitalNumber', type: 'text' },
              { label: '入院时间', field: 'admissionTime', type: 'date' },
              { label: '姓名', field: 'name', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '年龄', field: 'age', type: 'number' },
              { label: '血型', field: 'bloodType', type: 'text' },
              { label: '民族', field: 'ethnicity', type: 'text' },
              { label: '籍贯', field: 'birthplace', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '过敏史',
      config: {
        field: 'allergies',
        columns: 4,
        options: [
          { value: 'none', label: '无' },
          { value: 'penicillin', label: '青霉素' },
          { value: 'sulfa', label: '磺胺类' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'allergyOther' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '评估护士', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，入院24小时内完成',
  },
}

const sampleData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: '张三',
  age: 28,
  bloodType: 'A型',
  ethnicity: '汉族',
  birthplace: '天津',
  allergies: ['none'],
  nurseSignature: '李护士',
}

// ==================== Story 配置 ====================

const meta: Meta = {
  title: 'FontIsolation/字体隔离',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## 字体隔离功能

此组件展示了 \`@medical/print-renderer\` 库的字体隔离功能：

- **强制字体绑定**: 所有文本使用内嵌的思源宋体 SC (${FONT_FAMILY})
- **CSS 隔离**: 使用 \`.${ISOLATION_ROOT_CLASS}\` 容器隔离样式
- **命名空间**: 所有类名使用 \`${CSS_NAMESPACE}-\` 前缀

### 使用方法

\`\`\`typescript
import { renderToIsolatedHtml, waitForFonts } from '@medical/print-renderer'

// 等待字体加载
await waitForFonts({ timeout: 5000 })

// 渲染隔离的 HTML
const html = renderToIsolatedHtml(schema, data)
\`\`\`
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

// ==================== 辅助函数 ====================

/**
 * 创建字体加载状态指示器
 */
function createFontStatusIndicator(): HTMLDivElement {
  const indicator = document.createElement('div')
  indicator.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  `

  const updateStatus = () => {
    const loaded = isFontLoaded()
    indicator.style.backgroundColor = loaded ? '#d4edda' : '#fff3cd'
    indicator.style.border = loaded ? '1px solid #c3e6cb' : '1px solid #ffeeba'
    indicator.style.color = loaded ? '#155724' : '#856404'
    indicator.innerHTML = `
      <span style="font-size: 18px;">${loaded ? '✓' : '⏳'}</span>
      <span>
        <strong>字体状态:</strong> ${loaded ? '已加载' : '加载中...'}
        <br>
        <small>字体: ${FONT_FAMILY}</small>
      </span>
    `
  }

  updateStatus()

  // 如果字体未加载，等待加载完成后更新状态
  if (!isFontLoaded()) {
    waitForFonts({ timeout: 10000 })
      .then(() => updateStatus())
      .catch(() => {
        indicator.style.backgroundColor = '#f8d7da'
        indicator.style.border = '1px solid #f5c6cb'
        indicator.style.color = '#721c24'
        indicator.innerHTML = `
          <span style="font-size: 18px;">✗</span>
          <span>
            <strong>字体状态:</strong> 加载失败
            <br>
            <small>请检查网络连接</small>
          </span>
        `
      })
  }

  return indicator
}

/**
 * 创建隔离渲染器（完整 HTML 文档）
 */
function createIsolatedRenderer(schema: PrintSchema, data: FormData) {
  return (args: { watermark?: string; showFontStatus?: boolean }) => {
    const container = document.createElement('div')

    // 字体状态指示器
    if (args.showFontStatus) {
      container.appendChild(createFontStatusIndicator())
    }

    // 渲染隔离的 HTML
    const html = renderToIsolatedHtml(schema, data, {
      watermark: args.watermark,
    })

    // 使用 iframe 显示完整的 HTML 文档
    const iframe = document.createElement('iframe')
    iframe.style.cssText = `
      width: 100%;
      height: 800px;
      border: 1px solid #ccc;
      background: #fff;
      border-radius: 4px;
    `
    iframe.srcdoc = html

    container.appendChild(iframe)
    return container
  }
}

/**
 * 创建片段渲染器（嵌入式）
 */
function createFragmentRenderer(schema: PrintSchema, data: FormData) {
  return (args: { watermark?: string; showFontStatus?: boolean; externalStyles?: boolean }) => {
    const container = document.createElement('div')

    // 字体状态指示器
    if (args.showFontStatus) {
      container.appendChild(createFontStatusIndicator())
    }

    // 外部样式干扰测试
    if (args.externalStyles) {
      const styleInfo = document.createElement('div')
      styleInfo.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        background-color: #e7f3ff;
        border: 1px solid #b6d4fe;
        color: #084298;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      `
      styleInfo.innerHTML = `
        <strong>⚠️ 外部样式干扰测试</strong>
        <br>
        <small>已注入外部 CSS 规则，但隔离容器内的样式不受影响</small>
      `
      container.appendChild(styleInfo)

      // 注入干扰样式
      const externalStyle = document.createElement('style')
      externalStyle.textContent = `
        /* 外部样式干扰测试 */
        * { font-family: Comic Sans MS, cursive !important; }
        div { color: red !important; }
        table { border: 5px solid purple !important; }
        .print-page { background: yellow !important; }
      `
      container.appendChild(externalStyle)
    }

    // 渲染隔离的 HTML 片段
    const fragment = renderToIsolatedFragment(schema, data, {
      watermark: args.watermark,
    })

    // 创建包装容器
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: auto;
      max-height: 800px;
    `
    wrapper.innerHTML = fragment

    container.appendChild(wrapper)
    return container
  }
}

// ==================== Stories ====================

/**
 * 隔离渲染 - 完整 HTML 文档
 * 使用 iframe 展示完整的隔离 HTML 文档
 */
export const IsolatedHtml: Story = {
  name: '隔离渲染 (完整文档)',
  render: createIsolatedRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
  },
  argTypes: {
    watermark: {
      control: 'text',
      description: '水印文本',
    },
    showFontStatus: {
      control: 'boolean',
      description: '显示字体加载状态',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '使用 `renderToIsolatedHtml()` 生成完整的 HTML 文档，适用于 PDF 生成或独立预览。',
      },
    },
  },
}

/**
 * 隔离渲染 - HTML 片段
 * 直接嵌入页面的隔离片段
 */
export const IsolatedFragment: Story = {
  name: '隔离渲染 (HTML 片段)',
  render: createFragmentRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
    externalStyles: false,
  },
  argTypes: {
    watermark: {
      control: 'text',
      description: '水印文本',
    },
    showFontStatus: {
      control: 'boolean',
      description: '显示字体加载状态',
    },
    externalStyles: {
      control: 'boolean',
      description: '启用外部样式干扰测试',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '使用 `renderToIsolatedFragment()` 生成 HTML 片段，适用于嵌入现有页面。',
      },
    },
  },
}

/**
 * 样式隔离测试
 * 验证外部样式不会影响隔离容器内的内容
 */
export const StyleIsolationTest: Story = {
  name: '样式隔离测试',
  render: createFragmentRenderer(sampleSchema, sampleData),
  args: {
    watermark: '',
    showFontStatus: true,
    externalStyles: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
启用外部样式干扰测试，验证 CSS 隔离效果。

外部注入的样式规则：
- \`* { font-family: Comic Sans MS !important; }\`
- \`div { color: red !important; }\`
- \`table { border: 5px solid purple !important; }\`

隔离容器内的内容应该不受这些规则影响。
        `,
      },
    },
  },
}

/**
 * 带水印的隔离渲染
 */
export const IsolatedWithWatermark: Story = {
  name: '带水印的隔离渲染',
  render: createIsolatedRenderer(sampleSchema, sampleData),
  args: {
    watermark: '仅供内部使用',
    showFontStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: '展示带水印的隔离渲染效果。',
      },
    },
  },
}

/**
 * 字体加载 API 演示
 */
export const FontLoadingApi: Story = {
  name: '字体加载 API',
  render: () => {
    const container = document.createElement('div')
    container.style.cssText = `
      font-family: system-ui, -apple-system, sans-serif;
      padding: 20px;
    `

    container.innerHTML = `
      <h2 style="margin-top: 0;">字体加载 API 演示</h2>
      
      <div style="margin-bottom: 20px;">
        <h3>1. 同步检查字体状态</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { isFontLoaded } from '@medical/print-renderer'

const loaded = isFontLoaded()
console.log('Font loaded:', loaded) // ${isFontLoaded()}
        </pre>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>2. 异步等待字体加载</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { waitForFonts, FontLoadError } from '@medical/print-renderer'

try {
  await waitForFonts({ timeout: 5000 })
  console.log('Font loaded successfully')
} catch (error) {
  if (error instanceof FontLoadError) {
    console.error('Font loading failed:', error.message)
  }
}
        </pre>
      </div>

      <div style="margin-bottom: 20px;">
        <h3>3. 字体配置常量</h3>
        <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;">
import { FONT_FAMILY, CSS_NAMESPACE, ISOLATION_ROOT_CLASS } from '@medical/print-renderer'

FONT_FAMILY         // '${FONT_FAMILY}'
CSS_NAMESPACE       // '${CSS_NAMESPACE}'
ISOLATION_ROOT_CLASS // '${ISOLATION_ROOT_CLASS}'
        </pre>
      </div>

      <div id="font-status-demo"></div>
    `

    // 添加实时字体状态
    const statusDemo = container.querySelector('#font-status-demo')
    if (statusDemo) {
      statusDemo.appendChild(createFontStatusIndicator())
    }

    return container
  },
  parameters: {
    docs: {
      description: {
        story: '展示字体加载相关的 API 使用方法。',
      },
    },
  },
}
