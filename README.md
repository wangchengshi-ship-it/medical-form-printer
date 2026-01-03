# medical-form-printer

A medical form print renderer - render structured form data to printable HTML/PDF.

## Features

- 🖨️ **Dual Environment** - Works in both browser and Node.js
- 📄 **Multiple Sections** - Info grid, data table, checkbox grid, signature area, etc.
- 🎨 **Theme Customization** - Custom fonts, colors, spacing
- 📑 **PDF Generation** - High-fidelity PDF output via Puppeteer
- 🔗 **PDF Merging** - Merge multiple documents into a single PDF
- 🔌 **Extensible** - Custom section renderers
- 📐 **Smart Pagination** - Auto pagination, header repeat, overflow field handling

## Installation

```bash
npm install medical-form-printer

# If you need PDF generation
npm install puppeteer
```

## Usage

### Browser / Frontend

```typescript
import { renderToHtml } from 'medical-form-printer'

const html = renderToHtml(printSchema, formData, {
  watermark: 'Internal Use Only'
})

// Insert into iframe or div for preview
document.getElementById('preview').innerHTML = html
```

### Node.js / Backend

```typescript
import { renderToPdf, mergePdfs } from 'medical-form-printer/node'

// Generate single PDF
const pdfBuffer = await renderToPdf(printSchema, formData, {
  watermark: 'Internal Use Only'
})

// Merge multiple forms
const mergedPdf = await mergePdfs([
  { schema: maternalSchema, data: maternalData },
  { schema: newbornSchema, data: newbornData },
])

// Save file
fs.writeFileSync('output.pdf', mergedPdf)
```

## PrintSchema Structure

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
              { label: 'Name', field: 'name', type: 'text' },
              { label: 'Age', field: 'age', type: 'number' },
            ]
          }
        ]
      }
    },
    {
      type: 'table',
      title: 'Nursing Records',
      config: {
        dataField: 'nursingRecords',
        columns: [
          { header: 'Date', field: 'date', type: 'date' },
          { header: 'Temperature', field: 'temperature', type: 'number' },
        ]
      }
    }
  ],
  footer: {
    showPageNumber: true
  }
}
```

## Section Types

| Type | Description |
|------|-------------|
| `info-grid` | Information grid for basic info display |
| `table` | Data table for list data |
| `checkbox-grid` | Checkbox grid for multiple options |
| `signature-area` | Signature area |
| `notes` | Static note text |
| `free-text` | Free text input |

## Custom Section Renderer

```typescript
import { registerSectionRenderer } from 'medical-form-printer'

registerSectionRenderer('custom-chart', (config, data, options) => {
  return `<div class="custom-chart">...</div>`
})
```

## Theme Customization

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

## CSS Isolation Mode

To ensure consistent fonts and styles across environments, use isolated mode renderer or CSS:

### Isolated Mode Renderer (Recommended)

```typescript
import { renderToIsolatedHtml, renderToIsolatedFragment } from 'medical-form-printer'
import type { IsolatedRenderOptions } from 'medical-form-printer'

// Render options
const options: IsolatedRenderOptions = {
  watermark: 'Internal Use Only',
  watermarkOpacity: 0.1,  // Opacity 0-1, auto-clamped if out of range
  theme: { /* Theme config (font config will be ignored) */ }
}

// Generate complete isolated HTML document
const html = renderToIsolatedHtml(printSchema, formData, options)

// Generate isolated HTML fragment (for embedding in existing page)
const fragment = renderToIsolatedFragment(printSchema, formData, options)
document.getElementById('preview').innerHTML = fragment
```

Isolated mode renderer features:
- All content wrapped in `.mpr-root` isolation container
- CSS embedded in `<style>` tag within isolation container
- All class names prefixed with `mpr-`
- Font forced to embedded Source Han Serif SC (ignores passed font config)

### Manual Isolated CSS Usage

```typescript
import { generateIsolatedCss, ISOLATION_ROOT_CLASS } from 'medical-form-printer'

// Generate complete isolated CSS
const css = generateIsolatedCss()

// Includes:
// 1. @font-face declarations (embedded Base64 Source Han Serif)
// 2. Font force override rules
// 3. CSS isolation container styles (contain: layout style, isolation: isolate)
// 4. All component styles (with mpr- prefix)
// 5. Print media queries

// Wrap content with isolation container
const html = `
  <style>${css}</style>
  <div class="${ISOLATION_ROOT_CLASS}">
    <!-- Rendered content -->
  </div>
`
```

### Namespace Utilities

```typescript
import { 
  CSS_NAMESPACE,           // 'mpr'
  ISOLATION_ROOT_CLASS,    // 'mpr-root'
  namespaceClass,          // Add prefix
  namespaceClasses,        // Batch add prefix
  getNamespacedClass,      // Get from mapping table
  CLASS_NAME_MAP,          // Class name mapping table
} from 'medical-form-printer'

// Single class name
namespaceClass('print-page')  // 'mpr-print-page'

// Batch convert
namespaceClasses(['header', 'footer'])  // ['mpr-header', 'mpr-footer']

// Get from mapping table (prefer predefined mappings)
getNamespacedClass('signature-area')  // 'mpr-signature-area'
```

> **Note**: Isolated mode ignores passed font config, always using embedded Source Han Serif SC for cross-environment consistency.

### Watermark Utilities

Provides unified watermark rendering with custom class names and opacity:

```typescript
import { 
  renderWatermarkHtml,
  extractWatermarkOptions,
  clamp,
  normalizeOpacity,
} from 'medical-form-printer'
import type { WatermarkOptions } from 'medical-form-printer'

// Render watermark HTML
const watermarkHtml = renderWatermarkHtml({
  text: 'Internal Use Only',
  opacity: 0.1,
  className: 'custom-watermark',  // Default 'watermark'
})
// => '<div class="custom-watermark" style="opacity: 0.1">Internal Use Only</div>'

// Extract watermark config from render options
const options = { watermark: 'Draft', watermarkOpacity: 0.5 }
const watermarkOptions = extractWatermarkOptions(options, 'mpr-watermark')
// => { text: 'Draft', opacity: 0.5, className: 'mpr-watermark' }

// Value range clamping
clamp(1.5, 0, 1)  // => 1
clamp(-0.5, 0, 1) // => 0

// Safe opacity handling (clamped to 0-1 range)
normalizeOpacity(1.5)   // => 1
normalizeOpacity(-0.5)  // => 0
normalizeOpacity(0.5)   // => 0.5
normalizeOpacity(undefined)  // => undefined
```

### Page Size CSS Constants

Page size string constants for CSS style generation:

```typescript
import { PAGE_SIZES } from 'medical-form-printer'
import type { PageSizeKey } from 'medical-form-printer'

// Preset sizes (CSS strings)
// PAGE_SIZES.A4: { width: '210mm', height: '297mm' }
// PAGE_SIZES.A5: { width: '148mm', height: '210mm' }
// PAGE_SIZES['16K']: { width: '185mm', height: '260mm' }

const pageSize: PageSizeKey = 'A4'
const { width, height } = PAGE_SIZES[pageSize]
// width: '210mm', height: '297mm'
```

> **Note**: `PAGE_SIZES` is for CSS style generation, returning strings with units. For numeric calculations (like pagination), use `PAGE_A4`, `PAGE_16K` constants from the `pagination` module.

## Smart Pagination

Supports content-height-based smart pagination for long forms and multi-page documents.

### Page Size Presets

```typescript
import { 
  PAGE_16K, PAGE_A4, PAGE_A5, 
  mmToPx, pxToMm,
  getPageDimensions 
} from 'medical-form-printer'
import type { PageSizePreset } from 'medical-form-printer'

// Preset sizes
// PAGE_16K: 185mm × 260mm (common for medical forms)
// PAGE_A4: 210mm × 297mm
// PAGE_A5: 148mm × 210mm

// Unit conversion
const heightPx = mmToPx(260)  // mm → px
const heightMm = pxToMm(982)  // px → mm

// Get preset by name
const pageSize: PageSizePreset = '16K'
const dimensions = getPageDimensions(pageSize)
```


### Pagination Config

```typescript
import type { PaginationConfig } from 'medical-form-printer'
import { PAGINATION_DEFAULTS } from 'medical-form-printer'

const paginationConfig: PaginationConfig = {
  enabled: true,
  mode: 'auto',                    // 'auto' | 'manual'
  
  // Overflow config
  overflow: {
    fields: ['notes'],             // Overflow pagination fields
    firstLineChars: 60,            // Max chars on first page
  },
  
  // Display config
  display: {
    headerOnEachPage: true,        // Show header on each page
    footerOnEachPage: true,        // Show footer on each page
    signatureOnEachPage: false,    // Show signature area on each page
    repeatTableHeaders: true,      // Repeat table headers on continuation pages
  },
  
  // Header config
  headerConfig: {
    showOnEachPage: true,
    continuationSuffix: '(continued)',    // Continuation page title suffix
  },
  
  // Footer config
  footerConfig: {
    showOnEachPage: true,
    pageNumberFormat: 'Page {current} of {total}',  // Page number format
  },
}

// Use default config constants
console.log(PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS) // 60
console.log(PAGINATION_DEFAULTS.DPI)                        // 96
```

### Paginated Render Isolation Mode

Paginated renderer supports isolation mode for consistent fonts and styles across environments:

```typescript
import { renderPaginatedHtml } from 'medical-form-printer'

// Enable isolation mode
const html = renderPaginatedHtml({
  schema: printSchema,
  data: formData,
  pageBreakResult: calculatePageBreaks(items, options),
  measuredItems: items,
  config: {
    isolated: true,  // Enable isolation mode
    showHeaderOnEachPage: true,
    continuationSuffix: '(continued)',
  },
})
```

Isolation mode features:
- All pages wrapped in single `.mpr-root` isolation container
- CSS embedded in `<style>` tag within isolation container
- All class names prefixed with `mpr-` (e.g., `mpr-print-page`, `mpr-print-header`)
- Font forced to embedded Source Han Serif SC
- Multiple pages share same isolation container for style consistency

### Overflow Field Handling

Long text fields (like notes) can be configured for overflow pagination:

```typescript
import { 
  getOverflowFirstLine, 
  getOverflowRest, 
  hasOverflowContent,
  PAGINATION_DEFAULTS 
} from 'medical-form-printer'

const notes = 'This is a very long note text...'

// First page content (default 60 chars)
const firstLine = getOverflowFirstLine(notes)

// Custom max chars
const firstLineCustom = getOverflowFirstLine(notes, 100)

// Continuation page content
const rest = getOverflowRest(notes)

// Check if has overflow content
if (hasOverflowContent(notes)) {
  // Need pagination handling
}

// Use default config constants
console.log(PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS) // 60
```

### Page Break Calculation

```typescript
import { 
  calculatePageBreaks, 
  calculateUsableHeight,
  MEASURABLE_ITEM_TYPES 
} from 'medical-form-printer'
import type { MeasurableItem, MeasurableItemType } from 'medical-form-printer'

// Measurable content item types
// MEASURABLE_ITEM_TYPES.HEADER       - Header
// MEASURABLE_ITEM_TYPES.SECTION      - Section
// MEASURABLE_ITEM_TYPES.TABLE_HEADER - Table header
// MEASURABLE_ITEM_TYPES.TABLE_ROW    - Table row
// MEASURABLE_ITEM_TYPES.SIGNATURE    - Signature area
// MEASURABLE_ITEM_TYPES.FOOTER       - Footer

// Measured content items
const items: MeasurableItem[] = [
  { id: 'header-1', type: MEASURABLE_ITEM_TYPES.HEADER, height: 80 },
  { id: 'table-header-1', type: MEASURABLE_ITEM_TYPES.TABLE_HEADER, height: 40, tableId: 'nursing' },
  { id: 'row-1', type: MEASURABLE_ITEM_TYPES.TABLE_ROW, height: 30, tableId: 'nursing', dataIndex: 0 },
  // ...
]

// Calculate page breaks
const result = calculatePageBreaks(items, {
  pageHeight: calculateUsableHeight(PAGE_16K),
  headerHeight: 60,
  footerHeight: 40,
  repeatTableHeaders: true,
})

// result.pages: Paginated page list
// result.totalPages: Total page count
```

### Content Measurer (Browser Environment)

Measure actual rendered height of DOM elements in browser for precise pagination:

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
} from 'medical-form-printer'
import type { 
  MeasureConfig, 
  MeasureResult,
  MeasureElementOptions,
  TextEstimateOptions,
} from 'medical-form-printer'
```

#### Composable Style API

```typescript
// Create measurer instance
const measurer = createContentMeasurer({ containerWidth: 624 })

// Measure single element
const height = measurer.measureElement(element)

// Batch measure table rows
const tableItems = measurer.measureTable(tableElement, { tableId: 'nursing' })

// Measure all content
const allItems = measurer.measureAll(contentContainer)

// Cleanup resources
measurer.cleanup()
```

#### Manual Measure Container Management

```typescript
// Create hidden measure container
const container = createMeasureContainer({
  containerWidth: 624,
  fontSize: '10pt',
  lineHeight: 1.8,
})

// Measure element height
const height = measureElementHeight(element, container)

// Cleanup
destroyMeasureContainer(container)
```

#### Text Height Estimation (No DOM Environment)

```typescript
// Estimate text height (for Node.js environment fallback)
const height = estimateTextHeight('This is test text', {
  containerWidth: 624,
  fontSize: 13.33,  // 10pt ≈ 13.33px
  lineHeight: 1.8,
  isChinese: true,
})
```

#### Environment Detection

```typescript
if (isBrowserEnvironment()) {
  // Use DOM measurement
  const measurer = createContentMeasurer()
  // ...
} else {
  // Use text estimation fallback
  const height = estimateTextHeight(text)
}
```

> **Note**: Content measurer is only available in browser environment. Node.js environment requires Puppeteer for measurement, or use `estimateTextHeight` for estimation.

## License

MIT
