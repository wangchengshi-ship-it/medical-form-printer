# medical-form-printer

[![npm version](https://img.shields.io/npm/v/medical-form-printer.svg)](https://www.npmjs.com/package/medical-form-printer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/medical-form-printer.svg)](https://nodejs.org)

A schema-driven medical form print renderer that transforms structured form data into printable HTML and PDF documents. Designed for healthcare applications requiring professional document generation with support for complex layouts, smart pagination, and cross-environment consistency.

[中文文档](./README.zh-CN.md)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Design Philosophy](#design-philosophy)
- [Section Types](#section-types)
- [API Reference](#api-reference)
- [CSS Isolation](#css-isolation)
- [Examples](#examples)

## Features

- 🖨️ **Dual Environment** - Works seamlessly in both browser and Node.js
- 📄 **Rich Section Types** - Info grids, data tables, checkbox grids, signature areas, notes, and more
- 🎨 **Theme Customization** - Fully customizable fonts, colors, spacing, and sizing
- 📑 **PDF Generation** - High-fidelity PDF output via Puppeteer (Node.js)
- 🔗 **PDF Merging** - Combine multiple documents into a single PDF
- 📐 **Smart Pagination** - Automatic page breaks with header repetition and overflow handling
- 🔒 **CSS Isolation** - Embedded fonts and namespaced styles for consistent rendering
- 🔌 **Extensible** - Register custom section renderers for specialized content
- 📦 **TypeScript First** - Full type definitions with comprehensive JSDoc documentation

## Installation

```bash
npm install medical-form-printer
```

For PDF generation in Node.js, install Puppeteer as a peer dependency:

```bash
npm install puppeteer
```

## Quick Start

### Browser Usage

```typescript
import { renderToHtml } from 'medical-form-printer'

const schema = {
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    title: 'Patient Assessment Form',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [{
          cells: [
            { label: 'Name', field: 'name' },
            { label: 'Age', field: 'age' },
            { label: 'Date', field: 'date', type: 'date' },
            { label: 'Room', field: 'room' },
          ]
        }]
      }
    }
  ]
}

const data = { name: 'Jane Doe', age: 28, date: '2024-01-15', room: 'A-101' }
const html = renderToHtml(schema, data)
```

### Node.js Usage (PDF)

```typescript
import { renderToPdf } from 'medical-form-printer/node'
import fs from 'fs'

const pdfBuffer = await renderToPdf(schema, data)
fs.writeFileSync('form.pdf', pdfBuffer)
```

## Design Philosophy

### Why Flat Sections Instead of Nested Components?

Many document rendering systems use deeply nested component hierarchies:

```
Document → Page → Container → Row → Cell → Element
```

We deliberately chose a **flat section-based model**. Here's why:

#### 1. Print Documents ≠ UI Components

Print documents are **static output**. A medical form doesn't need a `<Button>` that responds to clicks—it needs a checkbox symbol (☑/□) at the right position. Nested component trees add overhead without benefit.

#### 2. Domain-Driven Design

Sections map directly to **real-world medical form concepts**:

| Section Type | Real-World Concept |
|--------------|-------------------|
| `info-grid` | Patient demographics block |
| `table` | Nursing records log |
| `checkbox-grid` | Symptom checklist |
| `signature-area` | Approval signatures |

Medical staff think in these terms, not abstract "containers" and "elements".

#### 3. Pagination-Friendly Architecture

Flat sections enable **predictable pagination**:

```typescript
type MeasurableItemType = 
  | 'header'        // Page header - measured once
  | 'section'       // Atomic block - never split
  | 'table-header'  // Repeats on continuation pages
  | 'table-row'     // Can be paginated individually
  | 'signature'     // Usually pinned to last page
  | 'footer'        // Page footer - measured once
```

#### 4. Schema Simplicity

```typescript
// ❌ Nested approach (verbose)
{
  type: 'container',
  children: [{
    type: 'container',
    children: [
      { type: 'label', text: 'Name:' },
      { type: 'field', binding: 'name' }
    ]
  }]
}

// ✅ Flat approach (concise)
{
  type: 'info-grid',
  config: {
    rows: [{ cells: [{ label: 'Name', field: 'name' }] }]
  }
}
```

#### 5. Simple Extensibility

```typescript
registerSectionRenderer('vital-signs-chart', (config, data) => {
  return '<div class="chart">...</div>'
})
```

No abstract base classes or visitor patterns needed.

### Trade-offs

This design optimizes for **print document generation**. For deeply nested layouts or interactive components, consider general-purpose HTML templating or UI frameworks.

## Section Types

| Type | Description | Use Case |
|------|-------------|----------|
| `info-grid` | Grid layout for key-value pairs | Patient demographics |
| `table` | Data table with columns | Nursing records |
| `checkbox-grid` | Grid of checkbox options | Symptom checklists |
| `signature-area` | Signature fields | Approvals |
| `notes` | Static text content | Instructions |
| `free-text` | Multi-line text input | Comments |

### Info Grid

```typescript
{
  type: 'info-grid',
  config: {
    columns: 4,
    rows: [{
      cells: [
        { label: 'Name', field: 'name' },
        { label: 'Age', field: 'age', type: 'number' },
        { label: 'Status', field: 'status', type: 'checkbox', options: ['Active'] }
      ]
    }]
  }
}
```

### Table

```typescript
{
  type: 'table',
  title: 'Nursing Records',
  config: {
    dataField: 'records',
    columns: [
      { header: 'Date', field: 'date', type: 'date', width: '20%' },
      { header: 'Notes', field: 'notes' }
    ]
  }
}
```

### Checkbox Grid

```typescript
{
  type: 'checkbox-grid',
  config: {
    field: 'symptoms',
    columns: 4,
    options: [
      { value: 'fever', label: 'Fever' },
      { value: 'headache', label: 'Headache' }
    ]
  }
}
```

### Signature Area

```typescript
{
  type: 'signature-area',
  config: {
    fields: [
      { label: 'Patient', field: 'patientSig' },
      { label: 'Date', field: 'sigDate', type: 'date' }
    ]
  }
}
```

## API Reference

### Core Rendering

| Function | Description |
|----------|-------------|
| `renderToHtml(schema, data, options?)` | Render to HTML string |
| `renderToIsolatedHtml(schema, data, options?)` | Render with CSS isolation |
| `renderToIsolatedFragment(schema, data, options?)` | Render isolated fragment for embedding |

### PDF Generation (Node.js)

```typescript
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'

// Single PDF
const pdf = await renderToPdf(schema, data, { watermark: 'Draft' })

// Merge multiple documents
const merged = await mergePdfs([
  { schema: schema1, data: data1 },
  { schema: schema2, data: data2 }
])
```

### Pagination (Strategy Pattern)

```typescript
import { 
  createDefaultPaginationContext,
  SmartPaginationStrategy 
} from 'medical-form-printer'

// Automatic strategy selection
const context = createDefaultPaginationContext()
const html = context.render(schema, data, { isolated: true })

// Or use specific strategy
const strategy = new SmartPaginationStrategy()
if (strategy.shouldApply(schema)) {
  const html = strategy.render(schema, data)
}
```

### Custom Section Renderers

```typescript
import { registerSectionRenderer, getSectionRenderer } from 'medical-form-printer'

registerSectionRenderer('custom-chart', (config, data, options) => {
  return `<div class="chart">${config.title}</div>`
})
```

### Theme Customization

```typescript
import { renderToHtml, mergeTheme, defaultTheme } from 'medical-form-printer'

const theme = mergeTheme(defaultTheme, {
  colors: { primary: '#1a1a1a', border: '#333' },
  fontSize: { body: '10pt', heading: '14pt' }
})

const html = renderToHtml(schema, data, { theme })
```

### Page Sizes & Units

```typescript
import { PAGE_A4, PAGE_A5, PAGE_16K, mmToPx, pxToMm } from 'medical-form-printer'

// PAGE_A4: { width: 210, height: 297 } (mm)
const heightPx = mmToPx(297)  // mm → pixels
```

### Formatters

```typescript
import { formatDate, formatBoolean, formatNumber } from 'medical-form-printer'

formatDate('2024-01-15')                    // '2024-01-15'
formatDate('2024-01-15', { format: 'YYYY年MM月DD日' })  // '2024年01月15日'
formatBoolean(true)                         // '✓'
formatNumber(1234.5, { decimals: 2 })       // '1234.50'
```

## CSS Isolation

For consistent cross-environment rendering:

```typescript
import { renderToIsolatedHtml, CSS_NAMESPACE } from 'medical-form-printer'

const html = renderToIsolatedHtml(schema, data)
// CSS_NAMESPACE = 'mpr' (all classes prefixed with mpr-)
```

Isolation mode provides:
- Namespaced CSS classes (`mpr-` prefix)
- Embedded Source Han Serif SC font
- CSS containment for predictable rendering

## PrintSchema Structure

```typescript
interface PrintSchema {
  pageSize: 'A4' | 'A5' | '16K'
  orientation: 'portrait' | 'landscape'
  baseUnit?: number  // Scaling factor (default: 1)
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

## Examples

See the [examples](./examples) directory:

- [Browser Example](./examples/browser) - Vanilla HTML/JS
- [Node.js Example](./examples/node) - PDF generation

## Storybook

```bash
npm run storybook
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

[MIT](./LICENSE)

## Links

- [GitHub](https://github.com/wangchengshi-ship-it/medical-form-printer)
- [npm](https://www.npmjs.com/package/medical-form-printer)
- [Changelog](./CHANGELOG.md)
