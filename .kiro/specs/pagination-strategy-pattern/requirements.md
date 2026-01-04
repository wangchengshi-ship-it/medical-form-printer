# Requirements Document

## Introduction

本需求文档定义了 `medical-form-printer` 库的**分页策略统一架构**重构。

**现有实现（已完成，无需修改算法）：**
1. **表格智能分页**: `page-break-calculator.ts` - 通过建立隐藏整表测量高度，计算分页点，将表格行拆分到不同页面
2. **溢出字段分页**: `overflow-handler.ts` + `overflow-pagination.ts` - 将长文本字段拆分，第一页只显示第一行+续见附页标记，续页从第二行开始显示剩余内容

**重构目标：**
- 不修改现有算法实现
- 使用 GoF 策略模式为这两种分页提供**统一的接口抽象**
- 文件结构平齐、深度一致，一眼看出两种策略的平行关系
- 便于 Storybook 演示和未来扩展新的分页策略

**目标文件结构：**
```
src/pagination/
├── strategies/
│   ├── index.ts                              # 统一导出
│   ├── pagination-strategy.ts                # 抽象接口定义
│   ├── smart/                                # 智能分页策略
│   │   ├── index.ts
│   │   ├── smart-pagination-strategy.ts      # 策略适配器
│   │   └── page-break-calculator.ts          # 现有算法（移入）
│   └── overflow/                             # 溢出分页策略
│       ├── index.ts
│       ├── overflow-pagination-strategy.ts   # 策略适配器
│       ├── overflow-handler.ts               # 现有算法（移入）
│       └── overflow-pagination.ts            # 现有渲染（移入）
├── paginated-renderer.ts                     # 整合渲染器（保留，依赖两种策略）
├── types.ts                                  # 类型定义（保留）
├── page-dimensions.ts                        # 页面尺寸（保留）
├── content-measurer.ts                       # 内容测量（保留）
└── index.ts                                  # 模块入口（更新导出路径）

stories/pagination/
├── SmartPagination.stories.ts                # 智能分页演示（新建）
└── OverflowPagination.stories.ts             # 溢出分页演示（已有）
```

## Glossary

- **Pagination_Strategy**: 分页策略接口，定义统一的分页行为抽象
- **Smart_Pagination_Strategy**: 智能分页策略适配器，封装 `page-break-calculator.ts` 的现有实现
- **Overflow_Pagination_Strategy**: 溢出分页策略适配器，封装 `overflow-handler.ts` 的现有实现
- **Pagination_Context**: 策略上下文，管理策略选择和执行

## Requirements

### Requirement 1: 定义统一的分页策略接口

**User Story:** As a library developer, I want a unified pagination strategy interface, so that different pagination implementations can be used through the same API.

#### Acceptance Criteria

1. THE Library SHALL define a `PaginationStrategy` interface in `strategies/pagination-strategy.ts`
2. THE interface SHALL have `name: string` property identifying the strategy
3. THE interface SHALL have `shouldApply(schema, config): boolean` method to check if strategy applies
4. THE interface SHALL have `render(schema, data, options): string` method returning rendered HTML
5. THE interface SHALL NOT require changes to existing algorithm implementations

### Requirement 2: 创建智能分页策略适配器

**User Story:** As a library developer, I want to wrap the existing smart pagination logic in a strategy adapter.

#### Acceptance Criteria

1. THE `SmartPaginationStrategy` SHALL be in `strategies/smart/smart-pagination-strategy.ts`
2. THE `page-break-calculator.ts` SHALL be moved to `strategies/smart/` directory
3. THE adapter SHALL implement `PaginationStrategy` interface
4. THE adapter SHALL delegate to existing `calculatePageBreaks` function
5. WHEN `pagination.smartPagination.enabled` is true, THE `shouldApply` method SHALL return true

### Requirement 3: 创建溢出字段分页策略适配器

**User Story:** As a library developer, I want to wrap the existing overflow pagination logic in a strategy adapter.

#### Acceptance Criteria

1. THE `OverflowPaginationStrategy` SHALL be in `strategies/overflow/overflow-pagination-strategy.ts`
2. THE `overflow-handler.ts` and `overflow-pagination.ts` SHALL be moved to `strategies/overflow/` directory
3. THE adapter SHALL implement `PaginationStrategy` interface
4. THE adapter SHALL delegate to existing `processOverflowFields` and rendering functions
5. WHEN `pagination.overflow.fields` contains field names, THE `shouldApply` method SHALL return true

### Requirement 4: 实现策略上下文

**User Story:** As a library user, I want a context class that manages strategy selection and execution.

#### Acceptance Criteria

1. THE `PaginationContext` SHALL be in `strategies/pagination-strategy.ts`
2. THE context SHALL accept a list of strategies in constructor
3. THE context SHALL provide `getApplicableStrategies(schema)` method
4. THE context SHALL provide `render(schema, data, options)` method that executes applicable strategies

### Requirement 5: 创建 Storybook 演示故事

**User Story:** As a library user, I want to see each pagination type demonstrated in Storybook with realistic data.

#### Acceptance Criteria

1. THE Library SHALL provide `SmartPagination.stories.ts` showing table auto-pagination with 14+ rows
2. THE existing `OverflowPagination.stories.ts` SHALL be updated to use strategy interface
3. EACH story SHALL use the unified strategy interface for rendering
4. EACH story SHALL display realistic medical form data

