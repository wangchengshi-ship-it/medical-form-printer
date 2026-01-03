import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 新生儿护理记录单 Schema
const newbornNursingSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '新生儿护理记录单',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '房号', field: 'roomNumber', type: 'text' },
              { label: '床号', field: 'bedNumber', type: 'text' },
              { label: '新生儿姓名', field: 'babyName', type: 'text' },
              { label: '性别', field: 'gender', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '出生日期', field: 'birthDate', type: 'date' },
              { label: '出生体重', field: 'birthWeight', type: 'number', suffix: 'g' },
              { label: '母亲姓名', field: 'motherName', type: 'text' },
              { label: '住院号', field: 'hospitalNumber', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: '护理记录',
      config: {
        columns: [
          { field: 'date', header: '日期', width: '80px' },
          { field: 'time', header: '时间', width: '60px' },
          { field: 'temperature', header: '体温(℃)', width: '70px' },
          { field: 'weight', header: '体重(g)', width: '70px' },
          { field: 'feeding', header: '喂养情况', width: '100px' },
          { field: 'urination', header: '排尿', width: '50px' },
          { field: 'defecation', header: '排便', width: '50px' },
          { field: 'skinCondition', header: '皮肤情况', width: '100px' },
          { field: 'umbilicalCord', header: '脐带情况', width: '100px' },
          { field: 'nurse', header: '护士签名', width: '80px' },
        ],
        dataField: 'nursingRecords',
      },
    },
    {
      type: 'checkbox-grid',
      title: '特殊情况',
      config: {
        field: 'specialConditions',
        columns: 4,
        options: [
          { value: 'none', label: '无' },
          { value: 'jaundice', label: '黄疸' },
          { value: 'rash', label: '皮疹' },
          { value: 'fever', label: '发热' },
          { value: 'vomiting', label: '呕吐' },
          { value: 'diarrhea', label: '腹泻' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'specialConditionsOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: '护理备注：',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'nursingNotes',
        minHeight: '60px',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '责任护士', field: 'nurseSignature', showDate: true },
          { label: '护士长', field: 'headNurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，每日记录',
  },
}

// 示例数据
const sampleData: FormData = {
  roomNumber: '301',
  bedNumber: '1',
  babyName: '张宝宝',
  gender: '男',
  birthDate: '2024-01-10',
  birthWeight: 3250,
  motherName: '张三',
  hospitalNumber: '2024010001',
  nursingRecords: [
    {
      date: '2024-01-15',
      time: '08:00',
      temperature: 36.8,
      weight: 3300,
      feeding: '母乳喂养',
      urination: '正常',
      defecation: '正常',
      skinCondition: '良好',
      umbilicalCord: '干燥',
      nurse: '李护士',
    },
    {
      date: '2024-01-15',
      time: '14:00',
      temperature: 36.7,
      weight: 3300,
      feeding: '母乳喂养',
      urination: '正常',
      defecation: '正常',
      skinCondition: '良好',
      umbilicalCord: '干燥',
      nurse: '王护士',
    },
    {
      date: '2024-01-15',
      time: '20:00',
      temperature: 36.9,
      weight: 3310,
      feeding: '母乳+配方奶',
      urination: '正常',
      defecation: '正常',
      skinCondition: '良好',
      umbilicalCord: '干燥',
      nurse: '赵护士',
    },
  ],
  specialConditions: ['none'],
  nursingNotes: '新生儿一般情况良好，吃奶有力，睡眠安稳。',
  nurseSignature: '李护士',
  headNurseSignature: '王护士长',
}

const meta: Meta = {
  title: 'PrintRenderer/Forms/NewbornNursing',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(newbornNursingSchema, data, { watermark })
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '800px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 完整数据
export const FullData: Story = {
  name: '完整数据',
  render: createRenderer(sampleData),
}

// 空数据
export const EmptyData: Story = {
  name: '空数据',
  render: createRenderer({}),
}

// 带水印
export const WithWatermark: Story = {
  name: '带水印',
  render: createRenderer(sampleData, '仅供内部使用'),
}

// 有特殊情况
export const WithSpecialConditions: Story = {
  name: '有特殊情况',
  render: createRenderer({
    ...sampleData,
    specialConditions: ['jaundice', 'other'],
    specialConditionsOther: '轻度红臀',
    nursingNotes: '新生儿出现轻度黄疸，已通知医生。皮肤轻度红臀，已加强护理。',
  }),
}

// 多条记录
export const MultipleRecords: Story = {
  name: '多条记录',
  render: createRenderer({
    ...sampleData,
    nursingRecords: [
      ...sampleData.nursingRecords as object[],
      {
        date: '2024-01-16',
        time: '08:00',
        temperature: 36.6,
        weight: 3320,
        feeding: '母乳喂养',
        urination: '正常',
        defecation: '正常',
        skinCondition: '良好',
        umbilicalCord: '干燥',
        nurse: '李护士',
      },
      {
        date: '2024-01-16',
        time: '14:00',
        temperature: 36.7,
        weight: 3325,
        feeding: '母乳喂养',
        urination: '正常',
        defecation: '正常',
        skinCondition: '良好',
        umbilicalCord: '干燥',
        nurse: '王护士',
      },
    ],
  }),
}
