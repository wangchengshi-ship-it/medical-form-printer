# Requirements Document

## Introduction

本需求文档定义了 Smart Pagination 第一页空白问题的修复方案。

**当前问题：**
在 Smart Pagination 的 "14 Rows (2 Pages)" 示例中，第一页显示为空白，只有标题和页码。

**根本原因分析：**
1. `measureAll` 函数返回的测量项 ID 格式为 `info-grid-0`、`section-title-0` 等
2. `buildSectionMap` 函数创建的映射 key 格式为 `section-0`、`section-1` 等
3. 这两个 ID 格式不匹配，导致 `renderContentItem` 无法找到对应的 section
4. 根本原因是缺乏统一的内容标识策略

**设计原则：**
- **高内聚**：内容标识逻辑集中管理，与系统现有的 `PrintSection` 概念保持一致
- **统一性**：测量和渲染组件使用相同的标识策略
- **可追溯性**：ID 应该能够明确标识内容在 `PrintSchema.sections` 数组中的位置
- **向后兼容**：修复不应破坏现有功能

## Glossary

- **PrintSection**: 打印布局中的一个内容区块，定义在 `PrintSchema.sections` 数组中。每个 section 有一个类型（如 `info-grid`、`table`、`checkbox-grid`）和对应的配置。
- **MeasurableItem**: 可测量的内容项，用于分页计算。包含 ID、类型和高度信息。`type` 字段标识内容类型（`section`、`table-header`、`table-row` 等）。
- **Section_Index**: `PrintSection` 在 `PrintSchema.sections` 数组中的索引位置（从 0 开始）。这是系统中标识 section 的唯一方式。
- **Content_Identifier**: 内容标识符，用于在测量和渲染之间建立映射关系。格式为 `section-{index}`，其中 `index` 是 Section_Index。

## Requirements

### Requirement 1: 统一内容标识策略

**User Story:** As a library developer, I want a unified content identification strategy, so that measurement and rendering components can correctly map content items.

#### Acceptance Criteria

1. THE System SHALL use `section-{index}` format as the canonical identifier for all `PrintSection` items
2. THE `index` in the identifier SHALL correspond to the section's position in `PrintSchema.sections` array
3. THE `measureAll` function SHALL generate IDs using this unified format for section-type items
4. THE `buildSectionMap` function SHALL use the same format for map keys (already implemented)
5. THE identifier format SHALL be documented in code comments for future maintainability

### Requirement 2: 更新内容测量器

**User Story:** As a library developer, I want the content measurer to use the unified identifier format, so that measured items can be correctly mapped to sections.

#### Acceptance Criteria

1. WHEN measuring a section at index N in `PrintSchema.sections`, THE ID SHALL be `section-N`
2. THE measurement SHALL preserve the section's original index regardless of section type
3. THE `measureAll` function SHALL maintain existing behavior for table-header and table-row items
4. THE table-related items SHALL continue to use `table-{dataField}` format for `tableId`

### Requirement 3: 正确渲染分页内容

**User Story:** As a library user, I want each page to correctly render its assigned content, so that the first page is not blank.

#### Acceptance Criteria

1. WHEN rendering a page, THE System SHALL correctly map measured item IDs to actual section content
2. THE `contentRenderers.section` function SHALL find the correct section using the unified ID
3. WHEN a section is found, THE System SHALL render it with its title
4. THE first page SHALL display all content that fits within the page height

### Requirement 4: 保持向后兼容性

**User Story:** As a library developer, I want the fix to be backward compatible, so that existing functionality is not broken.

#### Acceptance Criteria

1. THE fix SHALL not change the public API
2. THE fix SHALL not break existing overflow field pagination
3. THE fix SHALL not break existing non-smart pagination scenarios
4. THE existing tests SHALL continue to pass
5. THE table row and header IDs SHALL remain compatible with existing pagination logic

