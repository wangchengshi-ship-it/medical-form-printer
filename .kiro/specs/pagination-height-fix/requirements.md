# Requirements Document

## Introduction

本需求文档定义了分页高度计算的修复方案。

**当前问题：**
`SmartPaginationStrategy.render()` 调用 `calculatePageBreaks()` 时，没有传递 `headerHeight` 和 `footerHeight` 参数，导致：
1. 分页计算时没有为页面 header 和 footer 预留空间
2. 续页的内容高度计算不准确
3. 内容溢出页面边界

**修复目标：**
- 从测量结果中提取 header 和 footer 的高度
- 将这些高度传递给 `calculatePageBreaks` 函数
- 确保每页都正确预留 header 和 footer 空间

## Glossary

- **Smart_Pagination_Strategy**: 智能分页策略，负责将长表格自动分页到多个页面
- **Page_Break_Calculator**: 分页点计算器，根据测量项和页面尺寸计算分页点
- **Header_Height**: 页面头部高度，包括医院名称、科室名称、表单标题等
- **Footer_Height**: 页面底部高度，包括页码、备注等
- **MeasurableItem**: 可测量项，包含元素 ID、类型和高度信息

## Requirements

### Requirement 1: 从测量结果中提取 Header 高度

**User Story:** As a library user, I want pagination to correctly account for header height, so that content does not overflow into the header area.

#### Acceptance Criteria

1. WHEN measuring content, THE Strategy SHALL identify items with type 'header'
2. THE Strategy SHALL extract the height of header items from measured results
3. THE Strategy SHALL pass the header height to `calculatePageBreaks` function
4. IF no header item is found, THEN THE Strategy SHALL use 0 as header height

### Requirement 2: 从测量结果中提取 Footer 高度

**User Story:** As a library user, I want pagination to correctly account for footer height, so that content does not overflow into the footer area.

#### Acceptance Criteria

1. WHEN measuring content, THE Strategy SHALL identify items with type 'footer' or 'signature'
2. THE Strategy SHALL calculate total footer height from footer and signature items
3. THE Strategy SHALL pass the footer height to `calculatePageBreaks` function
4. IF no footer items are found, THEN THE Strategy SHALL use 0 as footer height

### Requirement 3: 正确计算可用内容高度

**User Story:** As a library user, I want each page to have correct available content height, so that tables are paginated accurately.

#### Acceptance Criteria

1. THE available content height SHALL equal page height minus header height minus footer height
2. WHEN content exceeds available height, THE Strategy SHALL create a new page
3. WHEN rendering continuation pages, THE Strategy SHALL reserve space for repeated headers
4. THE rendered pages SHALL NOT have content overflow

### Requirement 4: 过滤非内容项

**User Story:** As a library developer, I want header and footer items to be excluded from content pagination, so that they are not double-counted.

#### Acceptance Criteria

1. WHEN passing items to `calculatePageBreaks`, THE Strategy SHALL exclude header items
2. WHEN passing items to `calculatePageBreaks`, THE Strategy SHALL exclude footer items
3. WHEN passing items to `calculatePageBreaks`, THE Strategy SHALL exclude signature items
4. THE Strategy SHALL only pass section and table items to pagination algorithm
