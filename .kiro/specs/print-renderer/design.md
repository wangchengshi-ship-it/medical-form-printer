# Design Document

## Overview

医疗表单打印渲染库（`@medical/print-renderer`）是一个与框架无关的 TypeScript 库，用于将结构化表单数据渲染为可打印的 HTML/PDF。

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    @medical/print-renderer                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      Public API                              ││
│  │  renderToHtml(schema, data, options) → string                ││
│  │  renderToPdf(schema, data, options) → Buffer                 ││
│  │  mergePdfs(buffers, options) → Buffer                        ││
│  │  calculatePageBreaks(items, pageHeight) → PageBreakResult    ││
│  │  usePrintPagination(dimensions) → PaginationUtils            ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    HTML Renderer                             ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │   Header    │  │  Sections   │  │   Footer    │          ││
│  │  │  Renderer   │  │  Renderer   │  │  Renderer   │          ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  Section Renderers (Plugin)                  ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        ││
│  │  │info-grid │ │  table   │ │ checkbox │ │signature │        ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  Pagination Engine                           ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │  Page Size  │  │  Page Break │  │  Paginated  │          ││
│  │  │  Calculator │  │  Calculator │  │  Renderer   │          ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Formatters  │  │    Styles    │  │    Theme     │           │
│  │  (date/bool) │  │  (CSS)       │  │  (config)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  PDF Generator (Node.js only)                ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │  Puppeteer  │  │  PDF Merge  │  │  Watermark  │          ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Content Measurer (Browser only)                 ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          ││
│  │  │  Hidden     │  │  Element    │  │  Text       │          ││
│  │  │  Container  │  │  Measurer   │  │  Estimator  │          ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 项目结构

```
medical-print-renderer/
├── src/
│   ├── index.ts                     # 主入口（浏览器 + Node.js）
│   ├── node.ts                      # Node.js 入口（含 PDF 生成）
│   ├── renderer/
│   │   ├── index.ts                 # 渲染器入口
│   │   ├── html-renderer.ts         # HTML 渲染核心
│   │   └── section-renderers/       # 区块渲染器
│   │       ├── index.ts
│   │       ├── info-grid.ts
│   │       ├── table.ts
│   │       ├── checkbox-grid.ts
│   │       ├── signature-area.ts
│   │       ├── notes.ts
│   │       └── free-text.ts
│   ├── pagination/
│   │   ├── index.ts                 # 分页模块入口
│   │   ├── page-dimensions.ts       # 页面尺寸配置（16K、A4、A5）
│   │   ├── page-break-calculator.ts # 分页点计算算法
│   │   ├── paginated-renderer.ts    # 分页渲染器
│   │   └── content-measurer.ts      # 内容测量器（浏览器环境）
│   ├── pdf/
│   │   ├── index.ts                 # PDF 生成入口
│   │   ├── pdf-generator.ts         # Puppeteer PDF 生成
│   │   └── pdf-merger.ts            # PDF 合并
│   ├── styles/
│   │   ├── index.ts                 # 样式入口
│   │   ├── default-theme.ts         # 默认主题
│   │   └── css-generator.ts         # CSS 生成器
│   ├── formatters/
│   │   └── index.ts                 # 数据格式化器
│   └── types/
│       ├── index.ts                 # 类型导出
│       ├── print-schema.ts          # PrintSchema 类型
│       ├── pagination.ts            # 分页相关类型
│       ├── options.ts               # 配置选项类型
│       └── theme.ts                 # 主题类型
├── test/
│   ├── renderer.test.ts
│   ├── formatters.test.ts
│   ├── section-renderers.test.ts
│   ├── styles.test.ts
│   ├── properties.test.ts
│   └── pagination.test.ts           # 分页算法测试
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
└── README.md
```

### 核心类型定义

```typescript
// PrintSchema - 打印布局配置
interface PrintSchema {
  pageSize: 'A4' | 'A5' | '16K'
  orientation: 'portrait' | 'landscape'
  header: PrintHeader
  sections: PrintSection[]
  footer?: PrintFooter
  pagination?: PaginationConfig  // 分页配置
}

// 区块类型
type SectionType = 
  | 'info-grid'      // 信息网格
  | 'table'          // 数据表格
  | 'checkbox-grid'  // 勾选框网格
  | 'signature-area' // 签名区域
  | 'notes'          // 备注
  | 'free-text'      // 自由文本

// 渲染选项
interface RenderOptions {
  theme?: Partial<Theme>
  locale?: string
  emptyPlaceholder?: string
  formatters?: Record<string, (value: unknown) => string>
  watermark?: string
}

// 分页配置
interface PaginationConfig {
  enabled: boolean           // 是否启用智能分页
  repeatTableHeaders: boolean // 续页是否重复表头
}
```

### 分页相关类型

```typescript
// 页面尺寸配置
interface PageDimensions {
  width: number       // 页面宽度 (mm)
  height: number      // 页面高度 (mm)
  marginTop: number   // 上边距 (mm)
  marginBottom: number // 下边距 (mm)
  marginLeft: number  // 左边距 (mm)
  marginRight: number // 右边距 (mm)
}

// 十六开纸张默认配置
const PAGE_16K: PageDimensions = {
  width: 185,
  height: 260,
  marginTop: 8,
  marginBottom: 8,
  marginLeft: 10,
  marginRight: 10,
}

// 可测量的内容项类型
type MeasurableItemType =
  | 'header'
  | 'section'
  | 'table-header'
  | 'table-row'
  | 'signature'
  | 'footer'

// 可测量的内容项
interface MeasurableItem {
  id: string                  // 唯一标识
  type: MeasurableItemType    // 内容类型
  height: number              // 测量得到的高度 (px)
  tableId?: string            // 所属表格ID（仅 table-header 和 table-row）
  dataIndex?: number          // 原始数据索引
}

// 单页内容
interface PageContent {
  pageNumber: number          // 页码（从1开始）
  isContinuation: boolean     // 是否为续页
  items: string[]             // 页面包含的内容项ID列表
  repeatedHeaders: string[]   // 需要重复的表头ID列表
}

// 分页结果
interface PageBreakResult {
  pages: PageContent[]        // 页面列表
  totalPages: number          // 总页数
}
```

### 使用方式

**前端（Vue）：**
```typescript
import { renderToHtml } from '@medical/print-renderer'

const html = renderToHtml(printSchema, formData, {
  theme: 'default',
  locale: 'zh-CN'
})
```

**前端分页渲染（Vue）：**
```typescript
import { 
  usePrintPagination, 
  calculatePageBreaks,
  PAGE_16K 
} from '@medical/print-renderer'

// 1. 测量内容高度（需要 DOM 环境）
const measuredItems = measureContent(contentElement)

// 2. 计算分页
const { usableHeight } = usePrintPagination(PAGE_16K)
const pageBreaks = calculatePageBreaks(measuredItems, usableHeight)

// 3. 根据分页结果渲染多页
pageBreaks.pages.forEach(page => {
  // 渲染每一页，包含重复的表头
})
```

**后端（NestJS）：**
```typescript
import { renderToPdf, mergePdfs } from '@medical/print-renderer/node'

// 生成单个 PDF
const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: '仅供内部使用'
})

// 合并多个表单
const mergedPdf = await mergePdfs([
  { schema: maternalSchema, data: maternalData },
  { schema: newbornSchema, data: newbornData },
])
```

## Data Models

### PrintSchema 完整结构

```typescript
interface PrintSchema {
  pageSize: PageSize
  orientation: PageOrientation
  header: PrintHeader
  sections: PrintSection[]
  footer?: PrintFooter
}

interface PrintHeader {
  hospital: string
  department?: string
  title: string
  showLogo?: boolean
  logoUrl?: string
}

interface PrintSection {
  type: SectionType
  title?: string
  config: SectionConfig
}

interface PrintFooter {
  showPageNumber?: boolean
  notes?: string
}
```

### Theme 主题配置

```typescript
interface Theme {
  fonts: {
    body: string      // 正文字体
    heading: string   // 标题字体
    mono: string      // 等宽字体
  }
  colors: {
    primary: string
    border: string
    background: string
    labelBackground: string
    text: string
    textSecondary: string
  }
  spacing: {
    pageMargin: string
    sectionGap: string
    cellPadding: string
  }
  fontSize: {
    hospitalName: string
    formTitle: string
    sectionTitle: string
    body: string
    small: string
  }
  borderWidth: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: HTML 输出完整性

*For any* valid PrintSchema and FormData, renderToHtml SHALL produce a complete HTML document with DOCTYPE, html, head, and body tags.

**Validates: Requirements 1.1, 1.5**

### Property 2: 纯函数特性

*For any* identical inputs (schema, data, options), renderToHtml SHALL always produce identical output.

**Validates: Requirements 1.2**

### Property 3: XSS 防护

*For any* FormData containing HTML special characters, the rendered output SHALL escape all special characters to prevent XSS attacks.

**Validates: Requirements 1.1**

### Property 4: 区块渲染完整性

*For any* PrintSchema with N sections, the rendered HTML SHALL contain exactly N section elements in the same order.

**Validates: Requirements 2.1-2.6**

### Property 5: 布尔值格式化

*For any* boolean field value, the formatter SHALL output exactly "☑" for true and "☐" for false.

**Validates: Requirements 5.2**

### Property 6: PDF 生成一致性

*For any* valid PrintSchema and FormData, renderToPdf SHALL produce a valid PDF buffer that can be opened by PDF readers.

**Validates: Requirements 6.1**

### Property 7: PDF 合并顺序

*For any* array of N documents, mergePdfs SHALL produce a PDF with pages in the exact order of the input array.

**Validates: Requirements 7.2**

### Property 8: 分页内容完整性

*For any* list of MeasurableItems, calculatePageBreaks SHALL assign every item to exactly one page, with no items lost or duplicated.

**Validates: Requirements 9.1, 9.7**

### Property 9: 表格行不分割

*For any* table with multiple rows, calculatePageBreaks SHALL never split a single table row across two pages.

**Validates: Requirements 9.2**

### Property 10: 续页表头重复

*For any* table that spans multiple pages, the table header SHALL be repeated at the beginning of each continuation page.

**Validates: Requirements 9.3, 9.6**

### Property 11: 页面高度约束

*For any* page in PageBreakResult, the total height of items (including repeated headers) SHALL not exceed the available page height.

**Validates: Requirements 9.1, 9.6**

### Property 12: 单位转换可逆性

*For any* measurement value, mmToPx(pxToMm(value)) SHALL equal the original value (within floating point precision).

**Validates: Requirements 10.1**

## Error Handling

| 场景 | 处理方式 |
|------|---------|
| 未知区块类型 | 输出 HTML 注释，不中断渲染 |
| 空数据字段 | 使用 emptyPlaceholder 或空字符串 |
| 无效日期值 | 返回原始字符串 |
| Puppeteer 未安装 | 抛出明确错误信息 |
| PDF 合并空数组 | 抛出错误 |

## Testing Strategy

### 单元测试

- 每个区块渲染器独立测试
- 格式化器测试（日期、布尔、数字）
- 主题合并测试
- CSS 生成测试

### 属性测试

使用 fast-check 进行属性测试：
- HTML 输出完整性
- XSS 防护
- 布尔值格式化

### 集成测试

- 完整 PrintSchema 渲染
- PDF 生成（需要 Puppeteer）
- PDF 合并

## 技术选型

| 功能 | 技术方案 |
|------|---------|
| 构建工具 | tsup (esbuild) |
| 测试框架 | Vitest |
| PDF 生成 | Puppeteer (Node.js) |
| PDF 合并 | pdf-lib |
| 类型检查 | TypeScript 5.x |
| 包管理 | pnpm |
