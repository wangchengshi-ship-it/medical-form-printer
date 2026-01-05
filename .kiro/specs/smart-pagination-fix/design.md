# Design Document

## Overview

本设计文档描述了 Smart Pagination 功能的修复方案。使用 GoF 策略模式将测量逻辑从分页逻辑中解耦，实现高内聚的设计。

### 设计目标

1. **GoF 策略模式**: 定义 `MeasurementStrategy` 接口，实现 DOM 测量
2. **高内聚**: 测量逻辑封装在独立的策略类中，与分页逻辑解耦
3. **依赖注入**: `SmartPaginationStrategy` 通过构造函数接收测量策略
4. **仅 DOM 测量**: 只支持浏览器环境的真实 DOM 测量，不使用估算
5. **向后兼容**: 废弃的方法保留但标记 `@deprecated`

### 当前问题分析

```typescript
// 当前 SmartPaginationStrategy.render 方法的问题
render(schema, data, options) {
  // ❌ 问题1: estimateItems 不基于实际数据
  const measuredItems = options?.measuredItems ?? this.estimateItems(schema)
  
  // ❌ 问题2: estimateItems 只是简单估算，不进行 DOM 测量
  // 导致 calculatePageBreaks 无法正确计算分页点
}
```

## Architecture

### 策略模式类图

```
┌─────────────────────────────────────────────────────────────┐
│                   MeasurementStrategy                        │
│                      <<interface>>                           │
├─────────────────────────────────────────────────────────────┤
│ + measure(schema, data, config): MeasurableItem[]           │
└─────────────────────────────────────────────────────────────┘
                            △
                            │
┌───────────────────────────────────────────────────────────┐
│              DomMeasurementStrategy                        │
├───────────────────────────────────────────────────────────┤
│ + measure()                                                │
│ - renderToHiddenContainer()                                │
│ - measureElements()                                        │
│ - cleanup()                                                │
└───────────────────────────────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│              createContentMeasurer                         │
│              (existing module)                             │
└───────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                SmartPaginationStrategy                       │
├─────────────────────────────────────────────────────────────┤
│ - measurementStrategy: MeasurementStrategy                  │
├─────────────────────────────────────────────────────────────┤
│ + constructor(strategy?: MeasurementStrategy)               │
│ + render(schema, data, options): string                     │
│ + shouldApply(schema): boolean                              │
│ - @deprecated estimateItems(schema): MeasurableItem[]       │
└─────────────────────────────────────────────────────────────┘
```

### 文件结构

```
src/pagination/strategies/smart/
├── index.ts                          # 导出
├── smart-pagination-strategy.ts      # 策略适配器（修改）
├── page-break-calculator.ts          # 现有算法（不变）
├── measurement-strategy.ts           # 新增：测量策略接口
└── dom-measurement-strategy.ts       # 新增：DOM 测量策略
```

## Components and Interfaces

### MeasurementStrategy 接口

```typescript
// strategies/smart/measurement-strategy.ts

import type { PrintSchemaWithPagination } from '../pagination-strategy'
import type { FormData } from '../../../types/print-schema'
import type { MeasurableItem } from '../../types'

/**
 * Measurement configuration
 */
export interface MeasurementConfig {
  /** Minimum row height in mm (for fallback) */
  minRowHeight: number
  /** Page height in pixels */
  pageHeight: number
}

/**
 * Measurement strategy interface (GoF Strategy Pattern)
 * @requirements 1.1, 1.2 - Unified measurement interface
 */
export interface MeasurementStrategy {
  /**
   * Measure content and return measurable items
   * @param schema - Print schema with pagination config
   * @param data - Form data containing table rows
   * @param config - Measurement configuration
   * @returns Array of measurable items with heights
   */
  measure(
    schema: PrintSchemaWithPagination,
    data: FormData,
    config: MeasurementConfig
  ): MeasurableItem[]
}
```

### DomMeasurementStrategy 实现

```typescript
// strategies/smart/dom-measurement-strategy.ts

import type { MeasurementStrategy, MeasurementConfig } from './measurement-strategy'
import type { PrintSchemaWithPagination } from '../pagination-strategy'
import type { FormData } from '../../../types/print-schema'
import type { MeasurableItem } from '../../types'
import { createContentMeasurer, isBrowserEnvironment } from '../../content-measurer'
import { renderToIsolatedHtml } from '../../../renderer/isolated-html-renderer'

/**
 * DOM-based measurement strategy
 * Renders content to hidden container and measures actual heights
 * @requirements 3.1, 3.2, 3.3, 3.4 - DOM measurement implementation
 */
export class DomMeasurementStrategy implements MeasurementStrategy {
  measure(
    schema: PrintSchemaWithPagination,
    data: FormData,
    config: MeasurementConfig
  ): MeasurableItem[] {
    // Ensure browser environment
    if (!isBrowserEnvironment()) {
      throw new Error(
        'DomMeasurementStrategy requires browser environment. ' +
        'Smart pagination is only available in browser.'
      )
    }

    // 1. Create hidden measurement container
    const measurer = createContentMeasurer({
      containerWidth: this.getContainerWidth(schema),
    })

    try {
      // 2. Render content to temporary container (without pagination)
      const tempHtml = renderToIsolatedHtml(schema, data)
      const tempContainer = this.createTempContainer(tempHtml)
      document.body.appendChild(tempContainer)

      try {
        // 3. Measure all elements using existing measurer
        const items = measurer.measureAll(tempContainer)
        
        // 4. Validate items match actual data
        return this.validateItems(items, schema, data)
      } finally {
        // 5. Cleanup temp container
        document.body.removeChild(tempContainer)
      }
    } finally {
      // 6. Cleanup measurer
      measurer.cleanup()
    }
  }

  private getContainerWidth(schema: PrintSchemaWithPagination): number {
    // Calculate container width based on page size
    // Default to 16K page width minus margins
    return 624 // pixels
  }

  private createTempContainer(html: string): HTMLDivElement {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.visibility = 'hidden'
    container.innerHTML = html
    return container
  }

  private validateItems(
    items: MeasurableItem[],
    schema: PrintSchemaWithPagination,
    data: FormData
  ): MeasurableItem[] {
    // Ensure we have items for all table rows in data
    // This handles cases where DOM measurement might miss some elements
    return items
  }
}
```

### 更新 SmartPaginationStrategy

```typescript
// strategies/smart/smart-pagination-strategy.ts

import type { MeasurementStrategy } from './measurement-strategy'
import { DomMeasurementStrategy } from './dom-measurement-strategy'

/**
 * Smart pagination strategy with dependency injection
 * @requirements 1.3 - Use MeasurementStrategy for measurement
 */
export class SmartPaginationStrategy implements PaginationStrategy {
  readonly name = 'smart-pagination'
  private measurementStrategy: MeasurementStrategy

  /**
   * Constructor with optional measurement strategy injection
   * @param measurementStrategy - Custom measurement strategy (defaults to DomMeasurementStrategy)
   */
  constructor(measurementStrategy?: MeasurementStrategy) {
    this.measurementStrategy = measurementStrategy ?? new DomMeasurementStrategy()
  }

  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    // Use injected measurement strategy for DOM measurement
    const measuredItems = options?.measuredItems ?? this.measurementStrategy.measure(
      schema,
      data,
      {
        minRowHeight: schema.pagination?.smartPagination?.minRowHeight ?? 8,
        pageHeight: this.getPageHeight(schema),
      }
    )

    // Calculate page breaks using existing algorithm
    const pageBreakResult = calculatePageBreaks(measuredItems, {
      pageHeight: this.getPageHeight(schema),
      repeatTableHeaders: schema.pagination?.display?.repeatTableHeaders ?? true,
    })

    // Render paginated HTML
    return renderPaginatedHtml({
      schema,
      data,
      pageBreakResult,
      measuredItems,
      config: { isolated: options?.isolated },
    })
  }

  /**
   * @deprecated Since v1.4.0. Use DomMeasurementStrategy instead.
   * This method only provides rough estimates and does not measure actual DOM heights.
   * Will be removed in v2.0.0.
   * 
   * @see {@link DomMeasurementStrategy} - For accurate DOM-based measurement
   * 
   * @param schema - Print schema
   * @returns Estimated measurable items (inaccurate)
   */
  private estimateItems(schema: PrintSchemaWithPagination): MeasurableItem[] {
    // Keep existing implementation for backward compatibility
    // This method is no longer used internally
    const items: MeasurableItem[] = []
    const minRowHeight = schema.pagination?.smartPagination?.minRowHeight ?? 8
    const mmToPixels = (mm: number) => (mm * 96) / 25.4
    const estimatedSectionHeight = mmToPixels(minRowHeight * 3)

    schema.sections.forEach((section, index) => {
      const sectionId = `section-${index}`
      items.push({
        id: sectionId,
        type: 'section',
        height: estimatedSectionHeight,
      })
    })

    return items
  }
}
```

## Data Models

### 测量流程

```
User calls SmartPaginationStrategy.render()
        │
        ▼
┌───────────────────────────────────────┐
│ Check if measuredItems provided       │
│ in options                            │
└───────────────────────────────────────┘
        │
        ▼ (not provided)
┌───────────────────────────────────────┐
│ DomMeasurementStrategy.measure()      │
│ - Render to hidden container          │
│ - Measure actual DOM heights          │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ MeasurableItem[] with actual heights  │
│ - 1 header item per table             │
│ - N row items per table (N = data.length)│
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ calculatePageBreaks(items, options)   │
│ - Existing algorithm unchanged        │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ PageBreakResult with multiple pages   │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ renderPaginatedHtml()                 │
│ - Render each page                    │
└───────────────────────────────────────┘
        │
        ▼
    HTML Output (multiple pages)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: MeasurementStrategy Interface Compliance

*For any* implementation of `MeasurementStrategy`, calling `measure(schema, data, config)` SHALL return an array of `MeasurableItem` objects, where each item has a valid `id`, `type`, and positive `height`.

**Validates: Requirements 1.1, 1.2**

### Property 2: Item Count Matches Data

*For any* schema with a table section and data containing N rows in the table's dataField, the measurement SHALL produce exactly 1 table-header item and N table-row items for that table.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Custom Strategy Override

*For any* `SmartPaginationStrategy` constructed with a custom `MeasurementStrategy`, calling `render()` SHALL use the provided strategy instead of the default `DomMeasurementStrategy`.

**Validates: Requirements 1.3**

### Property 4: Multi-Page Rendering

*For any* schema and data where the total measured height exceeds the available page height, the rendered HTML SHALL contain multiple `.print-page` elements.

**Validates: Requirements 6.4**

## Error Handling

1. **Non-browser environment**: When `DomMeasurementStrategy` is used in non-browser environment, throw descriptive error with message explaining smart pagination requires browser
2. **Missing data field**: When table's dataField is not found in data, treat as empty table (0 rows)
3. **Invalid measurement**: When DOM measurement returns 0 or negative height, log warning and skip item

## Testing Strategy

### Unit Tests

1. **Interface compliance tests**: Verify DomMeasurementStrategy implements interface correctly
2. **Item count tests**: Verify correct number of items for various data sizes
3. **Error handling tests**: Verify proper error in non-browser environment

### Property-Based Tests

使用 fast-check 进行属性测试，每个测试至少运行 100 次：

1. **Property 1**: Generate random schemas and data, verify all returned items have valid structure
2. **Property 2**: Generate random table data with N rows, verify item count is 1 + N
3. **Property 3**: Create mock strategy, verify it's called instead of default
4. **Property 4**: Generate data that exceeds page height, verify multiple pages in output

### Integration Tests

1. **DOM measurement**: In browser environment, verify actual heights are measured
2. **End-to-end pagination**: Verify tables with 14+ rows produce multiple pages
