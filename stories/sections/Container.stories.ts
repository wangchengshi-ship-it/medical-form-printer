/**
 * @fileoverview 容器区块 Story
 * @module stories/sections/Container
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { ContainerConfig, NotesConfig, SectionTitleConfig, CheckboxGridConfig, InfoGridConfig } from '../../src/types/print-schema'
import { createSectionStory, createMultiSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/Container',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 垂直布局（默认）
export const ColumnDirection: Story = {
  name: '垂直布局（默认）',
  render: createSectionStory(
    {
      type: 'container',
      config: {
        direction: 'column',
        gap: '12px',
        children: [
          {
            type: 'section-title',
            config: { text: '第一部分', align: 'left' } as SectionTitleConfig,
          },
          {
            type: 'notes',
            config: { content: '这是第一部分的内容', showBorder: true } as NotesConfig,
          },
          {
            type: 'section-title',
            config: { text: '第二部分', align: 'left' } as SectionTitleConfig,
          },
          {
            type: 'notes',
            config: { content: '这是第二部分的内容', showBorder: true } as NotesConfig,
          },
        ],
      } as ContainerConfig,
    },
    {},
    { title: '垂直布局', description: '子元素垂直排列' }
  ),
}

// 水平布局
export const RowDirection: Story = {
  name: '水平布局',
  render: createSectionStory(
    {
      type: 'container',
      config: {
        direction: 'row',
        gap: '16px',
        children: [
          {
            type: 'notes',
            config: { content: '左侧内容', showBorder: true } as NotesConfig,
          },
          {
            type: 'notes',
            config: { content: '右侧内容', showBorder: true } as NotesConfig,
          },
        ],
      } as ContainerConfig,
    },
    {},
    { title: '水平布局', description: '子元素水平排列' }
  ),
}

// 带边框
export const WithBorder: Story = {
  name: '带边框',
  render: createSectionStory(
    {
      type: 'container',
      config: {
        direction: 'column',
        gap: '8px',
        border: true,
        padding: '12px',
        children: [
          {
            type: 'section-title',
            config: { text: '带边框的容器', align: 'center' } as SectionTitleConfig,
          },
          {
            type: 'notes',
            config: { content: '容器内的内容会被边框包围' } as NotesConfig,
          },
        ],
      } as ContainerConfig,
    },
    {},
    { title: '带边框容器', description: '容器带边框和内边距' }
  ),
}

// 嵌套容器
export const NestedContainers: Story = {
  name: '嵌套容器',
  render: createSectionStory(
    {
      type: 'container',
      config: {
        direction: 'column',
        gap: '12px',
        border: true,
        padding: '12px',
        children: [
          {
            type: 'section-title',
            config: { text: '外层容器', align: 'center' } as SectionTitleConfig,
          },
          {
            type: 'container',
            config: {
              direction: 'row',
              gap: '8px',
              border: '1px solid #ccc',
              padding: '8px',
              children: [
                {
                  type: 'notes',
                  config: { content: '嵌套容器 - 左' } as NotesConfig,
                },
                {
                  type: 'notes',
                  config: { content: '嵌套容器 - 右' } as NotesConfig,
                },
              ],
            } as ContainerConfig,
          },
        ],
      } as ContainerConfig,
    },
    {},
    { title: '嵌套容器', description: '容器可以嵌套使用' }
  ),
}

// 真实医疗表单示例
export const RealMedicalExample: Story = {
  name: '真实医疗表单示例',
  render: createSectionStory(
    {
      type: 'container',
      config: {
        direction: 'column',
        gap: '16px',
        border: true,
        padding: '16px',
        children: [
          {
            type: 'section-title',
            config: { text: '产妇基本信息', align: 'center', fontSize: '16px' } as SectionTitleConfig,
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
                    { label: '入院日期', field: 'admissionDate', type: 'date' },
                    { label: '床号', field: 'bedNumber', type: 'text' },
                  ],
                },
              ],
            } as InfoGridConfig,
          },
          {
            type: 'container',
            config: {
              direction: 'row',
              gap: '16px',
              children: [
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
                {
                  type: 'checkbox-grid',
                  config: {
                    field: 'feedingMethod',
                    layout: 'flex',
                    prefixLabel: '喂养方式：',
                    options: [
                      { value: 'breast', label: '母乳' },
                      { value: 'formula', label: '配方奶' },
                      { value: 'mixed', label: '混合' },
                    ],
                  } as CheckboxGridConfig,
                },
              ],
            } as ContainerConfig,
          },
        ],
      } as ContainerConfig,
    },
    {
      name: 'Mary Johnson',
      age: 28,
      admissionDate: '2024-01-15',
      bedNumber: 'A-101',
      deliveryMethod: ['natural'],
      feedingMethod: ['breast'],
    },
    { title: '产妇基本信息', description: '真实医疗场景：使用容器组织复杂表单', height: '450px' }
  ),
}
