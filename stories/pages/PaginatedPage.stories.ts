import type { Meta, StoryObj } from '@storybook/html'
import { renderToIsolatedHtml } from '../../src/renderer'
import {
  renderPaginatedHtml,
  MEASURABLE_ITEM_TYPES,
} from '../../src/pagination'
import type { PrintSchema, FormData } from '../../src/types/print-schema'
import type { MeasurableItem, PageBreakResult } from '../../src/pagination'

// 多行数据表单（模拟分页场景）
const paginatedSchema: PrintSchema = {
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
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
      temperature: (36.5 + (Math.random() * 0.5 - 0.25)).toFixed(1),
      umbilicalCare: true,
      bath: i % 2 === 0,
      swimming: i % 3 === 0,
      massage: true,
      notes: i === 0 ? '状态良好' : (i === 6 ? '脐带脱落' : ''),
    })
  }
  
  return records
}

// 创建基于 section 的测量项（用于分页渲染）
const createSectionBasedItems = (schema: PrintSchema): MeasurableItem[] => {
  const items: MeasurableItem[] = []
  
  schema.sections.forEach((_, index) => {
    items.push({
      id: `section-${index}`,
      type: MEASURABLE_ITEM_TYPES.SECTION,
      height: 100, // 估算高度
    })
  })
  
  return items
}

// 创建单页分页结果
const createSinglePageResult = (schema: PrintSchema): PageBreakResult => {
  const items = createSectionBasedItems(schema)
  return {
    pages: [
      {
        pageNumber: 1,
        isContinuation: false,
        items: items.map(item => item.id),
        repeatedHeaders: [],
      },
    ],
    totalPages: 1,
  }
}

// 创建多页分页结果（模拟）
const createMultiPageResult = (totalPages: number): PageBreakResult => {
  const pages: PageBreakResult['pages'] = []
  for (let i = 0; i < totalPages; i++) {
    pages.push({
      pageNumber: i + 1,
      isContinuation: i > 0,
      items: [`section-0`, `section-1`], // 每页都渲染所有 sections
      repeatedHeaders: [],
    })
  }
  return {
    pages,
    totalPages,
  }
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
import { renderPaginatedHtml } from '@medical/print-renderer'

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

// 创建传统渲染函数（使用隔离模式，强制使用内嵌思源宋体）
const createLegacyRenderer = (recordCount: number) => {
  return () => {
    const data: FormData = {
      motherName: 'Mary Johnson',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(recordCount),
      nurseSignature: 'Nurse Li',
    }
    
    const html = renderToIsolatedHtml(paginatedSchema, data)
    
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
  totalPages: number = 1,
  config?: {
    showHeaderOnEachPage?: boolean
    showFooterOnEachPage?: boolean
    showSignatureOnEachPage?: boolean
    continuationSuffix?: string
    pageNumberFormat?: string
  }
) => {
  return () => {
    const data: FormData = {
      motherName: 'Mary Johnson',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(recordCount),
      nurseSignature: 'Nurse Li',
    }
    
    // 创建测量项
    const measuredItems = createSectionBasedItems(paginatedSchema)
    
    // 创建分页结果
    const pageBreakResult = totalPages > 1 
      ? createMultiPageResult(totalPages)
      : createSinglePageResult(paginatedSchema)
    
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
    iframe.style.height = totalPages > 1 ? `${totalPages * 450}px` : '800px'
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

// 大量数据
export const ManyRecords: Story = {
  name: '大量数据（14条）- 传统渲染',
  render: createLegacyRenderer(14),
}

// ==================== 分页渲染 ====================

// 分页渲染 - 单页
export const PaginatedSinglePage: Story = {
  name: '分页渲染 - 单页',
  render: createPaginatedRenderer(7, 1),
  parameters: {
    docs: {
      description: {
        story: '使用 `renderPaginatedHtml` 渲染单页表单。',
      },
    },
  },
}

// 分页渲染 - 两页
export const PaginatedTwoPages: Story = {
  name: '分页渲染 - 两页',
  render: createPaginatedRenderer(14, 2),
  parameters: {
    docs: {
      description: {
        story: '使用 `renderPaginatedHtml` 渲染两页表单，第二页显示 "(续)" 标记。',
      },
    },
  },
}

// 分页渲染 - 三页
export const PaginatedThreePages: Story = {
  name: '分页渲染 - 三页',
  render: createPaginatedRenderer(21, 3),
  parameters: {
    docs: {
      description: {
        story: '使用 `renderPaginatedHtml` 渲染三页表单。',
      },
    },
  },
}

// 分页渲染 - 自定义续页标记
export const PaginatedCustomSuffix: Story = {
  name: '分页渲染 - 自定义续页标记',
  render: createPaginatedRenderer(14, 2, {
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
  render: createPaginatedRenderer(14, 2, {
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
  render: createPaginatedRenderer(14, 2, {
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

// 分页渲染 - 每页显示签名
export const PaginatedSignatureOnEachPage: Story = {
  name: '分页渲染 - 每页显示签名',
  render: createPaginatedRenderer(14, 2, {
    showSignatureOnEachPage: true,
  }),
  parameters: {
    docs: {
      description: {
        story: '设置 `showSignatureOnEachPage: true` 后，每页底部都显示签名区域。',
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
      motherName: 'Mary Johnson',
      roomNumber: '301',
      gender: '男',
      birthDate: '2024-01-10',
      dailyRecords: generateDailyRecords(14),
      nurseSignature: 'Nurse Li',
    }
    
    const html = renderToIsolatedHtml(schema, data)
    
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '600px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.background = '#fff'
    iframe.srcdoc = html
    
    return iframe
  },
}
