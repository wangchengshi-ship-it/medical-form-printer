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
│       ├── options.ts               # 配置选项类型
│       └── theme.ts                 # 主题类型
├── test/
│   └── renderer.test.ts
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
  pageSize: 'A4' | 'A5'
  orientation: 'portrait' | 'landscape'
  header: PrintHeader
  sections: PrintSection[]
  footer?: PrintFooter
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
