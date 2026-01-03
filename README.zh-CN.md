# medical-form-printer

[![npm version](https://img.shields.io/npm/v/medical-form-printer.svg)](https://www.npmjs.com/package/medical-form-printer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/medical-form-printer.svg)](https://nodejs.org)

一个基于 Schema 驱动的医疗表单打印渲染库，将结构化表单数据转换为可打印的 HTML 和 PDF 文档。专为医疗健康应用设计，支持复杂布局、智能分页和跨环境一致性渲染。

[English Documentation](./README.md)

## 特性

- 🖨️ **双环境支持** - 同时支持浏览器和 Node.js 环境
- 📄 **丰富的区块类型** - 信息网格、数据表格、复选框网格、签名区域、备注等
- 🎨 **主题定制** - 完全可定制的字体、颜色、间距和尺寸
- 📑 **PDF 生成** - 通过 Puppeteer 生成高保真 PDF（Node.js）
- 🔗 **PDF 合并** - 将多个文档合并为单个 PDF
- 📐 **智能分页** - 自动分页，支持表头重复和溢出处理
- 🔒 **CSS 隔离** - 内嵌字体和命名空间样式，确保一致渲染
- 🔌 **可扩展** - 注册自定义区块渲染器以支持特殊内容
- 📦 **TypeScript 优先** - 完整的类型定义和 JSDoc 文档

## 安装

```bash
# npm
npm install medical-form-printer

# yarn
yarn add medical-form-printer

# pnpm
pnpm add medical-form-printer

# bun
bun add medical-form-printer
```

如需在 Node.js 中生成 PDF，请安装 Puppeteer 作为对等依赖：

```bash
npm install puppeteer
```

## 快速开始

### 浏览器使用

```typescript
import { renderToHtml } from 'medical-form-printer'

const printSchema = {
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    hospital: '示例医院',
    department: '产后康复中心',
    title: '患者评估表',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '姓名', field: 'name', type: 'text' },
              { label: '年龄', field: 'age', type: 'number' },
              { label: '日期', field: 'admissionDate', type: 'date' },
              { label: '房间', field: 'roomNumber', type: 'text' },
            ]
          }
        ]
      }
    }
  ],
  footer: {
    showPageNumber: true
  }
}

const formData = {
  name: 'Jane Doe',
  age: 28,
  admissionDate: '2024-01-15',
  roomNumber: 'A-101'
}

// 渲染为 HTML
const html = renderToHtml(printSchema, formData, {
  watermark: '内部使用'
})

// 显示在 iframe 或 div 中
document.getElementById('preview').innerHTML = html
```

### Node.js 使用（PDF 生成）

```typescript
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'
import fs from 'fs'

// 生成单个 PDF
const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: '机密文件'
})
fs.writeFileSync('assessment.pdf', pdfBuffer)

// 合并多个表单为一个 PDF
const mergedPdf = await mergePdfs([
  { schema: maternalSchema, data: maternalData },
  { schema: newbornSchema, data: newbornData },
])
fs.writeFileSync('complete-record.pdf', mergedPdf)
```

## API 参考

### 核心渲染

#### `renderToHtml(schema, data, options?)`

将打印 Schema 和表单数据渲染为 HTML 字符串。

```typescript
import { renderToHtml } from 'medical-form-printer'

const html = renderToHtml(printSchema, formData, {
  theme: customTheme,
  watermark: '草稿',
  watermarkOpacity: 0.1
})
```

**参数：**
- `schema: PrintSchema` - 定义布局和区块的打印 Schema
- `data: FormData` - 要渲染的表单数据
- `options?: RenderOptions` - 可选的渲染配置

**返回：** `string` - 完整的 HTML 文档

#### `renderToIsolatedHtml(schema, data, options?)`

使用 CSS 隔离模式渲染，确保跨环境样式一致性。

```typescript
import { renderToIsolatedHtml } from 'medical-form-printer'

const html = renderToIsolatedHtml(printSchema, formData, {
  watermark: '内部使用'
})
```

所有内容都包装在隔离容器中，具有：
- 命名空间 CSS 类（以 `mpr-` 为前缀）
- 内嵌思源宋体字体
- 样式隔离，确保可预测的渲染效果

#### `renderToIsolatedFragment(schema, data, options?)`

渲染隔离的 HTML 片段，用于嵌入现有页面。

```typescript
import { renderToIsolatedFragment } from 'medical-form-printer'

const fragment = renderToIsolatedFragment(printSchema, formData)
document.getElementById('preview').innerHTML = fragment
```

### PDF 生成（Node.js）

#### `renderToPdf(schema, data, options?)`

从打印 Schema 生成 PDF 缓冲区。

```typescript
import { renderToPdf } from 'medical-form-printer/node'

const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: '机密',
  pdfOptions: {
    format: 'A4',
    printBackground: true
  }
})
```

**参数：**
- `schema: PrintSchema` - 打印 Schema
- `data: FormData` - 表单数据
- `options?: RenderOptions & { pdfOptions?: PdfOptions }` - 渲染和 PDF 选项

**返回：** `Promise<Buffer>` - PDF 文件缓冲区

#### `mergePdfs(documents, options?)`

将多个文档合并为单个 PDF。

```typescript
import { mergePdfs } from 'medical-form-printer/node'

const mergedPdf = await mergePdfs([
  { schema: schema1, data: data1 },
  { schema: schema2, data: data2 },
], {
  watermark: '完整记录'
})
```

### 自定义区块渲染器

#### `registerSectionRenderer(type, renderer)`

注册自定义区块渲染器以支持特殊内容。

```typescript
import { registerSectionRenderer } from 'medical-form-printer'

registerSectionRenderer('vital-signs-chart', (config, data, options) => {
  const values = data[config.dataField] || []
  return `
    <div class="vital-signs-chart">
      <h3>${config.title}</h3>
      <!-- 自定义图表渲染 -->
    </div>
  `
})
```

#### `getSectionRenderer(type)`

获取已注册的区块渲染器。

```typescript
import { getSectionRenderer } from 'medical-form-printer'

const renderer = getSectionRenderer('info-grid')
```

### 分页

#### `renderPaginatedHtml(config)`

使用智能分页渲染多页内容。

```typescript
import { 
  renderPaginatedHtml, 
  calculatePageBreaks,
  PAGE_A4 
} from 'medical-form-printer'

const pageBreaks = calculatePageBreaks(measuredItems, {
  pageHeight: PAGE_A4.height,
  headerHeight: 60,
  footerHeight: 40,
  repeatTableHeaders: true
})

const html = renderPaginatedHtml({
  schema: printSchema,
  data: formData,
  pageBreakResult: pageBreaks,
  measuredItems: items,
  config: {
    isolated: true,
    showHeaderOnEachPage: true,
    continuationSuffix: '（续）'
  }
})
```

#### 页面尺寸预设

```typescript
import { PAGE_A4, PAGE_A5, PAGE_16K, PAGE_PRESETS } from 'medical-form-printer'

// PAGE_A4: { width: 210, height: 297 } (mm)
// PAGE_A5: { width: 148, height: 210 } (mm)
// PAGE_16K: { width: 185, height: 260 } (mm)
```

#### 单位转换

```typescript
import { mmToPx, pxToMm, mmToPt, ptToMm } from 'medical-form-printer'

const heightPx = mmToPx(297)  // 297mm → 像素
const heightMm = pxToMm(1123) // 像素 → mm
```

### 样式

#### `generateCss(theme?)`

生成打印渲染的 CSS 样式。

```typescript
import { generateCss, defaultTheme } from 'medical-form-printer'

const css = generateCss(defaultTheme)
```

#### `generateIsolatedCss(theme?)`

生成带有内嵌字体和命名空间类的隔离 CSS。

```typescript
import { generateIsolatedCss } from 'medical-form-printer'

const css = generateIsolatedCss()
// 包含 @font-face、隔离容器和所有组件样式
```

#### 主题定制

```typescript
import { renderToHtml, mergeTheme, defaultTheme } from 'medical-form-printer'

const customTheme = mergeTheme(defaultTheme, {
  fonts: {
    body: '"Microsoft YaHei", "PingFang SC", sans-serif',
    heading: '"Microsoft YaHei", "PingFang SC", sans-serif'
  },
  colors: {
    primary: '#1a1a1a',
    border: '#333333',
    background: '#ffffff'
  },
  fontSize: {
    body: '10pt',
    heading: '14pt',
    small: '8pt'
  },
  spacing: {
    section: '12pt',
    cell: '4pt'
  }
})

const html = renderToHtml(schema, data, { theme: customTheme })
```

### 格式化工具

```typescript
import { 
  formatDate, 
  formatBoolean, 
  formatNumber, 
  formatValue,
  isChecked 
} from 'medical-form-printer'

formatDate('2024-01-15')           // '2024-01-15'
formatDate('2024-01-15', { format: 'YYYY年MM月DD日' })  // '2024年01月15日'
formatBoolean(true)                // '✓'
formatBoolean(false)               // '✗'
formatNumber(1234.5, { decimals: 2 })  // '1234.50'
isChecked('yes', ['yes', 'true'])  // true
```

### HTML 构建工具

```typescript
import { 
  HtmlBuilder, 
  h, 
  fragment, 
  when, 
  each,
  escapeHtml 
} from 'medical-form-printer'

// 流式 HTML 构建
const html = h('div', { class: 'container' },
  h('h1', {}, '标题'),
  when(showContent, () => h('p', {}, '内容')),
  each(items, (item) => h('li', {}, item.name))
)

// 安全的 HTML 转义
const safe = escapeHtml('<script>alert("xss")</script>')
```

## PrintSchema 结构

```typescript
interface PrintSchema {
  pageSize: 'A4' | 'A5' | '16K'
  orientation: 'portrait' | 'landscape'
  header: {
    hospital: string
    department?: string
    title: string
    subtitle?: string
  }
  sections: PrintSection[]
  footer?: {
    showPageNumber?: boolean
    pageNumberFormat?: string
    notes?: string
  }
}
```

## 区块类型

| 类型 | 描述 | 使用场景 |
|------|------|----------|
| `info-grid` | 键值对网格布局 | 患者基本信息、人口统计 |
| `table` | 带列的数据表格 | 护理记录、用药日志 |
| `checkbox-grid` | 复选框选项网格 | 评估清单、症状选择 |
| `signature-area` | 带标签的签名字段 | 审批、确认签字 |
| `notes` | 静态文本内容 | 说明、免责声明 |
| `free-text` | 多行文本输入 | 备注、观察记录 |

### 信息网格区块

```typescript
{
  type: 'info-grid',
  config: {
    columns: 4,
    rows: [
      {
        cells: [
          { label: '姓名', field: 'name', type: 'text' },
          { label: '年龄', field: 'age', type: 'number', span: 1 },
          { label: '日期', field: 'date', type: 'date' },
          { label: '状态', field: 'status', type: 'checkbox', options: ['在院'] }
        ]
      }
    ]
  }
}
```

### 表格区块

```typescript
{
  type: 'table',
  title: '护理记录',
  config: {
    dataField: 'nursingRecords',
    columns: [
      { header: '日期', field: 'date', type: 'date', width: '15%' },
      { header: '时间', field: 'time', type: 'text', width: '10%' },
      { header: '体温', field: 'temperature', type: 'number', width: '15%' },
      { header: '备注', field: 'notes', type: 'text' }
    ]
  }
}
```

### 复选框网格区块

```typescript
{
  type: 'checkbox-grid',
  title: '症状评估',
  config: {
    field: 'symptoms',
    columns: 4,
    options: [
      { value: 'fever', label: '发热' },
      { value: 'headache', label: '头痛' },
      { value: 'fatigue', label: '乏力' },
      { value: 'nausea', label: '恶心' }
    ]
  }
}
```

### 签名区域区块

```typescript
{
  type: 'signature-area',
  config: {
    fields: [
      { label: '患者签名', field: 'patientSignature' },
      { label: '护士签名', field: 'nurseSignature' },
      { label: '日期', field: 'signatureDate', type: 'date' }
    ]
  }
}
```

## CSS 隔离

为确保跨环境一致渲染，请使用隔离模式：

```typescript
import { 
  renderToIsolatedHtml,
  CSS_NAMESPACE,
  ISOLATION_ROOT_CLASS,
  namespaceClass,
  namespaceClasses 
} from 'medical-form-printer'

// CSS_NAMESPACE = 'mpr'
// ISOLATION_ROOT_CLASS = 'mpr-root'

// 命名空间工具
namespaceClass('header')           // 'mpr-header'
namespaceClasses(['header', 'footer'])  // ['mpr-header', 'mpr-footer']
```

隔离模式提供：
- 所有类以 `mpr-` 命名空间为前缀
- 内嵌思源宋体字体（CJK 字符子集）
- CSS 隔离（`contain: layout style`）
- 无论宿主页面样式如何，都能保持一致渲染

## 示例

请参阅 [examples](./examples) 目录获取完整的工作示例：

- [浏览器示例](./examples/browser) - 原生 HTML/JS 使用
- [Node.js 示例](./examples/node) - PDF 生成与文件输出

## Storybook

通过 Storybook 可以查看交互式组件文档：

```bash
npm run storybook
```

## 贡献

欢迎贡献！请阅读我们的[贡献指南](./CONTRIBUTING.md)了解行为准则和提交 Pull Request 的流程。

## 许可证

[MIT](./LICENSE) © 2024

## 链接

- [GitHub 仓库](https://github.com/wangchengshi-ship-it/medical-form-printer)
- [npm 包](https://www.npmjs.com/package/medical-form-printer)
- [问题追踪](https://github.com/wangchengshi-ship-it/medical-form-printer/issues)
- [更新日志](./CHANGELOG.md)
