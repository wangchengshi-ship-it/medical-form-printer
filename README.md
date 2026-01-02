# @medical/print-renderer

医疗表单打印渲染库 - 将结构化表单数据渲染为可打印的 HTML/PDF。

## 特性

- 🖨️ **双端运行** - 浏览器和 Node.js 环境通用
- 📄 **多种区块** - 信息网格、数据表格、勾选框、签名区域等
- 🎨 **主题定制** - 支持自定义字体、颜色、间距
- 📑 **PDF 生成** - 基于 Puppeteer 的高保真 PDF 输出
- 🔗 **PDF 合并** - 多文档合并为单个 PDF
- 🔌 **可扩展** - 支持自定义区块渲染器

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

## License

MIT
