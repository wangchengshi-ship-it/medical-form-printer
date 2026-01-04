# Design Document

## Overview

本设计文档描述了 `medical-form-printer` 库的分页策略统一架构重构方案。使用 GoF 策略模式为两种核心分页功能提供统一接口，同时将现有算法文件移入对应策略目录，形成清晰的文件结构。

### 设计目标

1. **统一接口**: 定义 `PaginationStrategy` 接口，所有分页策略实现相同 API
2. **文件结构清晰**: 每种策略一个子目录，算法和适配器放在一起
3. **零算法修改**: 现有 `page-break-calculator.ts` 和 `overflow-handler.ts` 逻辑不变
4. **向后兼容**: 现有 API 继续可用，新接口作为补充

### 当前状态

基于代码库分析，部分工作已完成：
- ✅ `page-break-calculator.ts` 已移动到 `strategies/smart/`
- ✅ `overflow-handler.ts` 已移动到 `strategies/overflow/`
- ❌ `overflow-pagination.ts` 仍在根目录，需移动到 `strategies/overflow/`
- ❌ 策略接口 `PaginationStrategy` 未创建
- ❌ 策略适配器未创建
- ❌ `PaginationContext` 上下文类未创建
- ❌ 各目录 `index.ts` 导出文件未创建
- ❌ `SmartPagination.stories.ts` 未创建
- ❌ `CombinedPagination.stories.ts` 未创建

## Architecture

### 策略模式类图

```
┌─────────────────────────────────────────────────────────────┐
│                    PaginationStrategy                        │
│                      <<interface>>                           │
├─────────────────────────────────────────────────────────────┤
│ + name: string                                               │
│ + shouldApply(schema): boolean                               │
│ + render(schema, data, options): string                      │
└─────────────────────────────────────────────────────────────┘
                            △
                            │
            ┌───────────────┴───────────────┐
            │                               │
┌───────────────────────┐       ┌───────────────────────┐
│ SmartPaginationStrategy│       │OverflowPaginationStrategy│
├───────────────────────┤       ├───────────────────────┤
│ + shouldApply()       │       │ + shouldApply()       │
│ + render()            │       │ + render()            │
└───────────────────────┘       └───────────────────────┘
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ page-break-calculator │       │   overflow-handler    │
│   (existing logic)    │       │   (existing logic)    │
└───────────────────────┘       └───────────────────────┘
```

### 文件结构

```
src/pagination/
├── strategies/
│   ├── index.ts                              # 统一导出所有策略
│   ├── pagination-strategy.ts                # 接口定义 + PaginationContext
│   │
│   ├── smart/                                # 智能分页策略
│   │   ├── index.ts                          # 导出
│   │   ├── smart-pagination-strategy.ts      # 策略适配器
│   │   ├── page-break-calculator.ts          # 现有算法（已移入）
│   │   └── types.ts                          # 类型重导出
│   │
│   └── overflow/                             # 溢出分页策略
│       ├── index.ts                          # 导出
│       ├── overflow-pagination-strategy.ts   # 策略适配器
│       ├── overflow-handler.ts               # 现有算法（已移入）
│       ├── overflow-pagination.ts            # 现有渲染（需移入）
│       └── types.ts                          # 类型重导出
│
├── paginated-renderer.ts                     # 整合渲染器（更新 import 路径）
├── types.ts                                  # 类型定义
├── page-dimensions.ts                        # 页面尺寸
├── content-measurer.ts                       # 内容测量
└── index.ts                                  # 模块入口（更新导出）

stories/pagination/
├── SmartPagination.stories.ts                # 智能分页演示（新建）
└── OverflowPagination.stories.ts             # 溢出分页演示（已有，需更新）
```

## Components and Interfaces

### PaginationStrategy 接口

```typescript
// strategies/pagination-strategy.ts

import type { PrintSchema, FormData } from '../../types/print-schema'
import type { PaginationConfig, MeasurableItem, OverflowTextConfig } from '../types'

/** Extended PrintSchema with pagination configuration */
export interface PrintSchemaWithPagination extends PrintSchema {
  pagination?: PaginationConfig
}

/** Pagination render options */
export interface PaginationRenderOptions {
  isolated?: boolean
  measuredItems?: MeasurableItem[]
  textConfig?: Partial<OverflowTextConfig>
}

/**
 * Pagination strategy interface - Requirements 1.1-1.4
 */
export interface PaginationStrategy {
  readonly name: string
  shouldApply(schema: PrintSchemaWithPagination): boolean
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string
}
```

### PaginationContext 上下文

```typescript
// strategies/pagination-strategy.ts

/**
 * Pagination context - Requirements 4.1-4.4
 */
export class PaginationContext {
  private strategies: PaginationStrategy[]

  constructor(strategies: PaginationStrategy[]) {
    this.strategies = strategies
  }

  getApplicableStrategies(schema: PrintSchemaWithPagination): PaginationStrategy[] {
    return this.strategies.filter(s => s.shouldApply(schema))
  }

  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    const applicable = this.getApplicableStrategies(schema)
    if (applicable.length === 0) {
      return renderToIsolatedHtml(schema, data, options)
    }
    return applicable[0].render(schema, data, options)
  }
}
```

### SmartPaginationStrategy 适配器

```typescript
// strategies/smart/smart-pagination-strategy.ts

/**
 * Smart pagination strategy - Requirements 2.1-2.5
 */
export class SmartPaginationStrategy implements PaginationStrategy {
  readonly name = 'smart-pagination'

  shouldApply(schema: PrintSchemaWithPagination): boolean {
    return schema.pagination?.smartPagination?.enabled === true
  }

  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    const measuredItems = options?.measuredItems ?? this.estimateItems(schema)
    const pageBreakResult = calculatePageBreaks(measuredItems, {
      pageHeight: this.getPageHeight(schema),
      repeatTableHeaders: schema.pagination?.smartPagination?.repeatTableHeaders ?? true,
    })
    return renderPaginatedHtml({ schema, data, pageBreakResult, measuredItems, config: { isolated: options?.isolated } })
  }
}
```

### OverflowPaginationStrategy 适配器

```typescript
// strategies/overflow/overflow-pagination-strategy.ts

/**
 * Overflow pagination strategy - Requirements 3.1-3.5
 */
export class OverflowPaginationStrategy implements PaginationStrategy {
  readonly name = 'overflow-pagination'

  shouldApply(schema: PrintSchemaWithPagination): boolean {
    const fields = schema.pagination?.overflow?.fields
    return Array.isArray(fields) && fields.length > 0
  }

  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    return renderPaginatedHtml({
      schema, data,
      pageBreakResult: this.createSinglePageResult(),
      measuredItems: [],
      config: { isolated: options?.isolated, overflowText: options?.textConfig },
    })
  }

  private createSinglePageResult(): PageBreakResult {
    return { pages: [{ pageNumber: 1, isContinuation: false, items: [], repeatedHeaders: [] }], totalPages: 1 }
  }
}
```

## Data Models

### 策略执行流程

```
User calls render()
        │
        ▼
┌───────────────────┐
│ PaginationContext │
│ getApplicable()   │
└───────────────────┘
        │
        ▼
┌───────────────────┐     ┌───────────────────┐
│ SmartPagination   │ or  │ OverflowPagination│
│ Strategy          │     │ Strategy          │
└───────────────────┘     └───────────────────┘
        │                         │
        ▼                         ▼
┌───────────────────┐     ┌───────────────────┐
│ calculatePage     │     │ processOverflow   │
│ Breaks()          │     │ Fields()          │
└───────────────────┘     └───────────────────┘
        │                         │
        └──────────┬──────────────┘
                   ▼
        ┌───────────────────┐
        │ renderPaginated   │
        │ Html()            │
        └───────────────────┘
                   │
                   ▼
            HTML Output
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Strategy Interface Compliance

*For any* class implementing `PaginationStrategy`, the `name` property SHALL be a non-empty string, `shouldApply` SHALL return a boolean, and `render` SHALL return a non-empty string when given valid inputs.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Smart Pagination Strategy Applicability

*For any* schema with `pagination.smartPagination.enabled === true`, `SmartPaginationStrategy.shouldApply()` SHALL return `true`. *For any* schema without this config or with `enabled === false`, it SHALL return `false`.

**Validates: Requirements 2.5**

### Property 3: Overflow Pagination Strategy Applicability

*For any* schema with `pagination.overflow.fields` containing at least one field name, `OverflowPaginationStrategy.shouldApply()` SHALL return `true`. *For any* schema with empty or missing overflow fields, it SHALL return `false`.

**Validates: Requirements 3.5**

### Property 4: Context Strategy Selection Consistency

*For any* schema and set of strategies, `PaginationContext.getApplicableStrategies()` SHALL return exactly those strategies whose `shouldApply()` returns `true` for that schema, in the same order they were registered.

**Validates: Requirements 4.3**

## Error Handling

1. **No applicable strategy**: When no strategy applies, context falls back to default non-paginated rendering
2. **Missing measured items**: Smart pagination strategy estimates item heights when not provided
3. **Empty overflow fields**: Overflow strategy treats empty array as "not applicable"

## Testing Strategy

### Unit Tests

1. **Interface compliance tests**: Verify each strategy implements all interface methods
2. **shouldApply tests**: Test various config combinations for both strategies
3. **File structure tests**: Verify files are in correct locations

### Property-Based Tests

使用 fast-check 进行属性测试，每个测试至少运行 100 次：

1. **Property 1**: Generate random valid inputs, verify return types match interface
2. **Property 2**: Generate random configs with/without smartPagination.enabled
3. **Property 3**: Generate random configs with/without overflow.fields
4. **Property 4**: Generate random schemas, verify context selection matches individual shouldApply results

### Integration Tests

1. **Smart pagination rendering**: Verify table splits correctly across pages
2. **Overflow pagination rendering**: Verify text truncation and continuation
3. **Combined rendering**: Verify both strategies work together

## Migration Plan

### Step 1: Move overflow-pagination.ts
```bash
git mv src/pagination/overflow-pagination.ts src/pagination/strategies/overflow/
```

### Step 2: Create strategy interface and context
- Create `strategies/pagination-strategy.ts` with interface and context class

### Step 3: Create strategy adapters
- Create `strategies/smart/smart-pagination-strategy.ts`
- Create `strategies/overflow/overflow-pagination-strategy.ts`

### Step 4: Create index.ts exports
- Create `strategies/smart/index.ts`
- Create `strategies/overflow/index.ts`
- Create `strategies/index.ts`

### Step 5: Update import paths
- Update `paginated-renderer.ts` imports
- Update `src/pagination/index.ts` exports
- Update test file imports

### Step 6: Create Storybook stories
- Create `stories/pagination/SmartPagination.stories.ts`
- Update `stories/pagination/OverflowPagination.stories.ts`
- Create `stories/pagination/CombinedPagination.stories.ts`
