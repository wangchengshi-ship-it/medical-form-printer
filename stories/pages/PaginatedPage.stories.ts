import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 多行数据表单（模拟分页场景）
const paginatedSchema: PrintSchema = {
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
              { label: '母亲姓名', field: 'motherName', type: 'text' },
              { label: '房号', field: 'roomNumber', type: 'text' },
              { label: '性别', field: 'gender', type: 'text' },
              { label: '出生日期', field: 'birthDate', type: 'date' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: '每日护理记录',
      config: {
        dataField: 'dailyRecords',
        showRowNumber: true,
        columns: [
          { header: '日期', field: 'date', type: 'date', width: '80px' },
          { header: '出生天数', field: 'daysOld', type: 'number', width: '60px' },
          { header: '体重(g)', field: 'weight', type: 'number', width: '70px' },
          { header: '体温(℃)', field: 'temperature', type: 'number', width: '70px' },
          { header: '脐护', field: 'umbilicalCare', type: 'checkbox', width: '50px' },
          { header: '洗澡', field: 'bath', type: 'checkbox', width: '50px' },
          { header: '游泳', field: 'swimming', type: 'checkbox', width: '50px' },
          { header: '抚触', field: 'massage', type: 'checkbox', width: '50px' },
          { header: '备注', field: 'notes', type: 'text' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '护士签名', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
  },
}

// 生成多行数据
const generateDailyRecords = (count: number) => {
  const records: Record<string, unknown>[] = []
  const baseDate = new Date('2024-01-15')
  
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    
    records.push({
      date: date.toISOString().split('T')[0],
      daysOld: i + 5,
      weight: 3200 + i * 30,
      temperature: 36.5 + (Math.random() * 0.5 - 0.25),
      umbilicalCare: true,
      bath: i % 2 === 0,
      swimming: i % 3 === 0,
      massage: true,
      notes: i === 0 ? '状态良好' : (i === 6 ? '脐带脱落' : ''),
    })
  }
  
  return records
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/PaginatedPage',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (recordCount: number) => {
  return () => {
    const data: FormData = {
      motherName: '张三',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(recordCount),
      nurseSignature: '李护士',
    }
    
    const html = renderToHtml(paginatedSchema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '800px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  }
}

// 少量数据（单页）
export const FewRecords: Story = {
  name: '少量数据（3条）',
  render: createRenderer(3),
}

// 中等数据
export const MediumRecords: Story = {
  name: '中等数据（7条）',
  render: createRenderer(7),
}

// 大量数据（需要分页）
export const ManyRecords: Story = {
  name: '大量数据（14条）',
  render: createRenderer(14),
}

// 超大量数据
export const VeryManyRecords: Story = {
  name: '超大量数据（28条）',
  render: createRenderer(28),
}

// 横向布局
export const LandscapeLayout: Story = {
  name: '横向布局（14条）',
  render: () => {
    const schema: PrintSchema = {
      ...paginatedSchema,
      orientation: 'landscape',
    }
    
    const data: FormData = {
      motherName: '张三',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(14),
      nurseSignature: '李护士',
    }
    
    const html = renderToHtml(schema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
}
