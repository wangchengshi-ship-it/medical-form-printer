/**
 * @fileoverview 区块标题 Story
 * @module stories/sections/SectionTitle
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { SectionTitleConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/SectionTitle',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 左对齐（默认）
export const AlignLeft: Story = {
  name: '左对齐（默认）',
  render: createSectionStory(
    {
      type: 'section-title',
      config: {
        text: '基本信息',
        align: 'left',
      } as SectionTitleConfig,
    },
    {},
    { title: '左对齐标题', description: '默认左对齐', height: '250px' }
  ),
}

// 居中对齐
export const AlignCenter: Story = {
  name: '居中对齐',
  render: createSectionStory(
    {
      type: 'section-title',
      config: {
        text: '产妇入院评估表',
        align: 'center',
      } as SectionTitleConfig,
    },
    {},
    { title: '居中标题', description: '居中对齐，适合主标题', height: '250px' }
  ),
}

// 右对齐
export const AlignRight: Story = {
  name: '右对齐',
  render: createSectionStory(
    {
      type: 'section-title',
      config: {
        text: '附录',
        align: 'right',
      } as SectionTitleConfig,
    },
    {},
    { title: '右对齐标题', description: '右对齐', height: '250px' }
  ),
}

// 自定义字号
export const CustomFontSize: Story = {
  name: '自定义字号',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '大标题 (18px)', align: 'center', fontSize: '18px' } as SectionTitleConfig,
      },
      {
        type: 'section-title',
        config: { text: '中标题 (14px)', align: 'left', fontSize: '14px' } as SectionTitleConfig,
      },
      {
        type: 'section-title',
        config: { text: '小标题 (12px)', align: 'left', fontSize: '12px' } as SectionTitleConfig,
      },
    ],
    {},
    { title: '自定义字号', description: '不同字号的标题对比' }
  ),
}

// 带下划线
export const WithUnderline: Story = {
  name: '带下划线',
  render: createSectionStory(
    {
      type: 'section-title',
      config: {
        text: '护理评估',
        align: 'left',
        underline: true,
      } as SectionTitleConfig,
    },
    {},
    { title: '带下划线标题', description: '标题带下划线装饰', height: '250px' }
  ),
}

// 表单分区（真实场景）
export const FormSections: Story = {
  name: '表单分区',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '产妇入院评估表', align: 'center', fontSize: '16px' } as SectionTitleConfig,
      },
      {
        type: 'section-title',
        config: { text: '一、基本信息', align: 'left' } as SectionTitleConfig,
      },
      {
        type: 'info-grid',
        config: {
          columns: 4,
          rows: [
            {
              cells: [
                { label: '姓名', field: 'name', type: 'text' },
                { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
                { label: '入住日期', field: 'date', type: 'date' },
                { label: '床号', field: 'bed', type: 'text' },
              ],
            },
          ],
        },
      },
      {
        type: 'section-title',
        config: { text: '二、健康评估', align: 'left' } as SectionTitleConfig,
      },
      {
        type: 'notes',
        config: { content: '患者一般情况良好，生命体征平稳。', showBorder: true },
      },
    ],
    { name: '张女士', age: 28, date: '2024-01-15', bed: 'A-201' },
    { title: '表单分区示例', description: '真实医疗场景：使用标题分隔表单区域', height: '450px' }
  ),
}
