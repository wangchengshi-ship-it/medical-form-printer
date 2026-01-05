# Design Document

## Overview

本设计文档描述了 Smart Pagination 第一页空白问题的修复方案。

### 问题分析

当前系统中存在 ID 格式不匹配的问题：

```typescript
// measureAll 返回的 ID 格式
{ id: 'info-grid-0', type: 'section', height: 100 }
{ id: 'section-title-0', type: 'section', height: 30 }

// buildSectionMap 创建的 key 格式
map.set('section-0', infoGridSection)
map.set('section-1', tableSection)

// renderContentItem 尝试查找
sectionMap.get('info-grid-0')  // ❌ 返回 undefined
```

### 修复方案

统一使用 `section-{index}` 格式作为内容标识符：

```typescript
// 修复后 measureAll 返回的 ID 格式
{ id: 'section-0', type: 'section', height: 100 }  // info-grid
{ id: 'section-1', type: 'section', height: 30 }   // table (section-title)

// buildSectionMap 创建的 key 格式（不变）
map.set('section-0', infoGridSection)
map.set('section-1', tableSection)

// renderContentItem 现在可以正确查找
sectionMap.get('section-0')  // ✅ 返回 infoGridSection
```

## Architecture

### 修改范围

```
src/pagination/
├── content-measurer.ts      # 修改：更新 measureAll 函数的 ID 生成逻辑
├── measurer-types.ts        # 不变
├── paginated-renderer.ts    # 不变（buildSectionMap 已使用正确格式）
└── types.ts                 # 不变
```

### 数据流

```
PrintSchema.sections
        │
        ▼
┌───────────────────────────────────────┐
│ measureAll (content-measurer.ts)      │
│ - 遍历 DOM 元素                        │
│ - 生成 MeasurableItem[]               │
│ - ID 格式: section-{index}            │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ calculatePageBreaks                   │
│ - 计算分页点                           │
│ - 返回 PageBreakResult                │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ buildSectionMap                       │
│ - 创建 section ID -> PrintSection 映射│
│ - Key 格式: section-{index}           │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ renderContentItem                     │
│ - 使用 item.id 查找 section           │
│ - sectionMap.get('section-0') ✅      │
└───────────────────────────────────────┘
```

## Components and Interfaces

### measureAll 函数修改

当前实现中，`measureAll` 为不同类型的 section 生成不同格式的 ID：

```typescript
// 当前实现（问题代码）
const infoGridWrappers = printBody.querySelectorAll(MEASURE_SELECTORS.INFO_GRID_WRAPPER)
infoGridWrappers.forEach((wrapper, index) => {
  results.push({
    id: `info-grid-${index}`,  // ❌ 格式不匹配
    type: 'section',
    height: rect.height,
  })
})
```

修复方案：需要追踪 section 在 `PrintSchema.sections` 数组中的实际索引：

```typescript
// 修复后的实现
// 方案：按 DOM 顺序遍历所有 section 元素，使用递增索引

// 1. 收集所有 section 元素（按 DOM 顺序）
const allSectionElements = printBody.querySelectorAll(
  `${MEASURE_SELECTORS.INFO_GRID_WRAPPER}, ` +
  `${MEASURE_SELECTORS.TABLE_WRAPPER}, ` +
  `${MEASURE_SELECTORS.CHECKBOX_GRID_WRAPPER}, ` +
  // ... 其他 section 类型
)

// 2. 按 DOM 顺序分配索引
let sectionIndex = 0
allSectionElements.forEach((element) => {
  const rect = element.getBoundingClientRect()
  results.push({
    id: `section-${sectionIndex}`,  // ✅ 统一格式
    type: 'section',
    height: rect.height,
  })
  sectionIndex++
})
```

### 关键设计决策

1. **使用 DOM 顺序而非类型分组**：DOM 中元素的顺序应该与 `PrintSchema.sections` 数组顺序一致，因为渲染是按数组顺序进行的。

2. **保持 table-header 和 table-row 的现有格式**：这些项用于表格分页逻辑，不应改变。

3. **section-title 的处理**：`section-title` 是一种独立的 section 类型，应该有自己的索引。

## Data Models

### MeasurableItem ID 格式规范

| 类型 | ID 格式 | 示例 |
|------|---------|------|
| section (info-grid, checkbox-grid, etc.) | `section-{index}` | `section-0`, `section-1` |
| table-header | `{tableId}-header` | `table-0-header` |
| table-row | `{tableId}-row-{rowIndex}` | `table-0-row-0` |
| header | `page-header` | `page-header` |
| footer | `notes-{index}` | `notes-0` |
| signature | `signature-{index}` | `signature-0` |

### Section 索引映射

```typescript
// PrintSchema.sections 数组
sections: [
  { type: 'info-grid', ... },      // index 0 -> section-0
  { type: 'table', ... },          // index 1 -> section-1
  { type: 'checkbox-grid', ... },  // index 2 -> section-2
  { type: 'signature-area', ... }, // index 3 -> (不测量，在 footer 处理)
]
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Section ID 格式一致性

*For any* `PrintSchema` with N sections (excluding signature-area), the `measureAll` function SHALL return exactly N items with `type === 'section'`, and each item's ID SHALL be `section-{i}` where `i` is the section's index in the original array (0 to N-1).

**Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2**

### Property 2: Table 项 ID 向后兼容

*For any* `PrintSchema` containing table sections, the `measureAll` function SHALL return table-header and table-row items with IDs following the existing format (`{tableId}-header`, `{tableId}-row-{index}`), and the `tableId` SHALL follow the `table-{dataField}` format.

**Validates: Requirements 2.3, 2.4, 4.5**

### Property 3: Section 渲染正确性

*For any* page with section items, when `renderContentItem` is called with a section item ID, it SHALL find the corresponding `PrintSection` in `sectionMap` and render it with its title (if present).

**Validates: Requirements 3.1, 3.2, 3.3**

## Error Handling

1. **DOM 元素缺失**：如果 DOM 中找不到预期的 section 元素，记录警告但继续处理其他元素
2. **索引不匹配**：如果测量的 section 数量与 schema 中的数量不匹配，记录警告以便调试
3. **非浏览器环境**：保持现有行为，抛出描述性错误

## Testing Strategy

### Unit Tests

1. **ID 格式测试**：验证 `measureAll` 返回的 section 项 ID 格式正确
2. **索引顺序测试**：验证 ID 中的索引与 DOM 顺序一致
3. **向后兼容测试**：验证 table-header 和 table-row 的 ID 格式不变

### Property-Based Tests

使用 fast-check 进行属性测试，每个测试至少运行 100 次：

1. **Property 1**: 生成随机 schema，验证 section ID 格式一致性
2. **Property 2**: 生成包含表格的 schema，验证 table 项 ID 向后兼容
3. **Property 3**: 生成随机页面内容，验证 section 渲染正确性

### Integration Tests

1. **第一页内容测试**：验证 Smart Pagination 的第一页不再空白
2. **多页分页测试**：验证 14+ 行表格正确分页到多个页面
3. **回归测试**：运行现有测试套件确保不破坏现有功能

