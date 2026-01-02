import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 出院评估单 Schema
const dischargeAssessmentSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '产妇出院评估单',
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
              { label: '姓名', field: 'name', type: 'text' },
              { label: '年龄', field: 'age', type: 'number' },
            ],
          },
          {
            cells: [
              { label: '入院日期', field: 'admissionDate', type: 'date' },
              { label: '出院日期', field: 'dischargeDate', type: 'date' },
              { label: '住院天数', field: 'stayDays', type: 'number' },
              { label: '分娩方式', field: 'deliveryMethod', type: 'text' },
            ],
          },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '本表由护士填写，出院当日完成',
  },
}


// 添加更多区块到 schema
dischargeAssessmentSchema.sections.push(
  {
    type: 'section-title',
    config: {
      text: '出院时一般情况',
      align: 'left',
      fontSize: 'medium',
      bold: true,
    },
  },
  {
    type: 'info-grid',
    config: {
      columns: 4,
      rows: [
        {
          cells: [
            { label: '体温', field: 'temperature', type: 'number', suffix: '℃' },
            { label: '脉搏', field: 'pulse', type: 'number', suffix: '次/分' },
            { label: '呼吸', field: 'respiration', type: 'number', suffix: '次/分' },
            { label: '血压', field: 'bloodPressure', type: 'text' },
          ],
        },
        {
          cells: [
            { label: '体重', field: 'weight', type: 'number', suffix: 'kg' },
            { label: '子宫复旧', field: 'uterusRecovery', type: 'text' },
            { label: '恶露情况', field: 'lochiaStatus', type: 'text' },
            { label: '切口愈合', field: 'woundHealing', type: 'text' },
          ],
        },
      ],
    },
  },
  {
    type: 'checkbox-grid',
    title: '乳房情况',
    config: {
      field: 'breastCondition',
      columns: 4,
      options: [
        { value: 'soft', label: '柔软' },
        { value: 'engorged', label: '胀满' },
        { value: 'normal', label: '乳汁分泌正常' },
        { value: 'less', label: '乳汁分泌少' },
      ],
    },
  },
  {
    type: 'checkbox-grid',
    title: '喂养方式',
    config: {
      field: 'feedingMethod',
      columns: 4,
      options: [
        { value: 'breastfeeding', label: '纯母乳喂养' },
        { value: 'mixed', label: '混合喂养' },
        { value: 'formula', label: '人工喂养' },
      ],
    },
  }
)


// 添加出院指导和签名区块
dischargeAssessmentSchema.sections.push(
  {
    type: 'notes',
    config: {
      content: '出院指导：',
      showBorder: false,
    },
  },
  {
    type: 'free-text',
    config: {
      field: 'dischargeGuidance',
      minHeight: '100px',
    },
  },
  {
    type: 'signature-area',
    config: {
      fields: [
        { label: '评估护士', field: 'nurseSignature', showDate: true },
        { label: '护士长', field: 'headNurseSignature', showDate: true },
        { label: '产妇签名', field: 'patientSignature', showDate: true },
      ],
    },
  }
)

// 示例数据
const sampleData: FormData = {
  roomNumber: '301',
  hospitalNumber: '2024010001',
  name: '张三',
  age: 28,
  admissionDate: '2024-01-15',
  dischargeDate: '2024-01-22',
  stayDays: 7,
  deliveryMethod: '剖宫产',
  temperature: 36.5,
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80mmHg',
  weight: 52,
  uterusRecovery: '良好',
  lochiaStatus: '量少，色淡红',
  woundHealing: '愈合良好',
  breastCondition: ['soft', 'normal'],
  feedingMethod: ['breastfeeding'],
  dischargeGuidance: `1. 注意休息，保证充足睡眠
2. 合理饮食，多吃高蛋白、高维生素食物
3. 保持切口清洁干燥，如有红肿渗出及时就医
4. 坚持母乳喂养，按需哺乳
5. 产后42天复查
6. 如有发热、恶露异常等情况及时就医`,
  nurseSignature: '李护士',
  headNurseSignature: '王护士长',
  patientSignature: '张三',
}


const meta: Meta = {
  title: 'PrintRenderer/Forms/DischargeAssessment',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToHtml(dischargeAssessmentSchema, data, { watermark })
    
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

// 混合喂养
export const MixedFeeding: Story = {
  name: '混合喂养',
  render: createRenderer({
    ...sampleData,
    feedingMethod: ['mixed'],
    breastCondition: ['engorged', 'less'],
  }),
}
