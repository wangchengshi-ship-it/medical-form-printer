# Requirements Document

## Introduction

本需求文档定义了 Smart Pagination（智能分页）功能的修复方案。

**当前问题：**
`SmartPaginationStrategy` 的 `render` 方法使用 `estimateItems` 来估算内容高度，但这个估算方法：
1. 不基于实际数据（如表格行数）
2. 不进行真实的 DOM 测量
3. 只是简单地假设每个 section 有固定高度

这导致分页算法无法正确计算分页点，表格内容无法正确分页。

**修复目标：**
- 在浏览器环境中，使用真实的 DOM 测量来获取内容高度
- 基于实际的表格数据行数来创建测量项
- 确保 `calculatePageBreaks` 算法能够正确工作
- 遵循高内聚原则，将测量逻辑封装为独立的组件
- 使用 GoF 策略模式，实现 DOM 测量策略

## Glossary

- **Smart_Pagination_Strategy**: 智能分页策略，负责将长表格自动分页到多个页面
- **Content_Measurer**: 内容测量器，用于测量 DOM 元素的实际高度
- **MeasurableItem**: 可测量项，包含元素 ID、类型和高度信息
- **Page_Break_Calculator**: 分页点计算器，根据测量项计算分页点
- **Measurement_Strategy**: 测量策略接口，定义统一的内容测量行为（GoF 策略模式）
- **DOM_Measurement_Strategy**: DOM 测量策略，在浏览器环境中进行真实 DOM 测量

## Requirements

### Requirement 1: 定义测量策略接口（GoF 策略模式）

**User Story:** As a library developer, I want a unified measurement strategy interface, so that measurement logic is decoupled from pagination logic.

#### Acceptance Criteria

1. THE Library SHALL define a `MeasurementStrategy` interface with `measure(schema, data, config): MeasurableItem[]` method
2. THE interface SHALL support DOM-based measurement implementation
3. THE `SmartPaginationStrategy` SHALL use `MeasurementStrategy` for content measurement (依赖注入)
4. THE measurement logic SHALL be decoupled from pagination logic (高内聚)

### Requirement 2: 基于实际数据创建测量项

**User Story:** As a library user, I want smart pagination to correctly measure table content, so that tables with many rows are properly paginated.

#### Acceptance Criteria

1. WHEN measuring content, THE Strategy SHALL create MeasurableItems based on actual table row count from data
2. WHEN creating MeasurableItems for a table, THE Strategy SHALL create one item for the table header and one item for each data row
3. THE Strategy SHALL use the `dataField` from table config to look up actual row data
4. IF the data field contains N rows, THEN the Strategy SHALL create N table-row MeasurableItems

### Requirement 3: 实现 DOM 测量策略

**User Story:** As a library user, I want smart pagination to measure actual rendered heights in browser, so that pagination is accurate for variable-height content.

#### Acceptance Criteria

1. THE `DomMeasurementStrategy` SHALL render content to a hidden DOM container for measurement
2. THE Strategy SHALL use existing `createContentMeasurer` to measure actual element heights
3. WHEN measuring table rows, THE Strategy SHALL measure each row's actual rendered height
4. THE Strategy SHALL clean up the measurement container after measurement is complete
5. WHEN running in non-browser environment, THE Strategy SHALL throw descriptive error

### Requirement 4: 正确传递测量项到分页算法

**User Story:** As a library user, I want the pagination algorithm to receive correct measurement data.

#### Acceptance Criteria

1. THE Strategy SHALL pass all MeasurableItems to `calculatePageBreaks` function
2. THE Strategy SHALL pass correct page height based on page dimensions
3. THE Strategy SHALL respect `repeatTableHeaders` configuration
4. WHEN `calculatePageBreaks` returns multiple pages, THE rendered HTML SHALL contain multiple pages

### Requirement 5: 废弃旧的估算方法

**User Story:** As a library developer, I want deprecated code to be clearly marked, so that future maintainers know which code should not be used.

#### Acceptance Criteria

1. THE `estimateItems` method in `SmartPaginationStrategy` SHALL be marked with `@deprecated` JSDoc annotation
2. THE deprecation notice SHALL include the reason for deprecation and the recommended alternative
3. THE deprecation notice SHALL include the version when it was deprecated
4. THE deprecated method SHALL remain functional for backward compatibility but not be used internally
