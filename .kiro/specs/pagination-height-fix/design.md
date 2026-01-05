# Design Document

## Overview

本设计文档描述了分页高度计算的修复方案。核心问题是 `SmartPaginationStrategy.render()` 没有将 header 和 footer 高度传递给分页计算函数，导致内容溢出。

### 设计目标

1. **提取高度**: 从测量结果中提取 header 和 footer 高度
2. **过滤内容**: 将非内容项（header/footer/signature）从分页计算中排除
3. **正确传参**: 将提取的高度传递给 `calculatePageBreaks` 函数
4. **最小改动**: 只修改 `SmartPaginationStrategy`，不改动其他模块

### 当前问题分析

```typescript
// 当前 SmartPaginationStrategy.render 方法的问题
render(schema, data, options) {
  const measuredItems = this.measurementStrategy.measure(...)
  
  // ❌ 问题: headerHeight 和 footerHeight 都是 0
  const pageBreakResult = calculatePageBreaks(measuredItems, {
    pageHeight: this.getPageHeight(schema),
    repeatTableHeaders: true,
    // headerHeight: 0 (默认值)
    // footerHeight: 0 (默认值)
  })
}
```

### 修复方案

```typescript
// 修复后的实现
render(schema, data, options) {
  const measuredItems = this.measurementStrategy.measure(...)
  
  // ✅ 提取 header 和 footer 高度
  const headerHeight = this.extractHeaderHeight(measuredItems)
  const footerHeight = this.extractFooterHeight(measuredItems)
  
  // ✅ 过滤出内容项
  const contentItems = this.filterContentItems(measuredItems)
  
  // ✅ 传递正确的高度参数
  const pageBreakResult = calculatePageBreaks(contentItems, {
    pageHeight: this.getPageHeight(schema),
    headerHeight,
    footerHeight,
    repeatTableHeaders: true,
  })
}
```

## Architecture

### 数据流图

```
measurementStrategy.measure()
        │
        ▼
┌───────────────────────────────────────┐
│ MeasurableItem[] (all items)          │
│ - header items (type: 'header')       │
│ - section items (type: 'section')     │
│ - table items (type: 'table-*')       │
│ - footer items (type: 'footer')       │
│ - signature items (type: 'signature') │
└───────────────────────────────────────┘
        │
        ├──────────────────────────────────┐
        │                                  │
        ▼                                  ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│ extractHeaderHeight │    │ extractFooterHeight         │
│ → headerHeight (px) │    │ → footerHeight (px)         │
└─────────────────────┘    │   (footer + signature)      │
        │                  └─────────────────────────────┘
        │                                  │
        └──────────────────────────────────┤
                                           │
        ┌──────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ filterContentItems                    │
│ → contentItems (section + table only) │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ calculatePageBreaks(contentItems, {   │
│   pageHeight,                         │
│   headerHeight,  ← 新增               │
│   footerHeight,  ← 新增               │
│   repeatTableHeaders                  │
│ })                                    │
└───────────────────────────────────────┘
        │
        ▼
    PageBreakResult (正确分页)
```

## Components and Interfaces

### 新增辅助方法

```typescript
// 在 SmartPaginationStrategy 类中新增

/**
 * 从测量结果中提取 header 高度
 * @param items - 所有测量项
 * @returns header 高度（像素），如果没有 header 则返回 0
 */
private extractHeaderHeight(items: MeasurableItem[]): number {
  const headerItem = items.find(item => item.type === 'header')
  return headerItem?.height ?? 0
}

/**
 * 从测量结果中提取 footer 高度（包括 footer 和 signature）
 * @param items - 所有测量项
 * @returns footer 总高度（像素），如果没有则返回 0
 */
private extractFooterHeight(items: MeasurableItem[]): number {
  let totalHeight = 0
  for (const item of items) {
    if (item.type === 'footer' || item.type === 'signature') {
      totalHeight += item.height
    }
  }
  return totalHeight
}

/**
 * 过滤出内容项（排除 header、footer、signature）
 * @param items - 所有测量项
 * @returns 仅包含 section 和 table 相关项的数组
 */
private filterContentItems(items: MeasurableItem[]): MeasurableItem[] {
  return items.filter(item => 
    item.type === 'section' || 
    item.type === 'table-header' || 
    item.type === 'table-row'
  )
}
```

### 修改 render 方法

```typescript
render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
  // 1. 测量所有内容
  const measuredItems = options?.measuredItems ?? this.measurementStrategy.measure(
    schema,
    data,
    {
      minRowHeight: schema.pagination?.smartPagination?.minRowHeight ?? 8,
      pageHeight: this.getPageHeight(schema),
    }
  )
  
  // 2. 提取 header 和 footer 高度
  const headerHeight = this.extractHeaderHeight(measuredItems)
  const footerHeight = this.extractFooterHeight(measuredItems)
  
  // 3. 过滤出内容项
  const contentItems = this.filterContentItems(measuredItems)
  
  // 4. 计算分页（传递正确的高度参数）
  const pageBreakResult = calculatePageBreaks(contentItems, {
    pageHeight: this.getPageHeight(schema),
    headerHeight,
    footerHeight,
    repeatTableHeaders: schema.pagination?.display?.repeatTableHeaders ?? true,
  })

  // 5. 渲染分页 HTML
  return renderPaginatedHtml({
    schema,
    data,
    options: renderOptions,
    pageBreakResult,
    measuredItems,  // 传递原始测量项（包含所有类型）
    config: { 
      isolated: options?.isolated,
      showHeaderOnEachPage: schema.pagination?.display?.headerOnEachPage ?? true,
      showFooterOnEachPage: schema.pagination?.display?.footerOnEachPage ?? true,
      showSignatureOnEachPage: schema.pagination?.display?.signatureOnEachPage ?? false,
    },
  })
}
```

## Data Models

### MeasurableItem 类型回顾

```typescript
interface MeasurableItem {
  id: string
  type: 'header' | 'section' | 'table-header' | 'table-row' | 'footer' | 'signature'
  height: number
  tableId?: string
  dataIndex?: number
}
```

### 高度计算示例

假设测量结果如下：
- header: 80px
- section-0 (info-grid): 60px
- table-1-header: 30px
- table-1-row-0: 25px
- table-1-row-1: 25px
- ... (更多行)
- footer (notes): 20px
- signature: 40px

计算：
- headerHeight = 80px
- footerHeight = 20px + 40px = 60px
- contentItems = [section-0, table-1-header, table-1-row-0, ...]
- availableHeight = pageHeight - 80 - 60 = pageHeight - 140px

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Header Height Extraction

*For any* array of MeasurableItems containing exactly one header item with height H, `extractHeaderHeight` SHALL return H. *For any* array without header items, it SHALL return 0.

**Validates: Requirements 1.2, 1.4**

### Property 2: Footer Height Calculation

*For any* array of MeasurableItems containing footer and signature items with heights F1, F2, ..., Fn, `extractFooterHeight` SHALL return the sum F1 + F2 + ... + Fn. *For any* array without footer/signature items, it SHALL return 0.

**Validates: Requirements 2.2, 2.4**

### Property 3: Content Item Filtering

*For any* array of MeasurableItems, `filterContentItems` SHALL return only items where type is 'section', 'table-header', or 'table-row'. The returned array SHALL NOT contain items with type 'header', 'footer', or 'signature'.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 4: Page Break Parameters

*For any* call to `calculatePageBreaks` from `SmartPaginationStrategy.render()`, the options SHALL include `headerHeight` equal to the extracted header height and `footerHeight` equal to the extracted footer height.

**Validates: Requirements 1.3, 2.3**

### Property 5: Available Height Invariant

*For any* page in the pagination result, the total height of content items on that page SHALL NOT exceed (pageHeight - headerHeight - footerHeight).

**Validates: Requirements 3.1, 3.2**

## Error Handling

1. **缺少 header**: 如果测量结果中没有 header 项，使用 0 作为 headerHeight
2. **缺少 footer**: 如果测量结果中没有 footer/signature 项，使用 0 作为 footerHeight
3. **空内容**: 如果过滤后没有内容项，返回单页空结果

## Testing Strategy

### Unit Tests

1. **extractHeaderHeight**: 测试有/无 header 的情况
2. **extractFooterHeight**: 测试有/无 footer 和 signature 的各种组合
3. **filterContentItems**: 测试各种类型组合的过滤结果

### Property-Based Tests

使用 fast-check 进行属性测试，每个测试至少运行 100 次：

1. **Property 1**: 生成随机 MeasurableItem 数组，验证 header 高度提取正确
2. **Property 2**: 生成随机 footer/signature 项，验证总高度计算正确
3. **Property 3**: 生成随机项数组，验证过滤结果只包含内容类型
4. **Property 5**: 生成超过页面高度的内容，验证每页内容不超过可用高度

### Integration Tests

1. **端到端测试**: 使用 NewbornNursing 表单，验证多行数据正确分页
2. **回归测试**: 确保现有功能不受影响
