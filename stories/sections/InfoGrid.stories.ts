/**
 * @fileoverview 信息网格区块 Story
 * @module stories/sections/InfoGrid
 * @description 下划线填空样式的信息网格，与前端 Vue 组件保持一致
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

// 基础信息网格（下划线填空样式）
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
              { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
              { label: '性别', field: 'gender', type: 'text' },
              { label: '血型', field: 'bloodType', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '入院日期', field: 'admissionDate', type: 'date' },
              { label: '联系电话', field: 'phone', type: 'text', span: 2 },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    {
      name: 'Jane Doe',
      age: 28,
      gender: '女',
      bloodType: 'A型',
      admissionDate: '2024-01-15',
      phone: '13800138000',
    },
    { title: '基础信息网格', description: '下划线填空样式，4列布局，支持跨列' }
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
              {
                label: '输血史',
                field: 'hasTransfusion',
                type: 'checkbox-inline',
                inlineOptions: ['无', '有'],
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { hasAllergy: true, hasSurgery: false, hasTransfusion: false },
    { title: '内联勾选框', description: '布尔值显示为 □无 ☑有 样式', height: '280px' }
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
              },
              {
                label: '脉搏',
                field: 'pulse',
                type: 'number',
                suffix: '次/分',
              },
              {
                label: '体温',
                field: 'temperature',
                type: 'number',
                suffix: '℃',
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { systolic: 120, diastolic: 80, pulse: 72, temperature: 36.5 },
    { title: '复合字段', description: '多个字段组合显示，如血压 120/80mmHg', height: '280px' }
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
              { label: '姓名', field: 'name', type: 'text' },
              { label: '入院日期', field: 'admissionDate', type: 'date' },
            ],
          },
          {
            cells: [
              {
                label: '主诉',
                field: 'chiefComplaint',
                type: 'textarea',
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { name: 'Mary Smith', admissionDate: '2024-01-15', chiefComplaint: '产后3天，乳房胀痛2天。\n伴有轻微发热，体温37.5℃。' },
    { title: '多行文本', description: '支持多行文本自然换行显示', height: '320px' }
  ),
}

// checkbox-text 类型
export const CheckboxText: Story = {
  name: 'checkbox-text（勾选+文本）',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 1,
        rows: [
          {
            cells: [
              {
                label: '',
                field: 'hasComplications',
                type: 'checkbox-text',
                text: '产后并发症：产后出血、感染等需要特别关注',
              },
            ],
          },
          {
            cells: [
              {
                label: '',
                field: 'needsSpecialCare',
                type: 'checkbox-text',
                text: '需要特殊护理：如高血压、糖尿病等合并症',
              },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { hasComplications: true, needsSpecialCare: false },
    { title: '勾选+文本', description: '☑/□ 后跟说明文本', height: '300px' }
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

// 自定义宽度
export const CustomWidth: Story = {
  name: '自定义宽度',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '房号', field: 'roomNumber', type: 'text', width: '30mm' },
              { label: '住院号', field: 'hospitalNumber', type: 'text', width: '50mm' },
              { label: '入院时间', field: 'admissionTime', type: 'date' },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    { roomNumber: '301', hospitalNumber: 'INT-2025-CKFK-001', admissionTime: '2025-01-15' },
    { title: '自定义宽度', description: '可以为字段指定固定宽度', height: '280px' }
  ),
}

// 产妇基本信息（真实场景）
export const MaternalInfo: Story = {
  name: '产妇基本信息（真实场景）',
  render: createSectionStory(
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '房号', field: 'roomNumber', type: 'text', width: '25mm' },
              { label: '住院号', field: 'hospitalNumber', type: 'text', width: '50mm' },
              { label: '入院时间', field: 'admissionTime', type: 'date' },
            ],
          },
          {
            cells: [
              { label: '姓名', field: 'name', type: 'text' },
              { label: '年龄', field: 'age', type: 'number', suffix: '岁' },
              { label: '民族', field: 'ethnicity', type: 'text' },
              { label: '籍贯', field: 'birthplace', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '分娩医院', field: 'deliveryHospital', type: 'text' },
              { label: '分娩日期', field: 'deliveryDate', type: 'date' },
              { label: '分娩方式', field: 'deliveryMethod', type: 'text' },
              { label: '胎次产', field: 'parity', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '过敏史', field: 'hasAllergy', type: 'checkbox-inline', inlineOptions: ['无', '有'] },
              { label: '过敏药物', field: 'allergyDetail', type: 'text', span: 2 },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    {
      roomNumber: '301',
      hospitalNumber: 'INT-2025-CKFK-001',
      admissionTime: '2025-01-15',
      name: 'Mary Johnson',
      age: 28,
      ethnicity: '汉族',
      birthplace: 'Beijing',
      deliveryHospital: 'Sample Medical Center',
      deliveryDate: '2025-01-14',
      deliveryMethod: '剖宫产',
      parity: '初次产',
      hasAllergy: false,
      allergyDetail: '',
    },
    { title: 'Maternal Admission Assessment', description: '真实医疗场景：产妇入院信息，下划线填空样式', height: '400px' }
  ),
}

// 空数据
export const EmptyData: Story = {
  name: '空数据',
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
              { label: '性别', field: 'gender', type: 'text' },
              { label: '血型', field: 'bloodType', type: 'text' },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    {},
    { title: '空数据', description: '没有数据时显示空白下划线', height: '280px' }
  ),
}
