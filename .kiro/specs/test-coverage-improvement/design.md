# Design Document: Test Coverage Improvement

## Overview

本设计文档描述如何系统性地提升 `medical-print-renderer` 项目的测试覆盖率。当前覆盖率为 53.71%（Statements）、26.65%（Functions），目标是将覆盖率提升至 80% 以上。

测试策略采用双轨制：
1. **单元测试**：验证具体示例和边界情况
2. **属性测试**：使用 fast-check 验证通用属性

## Architecture

### 测试文件组织

```
test/
├── visitors.test.ts          # Visitor 模式测试 (NEW)
├── composite.test.ts         # Composite 模式测试 (NEW)
├── templates.test.ts         # Template Method 模式测试 (NEW)
├── pagination-extended.test.ts # Pagination 扩展测试 (NEW)
├── builders.test.ts          # Builder 模式测试 (EXTEND)
├── types.test.ts             # Types 模块测试 (NEW)
├── utils-extended.test.ts    # Utils 扩展测试 (NEW)
└── properties.test.ts        # 属性测试 (EXTEND)
```

### 测试框架配置

- **测试运行器**: Vitest
- **属性测试库**: fast-check
- **最小迭代次数**: 100 次（属性测试）

## Components and Interfaces

### 1. Visitor 模式测试组件

```typescript
// test/visitors.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  FormatVisitor,
  ValidationVisitor,
  MeasureVisitor,
  FormDataTraverser,
  createFormatVisitor,
  createValidationVisitor,
  createMeasureVisitor,
  createFormDataTraverser,
} from '../src/renderer/visitors'

// 测试 FormatVisitor 的各种字段类型处理
// 测试 ValidationVisitor 的验证逻辑
// 测试 MeasureVisitor 的测量计算
// 测试 FormDataTraverser 的遍历完整性
```

### 2. Composite 模式测试组件

```typescript
// test/composite.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  LeafSection,
  ContainerSection,
  SectionTreeTraverser,
  createSectionComponent,
  createSectionTree,
  renderSectionTree,
} from '../src/renderer/composite'

// 测试 LeafSection 和 ContainerSection 的行为
// 测试 SectionTreeTraverser 的遍历操作
// 测试 section tree 的创建和渲染
```

### 3. Template Method 模式测试组件

```typescript
// test/templates.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  SinglePageRenderer,
  PaginatedPageRenderer,
  createSinglePageRenderer,
  createPaginatedPageRenderer,
} from '../src/renderer/templates'

// 测试 SinglePageRenderer 的渲染流程
// 测试 PaginatedPageRenderer 的分页渲染
// 测试水印和页码功能
```

### 4. Pagination 扩展测试组件

```typescript
// test/pagination-extended.test.ts
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  ContentMeasurer,
  PageBreakCalculator,
  OverflowHandler,
  PageDimensions,
} from '../src/pagination'

// 测试内容测量
// 测试分页计算
// 测试溢出处理
// 测试页面尺寸计算
```

## Data Models

### 测试数据生成器

```typescript
// 字段信息生成器
const fieldInfoArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_]\w*$/.test(s)),
  value: fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.date(),
    fc.constant(null)
  ),
  type: fc.option(fc.constantFrom('text', 'number', 'date', 'checkbox', 'boolean')),
  label: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
})

// PrintSection 生成器
const printSectionArb = fc.record({
  type: fc.constantFrom('info-grid', 'table', 'checkbox-grid', 'notes', 'free-text'),
  config: fc.record({
    columns: fc.integer({ min: 1, max: 4 }),
    rows: fc.array(fc.record({
      cells: fc.array(fc.record({
        label: fc.string({ minLength: 1, maxLength: 20 }),
        field: fc.string({ minLength: 1, maxLength: 20 }),
      }), { minLength: 1, maxLength: 4 })
    }), { minLength: 1, maxLength: 5 })
  })
})

// PrintSchema 生成器
const printSchemaArb = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K'),
  orientation: fc.constantFrom('portrait', 'landscape'),
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
    title: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  sections: fc.array(printSectionArb, { maxLength: 5 }),
  footer: fc.option(fc.record({
    notes: fc.option(fc.string({ maxLength: 100 })),
    showPageNumber: fc.boolean(),
  })),
})
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: FormatVisitor 格式化正确性

*For any* field type and value, FormatVisitor SHALL produce correctly formatted output that matches the expected format for that type.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

### Property 2: ValidationVisitor 错误检测

*For any* invalid input (missing required field, non-numeric number, invalid date), ValidationVisitor SHALL produce appropriate error messages.

**Validates: Requirements 1.7, 1.8, 1.9**

### Property 3: MeasureVisitor 高度计算

*For any* text content, MeasureVisitor SHALL calculate estimated height that is positive and proportional to content length.

**Validates: Requirements 1.10**

### Property 4: FormDataTraverser 遍历完整性

*For any* form data object, FormDataTraverser SHALL visit all fields exactly once with correct type inference.

**Validates: Requirements 1.11**

### Property 5: Composite 模式树操作

*For any* section tree, SectionTreeTraverser operations (traverse, collectLeaves, getDepth) SHALL produce correct results consistent with tree structure.

**Validates: Requirements 2.4, 2.5, 2.6**

### Property 6: Section Tree 渲染

*For any* valid section tree, creating then rendering SHALL produce valid HTML output containing all section content.

**Validates: Requirements 2.7**

### Property 7: Template 渲染器内容包含

*For any* valid PrintSchema with header, footer, and watermark, renderers SHALL include all specified content in output.

**Validates: Requirements 3.2, 3.3, 3.4, 3.6, 3.7**

### Property 8: Pagination 高度约束

*For any* valid content, pagination SHALL produce pages where each page does not exceed maximum available height.

**Validates: Requirements 4.5**

### Property 9: Builder HTML 结构

*For any* valid builder configuration, building SHALL produce correctly structured HTML with proper tag names, attributes, and nesting.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**

### Property 10: Type Guard 正确性

*For any* input, type guards SHALL correctly identify valid instances and reject invalid ones, with serialization round-trip producing equivalent objects.

**Validates: Requirements 6.1, 6.3, 6.4**

### Property 11: HTML Escape Round-Trip

*For any* valid input string, escaping then unescaping SHALL produce the original string (idempotence for safe strings).

**Validates: Requirements 7.1, 7.4**

## Error Handling

### 测试错误处理策略

1. **边界情况测试**
   - 空输入
   - null/undefined 值
   - 超长字符串
   - 特殊字符

2. **异常情况测试**
   - 无效配置
   - 类型不匹配
   - 缺失必填字段

3. **错误消息验证**
   - 错误消息应包含字段名
   - 错误消息应描述问题

## Testing Strategy

### 双轨测试方法

**单元测试**：
- 验证具体示例和边界情况
- 测试错误条件和异常处理
- 测试集成点

**属性测试**：
- 验证通用属性在所有输入上成立
- 使用 fast-check 生成随机输入
- 每个属性测试最少 100 次迭代

### 属性测试配置

```typescript
// vitest.config.ts 中的属性测试配置
fc.assert(
  fc.property(generator, (input) => {
    // 属性验证逻辑
    return true
  }),
  { numRuns: 100 }
)
```

### 测试标注格式

每个属性测试必须包含注释引用设计文档中的属性：

```typescript
/**
 * Property N: [Property Title]
 * **Validates: Requirements X.Y, X.Z**
 */
it('should [property description]', () => {
  fc.assert(
    fc.property(generator, (input) => {
      // 测试逻辑
    }),
    { numRuns: 100 }
  )
})
```

### 覆盖率目标

| 模块 | 当前覆盖率 | 目标覆盖率 |
|------|-----------|-----------|
| visitors | 20.28% | 80%+ |
| composite | 25% | 80%+ |
| templates | 20.41% | 80%+ |
| pagination | 39.1% | 70%+ |
| builders | 27.27% | 80%+ |
| types | 41.66% | 70%+ |
| utils | 69.4% | 85%+ |
| **Overall** | **53.71%** | **75%+** |

