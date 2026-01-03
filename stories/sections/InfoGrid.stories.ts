/**
 * @fileoverview 信息网格区块 Story
 * @module stories/sections/InfoGrid
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { InfoGridConfig } from '../../src/types/print-schema'
import { createSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/InfoGrid',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础信息网格
export const Basic: Story = {
  name: '基础信息网格',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '姓名', field: 'name', type: 'text' },
              { label: '年龄', field: 'age', type: 'number' },
              { label: '性别', field: 'gender', type: 'text' },
              { label: '血型', field: 'bloodType', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '入院日期', field: 'admissionDate', type: 'date' },
              { label: '已确认', field: 'confirmed', type: 'checkbox' },
              { label: '联系电话', field: 'phone', type: 'text', span: 2 },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    {
      name: '张三',
      age: 28,
      gender: '女',
      bloodType: 'A型',
      admissionDate: '2024-01-15',
      confirmed: true,
      phone: '13800138000',
    },
    { title: '基础信息网格', description: '4列布局，支持跨列' }
  ),
}

// checkbox-inline 类型
export const CheckboxInline: Story = {
  name: 'checkbox-inline（内联勾选框）',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              {
                label: '过敏史',
                field: 'hasAllergy',
                type: 'checkbox-inline',
                inlineOptions: ['无', '有'],
              },
              {
                label: '手术史',
                field: 'hasSurgery',
                type: 'checkbox-inline',
                inlineOptions: ['无', '有'],
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { hasAllergy: true, hasSurgery: false },
    { title: '内联勾选框', description: '布尔值显示为勾选框组', height: '280px' }
  ),
}

// compound 类型
export const Compound: Story = {
  name: 'compound（复合字段）',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              {
                label: '血压',
                field: 'bloodPressure',
                type: 'compound',
                compoundFormat: '{systolic}/{diastolic}mmHg',
                compoundFields: {
                  systolic: 'bp_systolic',
                  diastolic: 'bp_diastolic',
                },
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { bp_systolic: 120, bp_diastolic: 80 },
    { title: '复合字段', description: '多个字段组合显示', height: '280px' }
  ),
}

// textarea 类型
export const Textarea: Story = {
  name: 'textarea（多行文本）',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 2,
        rows: [
          {
            cells: [
              {
                label: '主诉',
                field: 'chiefComplaint',
                type: 'textarea',
                minHeight: '80px',
                span: 1,
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { chiefComplaint: '产后3天，乳房胀痛2天。' },
    { title: '多行文本', description: '支持多行文本显示', height: '300px' }
  ),
}

// 带后缀
export const WithSuffix: Story = {
  name: '带后缀',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '体温', field: 'temperature', type: 'number', suffix: '℃' },
              { label: '体重', field: 'weight', type: 'number', suffix: 'kg' },
              { label: '身高', field: 'height', type: 'number', suffix: 'cm' },
              { label: '心率', field: 'heartRate', type: 'number', suffix: '次/分' },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { temperature: 36.5, weight: 55, height: 165, heartRate: 72 },
    { title: '带后缀', description: '数值字段带单位后缀', height: '280px' }
  ),
}

// 产妇基本信息（真实场景）
export const MaternalInfo: Story = {
  name: '产妇基本信息',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '姓名', field: 'name', type: 'text' },
              { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
              { label: '入住日期', field: 'admissionDate', type: 'date' },
              { label: '床号', field: 'bedNo', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '孕次', field: 'gravidity', type: 'number' },
              { label: '产次', field: 'parity', type: 'number' },
              { label: '分娩方式', field: 'deliveryMethod', type: 'text' },
              { label: '分娩日期', field: 'deliveryDate', type: 'date' },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    {
      name: '李女士',
      age: 30,
      admissionDate: '2024-01-15',
      bedNo: 'A-201',
      gravidity: 2,
      parity: 1,
      deliveryMethod: '顺产',
      deliveryDate: '2024-01-14',
    },
    { title: '产妇基本信息', description: '真实医疗场景：产妇入院信息' }
  ),
}
