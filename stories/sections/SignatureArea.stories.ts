/**
 * @fileoverview 签名区域 Story
 * @module stories/sections/SignatureArea
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { SignatureConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/SignatureArea',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础签名
export const Basic: Story = {
  name: '基础签名',
  render: createSectionStory(
    {
      type: 'signature-area',
      config: {
        fields: [{ label: '护士签名', field: 'nurseSignature' }],
      } as SignatureConfig,
    },
    { nurseSignature: '张护士' },
    { title: '基础签名', description: '单个签名字段', height: '280px' }
  ),
}

// 多签名字段
export const MultipleFields: Story = {
  name: '多签名字段',
  render: createSectionStory(
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '护士签名', field: 'nurseSignature' },
          { label: '医生签名', field: 'doctorSignature' },
          { label: '护士长签名', field: 'headNurseSignature' },
        ],
      } as SignatureConfig,
    },
    {
      nurseSignature: '张护士',
      doctorSignature: '李医生',
      headNurseSignature: '王护士长',
    },
    { title: '多签名字段', description: '多个签名字段并排显示', height: '280px' }
  ),
}

// 带日期签名
export const WithDate: Story = {
  name: '带日期签名',
  render: createSectionStory(
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '护士签名', field: 'nurseSignature', showDate: true },
          { label: '日期', field: 'signDate' },
        ],
      } as SignatureConfig,
    },
    { nurseSignature: '张护士', signDate: '2026-01-03' },
    { title: '带日期签名', description: '签名带日期字段', height: '280px' }
  ),
}

// 空签名（待签）
export const Empty: Story = {
  name: '空签名（待签）',
  render: createSectionStory(
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '护士签名', field: 'nurseSignature' },
          { label: '医生签名', field: 'doctorSignature' },
        ],
      } as SignatureConfig,
    },
    {},
    { title: '空签名', description: '签名字段为空时显示下划线', height: '280px' }
  ),
}

// 长标签签名
export const LongLabels: Story = {
  name: '长标签签名',
  render: createSectionStory(
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '责任护士签名', field: 'nurseSignature' },
          { label: '主治医师签名', field: 'doctorSignature' },
          { label: '科室负责人签名', field: 'headSignature' },
        ],
      } as SignatureConfig,
    },
    {
      nurseSignature: '张三',
      doctorSignature: '李四',
      headSignature: '王五',
    },
    { title: '长标签签名', description: '较长的标签文字不换行', height: '280px' }
  ),
}

// 完整表单中的签名区域
export const InForm: Story = {
  name: '完整表单中的签名',
  render: createMultiSectionStory(
    [
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
        } as SignatureConfig,
      },
    ],
    {
      name: '张女士',
      age: 28,
      bedNo: '301',
      admissionNo: 'A20260103001',
      nurseSignature: '李护士',
      recordDate: '2026-01-03',
    },
    { title: '护理记录单', description: '真实医疗场景：签名区域在完整表单底部' }
  ),
}
