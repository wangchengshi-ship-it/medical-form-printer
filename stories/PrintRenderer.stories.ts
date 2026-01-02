import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../src/renderer'
import type { PrintSchema, FormData } from '../src/types/print-schema'

// 产妇入院评估单示例数据
const maternalAdmissionSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '产妇入院评估单',
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
              { label: '住院号', field: 'hospitalNumber', type: 'text' },
              { label: '入院时间', field: 'admissionTime', type: 'date' },
              { label: '姓名', field: 'name', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '年龄', field: 'age', type: 'number' },
              { label: '血型', field: 'bloodType', type: 'text' },
              { label: '民族', field: 'ethnicity', type: 'text' },
              { label: '籍贯', field: 'birthplace', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '分娩医院', field: 'deliveryHospital', type: 'text' },
              { label: '分娩日期', field: 'deliveryDate', type: 'date' },
              { label: '分娩方式', field: 'deliveryMethod', type: 'text' },
              { label: '体温', field: 'temperature', type: 'number' },
            ],
          },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '过敏史',
      config: {
        field: 'allergies',
        columns: 4,
        options: [
          { value: 'none', label: '无' },
          { value: 'penicillin', label: '青霉素' },
          { value: 'sulfa', label: '磺胺类' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'allergyOther' },
        ],
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '评估护士', field: 'nurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，入院24小时内完成',
  },
}

const maternalAdmissionData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  admissionTime: '2024-01-15T10:30:00',
  name: '张三',
  age: 28,
  bloodType: 'A型',
  ethnicity: '汉族',
  birthplace: '天津',
  deliveryHospital: '天津市中心妇产科医院',
  deliveryDate: '2024-01-10',
  deliveryMethod: '剖宫产',
  temperature: 36.5,
  allergies: ['none'],
  nurseSignature: '李护士',
}

// 新生儿护理记录单示例数据
const newbornNursingSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'landscape',
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
  ],
  footer: {
    showPageNumber: true,
  },
}

const newbornNursingData: FormData = {
  motherName: '张三',
  roomNumber: '301',
  gender: '男',
  birthDate: '2024-01-10',
  dailyRecords: [
    { date: '2024-01-15', daysOld: 5, weight: 3200, temperature: 36.8, umbilicalCare: true, bath: true, swimming: false, massage: true, notes: '状态良好' },
    { date: '2024-01-16', daysOld: 6, weight: 3250, temperature: 36.7, umbilicalCare: true, bath: true, swimming: true, massage: true, notes: '' },
    { date: '2024-01-17', daysOld: 7, weight: 3300, temperature: 36.6, umbilicalCare: true, bath: true, swimming: true, massage: true, notes: '脐带脱落' },
  ],
}

// Story 配置
const meta: Meta = {
  title: 'PrintRenderer/表单渲染',
  tags: ['autodocs'],
  argTypes: {
    watermark: {
      control: 'text',
      description: '水印文本',
    },
  },
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (schema: PrintSchema, data: FormData) => {
  return (args: { watermark?: string }) => {
    const html = renderToHtml(schema, data, {
      watermark: args.watermark,
    })
    
    // 创建 iframe 来显示完整的 HTML 文档
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '800px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    
    // 使用 srcdoc 设置 iframe 内容
    iframe.srcdoc = html
    
    return iframe
  }
}

// 产妇入院评估单
export const MaternalAdmission: Story = {
  render: createRenderer(maternalAdmissionSchema, maternalAdmissionData),
  args: {
    watermark: '',
  },
}

// 产妇入院评估单（带水印）
export const MaternalAdmissionWithWatermark: Story = {
  render: createRenderer(maternalAdmissionSchema, maternalAdmissionData),
  args: {
    watermark: '仅供内部使用',
  },
}

// 新生儿护理记录单
export const NewbornNursing: Story = {
  render: createRenderer(newbornNursingSchema, newbornNursingData),
  args: {
    watermark: '',
  },
}

// 空数据表单
export const EmptyForm: Story = {
  render: createRenderer(maternalAdmissionSchema, {}),
  args: {
    watermark: '',
  },
}
