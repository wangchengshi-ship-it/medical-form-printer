/**
 * @fileoverview 自由文本区块 Story
 * @module stories/sections/FreeText
 * @description FreeText 用于显示从数据字段读取的动态文本
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { FreeTextConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/FreeText',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础自由文本
export const Basic: Story = {
  name: '基础自由文本',
  render: createSectionStory(
    {
      type: 'free-text',
      config: {
        field: 'content',
      } as FreeTextConfig,
    },
    { content: '这是一段自由文本内容，从数据字段读取。' },
    { title: '自由文本', description: '基本的自由文本区域', height: '280px' }
  ),
}

// 指定最小高度
export const WithMinHeight: Story = {
  name: '指定最小高度',
  render: createSectionStory(
    {
      type: 'free-text',
      config: {
        field: 'nursingNotes',
        minHeight: '100px',
      } as FreeTextConfig,
    },
    { nursingNotes: '患者一般情况良好。' },
    { title: '指定最小高度', description: '设置最小高度确保足够书写空间' }
  ),
}

// 空值显示
export const EmptyValue: Story = {
  name: '空值显示',
  render: createSectionStory(
    {
      type: 'free-text',
      config: {
        field: 'specialNotes',
        minHeight: '60px',
      } as FreeTextConfig,
    },
    {},
    { title: '空值显示', description: '字段为空时的显示效果', height: '300px' }
  ),
}

// 病程记录（真实场景）
export const MedicalProgress: Story = {
  name: '病程记录',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '病程记录', align: 'left' },
      },
      {
        type: 'free-text',
        config: {
          field: 'progressNotes',
          minHeight: '120px',
        } as FreeTextConfig,
      },
    ],
    {
      progressNotes: `2024-01-15 10:00
患者产后第1天，一般情况良好，精神可，睡眠尚可。
查体：T 36.5℃，P 78次/分，R 18次/分，BP 118/76mmHg
腹软，子宫底脐下一横指，恶露量中，色红，无异味。
会阴切口愈合良好，无红肿渗出。
乳房柔软，乳汁分泌少量。
处理：继续观察，指导母乳喂养。`,
    },
    { title: '病程记录', description: '真实医疗场景：病程记录', height: '420px' }
  ),
}

// 主诉记录
export const ChiefComplaint: Story = {
  name: '主诉记录',
  render: createSectionStory(
    {
      type: 'free-text',
      config: {
        field: 'chiefComplaint',
        minHeight: '60px',
      } as FreeTextConfig,
    },
    { chiefComplaint: '产后3天，乳房胀痛2天，伴有轻微发热。' },
    { title: '主诉记录', description: '患者主诉内容' }
  ),
}
