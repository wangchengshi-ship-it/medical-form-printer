# Changelog

All notable changes to `medical-form-printer` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `PrintSchema.baseUnit` property for global scaling (default: 1, e.g., 0.95 = 5% smaller, 1.1 = 10% larger)
- `OverflowTextConfig` type for overflow field pagination i18n support
- `DEFAULT_OVERFLOW_TEXT` constant with Chinese text (续见附页、续)
- `ENGLISH_OVERFLOW_TEXT` constant with English text (continued on next page, continued)

### Changed

- Section title (`.section-title`) now centered by default with `text-align: center`
- Vitest 配置添加 Bun 运行时兼容性支持（`pool: 'forks'` with `singleFork: true`），修复 Vitest 3.x 兼容性问题

## [0.2.0] - 2026-01-04

### Added

- Test utilities module `src/test-utils/placeholder-data.ts`
  - `PLACEHOLDER` - Generic placeholder data constants (hospital, patient, staff, location, form, watermark)
  - `SAMPLE_MATERNAL_DATA` - Maternal admission assessment sample data
  - `SAMPLE_NEWBORN_DATA` - Newborn nursing record sample data
  - `SAMPLE_DAILY_LOG_DATA` - Daily nursing log sample data
  - `SAMPLE_DISCHARGE_DATA` - Discharge assessment sample data
  - Used for Storybook stories and tests, replacing real sensitive data

### Changed

- **Paginated renderer internationalization**:
  - File-level and function comments translated to English (open source preparation)
  - Default continuation page title suffix changed from `(续)` to `(continued)`
  - Default page number format changed from `第 {current} 页 / 共 {total} 页` to `Page {current} of {total}`
  - Chinese users can customize to Chinese format via `PaginatedRenderConfig`
- **Info-grid section internationalization**:
  - Label suffix changed from Chinese colon `：` to English colon `:`
  - Default `checkbox-inline` options changed from `['无', '有']` to `['No', 'Yes']`
  - All Chinese comments translated to English (open source preparation)
- **Signature-area section internationalization**:
  - Date label changed from `日期：` to `Date:`
  - Label suffix changed from Chinese colon `：` to English colon `:`
  - File-level and function comments translated to English (open source preparation)
- **Default-theme module internationalization**:
  - File-level and function comments translated to English (open source preparation)
  - Removed Chinese font aliases from font config (`"宋体"` → removed, `"黑体"` → removed), keeping SimSun/SimHei as primary font names
- **Print-schema type definitions internationalization**:
  - File-level comments translated to English (open source preparation)
  - Type comments translated from Chinese to English (`页面尺寸` → `Page size`, `页面方向` → `Page orientation`, etc.)
- **16K paper style refactoring**:
  - Set both `height` and `min-height` to same value, ensuring page height matches physical print size exactly
  - Added `overflow: hidden` to prevent content overflow causing pagination issues
  - Added dedicated padding `padding: 8mm 10mm`, consistent with frontend Vue component
  - Landscape mode updated accordingly: `padding: 10mm 8mm`, `overflow: hidden`
- Default page margin changed from 20mm to 10mm, consistent with frontend Vue component (Vue component uses `8mm 10mm`, using 10mm as baseline here)
- `formatBoolean` function unchecked symbol changed from `☐` (U+2610 BALLOT BOX) to `□` (U+25A1 WHITE SQUARE), consistent with frontend Vue component
- Improved `checkbox-inline` type value matching logic:
  - Boolean values: `index 0` corresponds to `false` (e.g., "No"), `index 1` corresponds to `true` (e.g., "Yes")
  - String values: direct comparison with option text
  - Number values: comparison with option index
  - Removed hardcoded dependency on specific option text ("有"/"是"), changed to index-based generic logic
- Refactored `info-grid` section renderer (v2.0.0):
  - Changed from table layout (`<table>/<tr>/<td>`) to flex layout (`<div>/<span>`)
  - Added underline fill-in-the-blank style, format: `Label: ______value______`
  - Removed `formatValue` dependency, using internal `getCellValue` function for value formatting
  - Added `checkbox-text` type rendering: `☑/□ + text`
  - Added `textarea` type rendering: label + content with natural line breaks
  - Added empty label row support: shows only underline
  - Optimized `checkbox-inline` rendering logic
  - Optimized `compound` field handling
- **checkbox-grid section enhancements**:
  - Added Items mode with per-item field binding (`items[].field`)
  - Added `prefixLabel` support for checkbox items
  - Added mixed types support (checkbox, checkbox-with-input, text-input)
  - Added comprehensive Storybook stories and unit tests
- **Font subset update**:
  - Regenerated font subset with comprehensive medical characters from 《产后母婴康复机构档案书写格式》 (13 pages)
  - Fixed missing characters (e.g., "识" in "意识状态")
  - 3653 characters, 1.57 MB, 93% compression ratio

## [0.1.0] - 2026-01-03

### Added

- **Core Rendering**
  - `renderToHtml` - Render PrintSchema and form data to HTML
  - `renderToIsolatedHtml` - Render with CSS isolation for consistent cross-environment styling
  - `renderToIsolatedFragment` - Render isolated HTML fragment for embedding
  - `renderToPdf` - Generate PDF (Node.js environment, requires Puppeteer)
  - `mergePdfs` - Merge multiple PDF documents

- **Section Renderers**
  - `info-grid` - Information grid for key-value pairs
  - `table` - Data table with columns
  - `checkbox-grid` - Checkbox option grid
  - `signature-area` - Signature fields
  - `notes` - Static note text
  - `free-text` - Multi-line text input
  - `registerSectionRenderer` - Custom section renderer registration
  - `getSectionRenderer` - Retrieve registered section renderer

- **Smart Pagination System**
  - `calculatePageBreaks` - Page break calculation
  - `calculatePageBreaksSimple` - Simplified page break calculation
  - `calculateUsableHeight` - Calculate usable page height
  - `calculateUsableWidth` - Calculate usable page width
  - `renderPaginatedHtml` - Paginated HTML rendering
  - `renderPaginatedHtmlSimple` - Simplified paginated rendering
  - `generatePaginationCss` - Generate pagination CSS
  - Page size presets: `PAGE_16K`, `PAGE_A4`, `PAGE_A5`, `PAGE_PRESETS`
  - Unit conversion: `mmToPx`, `pxToMm`, `mmToPt`, `ptToMm`

- **Overflow Field Handling**
  - `getOverflowFirstLine` - Get first page content
  - `getOverflowRest` - Get continuation page content
  - `hasOverflowContent` - Check for overflow content
  - `createOverflowFieldConfig` - Create overflow field configuration
  - `processOverflowFields` - Process overflow fields

- **Content Measurer (Browser Environment)**
  - `createContentMeasurer` - Create measurer instance
  - `measureElementHeight` - Measure element height
  - `estimateTextHeight` - Text height estimation (fallback)
  - `createMeasureContainer` - Create measurement container
  - `destroyMeasureContainer` - Cleanup measurement container

- **CSS Isolation**
  - `CSS_NAMESPACE` - CSS namespace prefix constant (`mpr`)
  - `ISOLATION_ROOT_CLASS` - Isolation container root class (`mpr-root`)
  - `namespaceClass` - Add namespace prefix to class name
  - `namespaceClasses` - Batch convert class names
  - `generateIsolatedCss` - Generate complete isolated CSS
  - `getNamespacedClass` - Get namespaced class name

- **Font Module**
  - `getFontCss` - Get complete font CSS (@font-face + override rules)
  - `getFontDataUrl` - Get Base64 encoded font Data URL
  - `isFontLoaded` - Synchronously check font load status
  - `waitForFonts` - Asynchronously wait for font loading
  - `FontLoadError` - Font loading error class
  - Embedded Source Han Serif SC (subsetted woff2 format)

- **Theme Customization**
  - `defaultTheme` - Default theme configuration
  - `mergeTheme` - Deep merge theme configurations
  - `generateCss` - Generate CSS from theme
  - `createScaledTheme` - Create theme with scaled values
  - `createThemeWithBaseUnit` - Create theme with base unit system

- **Formatters**
  - `formatDate` - Date formatting with customizable format
  - `formatBoolean` - Boolean to checkbox symbol
  - `formatNumber` - Number formatting with decimals
  - `formatValue` - Generic value formatting
  - `isChecked` - Check if value matches checked options

- **HTML Builder Utilities**
  - `HtmlBuilder` - Fluent HTML builder class
  - `h` - Create HTML element
  - `fragment` - Create document fragment
  - `when` - Conditional rendering
  - `each` - List rendering
  - `escapeHtml` - HTML escape
  - `escapeAttr` - Attribute escape

- **Watermark Utilities**
  - `renderWatermarkHtml` - Render watermark HTML
  - `extractWatermarkOptions` - Extract watermark config from options
  - `clamp` - Value range clamping
  - `normalizeOpacity` - Safe opacity handling

- **Design Patterns**
  - Strategy pattern: `StrategyContext`, `createDefaultStrategyContext`
  - Factory pattern: `SectionRendererFactory`, `FormatterFactory`
  - Builder pattern: `HtmlElementBuilder`, `PageBuilder`, `TableBuilder`
  - Composite pattern: `LeafSection`, `ContainerSection`, `SectionTreeTraverser`
  - Template Method pattern: `AbstractPageRenderer`, `SinglePageRenderer`, `PaginatedPageRenderer`
  - Visitor pattern: `FormatVisitor`, `ValidationVisitor`, `MeasureVisitor`

- **Type Exports**
  - `PrintSchema`, `PrintHeader`, `PrintFooter`, `PrintSection`
  - `FormData`, `RenderOptions`, `PdfOptions`, `MergeOptions`
  - `Theme`, `FontConfig`, `ColorConfig`, `SpacingConfig`
  - `PaginationConfig`, `PageBreakResult`, `MeasurableItem`
  - `PageDimensions`, `OverflowFieldConfig`
  - `IsolatedRenderOptions`, `PaginatedRenderConfig`

[Unreleased]: https://github.com/wangchengshi-ship-it/medical-form-printer/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/wangchengshi-ship-it/medical-form-printer/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/wangchengshi-ship-it/medical-form-printer/releases/tag/v0.1.0
