# Changelog

All notable changes to `medical-form-printer` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Table Multi-Row Header Support** - 表格组件新增复杂表头支持:
  - `HeaderCell` 接口：支持 `text`、`colspan`、`rowspan`、`width`、`field` 属性
  - `HeaderRow` 接口：定义表头行配置
  - `TableConfig.headerRows` 属性：可选的多行表头配置，优先于 `columns` 生成的单行表头
  - 支持单元格行合并（rowspan）和列合并（colspan）
  - 完全向后兼容，不使用 `headerRows` 时行为不变

### Fixed

- **Footer 测量修复** - 修复 `measureFooterInto` 函数未正确测量 `print-footer` 元素的问题:
  - 新增 `FOOTER` 选择器到 `MEASURE_SELECTORS`，支持隔离模式（`.mpr-print-footer`）和非隔离模式（`.print-footer`）
  - `measureFooterInto` 函数签名更新，新增 `pageContainer` 参数用于查找 `print-footer` 元素
  - 现在同时测量 `print-footer`（页码区域）和 `notes`（备注区域），确保分页计算正确预留页脚空间
  - 仅当元素存在且高度大于 0 时才添加测量项，避免空元素干扰分页计算

- **Smart Pagination 签名区域高度计算优化** - 重构 `SmartPaginationStrategy` 中签名高度的提取逻辑:
  - 将签名高度从 `extractFooterHeight` 中分离，新增独立的 `extractSignatureHeight` 方法
  - 根据 `signatureOnEachPage` 配置决定签名高度是否计入每页的页脚空间
  - 当 `signatureOnEachPage: false` 时，签名高度仅在最后一页预留（通过 `lastPageExtraHeight` 参数）
  - 当 `signatureOnEachPage: true` 时，签名高度计入每页的有效页脚高度
  - 修复了签名区域可能与内容重叠或空间预留不正确的问题

- **Smart Pagination 页眉/页脚高度计算问题** - 修复 `SmartPaginationStrategy` 在分页计算时未正确预留页眉/页脚空间的问题:
  - 新增 `extractHeaderHeight` 和 `extractFooterHeight` 方法从测量项中提取高度
  - 分页计算前过滤掉 header、footer、signature 类型的测量项，这些元素在每页单独渲染
  - 将 `headerHeight` 和 `footerHeight` 传递给 `calculatePageBreaks`，确保每页内容区域正确计算
  - 修复了内容可能与页眉/页脚重叠的问题

### Added

- **Table Partial Rendering Support** - `renderTable` 函数新增 `partialOptions` 参数支持分页场景:
  - `PartialTableOptions` 接口：`rowIndices?: number[]` 指定渲染的行索引，`includeHeader?: boolean` 控制是否包含表头
  - 支持按行索引过滤渲染，用于 Smart Pagination 跨页表格分割
  - 行号显示保持原始索引（`originalIndex + 1`），确保分页后行号连续正确
  - 完全向后兼容，不传 `partialOptions` 时行为与之前一致

### Fixed

- **分页渲染隔离模式类名前缀问题** - 修复 `renderPaginatedHtml` 在隔离模式下未正确传递 `classPrefix` 给 section 渲染器的问题:
  - 之前：隔离模式下 section 渲染器生成的类名缺少 `mpr-` 前缀，导致样式不匹配
  - 之后：当 `config.isolated: true` 时，自动将 `classPrefix: 'mpr'` 添加到 `renderOptions`，确保所有 section 渲染器生成正确的命名空间类名

- **Smart Pagination 第一页空白问题** - 修复 `measureAll` 函数生成的 section ID 与 `buildSectionMap` 不匹配导致的第一页空白问题:
  - 统一 section ID 格式为 `section-{index}`，其中 `index` 对应 `PrintSchema.sections` 数组中的位置
  - 之前：不同类型使用不同格式（`info-grid-0`、`checkbox-grid-0`、`section-title-0` 等）
  - 之后：所有 section 类型统一使用 `section-{index}` 格式
  - Table 相关项（`table-header`、`table-row`）保持原有格式不变，确保向后兼容

### Changed

- **Node.js 版本要求** - 最低版本从 `>=20.0.0` 提升至 `>=20.19.0`，与 `.nvmrc` 保持一致

### Added

- **CSS Isolation Support for Content Measurer** - 内容测量器现在支持 CSS 隔离模式:
  - `MEASURE_SELECTORS` 更新为同时匹配隔离模式（`mpr-` 前缀）和非隔离模式的类名
  - 移除 `:scope >` 选择器前缀以提高浏览器兼容性
  - 确保 `measureAll()` 和相关测量函数在隔离模式下正常工作

- **MeasurementStrategy Pattern** - Smart Pagination 测量逻辑重构为 GoF 策略模式:
  - `MeasurementStrategy` interface with `measure` method for decoupled measurement logic
  - `MeasurementConfig` type for measurement configuration options
  - `DomMeasurementStrategy` class for browser-based DOM measurement
  - Dependency injection support in `SmartPaginationStrategy` constructor
  - Property-based tests for interface compliance and error handling
  
  **测量逻辑说明**：系统通过 `MeasurableItem` 类型统一描述所有可测量的内容元素：
  - `header` - 页面头部（医院名称、表单标题等）
  - `section` - 独立区块（info-grid、checkbox-grid、notes 等非表格区块）
  - `table-header` - 表格头部（thead），用于续页时重复显示
  - `table-row` - 表格数据行（tbody tr），支持逐行分页
  - `signature` - 签名区域
  - `footer` - 页面底部（备注、页码等）
  
  `DomMeasurementStrategy` 的工作流程：
  1. 使用 `renderToIsolatedHtml` 将 schema + data 渲染为完整 HTML
  2. 创建隐藏的测量容器，模拟打印环境的宽度和字体
  3. 通过 `MEASURE_SELECTORS` 定位各类元素（支持隔离模式 `mpr-` 前缀）
  4. 使用 `getBoundingClientRect()` 获取实际渲染高度
  5. 返回 `MeasurableItem[]` 数组供分页算法使用

- **Pagination Strategy Pattern** - 分页功能重构为统一的策略模式架构:
  - `PaginationStrategy` interface with `name`, `shouldApply`, `render` methods
  - `PaginationContext` class for strategy management and selection
  - `SmartPaginationStrategy` adapter wrapping existing smart pagination algorithm
  - `OverflowPaginationStrategy` adapter wrapping existing overflow pagination algorithm
  - `createDefaultPaginationContext()` factory function for creating context with default strategies
  - `PrintSchemaWithPagination` and `PaginationRenderOptions` types
  - Property-based tests for strategy selection consistency (Property 4)
  - Property-based tests for smart pagination applicability (Property 2)
  - Property-based tests for overflow pagination applicability (Property 3)

### Deprecated

- `renderPaginatedHtml()` - 使用策略模式 API 替代：`createDefaultPaginationContext().render()` 或 `strategy.render()`
- `renderPaginatedHtmlSimple()` - 使用策略模式 API 替代
- `usePrintPagination()` composable - 使用策略模式 API 替代
- `PrintSchema.baseUnit` property for global scaling (default: 1, e.g., 0.95 = 5% smaller, 1.1 = 10% larger)
- `textarea` cell type in info-grid now supports pre-rendered overflow HTML via `__overflow_html_{field}` flag in form data (internal pagination system support)
- `OverflowTextConfig` type for overflow field pagination i18n support
- `DEFAULT_OVERFLOW_TEXT` constant with Chinese text (续见附页、续)
- `ENGLISH_OVERFLOW_TEXT` constant with English text (continued on next page, continued)

### Removed

- **Overflow Pagination Rendering Functions** - 移除高级溢出分页渲染 API（内部实现，不再公开导出）:
  - `isOverflowSection`
  - `findOverflowFieldLabel`
  - `findOverflowFieldCell`
  - `getOverflowFieldsFromConfig`
  - `getOverflowFieldNames`
  - `renderOverflowFirstLine`
  - `renderOverflowContinuation`
  - `renderOverflowContinuationPage`
  - `mergeOverflowTextConfig`
  - `hasAnyContinuationContent`
  - `OVERFLOW_CSS_CLASSES`
- **Overflow Pagination Types** - 移除相关类型导出:
  - `OverflowRenderContext`
  - `OverflowContinuationPageContext`

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
