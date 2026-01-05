# Requirements Document

## Introduction

本需求文档定义了页脚测量的修复方案。

### 页面结构说明

一个完整的打印页面分为三个部分：

```
┌─────────────────────────────────────┐
│           Header (头)               │
│   医院名称、科室、表单标题            │
├─────────────────────────────────────┤
│           Body (中)                 │
│   - info-grid                       │
│   - table (可能最后一列是签名列)      │
│   - checkbox-grid                   │
│   - notes                           │
│   - ...                             │
├─────────────────────────────────────┤
│           Footer (脚)               │
│   - signature-area (可选，独立签名)  │
│   - print-footer (页码区域)          │
└─────────────────────────────────────┘
```

### 签名的两种形式

1. **Footer 内签名** (`signature-area` section) - 独立的签名区域，在页面底部，由 `measureSignaturesInto` 测量
2. **表格最后一列签名** - 签名作为表格的一列，跟随表格行，由 `measureSectionsInto` 测量为 `table-row`

### 分页时签名的配置

- `signatureOnEachPage: true` - 每页都显示签名
- `signatureOnEachPage: false` - 只在最后一页显示签名

### 当前问题

`measureFooterInto` 函数只测量 `notes-text` 和 `notes-section` 元素，但没有测量 `print-footer` 元素（包含页码 `<span class="page-number">Page 1 of 2</span>`）。这导致：
1. 分页计算时没有为页脚区域（页码）预留空间
2. 第一页底部的内容被截断
3. 页脚与内容重叠

**根本原因：**
- `MEASURE_SELECTORS` 中有 `HEADER` 选择器（`.print-header`），但没有 `FOOTER` 选择器（`.print-footer`）
- `measureFooterInto` 只查找 `NOTES` 元素，而不是 `print-footer` 元素
- 页码区域的高度没有被测量和计入

**修复目标：**
- 在 `MEASURE_SELECTORS` 中添加 `FOOTER` 选择器
- 修改 `measureFooterInto` 函数以测量 `print-footer` 元素
- 确保页脚高度（包括页码）被正确测量和传递给分页算法

## Glossary

- **Content_Measurer**: 内容测量器，负责测量 DOM 元素的实际渲染高度
- **MEASURE_SELECTORS**: CSS 选择器常量对象，定义各类可测量元素的选择器
- **Print_Footer**: 页面底部区域，包含页码和备注信息
- **Page_Number**: 页码元素，显示 "Page X of Y" 格式的页码
- **MeasurableItem**: 可测量项，包含元素 ID、类型和高度信息

## Requirements

### Requirement 1: 添加 Footer 选择器

**User Story:** As a library developer, I want MEASURE_SELECTORS to include a FOOTER selector, so that the print-footer element can be located for measurement.

#### Acceptance Criteria

1. THE MEASURE_SELECTORS object SHALL include a FOOTER selector
2. THE FOOTER selector SHALL match both `.print-footer` and `.mpr-print-footer` class names
3. THE FOOTER selector SHALL use the same dual-selector pattern as HEADER selector

### Requirement 2: 测量 Print Footer 元素

**User Story:** As a library user, I want the print-footer element to be measured, so that pagination correctly reserves space for the footer area.

#### Acceptance Criteria

1. WHEN measuring content, THE measureFooterInto function SHALL locate the print-footer element
2. THE measureFooterInto function SHALL measure the height of the print-footer element
3. THE measureFooterInto function SHALL create a MeasurableItem with type 'footer' for the print-footer element
4. IF no print-footer element is found, THEN THE function SHALL continue without error

### Requirement 3: 正确计算页脚总高度

**User Story:** As a library user, I want the total footer height to include both notes and page number areas, so that content does not overlap with the footer.

#### Acceptance Criteria

1. THE extractFooterHeight function SHALL return the total height of all footer items
2. THE total footer height SHALL include the print-footer element height
3. THE total footer height SHALL include any notes section heights
4. WHEN multiple footer items exist, THE function SHALL sum all their heights

### Requirement 4: 分页计算预留页脚空间

**User Story:** As a library user, I want pagination to reserve correct space for the footer, so that the last row of content is not cut off.

#### Acceptance Criteria

1. WHEN calculating page breaks, THE algorithm SHALL subtract footer height from available page height
2. THE available content height SHALL equal page height minus header height minus footer height
3. WHEN content approaches the footer boundary, THE algorithm SHALL create a new page
4. THE rendered pages SHALL NOT have content overlapping with the footer area

