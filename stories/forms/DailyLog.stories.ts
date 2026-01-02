import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../../src/renderer'
import type { PrintSchema, FormData } from '../../src/types/print-schema'

// 每日记录表 Schema
const dailyLogSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '天津中医药大学第二附属医院',
    department: '国际产后康复中心',
    title: '产妇每日护理记录单',
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
              { label: '姓名', field: 'name', type: 'text' },
              { label: '住院号', field: 'hospitalNumber', type: 'text' },
            ],
          },
          {
            cells: [
              { label: '产后天数', field: 'postpartumDays', type: 'number' },
              { label: '分娩方式', field: 'deliveryMethod', type: 'text' },
              { label: '记录日期', field: 'recordDate', type: 'date' },
              { label: '', field: '', type: 'text' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: '生命体征记录',
      config: {
        columns: [
          { field: 'time', header: '时间', width: '80px' },
          { field: 'temperature', header: '体温(℃)', width: '80px' },
          { field: 'pulse', header: '脉搏(次/分)', width: '90px' },
          { field: 'respiration', header: '呼吸(次/分)', width: '90px' },
          { field: 'bloodPressure', header: '血压(mmHg)', width: '100px' },
          { field: 'nurse', header: '护士签名', width: '80px' },
        ],
        dataField: 'vitalSigns',
      },
    },
    {
      type: 'checkbox-grid',
      title: '恶露情况',
      config: {
        field: 'lochia',
        columns: 4,
        options: [
          { value: 'red', label: '血性' },
          { value: 'serous', label: '浆液性' },
          { value: 'white', label: '白色' },
          { value: 'normal', label: '量正常' },
          { value: 'less', label: '量少' },
          { value: 'more', label: '量多' },
          { value: 'odor', label: '有异味' },
          { value: 'noOdor', label: '无异味' },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '乳房情况',
      config: {
        field: 'breast',
        columns: 4,
        options: [
          { value: 'soft', label: '柔软' },
          { value: 'engorged', label: '胀满' },
          { value: 'hard', label: '硬结' },
          { value: 'cracked', label: '皲裂' },
          { value: 'normal', label: '乳汁正常' },
          { value: 'less', label: '乳汁少' },
          { value: 'more', label: '乳汁多' },
          { value: 'blocked', label: '乳腺不通' },
        ],
      },
    },
    {
      type: 'checkbox-grid',
      title: '切口/伤口情况',
      config: {
        field: 'wound',
        columns: 4,
        options: [
          { value: 'healing', label: '愈合良好' },
          { value: 'redness', label: '红肿' },
          { value: 'discharge', label: '渗出' },
          { value: 'pain', label: '疼痛' },
          { value: 'infection', label: '感染' },
          { value: 'other', label: '其他', hasInput: true, inputField: 'woundOther' },
        ],
      },
    },
    {
      type: 'notes',
      config: {
        content: '护理措施及效果：',
        showBorder: false,
      },
    },
    {
      type: 'free-text',
      config: {
        field: 'nursingMeasures',
        minHeight: '80px',
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
  name: '张三',
  hospitalNumber: '2024010001',
  postpartumDays: 5,
  deliveryMethod: '剖宫产',
  recordDate: '2024-01-15',
  vitalSigns: [
    {
      time: '08:00',
      temperature: 36.5,
      pulse: 72,
      respiration: 18,
      bloodPressure: '120/80',
      nurse: '李护士',
    },
    {
      time: '14:00',
      temperature: 36.6,
      pulse: 74,
      respiration: 18,
      bloodPressure: '118/78',
      nurse: '王护士',
    },
    {
      time: '20:00',
      temperature: 36.7,
      pulse: 70,
      respiration: 17,
      bloodPressure: '122/82',
      nurse: '赵护士',
    },
  ],
  lochia: ['serous', 'normal', 'noOdor'],
  breast: ['soft', 'normal'],
  wound: ['healing'],
  nursingMeasures: '1. 指导产妇正确哺乳姿势\n2. 协助产妇翻身活动\n3. 切口换药，愈合良好\n4. 心理疏导，产妇情绪稳定',
  nurseSignature: '李护士',
  headNurseSignature: '王护士长',
}

const meta: Meta = {
  title: 'PrintRenderer/Forms/DailyLog',
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

// 创建渲染函数
const createRenderer = (data: FormData, watermark?: string) => {
  return () => {
    const html = renderToHtml(dailyLogSchema, data, { watermark })
    
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

// 产后第一天
export const PostpartumDay1: Story = {
  name: '产后第一天',
  render: createRenderer({
    ...sampleData,
    postpartumDays: 1,
    lochia: ['red', 'more', 'noOdor'],
    breast: ['engorged', 'less'],
    wound: ['healing', 'pain'],
    nursingMeasures: '1. 术后第一天，密切观察生命体征\n2. 指导早期下床活动\n3. 切口疼痛，给予镇痛处理\n4. 乳房胀满，指导按摩通乳',
  }),
}

// 有异常情况
export const WithAbnormal: Story = {
  name: '有异常情况',
  render: createRenderer({
    ...sampleData,
    lochia: ['red', 'more', 'odor'],
    breast: ['hard', 'blocked'],
    wound: ['redness', 'discharge'],
    woundOther: '需加强换药',
    nursingMeasures: '1. 恶露量多有异味，已通知医生\n2. 乳房硬结，进行热敷按摩\n3. 切口红肿渗出，加强换药\n4. 密切观察体温变化',
  }),
}
