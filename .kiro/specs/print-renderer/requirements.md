# Requirements Document

## Introduction

医疗表单打印渲染库（Print Renderer Library），一个与框架无关的纯 TypeScript 库，用于将结构化表单数据渲染为可打印的 HTML/PDF。该库可同时在浏览器和 Node.js 环境运行，支持产后康复中心表单和未来的电子病历系统。

## Glossary

- **Print_Renderer**: 打印渲染器，将 printSchema + formData 转换为 HTML 字符串
- **PrintSchema**: 打印布局配置，定义页面结构、区块类型、样式等
- **FormData**: 表单数据，键值对形式的用户填写内容
- **Section_Renderer**: 区块渲染器，负责渲染特定类型的区块（info-grid、table、checkbox-grid 等）
- **PDF_Generator**: PDF 生成器，将 HTML 转换为 PDF 文件（仅 Node.js 环境）
- **Theme**: 主题配置，定义字体、颜色、边距等样式变量
- **Pagination_Engine**: 分页引擎，根据内容高度计算分页点，确保表格行不被分割
- **Content_Measurer**: 内容测量器，测量渲染后元素的实际高度
- **Paginated_Renderer**: 分页渲染器，将分页结果渲染为多页 HTML
- **MeasurableItem**: 可测量项，包含 id、type、height、tableId 等属性的内容单元
- **PageBreakResult**: 分页结果，包含 pages 数组和 totalPages 总页数
- **16K**: 十六开纸张，尺寸为 185mm × 260mm，医疗表单常用规格

## Requirements

### Requirement 1: 核心渲染引擎

**User Story:** 作为开发者，我需要一个纯函数式的渲染引擎，将 printSchema 和 formData 转换为 HTML 字符串。

#### Acceptance Criteria

1. THE Print_Renderer SHALL accept printSchema and formData as input and return HTML string
2. THE Print_Renderer SHALL be a pure function with no side effects
3. THE Print_Renderer SHALL work in both browser and Node.js environments
4. THE Print_Renderer SHALL not depend on any UI framework (Vue, React, Angular)
5. THE Print_Renderer SHALL support TypeScript with full type definitions

### Requirement 2: 区块渲染器

**User Story:** 作为开发者，我需要支持多种区块类型的渲染，以满足不同表单的布局需求。

#### Acceptance Criteria

1. THE Section_Renderer SHALL support info-grid type for key-value information display
2. THE Section_Renderer SHALL support table type for tabular data with multiple rows
3. THE Section_Renderer SHALL support checkbox-grid type for multiple choice options
4. THE Section_Renderer SHALL support signature-area type for signature fields
5. THE Section_Renderer SHALL support notes type for static text content
6. THE Section_Renderer SHALL support free-text type for paragraph content (future EMR)
7. THE Section_Renderer SHALL be extensible to add custom section types via plugin

### Requirement 3: 页面布局

**User Story:** 作为开发者，我需要支持标准纸张尺寸和页面布局配置。

#### Acceptance Criteria

1. THE Print_Renderer SHALL support A4, A5, and 16K (185mm × 260mm) page sizes
2. THE Print_Renderer SHALL support portrait and landscape orientations
3. THE Print_Renderer SHALL render page header with hospital name, department, and form title
4. THE Print_Renderer SHALL render page footer with page numbers and notes
5. THE Print_Renderer SHALL support configurable margins
6. THE Print_Renderer SHALL use 16K as the default page size

### Requirement 4: 样式系统

**User Story:** 作为开发者，我需要一个可定制的样式系统，支持不同医院的品牌需求。

#### Acceptance Criteria

1. THE Print_Renderer SHALL include default styles that match standard medical form appearance
2. THE Print_Renderer SHALL support theme customization for fonts, colors, and spacing
3. THE Print_Renderer SHALL generate self-contained HTML with embedded CSS
4. THE Print_Renderer SHALL support Chinese fonts (SimSun, 宋体) for medical documents
5. THE Print_Renderer SHALL output print-optimized CSS with @media print rules

### Requirement 5: 数据格式化

**User Story:** 作为开发者，我需要自动格式化不同类型的数据值。

#### Acceptance Criteria

1. THE Print_Renderer SHALL format date values according to locale settings
2. THE Print_Renderer SHALL format boolean values as checkbox symbols (☑/☐)
3. THE Print_Renderer SHALL format number values with configurable precision
4. THE Print_Renderer SHALL handle null/undefined values gracefully with placeholder
5. THE Print_Renderer SHALL support custom formatters for specific fields

### Requirement 6: PDF 生成（Node.js）

**User Story:** 作为后端开发者，我需要在 Node.js 环境将 HTML 转换为 PDF 文件。

#### Acceptance Criteria

1. THE PDF_Generator SHALL convert HTML string to PDF buffer
2. THE PDF_Generator SHALL support PDF/A format for long-term archival
3. THE PDF_Generator SHALL support adding watermark text
4. THE PDF_Generator SHALL support merging multiple PDFs into one file
5. THE PDF_Generator SHALL use Puppeteer for accurate HTML rendering
6. IF Puppeteer is not available, THE PDF_Generator SHALL provide fallback error message

### Requirement 7: 多文档合并

**User Story:** 作为病案管理员，我需要将多个表单合并成一个 PDF 文件。

#### Acceptance Criteria

1. THE PDF_Generator SHALL accept array of printSchema + formData pairs
2. THE PDF_Generator SHALL render each form as separate pages in order
3. THE PDF_Generator SHALL support custom page order configuration
4. THE PDF_Generator SHALL generate table of contents (optional)
5. THE PDF_Generator SHALL support section dividers between different form types

### Requirement 8: 可扩展性

**User Story:** 作为开发者，我需要能够扩展渲染器以支持未来的电子病历需求。

#### Acceptance Criteria

1. THE Print_Renderer SHALL support plugin architecture for custom section types
2. THE Print_Renderer SHALL support custom data formatters registration
3. THE Print_Renderer SHALL support template inheritance and composition
4. THE Print_Renderer SHALL provide hooks for pre/post rendering customization
5. THE Print_Renderer SHALL maintain backward compatibility when adding new features

### Requirement 9: 智能分页

**User Story:** 作为开发者，我需要智能分页功能，确保内容在多页打印时正确分割，表格行不被截断，续页自动重复表头。

#### Acceptance Criteria

1. THE Pagination_Engine SHALL calculate page breaks based on measured content heights
2. THE Pagination_Engine SHALL ensure table rows are never split across pages
3. WHEN a table continues on a new page, THE Pagination_Engine SHALL repeat the table header
4. THE Pagination_Engine SHALL mark continuation pages with isContinuation flag
5. THE Pagination_Engine SHALL support configurable page dimensions (width, height, margins)
6. THE Pagination_Engine SHALL reserve space for repeated headers when calculating page breaks
7. THE Pagination_Engine SHALL work with pre-measured content heights (MeasurableItem[])

### Requirement 10: 内容测量

**User Story:** 作为开发者，我需要测量渲染后内容的实际高度，以便进行精确分页。

#### Acceptance Criteria

1. THE Content_Measurer SHALL create a hidden container matching print styles for measurement
2. THE Content_Measurer SHALL measure actual rendered height including line-height, padding, and margin
3. THE Content_Measurer SHALL support measuring variable-height table rows (text wrapping)
4. THE Content_Measurer SHALL handle text wrapping estimation when DOM is not available
5. THE Content_Measurer SHALL support batch measurement of multiple elements
6. THE Content_Measurer SHALL clean up measurement containers after use

### Requirement 11: 分页渲染

**User Story:** 作为开发者，我需要将分页结果渲染为多页 HTML，每页独立且可打印。

#### Acceptance Criteria

1. THE Paginated_Renderer SHALL render each page as a separate .print-page element
2. THE Paginated_Renderer SHALL include repeated table headers on continuation pages
3. THE Paginated_Renderer SHALL display page numbers (e.g., "第 1 页 / 共 3 页")
4. THE Paginated_Renderer SHALL support continuation markers (e.g., "(续)" in title)
5. THE Paginated_Renderer SHALL maintain consistent styling across all pages
6. THE Paginated_Renderer SHALL support CSS page-break rules for browser printing
