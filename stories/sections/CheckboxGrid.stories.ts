/**
 * @fileoverview 勾选框网格区块 Story
 * @module stories/sections/CheckboxGrid
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { CheckboxGridConfig } from '../../src/types/print-schema'
import { createSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/CheckboxGrid',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础勾选框网格
export const Basic: Story = {
  name: '基础勾选框网格',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'symptoms',
        layout: 'grid',
        columns: 4,
        options: [
          { value: 'fever', label: '发热' },
          { value: 'cough', label: '咳嗽' },
          { value: 'headache', label: '头痛' },
          { value: 'fatigue', label: '乏力' },
          { value: 'nausea', label: '恶心' },
          { value: 'vomiting', label: '呕吐' },
          { value: 'diarrhea', label: '腹泻' },
          { value: 'other', label: '其他' },
        ],
      } as CheckboxGridConfig,
    },
    { symptoms: ['fever', 'fatigue'] },
    { title: '勾选框网格', description: '4列网格布局，多选' }
  ),
}

// Flex 布局
export const FlexLayout: Story = {
  name: 'Flex 布局',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'deliveryMethod',
        layout: 'flex',
        prefixLabel: '分娩方式：',
        options: [
          { value: 'natural', label: '顺产' },
          { value: 'cesarean', label: '剖宫产' },
          { value: 'forceps', label: '产钳助产' },
          { value: 'vacuum', label: '吸引器助产' },
        ],
      } as CheckboxGridConfig,
    },
    { deliveryMethod: ['natural'] },
    { title: 'Flex布局', description: '带前缀标签的弹性布局', height: '280px' }
  ),
}

// 单选模式
export const SingleSelect: Story = {
  name: '单选模式',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'feedingMethod',
        layout: 'flex',
        prefixLabel: '喂养方式：',
        options: [
          { value: 'breast', label: '纯母乳' },
          { value: 'formula', label: '配方奶' },
          { value: 'mixed', label: '混合喂养' },
        ],
      } as CheckboxGridConfig,
    },
    { feedingMethod: 'breast' },
    { title: '单选模式', description: '单选值（非数组）', height: '280px' }
  ),
}

// 带前缀标签
export const WithPrefixLabel: Story = {
  name: '带前缀标签',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'consciousness',
        layout: 'flex',
        prefixLabel: '意识状态：',
        options: [
          { value: 'clear', label: '清醒' },
          { value: 'drowsy', label: '嗜睡' },
          { value: 'confused', label: '意识模糊' },
          { value: 'coma', label: '昏迷' },
        ],
      } as CheckboxGridConfig,
    },
    { consciousness: ['clear'] },
    { title: '带前缀标签', description: '前缀标签 + 选项', height: '280px' }
  ),
}

// 无选中项
export const NoSelection: Story = {
  name: '无选中项',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'allergies',
        layout: 'flex',
        prefixLabel: '过敏史：',
        options: [
          { value: 'penicillin', label: '青霉素' },
          { value: 'sulfa', label: '磺胺类' },
          { value: 'food', label: '食物过敏' },
          { value: 'other', label: '其他' },
        ],
      } as CheckboxGridConfig,
    },
    { allergies: [] },
    { title: '无选中项', description: '所有选项均未选中', height: '280px' }
  ),
}

// 产后评估（真实场景）
export const PostpartumAssessment: Story = {
  name: '产后评估',
  render: createSectionStory(
    {
      type: 'checkbox-grid',
      config: {
        field: 'postpartumSymptoms',
        layout: 'grid',
        columns: 3,
        options: [
          { value: 'lochia_normal', label: '恶露正常' },
          { value: 'lochia_abnormal', label: '恶露异常' },
          { value: 'uterus_normal', label: '子宫复旧良好' },
          { value: 'breast_engorgement', label: '乳房胀痛' },
          { value: 'nipple_crack', label: '乳头皲裂' },
          { value: 'wound_healing', label: '伤口愈合良好' },
        ],
      } as CheckboxGridConfig,
    },
    { postpartumSymptoms: ['lochia_normal', 'uterus_normal', 'wound_healing'] },
    { title: '产后评估', description: '真实医疗场景：产后症状评估' }
  ),
}
