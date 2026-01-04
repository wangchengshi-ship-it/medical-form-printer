# medical-form-printer

[![npm version](https://img.shields.io/npm/v/medical-form-printer.svg)](https://www.npmjs.com/package/medical-form-printer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/medical-form-printer.svg)](https://nodejs.org)

A schema-driven medical form print renderer that transforms structured form data into printable HTML and PDF documents. Designed for healthcare applications requiring professional document generation with support for complex layouts, smart pagination, and cross-environment consistency.

[中文文档](./README.zh-CN.md)

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
# npm
npm install medical-form-printer

# yarn
yarn add medical-form-printer

# pnpm
pnpm add medical-form-printer

# bun
bun add medical-form-printer
```

For PDF generation in Node.js, install Puppeteer as a peer dependency:

```bash
npm install puppeteer
```

## Quick Start

### Browser Usage

```typescript
import { renderToHtml } from 'medical-form-printer'

const printSchema = {
  pageSize: 'A4',
  orientation: 'portrait',
  header: {
    hospital: 'Sample Hospital',
    department: 'Postpartum Care Center',
    title: 'Patient Assessment Form',
  },
  sections: [
    {
      type: 'info-grid',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: 'Name', field: 'name', type: 'text' },
              { label: 'Age', field: 'age', type: 'number' },
              { label: 'Date', field: 'admissionDate', type: 'date' },
              { label: 'Room', field: 'roomNumber', type: 'text' },
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

// Render to HTML
const html = renderToHtml(printSchema, formData, {
  watermark: 'Internal Use Only'
})

// Display in iframe or div
document.getElementById('preview').innerHTML = html
```

### Node.js Usage (PDF Generation)

```typescript
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'
import fs from 'fs'

// Generate single PDF
const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: 'Confidential'
})
fs.writeFileSync('assessment.pdf', pdfBuffer)

// Merge multiple forms into one PDF
const mergedPdf = await mergePdfs([
  { schema: maternalSchema, data: maternalData },
  { schema: newbornSchema, data: newbornData },
])
fs.writeFileSync('complete-record.pdf', mergedPdf)
```

## API Reference

### Core Rendering

#### `renderToHtml(schema, data, options?)`

Renders a print schema with form data to an HTML string.

```typescript
import { renderToHtml } from 'medical-form-printer'

const html = renderToHtml(printSchema, formData, {
  theme: customTheme,
  watermark: 'Draft',
  watermarkOpacity: 0.1
})
```

**Parameters:**
- `schema: PrintSchema` - The print schema defining layout and sections
- `data: FormData` - The form data to render
- `options?: RenderOptions` - Optional rendering configuration

**Returns:** `string` - Complete HTML document

#### `renderToIsolatedHtml(schema, data, options?)`

Renders with CSS isolation for consistent cross-environment styling.

```typescript
import { renderToIsolatedHtml } from 'medical-form-printer'

const html = renderToIsolatedHtml(printSchema, formData, {
  watermark: 'Internal Use Only'
})
```

All content is wrapped in an isolation container with:
- Namespaced CSS classes (prefixed with `mpr-`)
- Embedded Source Han Serif SC font
- Style containment for predictable rendering

#### `renderToIsolatedFragment(schema, data, options?)`

Renders an isolated HTML fragment for embedding in existing pages.

```typescript
import { renderToIsolatedFragment } from 'medical-form-printer'

const fragment = renderToIsolatedFragment(printSchema, formData)
document.getElementById('preview').innerHTML = fragment
```

### PDF Generation (Node.js)

#### `renderToPdf(schema, data, options?)`

Generates a PDF buffer from a print schema.

```typescript
import { renderToPdf } from 'medical-form-printer/node'

const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: 'Confidential',
  pdfOptions: {
    format: 'A4',
    printBackground: true
  }
})
```

**Parameters:**
- `schema: PrintSchema` - The print schema
- `data: FormData` - The form data
- `options?: RenderOptions & { pdfOptions?: PdfOptions }` - Rendering and PDF options

**Returns:** `Promise<Buffer>` - PDF file buffer

#### `mergePdfs(documents, options?)`

Merges multiple documents into a single PDF.

```typescript
import { mergePdfs } from 'medical-form-printer/node'

const mergedPdf = await mergePdfs([
  { schema: schema1, data: data1 },
  { schema: schema2, data: data2 },
], {
  watermark: 'Complete Record'
})
```

### Custom Section Renderers

#### `registerSectionRenderer(type, renderer)`

Registers a custom section renderer for specialized content.

```typescript
import { registerSectionRenderer } from 'medical-form-printer'

registerSectionRenderer('vital-signs-chart', (config, data, options) => {
  const values = data[config.dataField] || []
  return `
    <div class="vital-signs-chart">
      <h3>${config.title}</h3>
      <!-- Custom chart rendering -->
    </div>
  `
})
```

#### `getSectionRenderer(type)`

Retrieves a registered section renderer.

```typescript
import { getSectionRenderer } from 'medical-form-printer'

const renderer = getSectionRenderer('info-grid')
```

### Pagination

#### Strategy Pattern API (Recommended)

The pagination system uses a strategy pattern for flexible rendering:

```typescript
import { 
  createDefaultPaginationContext,
  SmartPaginationStrategy,
  OverflowPaginationStrategy
} from 'medical-form-printer'

// Option 1: Use PaginationContext for automatic strategy selection
const context = createDefaultPaginationContext()
const html = context.render(schema, data, { isolated: true })

// Option 2: Use specific strategy directly
const strategy = new SmartPaginationStrategy()
if (strategy.shouldApply(schema)) {
  const html = strategy.render(schema, data, { isolated: true })
}

// Option 3: Use OverflowPaginationStrategy for long text fields
const overflowStrategy = new OverflowPaginationStrategy()
if (overflowStrategy.shouldApply(schema)) {
  const html = overflowStrategy.render(schema, data, { 
    isolated: true,
    textConfig: { seeNextMarker: '(continued on next page)' }
  })
}
```

#### `renderPaginatedHtml(config)` (Deprecated)

> **Deprecated**: Use the Strategy Pattern API above instead.

Renders multi-page content with smart pagination.

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
    continuationSuffix: '(continued)'
  }
})
```

#### Page Size Presets

```typescript
import { PAGE_A4, PAGE_A5, PAGE_16K, PAGE_PRESETS } from 'medical-form-printer'

// PAGE_A4: { width: 210, height: 297 } (mm)
// PAGE_A5: { width: 148, height: 210 } (mm)
// PAGE_16K: { width: 185, height: 260 } (mm)
```

#### Unit Conversion

```typescript
import { mmToPx, pxToMm, mmToPt, ptToMm } from 'medical-form-printer'

const heightPx = mmToPx(297)  // 297mm → pixels
const heightMm = pxToMm(1123) // pixels → mm
```

#### Overflow Text Configuration (i18n)

Configure overflow field pagination text for different languages:

```typescript
import { 
  DEFAULT_OVERFLOW_TEXT,    // Chinese (default)
  ENGLISH_OVERFLOW_TEXT     // English
} from 'medical-form-printer'
import type { OverflowTextConfig } from 'medical-form-printer'

// DEFAULT_OVERFLOW_TEXT:
// {
//   seeNextMarker: '（续见附页）',      // Marker on first page
//   continuationSuffix: '（续）',       // Label suffix on continuation page
//   pageTitleSuffix: '（续）'           // Page title suffix
// }

// ENGLISH_OVERFLOW_TEXT:
// {
//   seeNextMarker: '(continued on next page)',
//   continuationSuffix: '(continued)',
//   pageTitleSuffix: '(continued)'
// }

// Custom configuration
const customText: OverflowTextConfig = {
  seeNextMarker: '(voir page suivante)',
  continuationSuffix: '(suite)',
  pageTitleSuffix: '(suite)'
}

// Use in paginated rendering
const html = renderPaginatedHtml({
  schema: printSchema,
  data: formData,
  config: {
    overflowText: ENGLISH_OVERFLOW_TEXT  // or customText
  }
})
```

### Styling

#### `generateCss(theme?)`

Generates CSS styles for print rendering.

```typescript
import { generateCss, defaultTheme } from 'medical-form-printer'

const css = generateCss(defaultTheme)
```

#### `generateIsolatedCss(theme?)`

Generates isolated CSS with embedded fonts and namespaced classes.

```typescript
import { generateIsolatedCss } from 'medical-form-printer'

const css = generateIsolatedCss()
// Includes @font-face, isolation container, and all component styles
```

#### Theme Customization

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

### Formatters

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

### HTML Builder Utilities

```typescript
import { 
  HtmlBuilder, 
  h, 
  fragment, 
  when, 
  each,
  escapeHtml 
} from 'medical-form-printer'

// Fluent HTML building
const html = h('div', { class: 'container' },
  h('h1', {}, 'Title'),
  when(showContent, () => h('p', {}, 'Content')),
  each(items, (item) => h('li', {}, item.name))
)

// Safe HTML escaping
const safe = escapeHtml('<script>alert("xss")</script>')
```

## PrintSchema Structure

```typescript
interface PrintSchema {
  pageSize: 'A4' | 'A5' | '16K'
  orientation: 'portrait' | 'landscape'
  baseUnit?: number  // Scaling factor (default: 1, e.g., 0.95 = 5% smaller)
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

### Base Unit Scaling

The `baseUnit` property allows global scaling of all size values in the rendered output:

```typescript
const schema = {
  pageSize: 'A4',
  orientation: 'portrait',
  baseUnit: 0.95,  // 5% smaller - useful for fitting more content
  // ...
}
```

- `baseUnit: 1` (default) - Normal size
- `baseUnit: 0.95` - 5% smaller
- `baseUnit: 1.1` - 10% larger

## Section Types

| Type | Description | Use Case |
|------|-------------|----------|
| `info-grid` | Grid layout for key-value pairs | Patient demographics, basic info |
| `table` | Data table with columns | Nursing records, medication logs |
| `checkbox-grid` | Grid of checkbox options | Assessment checklists, symptoms |
| `signature-area` | Signature fields with labels | Approvals, acknowledgments |
| `notes` | Static text content | Instructions, disclaimers |
| `free-text` | Multi-line text input | Comments, observations |

### Info Grid Section

```typescript
{
  type: 'info-grid',
  config: {
    columns: 4,
    rows: [
      {
        cells: [
          { label: 'Name', field: 'name', type: 'text' },
          { label: 'Age', field: 'age', type: 'number', span: 1 },
          { label: 'Date', field: 'date', type: 'date' },
          { label: 'Status', field: 'status', type: 'checkbox', options: ['Active'] }
        ]
      }
    ]
  }
}
```

### Table Section

```typescript
{
  type: 'table',
  title: 'Nursing Records',
  config: {
    dataField: 'nursingRecords',
    columns: [
      { header: 'Date', field: 'date', type: 'date', width: '15%' },
      { header: 'Time', field: 'time', type: 'text', width: '10%' },
      { header: 'Temperature', field: 'temperature', type: 'number', width: '15%' },
      { header: 'Notes', field: 'notes', type: 'text' }
    ]
  }
}
```

### Checkbox Grid Section

```typescript
{
  type: 'checkbox-grid',
  title: 'Symptoms Assessment',
  config: {
    field: 'symptoms',
    columns: 4,
    options: [
      { value: 'fever', label: 'Fever' },
      { value: 'headache', label: 'Headache' },
      { value: 'fatigue', label: 'Fatigue' },
      { value: 'nausea', label: 'Nausea' }
    ]
  }
}
```

### Signature Area Section

```typescript
{
  type: 'signature-area',
  config: {
    fields: [
      { label: 'Patient Signature', field: 'patientSignature' },
      { label: 'Nurse Signature', field: 'nurseSignature' },
      { label: 'Date', field: 'signatureDate', type: 'date' }
    ]
  }
}
```

## CSS Isolation

For consistent rendering across different environments, use isolation mode:

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

// Namespace utilities
namespaceClass('header')           // 'mpr-header'
namespaceClasses(['header', 'footer'])  // ['mpr-header', 'mpr-footer']
```

Isolation mode provides:
- All classes prefixed with `mpr-` namespace
- Embedded Source Han Serif SC font (subset for CJK support)
- CSS containment (`contain: layout style`)
- Consistent rendering regardless of host page styles

## Examples

See the [examples](./examples) directory for complete working examples:

- [Browser Example](./examples/browser) - Vanilla HTML/JS usage
- [Node.js Example](./examples/node) - PDF generation with file output

## Storybook

Interactive component documentation is available via Storybook:

```bash
npm run storybook
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

[MIT](./LICENSE) © 2024

## Links

- [GitHub Repository](https://github.com/wangchengshi-ship-it/medical-form-printer)
- [npm Package](https://www.npmjs.com/package/medical-form-printer)
- [Issue Tracker](https://github.com/wangchengshi-ship-it/medical-form-printer/issues)
- [Changelog](./CHANGELOG.md)
