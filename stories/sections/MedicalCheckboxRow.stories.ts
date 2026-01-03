/**
 * @fileoverview 医疗勾选行区块 Story
 * @module stories/sections/MedicalCheckboxRow
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { MedicalCheckboxRowConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/MedicalCheckboxRow',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础选项勾选
export const BasicOptions: Story = {
  name: '基础选项勾选',
  render: createSectionStory(
    {
      type: 'medical-checkbox-row',
      config: {
        prefixLabel: '排便情况：',
        field: 'bowelMovement',
        options: [
          { value: 'yes', label: '有' },
          { value: 'no', label: '无' },
        ],
      } as MedicalCheckboxRowConfig,
    },
    { bowelMovement: 'yes' },
    { title: '基础选项', description: '简单的是/否选项', height: '280px' }
  ),
}

// 带输入框模板
export const WithInputFormat: Story = {
  name: '带输入框模板',
  render: createSectionStory(
    {
      type: 'medical-checkbox-row',
      config: {
        prefixLabel: '排便次数：',
        inputFormat: '{input}次/日',
        inputField: 'bowelCount',
      } as MedicalCheckboxRowConfig,
    },
    { bowelCount: 3 },
    { title: '带输入框模板', description: '使用模板格式化输入值', height: '280px' }
  ),
}

// 带简单输入框标签
export const WithInputLabel: Story = {
  name: '带简单输入框标签',
  render: createSectionStory(
    {
      type: 'medical-checkbox-row',
      config: {
        inputLabel: '疾病名称',
        inputLabelField: 'diseaseName',
      } as MedicalCheckboxRowConfig,
    },
    { diseaseName: '高血压' },
    { title: '带输入框标签', description: '标签 + 输入框组合', height: '280px' }
  ),
}

// 带额外输入项
export const WithExtraInputs: Story = {
  name: '带额外输入项',
  render: createSectionStory(
    {
      type: 'medical-checkbox-row',
      config: {
        prefixLabel: '体温：',
        extraInputs: [{ field: 'temperature', suffix: '℃' }],
      } as MedicalCheckboxRowConfig,
    },
    { temperature: 36.5 },
    { title: '带额外输入项', description: '前缀标签 + 额外输入', height: '280px' }
  ),
}

// 复杂组合
export const ComplexCombination: Story = {
  name: '复杂组合',
  render: createSectionStory(
    {
      type: 'medical-checkbox-row',
      config: {
        prefixLabel: '过敏史：',
        field: 'hasAllergy',
        options: [
          { value: 'yes', label: '有' },
          { value: 'no', label: '无' },
        ],
        inputLabel: '过敏原',
        inputLabelField: 'allergen',
      } as MedicalCheckboxRowConfig,
    },
    { hasAllergy: 'yes', allergen: '青霉素' },
    { title: '复杂组合', description: '勾选框 + 输入框组合', height: '280px' }
  ),
}

// 真实医疗表单示例
export const RealMedicalExample: Story = {
  name: '真实医疗表单示例',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '日常评估', align: 'left' },
      },
      {
        type: 'medical-checkbox-row',
        config: {
          prefixLabel: '大便：',
          field: 'stool',
          options: [
            { value: 'normal', label: '正常' },
            { value: 'abnormal', label: '异常' },
          ],
          inputFormat: '{input}次/日',
          inputField: 'stoolCount',
        } as MedicalCheckboxRowConfig,
      },
      {
        type: 'medical-checkbox-row',
        config: {
          prefixLabel: '小便：',
          field: 'urine',
          options: [
            { value: 'normal', label: '正常' },
            { value: 'abnormal', label: '异常' },
          ],
          inputFormat: '{input}次/日',
          inputField: 'urineCount',
        } as MedicalCheckboxRowConfig,
      },
      {
        type: 'medical-checkbox-row',
        config: {
          prefixLabel: '睡眠：',
          field: 'sleep',
          options: [
            { value: 'good', label: '好' },
            { value: 'fair', label: '一般' },
            { value: 'poor', label: '差' },
          ],
          inputFormat: '{input}小时',
          inputField: 'sleepHours',
        } as MedicalCheckboxRowConfig,
      },
    ],
    {
      stool: 'normal',
      stoolCount: 2,
      urine: 'normal',
      urineCount: 6,
      sleep: 'good',
      sleepHours: 8,
    },
    { title: '日常评估', description: '真实医疗场景：产妇日常评估记录', height: '400px' }
  ),
}
