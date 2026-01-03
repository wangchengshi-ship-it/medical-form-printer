/**
 * @fileoverview Storybook 故事工具函数
 * @module stories/sections/_story-utils
 * @description
 * 提供统一的故事渲染工具，使用隔离模式确保 CSS 正确应用
 */

import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData, PrintSection } from '../../src/types'

/** 默认页眉配置 */
const DEFAULT_HEADER = {
  hospital: '天津中医药大学第二附属医院',
  department: '国际产后康复中心',
  title: '打印预览',
}

/**
 * 创建单个区块的渲染函数
 * @param section - 区块配置（包含 type 和 config）
 * @param data - 表单数据
 * @param options - 可选配置
 */
export function createSectionStory(
  section: PrintSection,
  data: FormData = {},
  options: {
    title?: string
    description?: string
    pageSize?: '16K' | 'A4'
    orientation?: 'portrait' | 'landscape'
    height?: string
  } = {}
) {
  const {
    title = '区块预览',
    description,
    pageSize = '16K',
    orientation = 'portrait',
    height = '400px',
  } = options

  return () => {
    const schema: PrintSchema = {
      pageSize,
      orientation,
      header: { ...DEFAULT_HEADER, title },
      sections: [section],
    }

    const html = renderToIsolatedHtml(schema, data)
    const container = document.createElement('div')

    const descHtml = description
      ? `<div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <strong>说明:</strong> ${description}
        </div>`
      : ''

    container.innerHTML = `
      ${descHtml}
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: ${height}; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `

    return container
  }
}

/**
 * 创建多个区块的渲染函数
 * @param sections - 区块配置数组（每个包含 type 和 config）
 * @param data - 表单数据
 * @param options - 可选配置
 */
export function createMultiSectionStory(
  sections: PrintSection[],
  data: FormData = {},
  options: {
    title?: string
    description?: string
    pageSize?: '16K' | 'A4'
    orientation?: 'portrait' | 'landscape'
    height?: string
  } = {}
) {
  const {
    title = '多区块预览',
    description,
    pageSize = '16K',
    orientation = 'portrait',
    height = '500px',
  } = options

  return () => {
    const schema: PrintSchema = {
      pageSize,
      orientation,
      header: { ...DEFAULT_HEADER, title },
      sections,
    }

    const html = renderToIsolatedHtml(schema, data)
    const container = document.createElement('div')

    const descHtml = description
      ? `<div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <strong>说明:</strong> ${description}
        </div>`
      : ''

    container.innerHTML = `
      ${descHtml}
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: ${height}; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `

    return container
  }
}
