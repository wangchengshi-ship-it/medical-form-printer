import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 产妇入院评估单 Schema
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
          {
            cells: [
              { label: '脉搏', field: 'pulse', type: 'number' },
              { label: '呼吸', field: 'respiration', type: 'number' },
              { label: '血压', field: 'bloodPressure', type: 'text' },
              { label: '体重', field: 'weight', type: 'number' },
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
      type: 'checkbox-grid',
      title: '既往病史',
      config: {
        field: 'medicalHistory',
        columns: 4,
        options: [
          { value: 'none', label: '无' },
          { value: 'hypertension', label: '高血压' },
          { value: 'diabetes', label: '糖尿病' },
          { value: 'heart', label: '心脏病' },
          { value: 'hepatitis', label: '肝炎' },
          { value: 'tuberculosis', label: '结核' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'medicalHistoryOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: '入院评估：',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'assessment',
        minHeight: '80px',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '评估护士', field: 'nurseSignature', showDate: true },
          { label: '护士长', field: 'headNurseSignature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，入院24小时内完成',
  },
}

// 示例数据
const sampleData: FormData = {
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
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80',
  weight: 55,
  allergies: ['none'],
  medicalHistory: ['none'],
  assessment: '产妇一般情况良好，神志清楚，精神可。剖宫产术后第5天，切口愈合良好，无红肿渗出。乳房胀满，乳汁分泌正常。恶露量少，色淡红。',
  nurseSignature: '李护士',
  headNurseSignature: '王护士长',
}

const meta: Meta = {
  title: 'PrintRenderer/Forms/MaternalAdmission',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToIsolatedHtml(maternalAdmissionSchema, data, { watermark })
    
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

// 有过敏史
export const WithAllergies: Story = {
  name: '有过敏史',
  render: createRenderer({
    ...sampleData,
    allergies: ['penicillin', 'other'],
    allergyOther: '海鲜',
  }),
}

// 有既往病史
export const WithMedicalHistory: Story = {
  name: '有既往病史',
  render: createRenderer({
    ...sampleData,
    medicalHistory: ['hypertension', 'diabetes'],
  }),
}
