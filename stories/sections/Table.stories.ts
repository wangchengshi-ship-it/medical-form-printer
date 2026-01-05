/**
 * @fileoverview 表格区块 Story
 * @module stories/sections/Table
 *
 * @description
 * Demonstrates table section rendering including:
 * - Basic tables with various column types
 * - Tables with row numbers
 * - Multi-row headers with colspan/rowspan
 * - Builder pattern for complex header construction
 */

import type { Meta, StoryObj } from '@storybook/html'
import type { TableConfig, HeaderRow } from '../../src/types/print-schema'
import { TableHeaderBuilder } from '../../src/renderer/section-renderers/table/header-builder'
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

// 多行表头 - 血压分收缩压/舒张压
export const MultiRowHeader: Story = {
  name: '多行表头',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'vitalSigns',
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '收缩压', field: 'systolic', type: 'number', width: '80px' },
          { header: '舒张压', field: 'diastolic', type: 'number', width: '80px' },
          { header: '体温', field: 'temperature', type: 'number', width: '80px' },
        ],
        headerRows: [
          {
            cells: [
              { text: '日期', rowspan: 2, width: '100px' },
              { text: '血压 (mmHg)', colspan: 2 },
              { text: '体温 (℃)', rowspan: 2, width: '80px' },
            ],
          },
          {
            cells: [
              { text: '收缩压', field: 'systolic', width: '80px' },
              { text: '舒张压', field: 'diastolic', width: '80px' },
            ],
          },
        ] as HeaderRow[],
      } as TableConfig,
    },
    {
      vitalSigns: [
        { date: '2024-01-15', systolic: 120, diastolic: 80, temperature: 36.5 },
        { date: '2024-01-16', systolic: 118, diastolic: 78, temperature: 36.8 },
        { date: '2024-01-17', systolic: 122, diastolic: 82, temperature: 36.6 },
      ],
    },
    {
      title: '多行表头表格',
      description: '使用 headerRows 配置实现多行表头，血压分为收缩压和舒张压两个子列',
      height: '350px',
    }
  ),
}

// 建造者模式示例
const builderHeaderRows = new TableHeaderBuilder()
  .addRow()
    .addCell('日期').rowspan(2).width('100px').done()
    .addCell('血压 (mmHg)').colspan(2).done()
    .addCell('体温 (℃)').rowspan(2).width('80px').done()
  .done()
  .addRow()
    .addCell('收缩压').field('systolic').width('80px').done()
    .addCell('舒张压').field('diastolic').width('80px').done()
  .done()
  .build()

export const BuilderPattern: Story = {
  name: '建造者模式',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'vitalSigns',
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '收缩压', field: 'systolic', type: 'number', width: '80px' },
          { header: '舒张压', field: 'diastolic', type: 'number', width: '80px' },
          { header: '体温', field: 'temperature', type: 'number', width: '80px' },
        ],
        headerRows: builderHeaderRows,
      } as TableConfig,
    },
    {
      vitalSigns: [
        { date: '2024-01-15', systolic: 120, diastolic: 80, temperature: 36.5 },
        { date: '2024-01-16', systolic: 118, diastolic: 78, temperature: 36.8 },
        { date: '2024-01-17', systolic: 122, diastolic: 82, temperature: 36.6 },
      ],
    },
    {
      title: '建造者模式表格',
      description: '使用 TableHeaderBuilder 流畅 API 构建复杂表头配置',
      height: '350px',
    }
  ),
}

// 复杂三行表头示例
const complexHeaderRows = new TableHeaderBuilder()
  .addRow()
    .addCell('基本信息').colspan(2).done()
    .addCell('生命体征').colspan(4).done()
    .addCell('备注').rowspan(3).done()
  .done()
  .addRow()
    .addCell('日期').rowspan(2).width('100px').done()
    .addCell('时间').rowspan(2).width('80px').done()
    .addCell('血压 (mmHg)').colspan(2).done()
    .addCell('体温 (℃)').rowspan(2).width('80px').done()
    .addCell('心率 (次/分)').rowspan(2).width('80px').done()
  .done()
  .addRow()
    .addCell('收缩压').field('systolic').width('80px').done()
    .addCell('舒张压').field('diastolic').width('80px').done()
  .done()
  .build()

export const ComplexThreeRowHeader: Story = {
  name: '复杂三行表头',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'vitalSigns',
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '时间', field: 'time', type: 'text', width: '80px' },
          { header: '收缩压', field: 'systolic', type: 'number', width: '80px' },
          { header: '舒张压', field: 'diastolic', type: 'number', width: '80px' },
          { header: '体温', field: 'temperature', type: 'number', width: '80px' },
          { header: '心率', field: 'heartRate', type: 'number', width: '80px' },
          { header: '备注', field: 'notes', type: 'text' },
        ],
        headerRows: complexHeaderRows,
      } as TableConfig,
    },
    {
      vitalSigns: [
        { date: '2024-01-15', time: '08:00', systolic: 120, diastolic: 80, temperature: 36.5, heartRate: 72, notes: '状态良好' },
        { date: '2024-01-15', time: '14:00', systolic: 118, diastolic: 78, temperature: 36.8, heartRate: 75, notes: '' },
        { date: '2024-01-15', time: '20:00', systolic: 122, diastolic: 82, temperature: 36.6, heartRate: 70, notes: '待复查' },
        { date: '2024-01-16', time: '08:00', systolic: 119, diastolic: 79, temperature: 36.4, heartRate: 68, notes: '' },
      ],
    },
    {
      title: '复杂三行表头表格',
      description: '三行嵌套表头结构：基本信息和生命体征分组，血压进一步细分为收缩压和舒张压',
      height: '400px',
    }
  ),
}

// 多行表头带行号
export const MultiRowHeaderWithRowNumber: Story = {
  name: '多行表头带行号',
  render: createSectionStory(
    {
      type: 'table',
      config: {
        dataField: 'vitalSigns',
        showRowNumber: true,
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '100px' },
          { header: '收缩压', field: 'systolic', type: 'number', width: '80px' },
          { header: '舒张压', field: 'diastolic', type: 'number', width: '80px' },
          { header: '体温', field: 'temperature', type: 'number', width: '80px' },
        ],
        headerRows: [
          {
            cells: [
              { text: '日期', rowspan: 2, width: '100px' },
              { text: '血压 (mmHg)', colspan: 2 },
              { text: '体温 (℃)', rowspan: 2, width: '80px' },
            ],
          },
          {
            cells: [
              { text: '收缩压', field: 'systolic', width: '80px' },
              { text: '舒张压', field: 'diastolic', width: '80px' },
            ],
          },
        ] as HeaderRow[],
      } as TableConfig,
    },
    {
      vitalSigns: [
        { date: '2024-01-15', systolic: 120, diastolic: 80, temperature: 36.5 },
        { date: '2024-01-16', systolic: 118, diastolic: 78, temperature: 36.8 },
        { date: '2024-01-17', systolic: 122, diastolic: 82, temperature: 36.6 },
      ],
    },
    {
      title: '多行表头带行号',
      description: '多行表头与行号列的组合使用，行号列自动跨越所有表头行',
      height: '350px',
    }
  ),
}
