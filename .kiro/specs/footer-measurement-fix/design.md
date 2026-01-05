# Design Document: Footer Measurement Fix

## Overview

本设计文档描述了修复页脚测量问题的技术方案。当前 `measureFooterInto` 函数只测量 `notes` 元素，没有测量 `print-footer` 元素（包含页码），导致分页计算时没有为页脚区域预留空间。

修复方案包括：
1. 在 `MEASURE_SELECTORS` 中添加 `FOOTER` 选择器
2. 修改 `measureFooterInto` 函数以测量 `print-footer` 元素
3. 确保页脚高度被正确传递给分页算法

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Smart Pagination Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DomMeasurementStrategy.measure()                        │
│     └── createContentMeasurer().measureAll()                │
│         ├── measureHeaderInto()  → header items             │
│         ├── measureSectionsInto() → section/table items     │
│         ├── measureFooterInto()  → footer items  ◄── FIX   │
│         └── measureSignaturesInto() → signature items       │
│                                                              │
│  2. SmartPaginationStrategy.render()                        │
│     ├── extractHeaderHeight(items) → headerHeight           │
│     ├── extractFooterHeight(items) → footerHeight  ◄── OK  │
│     ├── filterContentItems(items) → contentItems            │
│     └── calculatePageBreaks(contentItems, {                 │
│           pageHeight,                                        │
│           headerHeight,                                      │
│           footerHeight  ◄── Now includes print-footer       │
│         })                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. MEASURE_SELECTORS (measurer-types.ts)

添加 `FOOTER` 选择器：

```typescript
export const MEASURE_SELECTORS = {
  /** Header selector - matches .print-header and .mpr-print-header */
  HEADER: createDualSelector(['print-header']),
  /** Footer selector - matches .print-footer and .mpr-print-footer */
  FOOTER: createDualSelector(['print-footer']),  // NEW
  // ... existing selectors
}
```

### 2. measureFooterInto (content-measurer.ts)

修改函数以测量 `print-footer` 元素：

```typescript
/**
 * Measure footer elements and push results to array
 * Includes both print-footer (page number) and notes sections
 * @param pageContainer - Page container element (for print-footer)
 * @param printBody - Print body container element (for notes)
 * @param results - Array to push measurement results into
 */
function measureFooterInto(
  pageContainer: HTMLElement,
  printBody: Element,
  results: MeasurableItem[]
): void {
  // Measure print-footer element (contains page number)
  const footer = pageContainer.querySelector(MEASURE_SELECTORS.FOOTER)
  if (footer) {
    results.push({
      id: 'page-footer',
      type: 'footer',
      height: footer.getBoundingClientRect().height,
    })
  }

  // Measure notes sections (existing logic)
  const notes = printBody.querySelectorAll(MEASURE_SELECTORS.NOTES)
  notes.forEach((note, index) => {
    results.push({
      id: `notes-${index}`,
      type: 'footer',
      height: note.getBoundingClientRect().height,
    })
  })
}
```

### 3. measureAll 函数调用更新

更新 `measureAll` 函数中对 `measureFooterInto` 的调用：

```typescript
// 3. Measure footer (print-footer + notes)
if (measureFooter) {
  measureFooterInto(pageContainer, printBody, results)  // Pass pageContainer
}
```

## Data Models

### MeasurableItem (existing)

```typescript
interface MeasurableItem {
  id: string
  type: 'header' | 'section' | 'table-header' | 'table-row' | 'footer' | 'signature'
  height: number
  tableId?: string
  dataIndex?: number
}
```

页脚相关的 MeasurableItem：
- `{ id: 'page-footer', type: 'footer', height: number }` - print-footer 元素
- `{ id: 'notes-0', type: 'footer', height: number }` - notes 元素

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: FOOTER selector matches both class name variants

*For any* DOM element with class `print-footer` or `mpr-print-footer`, the `MEASURE_SELECTORS.FOOTER` selector SHALL match that element.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: measureFooterInto returns footer items for print-footer elements

*For any* DOM container that contains a `print-footer` element, calling `measureFooterInto` SHALL produce a MeasurableItem with `type: 'footer'` and a positive height.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: extractFooterHeight returns sum of all footer item heights

*For any* array of MeasurableItems containing footer items, `extractFooterHeight` SHALL return the sum of all items where `type === 'footer'`.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Available content height equals page height minus header and footer heights

*For any* pagination calculation, the available content height SHALL equal `pageHeight - headerHeight - footerHeight`.

**Validates: Requirements 4.1, 4.2**

### Property 5: Content on each page does not exceed available height

*For any* paginated result, the total content height on each page (excluding header and footer) SHALL NOT exceed the available content height.

**Validates: Requirements 4.3, 4.4**

## Error Handling

1. **Missing print-footer element**: 如果 DOM 中没有 `print-footer` 元素，函数应继续执行而不报错，只是不添加 footer item。

2. **Zero height footer**: 如果 `print-footer` 元素高度为 0（可能是隐藏的），应该跳过该元素或记录警告。

3. **Non-browser environment**: `measureFooterInto` 只在浏览器环境中工作，Node.js 环境需要使用 Puppeteer。

## Testing Strategy

### Unit Tests

1. **MEASURE_SELECTORS.FOOTER 存在性测试**
   - 验证 `MEASURE_SELECTORS.FOOTER` 已定义
   - 验证选择器字符串包含 `.print-footer` 和 `.mpr-print-footer`

2. **measureFooterInto 边界情况测试**
   - 测试没有 print-footer 元素时不报错
   - 测试有 print-footer 但高度为 0 时的处理

### Property-Based Tests

使用 fast-check 进行属性测试：

1. **Property 3: extractFooterHeight sum property**
   - 生成随机的 MeasurableItem 数组
   - 验证 extractFooterHeight 返回所有 footer 项高度之和

2. **Property 5: Content height invariant**
   - 生成随机的内容项和页面配置
   - 验证每页内容高度不超过可用高度

### Integration Tests

1. **端到端分页测试**
   - 创建包含页脚的完整 schema
   - 验证分页结果中内容不与页脚重叠

