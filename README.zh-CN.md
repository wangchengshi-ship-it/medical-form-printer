# medical-form-printer

[![npm version](https://img.shields.io/npm/v/medical-form-printer.svg)](https://www.npmjs.com/package/medical-form-printer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/medical-form-printer.svg)](https://nodejs.org)

基于 Schema 驱动的医疗表单打印渲染库，将结构化表单数据转换为可打印的 HTML 和 PDF 文档。专为医疗健康应用设计，支持复杂布局、智能分页和跨环境一致性渲染。

[English Documentation](./README.md)

## 目录

- [特性](#特性)
- [安装](#安装)
- [快速开始](#快速开始)
- [设计理念](#设计理念)
- [区块类型](#区块类型)
- [API 参考](#api-参考)
- [CSS 隔离](#css-隔离)
- [示例](#示例)

## 特性

- 🖨️ **双环境支持** - 同时支持浏览器和 Node.js
- 📄 **丰富的区块类型** - 信息网格、数据表格、复选框网格、签名区域等
- 🎨 **主题定制** - 完全可定制的字体、颜色、间距和尺寸
- 📑 **PDF 生成** - 通过 Puppeteer 生成高保真 PDF（Node.js）
- 🔗 **PDF 合并** - 将多个文档合并为单个 PDF
- 📐 **智能分页** - 自动分页，支持表头重复和溢出处理
- 🔒 **CSS 隔离** - 内嵌字体和命名空间样式，确保一致渲染
- 🔌 **可扩展** - 注册自定义区块渲染器
- 📦 **TypeScript 优先** - 完整的类型定义和 JSDoc 文档

## 安装

```bash
npm install medical-form-printer
```

如需在 Node.js 中生成 PDF，请安装 Puppeteer：

```bash
npm install puppeteer
```

## 快速开始

### 浏览器使用

```typescript
import { renderToHtml } from 'medical-form-printer'

const schema = {
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    hospital: '示例医院',
    title: '患者评估表',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [{
          cells: [
            { label: '姓名', field: 'name' },
            { label: '年龄', field: 'age' },
            { label: '日期', field: 'date', type: 'date' },
            { label: '房间', field: 'room' },
          ]
        }]
      }
    }
  ]
}

const data = { name: '张三', age: 28, date: '2024-01-15', room: 'A-101' }
const html = renderToHtml(schema, data)
```

### Node.js 使用（PDF）

```typescript
import { renderToPdf } from 'medical-form-printer/node'
import fs from 'fs'

const pdfBuffer = await renderToPdf(schema, data)
fs.writeFileSync('form.pdf', pdfBuffer)
```

## 设计理念

### 为什么选择扁平的 Section 模型？

许多文档渲染系统使用深度嵌套的组件层级：

```
Document → Page → Container → Row → Cell → Element
```

我们刻意选择了**扁平的 section 模型**，原因如下：

#### 1. 打印文档 ≠ UI 组件

打印文档是**静态输出**。医疗表单不需要响应点击的 `<Button>`——它只需要在正确位置渲染复选框符号（☑/□）。嵌套组件树带来的是额外开销而非收益。

#### 2. 领域驱动设计

Section 直接映射到**真实的医疗表单概念**：

| Section 类型 | 真实概念 |
|-------------|---------|
| `info-grid` | 患者基本信息区块 |
| `table` | 护理记录表格 |
| `checkbox-grid` | 症状检查清单 |
| `signature-area` | 审批签名区 |

医护人员用这些术语思考，而不是抽象的"容器"和"元素"。

#### 3. 分页友好的架构

扁平的 section 使**分页计算可预测**：

```typescript
type MeasurableItemType = 
  | 'header'        // 页面头部 - 测量一次
  | 'section'       // 原子区块 - 不可拆分
  | 'table-header'  // 在续页重复显示
  | 'table-row'     // 可以单独分页
  | 'signature'     // 通常固定在最后一页
  | 'footer'        // 页面底部 - 测量一次
```

#### 4. Schema 简洁性

```typescript
// ❌ 嵌套方式（冗长）
{
  type: 'container',
  children: [{
    type: 'container',
    children: [
      { type: 'label', text: '姓名：' },
      { type: 'field', binding: 'name' }
    ]
  }]
}

// ✅ 扁平方式（简洁）
{
  type: 'info-grid',
  config: {
    rows: [{ cells: [{ label: '姓名', field: 'name' }] }]
  }
}
```

#### 5. 简单的可扩展性

```typescript
registerSectionRenderer('vital-signs-chart', (config, data) => {
  return '<div class="chart">...</div>'
})
```

无需抽象基类或访问者模式。

### 权衡取舍

这个设计专门为**打印文档生成**优化。如需深度嵌套布局或交互式组件，请考虑通用 HTML 模板库或 UI 框架。

## 区块类型

| 类型 | 描述 | 使用场景 |
|------|------|----------|
| `info-grid` | 键值对网格布局 | 患者基本信息 |
| `table` | 带列的数据表格 | 护理记录 |
| `checkbox-grid` | 复选框选项网格 | 症状检查清单 |
| `signature-area` | 签名字段 | 审批签字 |
| `notes` | 静态文本内容 | 说明文字 |
| `free-text` | 多行文本输入 | 备注 |

### 信息网格

```typescript
{
  type: 'info-grid',
  config: {
    columns: 4,
    rows: [{
      cells: [
        { label: '姓名', field: 'name' },
        { label: '年龄', field: 'age', type: 'number' },
        { label: '状态', field: 'status', type: 'checkbox', options: ['在院'] }
      ]
    }]
  }
}
```

### 表格

```typescript
{
  type: 'table',
  title: '护理记录',
  config: {
    dataField: 'records',
    columns: [
      { header: '日期', field: 'date', type: 'date', width: '20%' },
      { header: '备注', field: 'notes' }
    ]
  }
}
```

#### 多行表头

表格支持复杂的多行表头，可使用 colspan 和 rowspan 进行单元格合并：

```typescript
{
  type: 'table',
  title: '生命体征',
  config: {
    dataField: 'vitalSigns',
    columns: [
      { header: '日期', field: 'date', type: 'date' },
      { header: '收缩压', field: 'systolic', type: 'number' },
      { header: '舒张压', field: 'diastolic', type: 'number' },
      { header: '体温', field: 'temperature', type: 'number' },
    ],
    headerRows: [
      {
        cells: [
          { text: '日期', rowspan: 2 },
          { text: '血压 (mmHg)', colspan: 2 },
          { text: '体温 (℃)', rowspan: 2 },
        ]
      },
      {
        cells: [
          { text: '收缩压', field: 'systolic' },
          { text: '舒张压', field: 'diastolic' },
        ]
      }
    ]
  }
}
```

### 复选框网格

```typescript
{
  type: 'checkbox-grid',
  config: {
    field: 'symptoms',
    columns: 4,
    options: [
      { value: 'fever', label: '发热' },
      { value: 'headache', label: '头痛' }
    ]
  }
}
```

### 签名区域

```typescript
{
  type: 'signature-area',
  config: {
    fields: [
      { label: '患者签名', field: 'patientSig' },
      { label: '日期', field: 'sigDate', type: 'date' }
    ]
  }
}
```

## API 参考

### 核心渲染

| 函数 | 描述 |
|------|------|
| `renderToHtml(schema, data, options?)` | 渲染为 HTML 字符串 |
| `renderToIsolatedHtml(schema, data, options?)` | 使用 CSS 隔离渲染 |
| `renderToIsolatedFragment(schema, data, options?)` | 渲染隔离片段用于嵌入 |

### PDF 生成（Node.js）

```typescript
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'

// 单个 PDF
const pdf = await renderToPdf(schema, data, { watermark: '草稿' })

// 合并多个文档
const merged = await mergePdfs([
  { schema: schema1, data: data1 },
  { schema: schema2, data: data2 }
])
```

### 分页（策略模式）

```typescript
import { 
  createDefaultPaginationContext,
  SmartPaginationStrategy 
} from 'medical-form-printer'

// 自动选择策略
const context = createDefaultPaginationContext()
const html = context.render(schema, data, { isolated: true })

// 或使用特定策略
const strategy = new SmartPaginationStrategy()
if (strategy.shouldApply(schema)) {
  const html = strategy.render(schema, data)
}
```

### 自定义区块渲染器

```typescript
import { registerSectionRenderer, getSectionRenderer } from 'medical-form-printer'

registerSectionRenderer('custom-chart', (config, data, options) => {
  return `<div class="chart">${config.title}</div>`
})
```

### 主题定制

```typescript
import { renderToHtml, mergeTheme, defaultTheme } from 'medical-form-printer'

const theme = mergeTheme(defaultTheme, {
  colors: { primary: '#1a1a1a', border: '#333' },
  fontSize: { body: '10pt', heading: '14pt' }
})

const html = renderToHtml(schema, data, { theme })
```

### 页面尺寸与单位

```typescript
import { PAGE_A4, PAGE_A5, PAGE_16K, mmToPx, pxToMm } from 'medical-form-printer'

// PAGE_A4: { width: 210, height: 297 } (mm)
const heightPx = mmToPx(297)  // mm → 像素
```

### 格式化工具

```typescript
import { formatDate, formatBoolean, formatNumber } from 'medical-form-printer'

formatDate('2024-01-15')                    // '2024-01-15'
formatDate('2024-01-15', { format: 'YYYY年MM月DD日' })  // '2024年01月15日'
formatBoolean(true)                         // '✓'
formatNumber(1234.5, { decimals: 2 })       // '1234.50'
```

## CSS 隔离

确保跨环境一致渲染：

```typescript
import { renderToIsolatedHtml, CSS_NAMESPACE } from 'medical-form-printer'

const html = renderToIsolatedHtml(schema, data)
// CSS_NAMESPACE = 'mpr'（所有类以 mpr- 为前缀）
```

隔离模式提供：
- 命名空间 CSS 类（`mpr-` 前缀）
- 内嵌思源宋体字体
- CSS 隔离确保可预测渲染

## PrintSchema 结构

```typescript
interface PrintSchema {
  pageSize: 'A4' | 'A5' | '16K'
  orientation: 'portrait' | 'landscape'
  baseUnit?: number  // 缩放因子（默认: 1）
  header: {
    hospital: string
    department?: string
    title: string
  }
  sections: PrintSection[]
  footer?: {
    showPageNumber?: boolean
    notes?: string
  }
}
```

## 示例

参见 [examples](./examples) 目录：

- [浏览器示例](./examples/browser) - 原生 HTML/JS
- [Node.js 示例](./examples/node) - PDF 生成

## Storybook

```bash
npm run storybook
```

## 贡献

参见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

[MIT](./LICENSE)

## 链接

- [GitHub](https://github.com/wangchengshi-ship-it/medical-form-printer)
- [npm](https://www.npmjs.com/package/medical-form-printer)
- [更新日志](./CHANGELOG.md)
