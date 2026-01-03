# @medical/print-renderer

医疗表单打印渲染库 - 将结构化表单数据渲染为可打印的 HTML/PDF。

## 特性

- 🖨️ **双端运行** - 浏览器和 Node.js 环境通用
- 📄 **多种区块** - 信息网格、数据表格、勾选框、签名区域等
- 🎨 **主题定制** - 支持自定义字体、颜色、间距
- 📑 **PDF 生成** - 基于 Puppeteer 的高保真 PDF 输出
- 🔗 **PDF 合并** - 多文档合并为单个 PDF
- 🔌 **可扩展** - 支持自定义区块渲染器
- 📐 **智能分页** - 自动分页、表头重复、溢出字段处理

## 安装

```bash
npm install @medical/print-renderer

# 如果需要 PDF 生成功能
npm install puppeteer
```

## 使用

### 浏览器 / 前端

```typescript
import { renderToHtml } from '@medical/print-renderer'

const html = renderToHtml(printSchema, formData, {
  watermark: '仅供内部使用'
})

// 插入到 iframe 或 div 中预览
document.getElementById('preview').innerHTML = html
```

### Node.js / 后端

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

// 保存文件
fs.writeFileSync('output.pdf', mergedPdf)
```

## PrintSchema 结构

```typescript
const printSchema = {
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: 'Maternal Admission Assessment',
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
            ]
          }
        ]
      }
    },
    {
      type: 'table',
      title: '护理记录',
      config: {
        dataField: 'nursingRecords',
        columns: [
          { header: '日期', field: 'date', type: 'date' },
          { header: '体温', field: 'temperature', type: 'number' },
        ]
      }
    }
  ],
  footer: {
    showPageNumber: true
  }
}
```

## 区块类型

| 类型 | 说明 |
|------|------|
| `info-grid` | 信息网格，用于基本信息展示 |
| `table` | 数据表格，用于列表数据 |
| `checkbox-grid` | 勾选框网格，用于多选项 |
| `signature-area` | 签名区域 |
| `notes` | 静态备注文本 |
| `free-text` | 自由文本输入 |

## 自定义区块渲染器

```typescript
import { registerSectionRenderer } from '@medical/print-renderer'

registerSectionRenderer('custom-chart', (config, data, options) => {
  return `<div class="custom-chart">...</div>`
})
```

## 主题定制

```typescript
const html = renderToHtml(schema, data, {
  theme: {
    fonts: {
      body: '"Microsoft YaHei", sans-serif',
    },
    colors: {
      primary: '#1a1a1a',
      border: '#333333',
    },
    fontSize: {
      body: '12pt',
    }
  }
})
```

## CSS 隔离模式

为确保渲染输出在任何环境下都使用统一的字体和样式，可使用隔离模式渲染器或 CSS：

### 隔离模式渲染器（推荐）

```typescript
import { renderToIsolatedHtml, renderToIsolatedFragment } from '@medical/print-renderer'
import type { IsolatedRenderOptions } from '@medical/print-renderer'

// 渲染选项
const options: IsolatedRenderOptions = {
  watermark: '仅供内部使用',
  watermarkOpacity: 0.1,  // 透明度 0-1，超出范围会被自动 clamp
  theme: { /* 主题配置（字体配置将被忽略） */ }
}

// 生成完整的隔离 HTML 文档
const html = renderToIsolatedHtml(printSchema, formData, options)

// 生成隔离 HTML 片段（用于嵌入现有页面）
const fragment = renderToIsolatedFragment(printSchema, formData, options)
document.getElementById('preview').innerHTML = fragment
```

隔离模式渲染器的特点：
- 所有内容包裹在 `.mpr-root` 隔离容器中
- CSS 内嵌在隔离容器内的 `<style>` 标签中
- 所有类名带 `mpr-` 前缀
- 字体强制使用内嵌的思源宋体 SC（忽略传入的字体配置）

### 手动使用隔离 CSS

```typescript
import { generateIsolatedCss, ISOLATION_ROOT_CLASS } from '@medical/print-renderer'

// 生成完整的隔离 CSS
const css = generateIsolatedCss()

// 包含：
// 1. @font-face 声明（内嵌 Base64 思源宋体）
// 2. 字体强制覆盖规则
// 3. CSS 隔离容器样式（contain: layout style, isolation: isolate）
// 4. 所有组件样式（带 mpr- 前缀）
// 5. 打印媒体查询

// 使用隔离容器包装内容
const html = `
  <style>${css}</style>
  <div class="${ISOLATION_ROOT_CLASS}">
    <!-- 渲染内容 -->
  </div>
`
```

### 命名空间工具

```typescript
import { 
  CSS_NAMESPACE,           // 'mpr'
  ISOLATION_ROOT_CLASS,    // 'mpr-root'
  namespaceClass,          // 添加前缀
  namespaceClasses,        // 批量添加前缀
  getNamespacedClass,      // 从映射表获取
  CLASS_NAME_MAP,          // 类名映射表
} from '@medical/print-renderer'

// 单个类名
namespaceClass('print-page')  // 'mpr-print-page'

// 批量转换
namespaceClasses(['header', 'footer'])  // ['mpr-header', 'mpr-footer']

// 从映射表获取（优先使用预定义映射）
getNamespacedClass('signature-area')  // 'mpr-signature-area'
```

> **注意**: 隔离模式会忽略传入的字体配置，始终使用内嵌的思源宋体 SC，确保跨环境一致性。

### 水印工具

提供统一的水印渲染功能，支持自定义类名和透明度：

```typescript
import { 
  renderWatermarkHtml,
  extractWatermarkOptions,
  clamp,
  normalizeOpacity,
} from '@medical/print-renderer'
import type { WatermarkOptions } from '@medical/print-renderer'

// 渲染水印 HTML
const watermarkHtml = renderWatermarkHtml({
  text: '仅供内部使用',
  opacity: 0.1,
  className: 'custom-watermark',  // 默认 'watermark'
})
// => '<div class="custom-watermark" style="opacity: 0.1">仅供内部使用</div>'

// 从渲染选项中提取水印配置
const options = { watermark: '草稿', watermarkOpacity: 0.5 }
const watermarkOptions = extractWatermarkOptions(options, 'mpr-watermark')
// => { text: '草稿', opacity: 0.5, className: 'mpr-watermark' }

// 数值范围限制
clamp(1.5, 0, 1)  // => 1
clamp(-0.5, 0, 1) // => 0

// 透明度安全处理（超出 0-1 范围会被 clamp）
normalizeOpacity(1.5)   // => 1
normalizeOpacity(-0.5)  // => 0
normalizeOpacity(0.5)   // => 0.5
normalizeOpacity(undefined)  // => undefined
```

### 页面尺寸 CSS 常量

用于 CSS 样式生成的页面尺寸字符串常量：

```typescript
import { PAGE_SIZES } from '@medical/print-renderer'
import type { PageSizeKey } from '@medical/print-renderer'

// 预设尺寸（CSS 字符串）
// PAGE_SIZES.A4: { width: '210mm', height: '297mm' }
// PAGE_SIZES.A5: { width: '148mm', height: '210mm' }
// PAGE_SIZES['16K']: { width: '185mm', height: '260mm' }

const pageSize: PageSizeKey = 'A4'
const { width, height } = PAGE_SIZES[pageSize]
// width: '210mm', height: '297mm'
```

> **注意**: `PAGE_SIZES` 用于 CSS 样式生成，返回带单位的字符串。如需数值计算（如分页），请使用 `pagination` 模块的 `PAGE_A4`、`PAGE_16K` 等常量。

## 智能分页

支持基于内容高度的智能分页，适用于长表单和多页文档。

### 页面尺寸预设

```typescript
import { 
  PAGE_16K, PAGE_A4, PAGE_A5, 
  mmToPx, pxToMm,
  getPageDimensions 
} from '@medical/print-renderer'
import type { PageSizePreset } from '@medical/print-renderer'

// 预设尺寸
// PAGE_16K: 185mm × 260mm（医疗表单常用）
// PAGE_A4: 210mm × 297mm
// PAGE_A5: 148mm × 210mm

// 单位转换
const heightPx = mmToPx(260)  // mm → px
const heightMm = pxToMm(982)  // px → mm

// 根据名称获取预设
const pageSize: PageSizePreset = '16K'
const dimensions = getPageDimensions(pageSize)
```

### 分页配置

```typescript
import type { PaginationConfig } from '@medical/print-renderer'
import { PAGINATION_DEFAULTS } from '@medical/print-renderer'

const paginationConfig: PaginationConfig = {
  enabled: true,
  mode: 'auto',                    // 'auto' | 'manual'
  
  // 溢出配置
  overflow: {
    fields: ['notes'],             // 溢出分页字段
    firstLineChars: 60,            // 第一页最大字符数
  },
  
  // 显示配置
  display: {
    headerOnEachPage: true,        // 每页显示页眉
    footerOnEachPage: true,        // 每页显示页脚
    signatureOnEachPage: false,    // 每页显示签名区域
    repeatTableHeaders: true,      // 续页重复表头
  },
  
  // 页眉配置
  headerConfig: {
    showOnEachPage: true,
    continuationSuffix: '(continued)',    // 续页标题后缀，默认 "(continued)"
  },
  
  // 页脚配置
  footerConfig: {
    showOnEachPage: true,
    pageNumberFormat: 'Page {current} of {total}',  // 页码格式，默认英文格式
  },
}

// 使用默认配置常量
console.log(PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS) // 60
console.log(PAGINATION_DEFAULTS.DPI)                        // 96
```

> **注意**: 旧版扁平配置（如 `showHeaderOnEachPage`、`overflowFields`）仍然支持但已废弃，建议迁移到新的嵌套结构。

### 分页渲染隔离模式

分页渲染器支持隔离模式，确保多页输出在任何环境下都使用统一的字体和样式：

```typescript
import { renderPaginatedHtml } from '@medical/print-renderer'

// 启用隔离模式
const html = renderPaginatedHtml({
  schema: printSchema,
  data: formData,
  pageBreakResult: calculatePageBreaks(items, options),
  measuredItems: items,
  config: {
    isolated: true,  // 启用隔离模式
    showHeaderOnEachPage: true,
    continuationSuffix: '(continued)',  // 默认值，可自定义为中文 "(续)"
  },
})
```

隔离模式特点：
- 所有页面包裹在单个 `.mpr-root` 隔离容器中
- CSS 内嵌在隔离容器内的 `<style>` 标签中
- 所有类名带 `mpr-` 前缀（如 `mpr-print-page`、`mpr-print-header`）
- 字体强制使用内嵌的思源宋体 SC
- 多页共享同一隔离容器，确保样式一致性

### 溢出字段处理

长文本字段（如备注）可配置为溢出分页：

```typescript
import { 
  getOverflowFirstLine, 
  getOverflowRest, 
  hasOverflowContent,
  PAGINATION_DEFAULTS 
} from '@medical/print-renderer'

const notes = '这是一段很长的备注文本...'

// 第一页显示内容（默认 60 字符）
const firstLine = getOverflowFirstLine(notes)

// 自定义最大字符数
const firstLineCustom = getOverflowFirstLine(notes, 100)

// 续页显示内容
const rest = getOverflowRest(notes)

// 是否有溢出内容
if (hasOverflowContent(notes)) {
  // 需要分页处理
}

// 使用默认配置常量
console.log(PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS) // 60
```

### 分页计算

```typescript
import { 
  calculatePageBreaks, 
  calculateUsableHeight,
  MEASURABLE_ITEM_TYPES 
} from '@medical/print-renderer'
import type { MeasurableItem, MeasurableItemType } from '@medical/print-renderer'

// 可测量内容项类型
// MEASURABLE_ITEM_TYPES.HEADER       - 页眉
// MEASURABLE_ITEM_TYPES.SECTION      - 区块
// MEASURABLE_ITEM_TYPES.TABLE_HEADER - 表头
// MEASURABLE_ITEM_TYPES.TABLE_ROW    - 表格行
// MEASURABLE_ITEM_TYPES.SIGNATURE    - 签名区域
// MEASURABLE_ITEM_TYPES.FOOTER       - 页脚

// 测量后的内容项
const items: MeasurableItem[] = [
  { id: 'header-1', type: MEASURABLE_ITEM_TYPES.HEADER, height: 80 },
  { id: 'table-header-1', type: MEASURABLE_ITEM_TYPES.TABLE_HEADER, height: 40, tableId: 'nursing' },
  { id: 'row-1', type: MEASURABLE_ITEM_TYPES.TABLE_ROW, height: 30, tableId: 'nursing', dataIndex: 0 },
  // ...
]

// 计算分页
const result = calculatePageBreaks(items, {
  pageHeight: calculateUsableHeight(PAGE_16K),
  headerHeight: 60,
  footerHeight: 40,
  repeatTableHeaders: true,
})

// result.pages: 分页后的页面列表
// result.totalPages: 总页数
```

### 内容测量器（浏览器环境）

在浏览器环境中测量 DOM 元素的实际渲染高度，用于精确分页计算：

```typescript
import { 
  createContentMeasurer,
  createMeasureContainer,
  destroyMeasureContainer,
  measureElementHeight,
  estimateTextHeight,
  isBrowserEnvironment,
  DEFAULT_MEASURE_CONFIG,
  MEASURE_SELECTORS,
} from '@medical/print-renderer'
import type { 
  MeasureConfig, 
  MeasureResult,
  MeasureElementOptions,
  TextEstimateOptions,
} from '@medical/print-renderer'
```

#### Composable 风格 API

```typescript
// 创建测量器实例
const measurer = createContentMeasurer({ containerWidth: 624 })

// 测量单个元素
const height = measurer.measureElement(element)

// 批量测量表格行
const tableItems = measurer.measureTable(tableElement, { tableId: 'nursing' })

// 测量所有内容
const allItems = measurer.measureAll(contentContainer)

// 清理资源
measurer.cleanup()
```

#### 手动管理测量容器

```typescript
// 创建隐藏的测量容器
const container = createMeasureContainer({
  containerWidth: 624,
  fontSize: '10pt',
  lineHeight: 1.8,
})

// 测量元素高度
const height = measureElementHeight(element, container)

// 清理
destroyMeasureContainer(container)
```

#### 文本高度估算（无 DOM 环境）

```typescript
// 估算文本高度（用于 Node.js 环境降级）
const height = estimateTextHeight('这是一段测试文本', {
  containerWidth: 624,
  fontSize: 13.33,  // 10pt ≈ 13.33px
  lineHeight: 1.8,
  isChinese: true,
})
```

#### 环境检测

```typescript
if (isBrowserEnvironment()) {
  // 使用 DOM 测量
  const measurer = createContentMeasurer()
  // ...
} else {
  // 使用文本估算降级方案
  const height = estimateTextHeight(text)
}
```

> **注意**: 内容测量器仅在浏览器环境可用。Node.js 环境需要使用 Puppeteer 进行测量，或使用 `estimateTextHeight` 进行估算。

## License

MIT
