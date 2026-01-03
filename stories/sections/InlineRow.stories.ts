/**
 * @fileoverview 内联行区块 Story
 * @module stories/sections/InlineRow
 * @description InlineRow 用于将多个区块水平排列在一行
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { InlineRowConfig, InfoGridConfig, CheckboxGridConfig, NotesConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/InlineRow',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础内联行（两列等宽）
export const Basic: Story = {
  name: '基础内联行',
  render: createSectionStory(
    {
      type: 'inline-row',
      config: {
        children: [
          {
            type: 'notes',
            config: { content: '左侧内容' } as NotesConfig,
          },
          {
            type: 'notes',
            config: { content: '右侧内容' } as NotesConfig,
          },
        ],
      } as InlineRowConfig,
    },
    {},
    { title: '内联行', description: '两个区块水平排列', height: '280px' }
  ),
}

// 自定义列比例
export const CustomColumns: Story = {
  name: '自定义列比例',
  render: createSectionStory(
    {
      type: 'inline-row',
      config: {
        columns: [1, 2, 1],
        gap: '16px',
        children: [
          {
            type: 'notes',
            config: { content: '1份宽度' } as NotesConfig,
          },
          {
            type: 'notes',
            config: { content: '2份宽度（中间更宽）' } as NotesConfig,
          },
          {
            type: 'notes',
            config: { content: '1份宽度' } as NotesConfig,
          },
        ],
      } as InlineRowConfig,
    },
    {},
    { title: '自定义列比例', description: '1:2:1 比例布局', height: '280px' }
  ),
}

// 混合区块类型
export const MixedTypes: Story = {
  name: '混合区块类型',
  render: createSectionStory(
    {
      type: 'inline-row',
      config: {
        columns: [2, 1],
        gap: '16px',
        children: [
          {
            type: 'info-grid',
            config: {
              columns: 2,
              rows: [
                {
                  cells: [
                    { label: '姓名', field: 'name', type: 'text' },
                    { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
                  ],
                },
              ],
            } as InfoGridConfig,
          },
          {
            type: 'checkbox-grid',
            config: {
              field: 'gender',
              layout: 'flex',
              prefixLabel: '性别：',
              options: [
                { value: 'male', label: '男' },
                { value: 'female', label: '女' },
              ],
            } as CheckboxGridConfig,
          },
        ],
      } as InlineRowConfig,
    },
    { name: 'Jane Doe', age: 28, gender: ['female'] },
    { title: '混合区块类型', description: 'InfoGrid + CheckboxGrid 组合' }
  ),
}

// 产妇信息行（真实场景）
export const MaternalInfoRow: Story = {
  name: '产妇信息行',
  render: createMultiSectionStory(
    [
      {
        type: 'section-title',
        config: { text: '产妇基本信息', align: 'left' },
      },
      {
        type: 'inline-row',
        config: {
          columns: [3, 2],
          gap: '16px',
          children: [
            {
              type: 'info-grid',
              config: {
                columns: 3,
                rows: [
                  {
                    cells: [
                      { label: '姓名', field: 'name', type: 'text' },
                      { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
                      { label: '床号', field: 'bedNo', type: 'text' },
                    ],
                  },
                ],
              } as InfoGridConfig,
            },
            {
              type: 'checkbox-grid',
              config: {
                field: 'deliveryMethod',
                layout: 'flex',
                prefixLabel: '分娩方式：',
                options: [
                  { value: 'natural', label: '顺产' },
                  { value: 'cesarean', label: '剖宫产' },
                ],
              } as CheckboxGridConfig,
            },
          ],
        } as InlineRowConfig,
      },
    ],
    {
      name: 'Mary Smith',
      age: 30,
      bedNo: 'A-201',
      deliveryMethod: ['natural'],
    },
    { title: '产妇信息行', description: '真实医疗场景：产妇基本信息水平布局' }
  ),
}
