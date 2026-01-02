import type { Meta, StoryObj } from '@storybook/html'
import { renderToHtml } from '../../src/renderer'
import {
  renderPaginatedHtml,
  calculatePageBreaks,
  PAGE_16K,
  calculateUsableHeight,
  MEASURABLE_ITEM_TYPES,
} from '../../src/pagination'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import type { MeasurableItem } from '../../src/pagination'

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

// 模拟测量内容项（实际应用中由 content-measurer 测量）
const createMeasuredItems = (recordCount: number): MeasurableItem[] => {
  const items: MeasurableItem[] = []
  
  // 页眉
  items.push({
    id: 'header',
    type: MEASURABLE_ITEM_TYPES.HEADER,
    height: 80,
  })
  
  // 基本信息区块
  items.push({
    id: 'section-0',
    type: MEASURABLE_ITEM_TYPES.SECTION,
    height: 60,
  })
  
  // 表格标题
  items.push({
    id: 'table-title',
    type: MEASURABLE_ITEM_TYPES.SECTION,
    height: 30,
  })
  
  // 表格表头
  items.push({
    id: 'table-dailyRecords-header',
    type: MEASURABLE_ITEM_TYPES.TABLE_HEADER,
    height: 35,
    tableId: 'table-dailyRecords',
  })
  
  // 表格行
  for (let i = 0; i < recordCount; i++) {
    items.push({
      id: `table-dailyRecords-row-${i}`,
      type: MEASURABLE_ITEM_TYPES.TABLE_ROW,
      height: 30,
      tableId: 'table-dailyRecords',
      dataIndex: i,
    })
  }
  
  // 签名区域
  items.push({
    id: 'section-signature',
    type: MEASURABLE_ITEM_TYPES.SIGNATURE,
    height: 50,
  })
  
  return items
}

const meta: Meta = {
  title: 'PrintRenderer/Pages/PaginatedPage',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## 分页渲染器

分页渲染器支持将长表单自动分割成多页，每页独立渲染。

### 功能特性
- 每页独立的 \`.print-page\` 元素
- 续页自动添加 "(续)" 标记
- 表格表头在续页自动重复
- 页码显示（"第 X 页 / 共 Y 页"）
- 支持自定义分页配置

### 使用方式
\`\`\`typescript
import { renderPaginatedHtml, calculatePageBreaks } from '@medical/print-renderer'

// 1. 测量内容高度（实际应用中使用 content-measurer）
const measuredItems = measureContent(contentElement)

// 2. 计算分页
const pageBreakResult = calculatePageBreaks(measuredItems, {
  pageHeight: usableHeight,
  headerHeight: 80,
  footerHeight: 50,
})

// 3. 渲染分页 HTML
const html = renderPaginatedHtml({
  schema,
  data,
  pageBreakResult,
  measuredItems,
  config: {
    showHeaderOnEachPage: true,
    continuationSuffix: '(续)',
  },
})
\`\`\`
        `,
      },
    },
  },
}

export default meta

type Story = StoryObj

// 创建传统渲染函数（使用 renderToHtml）
const createLegacyRenderer = (recordCount: number) => {
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

// 创建分页渲染函数（使用 renderPaginatedHtml）
const createPaginatedRenderer = (
  recordCount: number,
  config?: {
    showHeaderOnEachPage?: boolean
    showFooterOnEachPage?: boolean
    continuationSuffix?: string
    pageNumberFormat?: string
  }
) => {
  return () => {
    const data: FormData = {
      motherName: '张三',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(recordCount),
      nurseSignature: '李护士',
    }
    
    // 创建测量项
    const measuredItems = createMeasuredItems(recordCount)
    
    // 计算分页
    const usableHeight = calculateUsableHeight(PAGE_16K)
    const pageBreakResult = calculatePageBreaks(measuredItems, {
      pageHeight: usableHeight,
      headerHeight: 80,
      footerHeight: 50,
      repeatTableHeaders: true,
    })
    
    // 渲染分页 HTML
    const html = renderPaginatedHtml({
      schema: paginatedSchema,
      data,
      pageBreakResult,
      measuredItems,
      config,
    })
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '900px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#f5f5f5'
    iframe.srcdoc = html
    
    return iframe
  }
}

// ==================== 传统渲染（单页） ====================

// 少量数据（单页）
export const FewRecords: Story = {
  name: '少量数据（3条）- 传统渲染',
  render: createLegacyRenderer(3),
}

// 中等数据
export const MediumRecords: Story = {
  name: '中等数据（7条）- 传统渲染',
  render: createLegacyRenderer(7),
}

// ==================== 分页渲染 ====================

// 分页渲染 - 基础
export const PaginatedBasic: Story = {
  name: '分页渲染 - 基础（14条）',
  render: createPaginatedRenderer(14),
  parameters: {
    docs: {
      description: {
        story: '使用 `renderPaginatedHtml` 渲染多页表单，每页独立显示。',
      },
    },
  },
}

// 分页渲染 - 大量数据
export const PaginatedManyRecords: Story = {
  name: '分页渲染 - 大量数据（28条）',
  render: createPaginatedRenderer(28),
}

// 分页渲染 - 自定义续页标记
export const PaginatedCustomSuffix: Story = {
  name: '分页渲染 - 自定义续页标记',
  render: createPaginatedRenderer(14, {
    continuationSuffix: '（续表）',
  }),
  parameters: {
    docs: {
      description: {
        story: '自定义续页标题后缀，默认为 "(续)"。',
      },
    },
  },
}

// 分页渲染 - 自定义页码格式
export const PaginatedCustomPageNumber: Story = {
  name: '分页渲染 - 自定义页码格式',
  render: createPaginatedRenderer(14, {
    pageNumberFormat: 'Page {current} of {total}',
  }),
  parameters: {
    docs: {
      description: {
        story: '自定义页码格式，支持 `{current}` 和 `{total}` 占位符。',
      },
    },
  },
}

// 分页渲染 - 仅首页显示页眉
export const PaginatedHeaderFirstOnly: Story = {
  name: '分页渲染 - 仅首页显示页眉',
  render: createPaginatedRenderer(14, {
    showHeaderOnEachPage: false,
  }),
  parameters: {
    docs: {
      description: {
        story: '设置 `showHeaderOnEachPage: false` 后，续页不显示页眉。',
      },
    },
  },
}

// 分页渲染 - 仅末页显示页脚
export const PaginatedFooterLastOnly: Story = {
  name: '分页渲染 - 仅末页显示页脚',
  render: createPaginatedRenderer(14, {
    showFooterOnEachPage: false,
  }),
  parameters: {
    docs: {
      description: {
        story: '设置 `showFooterOnEachPage: false` 后，非末页不显示页脚备注（但仍显示页码）。',
      },
    },
  },
}

// ==================== 横向布局 ====================

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
