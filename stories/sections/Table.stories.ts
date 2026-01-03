/**
 * @fileoverview 表格区块 Story
 * @module stories/sections/Table
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { TableConfig } from '../../src/types/print-schema'
import { createSectionStory } from './_story-utils'

const meta: Meta = {
  title: 'PrintRenderer/Sections/Table',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// 基础表格
export const Basic: Story = {
  name: '基础表格',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'records',
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '体温(℃)', field: 'temperature', type: 'number', width: '80px' },
          { header: '血压', field: 'bloodPressure', type: 'text', width: '100px' },
          { header: '备注', field: 'notes', type: 'text' },
        ],
      } as TableConfig,
    },
    {
      records: [
        { date: '2024-01-15', temperature: 36.5, bloodPressure: '120/80', notes: '状态良好' },
        { date: '2024-01-16', temperature: 36.8, bloodPressure: '118/78', notes: '' },
        { date: '2024-01-17', temperature: 36.6, bloodPressure: '122/82', notes: '待复查' },
      ],
    },
    { title: '基础表格', description: '基本的数据表格，支持多种列类型' }
  ),
}

// 带行号
export const WithRowNumber: Story = {
  name: '带行号',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'records',
        showRowNumber: true,
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '体温(℃)', field: 'temperature', type: 'number', width: '80px' },
          { header: '已检查', field: 'checked', type: 'checkbox', width: '60px' },
          { header: '备注', field: 'notes', type: 'text' },
        ],
      } as TableConfig,
    },
    {
      records: [
        { date: '2024-01-15', temperature: 36.5, checked: true, notes: '状态良好' },
        { date: '2024-01-16', temperature: 36.8, checked: true, notes: '' },
        { date: '2024-01-17', temperature: 36.6, checked: false, notes: '待复查' },
      ],
    },
    { title: '带行号表格', description: '显示行号列，便于定位数据' }
  ),
}

// 护理记录表
export const NursingRecord: Story = {
  name: '护理记录表',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'nursingRecords',
        showRowNumber: true,
        columns: [
          { header: '时间', field: 'time', type: 'text', width: '80px' },
          { header: '护理内容', field: 'content', type: 'text' },
          { header: '护士签名', field: 'nurse', type: 'signature', width: '80px' },
        ],
      } as TableConfig,
    },
    {
      nursingRecords: [
        { time: '08:00', content: '晨间护理，测量生命体征', nurse: 'Nurse Li' },
        { time: '10:00', content: '协助母乳喂养指导', nurse: 'Nurse Wang' },
        { time: '14:00', content: '产后康复操指导', nurse: 'Nurse Li' },
        { time: '18:00', content: '晚间护理，观察恶露情况', nurse: 'Nurse Zhang' },
      ],
    },
    { title: '护理记录表', description: '真实医疗场景：护理记录表格' }
  ),
}

// 空数据
export const EmptyData: Story = {
  name: '空数据',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'records',
        columns: [
          { header: '日期', field: 'date', type: 'date' },
          { header: '内容', field: 'content', type: 'text' },
        ],
      } as TableConfig,
    },
    { records: [] },
    { title: '空数据表格', description: '数据为空时的表格显示', height: '250px' }
  ),
}
