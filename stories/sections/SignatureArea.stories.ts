/**
 * @fileoverview 签名区域 Story
 * @module stories/sections/SignatureArea
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 展示签名区域组件的各种配置和样式效果
 */

import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../../src/renderer'
import type { PrintSchema, FormData, SignatureConfig } from '../../src/types'

const meta: Meta = {
  title: 'PrintRenderer/Sections/SignatureArea',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

/**
 * 创建签名区域渲染函数
 */
const createSignatureRenderer = (
  config: SignatureConfig,
  data: FormData,
  label: string
) => {
  return () => {
    const schema: PrintSchema = {
      pageSize: '16K',
      orientation: 'portrait',
      header: {
        hospital: '天津中医药大学第二附属医院',
        department: '国际产后康复中心',
        title: '签名区域演示',
      },
      sections: [
        {
          type: 'signature-area',
          config,
        },
      ],
    }

    const html = renderToHtml(schema, data)

    const container = document.createElement('div')
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        <strong>场景:</strong> ${label}
      </div>
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: 300px; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `

    return container
  }
}

// 基础签名
export const Basic: Story = {
  name: '基础签名',
  render: createSignatureRenderer(
    {
      fields: [
        { label: '护士签名', field: 'nurseSignature' },
      ],
    },
    { nurseSignature: '张护士' },
    '单个签名字段'
  ),
}

// 多签名字段
export const MultipleFields: Story = {
  name: '多签名字段',
  render: createSignatureRenderer(
    {
      fields: [
        { label: '护士签名', field: 'nurseSignature' },
        { label: '医生签名', field: 'doctorSignature' },
        { label: '护士长签名', field: 'headNurseSignature' },
      ],
    },
    {
      nurseSignature: '张护士',
      doctorSignature: '李医生',
      headNurseSignature: '王护士长',
    },
    '多个签名字段并排显示'
  ),
}

// 带日期签名
export const WithDate: Story = {
  name: '带日期签名',
  render: createSignatureRenderer(
    {
      fields: [
        { label: '护士签名', field: 'nurseSignature', showDate: true },
        { label: '日期', field: 'signDate' },
      ],
    },
    {
      nurseSignature: '张护士',
      signDate: '2026-01-03',
    },
    '签名带日期字段'
  ),
}

// 空签名（待签）
export const Empty: Story = {
  name: '空签名（待签）',
  render: createSignatureRenderer(
    {
      fields: [
        { label: '护士签名', field: 'nurseSignature' },
        { label: '医生签名', field: 'doctorSignature' },
      ],
    },
    {},
    '签名字段为空时显示下划线'
  ),
}

// 长标签签名
export const LongLabels: Story = {
  name: '长标签签名',
  render: createSignatureRenderer(
    {
      fields: [
        { label: '责任护士签名', field: 'nurseSignature' },
        { label: '主治医师签名', field: 'doctorSignature' },
        { label: '科室负责人签名', field: 'headSignature' },
      ],
    },
    {
      nurseSignature: '张三',
      doctorSignature: '李四',
      headSignature: '王五',
    },
    '较长的标签文字不换行'
  ),
}

// 完整表单中的签名区域
export const InForm: Story = {
  name: '完整表单中的签名',
  render: () => {
    const schema: PrintSchema = {
      pageSize: '16K',
      orientation: 'portrait',
      header: {
        hospital: '天津中医药大学第二附属医院',
        department: '国际产后康复中心',
        title: '护理记录单',
      },
      sections: [
        {
          type: 'info-grid',
          config: {
            columns: 4,
            rows: [
              {
                cells: [
                  { label: '姓名', field: 'name', type: 'text' },
                  { label: '年龄', field: 'age', type: 'number' },
                  { label: '床号', field: 'bedNo', type: 'text' },
                  { label: '住院号', field: 'admissionNo', type: 'text' },
                ],
              },
            ],
          },
        },
        {
          type: 'notes',
          config: {
            content: '患者一般情况良好，生命体征平稳。',
            showBorder: true,
          },
        },
        {
          type: 'signature-area',
          config: {
            fields: [
              { label: '记录护士', field: 'nurseSignature' },
              { label: '记录日期', field: 'recordDate' },
            ],
          },
        },
      ],
    }

    const data: FormData = {
      name: '张女士',
      age: 28,
      bedNo: '301',
      admissionNo: 'A20260103001',
      nurseSignature: '李护士',
      recordDate: '2026-01-03',
    }

    const html = renderToHtml(schema, data)

    const container = document.createElement('div')
    container.innerHTML = `
      <div style="margin-bottom: 16px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        <strong>场景:</strong> 签名区域在完整表单底部
      </div>
      <iframe 
        srcdoc="${html.replace(/"/g, '&quot;')}" 
        style="width: 100%; height: 400px; border: 1px solid #ccc; background: #fff;"
      ></iframe>
    `

    return container
  },
}
