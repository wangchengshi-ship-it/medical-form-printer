/**
 * @fileoverview 页面尺寸 Storybook 故事
 * @description 展示不同纸张尺寸的渲染效果，验证尺寸一致性
 */

import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedFragment } from '../../src'
import type { PrintSchema } from '../../src/types/print-schema'

const meta: Meta = {
  title: 'Styles/PageSizes',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
页面尺寸组件展示不同纸张规格的渲染效果。

## 支持的纸张尺寸

| 尺寸 | 宽度 | 高度 | 说明 |
|------|------|------|------|
| A4 | 210mm | 297mm | 国际标准 |
| A5 | 148mm | 210mm | A4 的一半 |
| 16K | 185mm | 260mm | 中国常用，与前端 Vue 组件一致 |

## 16K 纸张特殊处理

16K 纸张使用固定 \`height\` 而非 \`min-height\`，防止内容溢出导致分页问题。
这与前端 Vue 组件 (PrintModeForm.vue) 保持一致。
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

/** 创建基础 schema */
function createSchema(pageSize: '16K' | 'A4' | 'A5', orientation: 'portrait' | 'landscape'): PrintSchema {
  return {
    pageSize,
    orientation,
    header: {
      hospital: '天津中医药大学第二附属医院',
      department: '国际产后康复中心',
      title: `${pageSize} ${orientation === 'landscape' ? '横向' : '纵向'}测试`,
    },
    sections: [
      {
        type: 'info-grid',
        config: {
          columns: 4,
          rows: [
            {
              cells: [
                { label: '纸张尺寸', field: 'pageSize' },
                { label: '方向', field: 'orientation' },
              ],
            },
          ],
        },
      },
    ],
  }
}

const sampleData = {
  pageSize: '16K',
  orientation: '纵向',
}

/** 16K 纵向 - 最常用的尺寸 */
export const Size16K: Story = {
  name: '16K 纵向 (185mm × 260mm)',
  render: () => {
    const schema = createSchema('16K', 'portrait')
    const html = renderToIsolatedFragment(schema, { ...sampleData, pageSize: '16K', orientation: '纵向' })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="padding: 20px; background: #f5f5f5;">
        <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
          预期尺寸: 185mm × 260mm (约 699px × 983px @ 96dpi)
        </div>
        ${html}
      </div>
    `
    return container
  },
}

/** 16K 横向 */
export const Size16KLandscape: Story = {
  name: '16K 横向 (260mm × 185mm)',
  render: () => {
    const schema = createSchema('16K', 'landscape')
    const html = renderToIsolatedFragment(schema, { ...sampleData, pageSize: '16K', orientation: '横向' })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="padding: 20px; background: #f5f5f5;">
        <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
          预期尺寸: 260mm × 185mm (约 983px × 699px @ 96dpi)
        </div>
        ${html}
      </div>
    `
    return container
  },
}

/** A4 纵向 */
export const SizeA4: Story = {
  name: 'A4 纵向 (210mm × 297mm)',
  render: () => {
    const schema = createSchema('A4', 'portrait')
    const html = renderToIsolatedFragment(schema, { ...sampleData, pageSize: 'A4', orientation: '纵向' })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="padding: 20px; background: #f5f5f5;">
        <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
          预期尺寸: 210mm × 297mm (约 794px × 1123px @ 96dpi)
        </div>
        ${html}
      </div>
    `
    return container
  },
}

/** A5 纵向 */
export const SizeA5: Story = {
  name: 'A5 纵向 (148mm × 210mm)',
  render: () => {
    const schema = createSchema('A5', 'portrait')
    const html = renderToIsolatedFragment(schema, { ...sampleData, pageSize: 'A5', orientation: '纵向' })
    
    const container = document.createElement('div')
    container.innerHTML = `
      <div style="padding: 20px; background: #f5f5f5;">
        <div style="margin-bottom: 10px; font-size: 14px; color: #666;">
          预期尺寸: 148mm × 210mm (约 559px × 794px @ 96dpi)
        </div>
        ${html}
      </div>
    `
    return container
  },
}

/** 尺寸对比 */
export const SizeComparison: Story = {
  name: '尺寸对比',
  render: () => {
    const sizes: Array<{ size: '16K' | 'A4' | 'A5'; label: string }> = [
      { size: '16K', label: '16K (185×260mm)' },
      { size: 'A4', label: 'A4 (210×297mm)' },
      { size: 'A5', label: 'A5 (148×210mm)' },
    ]
    
    const container = document.createElement('div')
    container.style.cssText = 'display: flex; gap: 20px; padding: 20px; background: #f5f5f5; flex-wrap: wrap; align-items: flex-start;'
    
    sizes.forEach(({ size, label }) => {
      const schema = createSchema(size, 'portrait')
      const html = renderToIsolatedFragment(schema, { ...sampleData, pageSize: size })
      
      const wrapper = document.createElement('div')
      wrapper.innerHTML = `
        <div style="margin-bottom: 8px; font-size: 12px; font-weight: bold; color: #333;">${label}</div>
        <div style="transform: scale(0.3); transform-origin: top left;">
          ${html}
        </div>
      `
      container.appendChild(wrapper)
    })
    
    return container
  },
}
