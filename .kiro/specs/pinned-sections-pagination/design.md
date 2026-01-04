# Design Document

## Overview

本设计文档描述了 `medical-form-printer` 库的溢出字段分页渲染功能的实现方案。该功能将 `overflow-handler.ts` 中已实现的核心逻辑集成到 `paginated-renderer.ts` 中，使库能够正确渲染溢出字段的分页效果。

### 设计目标

1. **功能对齐**：与前端 `PrintModeForm.vue` 的溢出字段分页行为保持一致
2. **代码复用**：复用已有的 `overflow-handler.ts` 核心逻辑
3. **向后兼容**：不破坏现有的分页渲染功能
4. **可扩展性**：遵循 GoF 设计模式，便于未来扩展其他分页策略

## Architecture

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    paginated-renderer.ts                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              PaginatedRenderContext                      ││
│  │  - schema: PrintSchema                                   ││
│  │  - data: FormData                                        ││
│  │  - pageBreakResult: PageBreakResult                      ││
│  │  - overflowResults?: OverflowFieldResult[]  (NEW)        ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Pagination Strategy (Strategy Pattern)         ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  ││
│  │  │   Smart     │  │  Overflow   │  │    Manual       │  ││
│  │  │  Pagination │  │  Pagination │  │   Pagination    │  ││
│  │  │  Strategy   │  │  Strategy   │  │   Strategy      │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              renderPaginatedHtml()                       ││
│  │  - renderFirstPage()                                     ││
│  │  - renderOverflowContinuationPage() (NEW)                ││
│  │  - renderSmartPaginationPages()                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    overflow-handler.ts                       │
│  - getOverflowFirstLine(value, maxChars)                    │
│  - getOverflowRest(value, maxChars)                         │
│  - hasOverflowContent(value, maxChars)                      │
│  - processOverflowFields(data, configs)                     │
└─────────────────────────────────────────────────────────────┘
```

### 策略模式设计

采用策略模式（Strategy Pattern）来管理不同的分页策略：

```typescript
interface PaginationStrategy {
  /** 策略名称 */
  name: string
  /** 判断是否应用此策略 */
  shouldApply(config: PaginationConfig): boolean
  /** 执行分页渲染 */
  render(context: PaginatedRenderContext): string
}
```

## Components and Interfaces

### 新增类型定义

```typescript
// types.ts 新增

/**
 * 溢出字段分页配置（扩展 PaginationConfig）
 */
export interface OverflowPaginationConfig {
  /** 溢出字段列表 */
  overflowFields?: string[]
  /** 第一页最大字符数，默认 60 */
  overflowFirstLineChars?: number
}

/**
 * 扩展 PaginatedRenderContext
 */
export interface PaginatedRenderContext {
  // ... 现有字段
  /** 溢出字段处理结果 */
  overflowResults?: OverflowFieldResult[]
}
```

### 新增渲染函数

```typescript
// paginated-renderer.ts 新增

/**
 * 渲染溢出字段的第一页内容
 * @param section - 包含溢出字段的 section
 * @param overflowResult - 溢出字段处理结果
 * @param cls - CSS 类名生成函数
 */
function renderOverflowFirstLine(
  section: PrintSection,
  overflowResult: OverflowFieldResult,
  cls: ClassNameFn
): string

/**
 * 渲染溢出字段的续页内容
 * @param overflowResult - 溢出字段处理结果
 * @param fieldLabel - 字段标签
 * @param cls - CSS 类名生成函数
 */
function renderOverflowContinuation(
  overflowResult: OverflowFieldResult,
  fieldLabel: string,
  cls: ClassNameFn
): string

/**
 * 渲染溢出续页
 * @param ctx - 渲染上下文
 * @param cls - CSS 类名生成函数
 */
function renderOverflowContinuationPage(
  ctx: SinglePageContext,
  cls: ClassNameFn
): string
```

### CSS 类名常量扩展

```typescript
const CSS_CLASSES = {
  // ... 现有类名
  
  // 溢出字段相关
  OVERFLOW_FIRST_LINE: 'overflow-first-line',
  OVERFLOW_CONTINUATION: 'overflow-continuation',
  OVERFLOW_LABEL: 'overflow-label',
  OVERFLOW_CONTENT: 'overflow-content',
  SEE_NEXT: 'see-next',
} as const
```

## Data Models

### 渲染流程数据流

```
PrintSchema + FormData
        │
        ▼
┌───────────────────┐
│ processOverflow   │ ← overflow-handler.ts
│ Fields()          │
└───────────────────┘
        │
        ▼
OverflowFieldResult[]
        │
        ▼
┌───────────────────┐
│ determinePages()  │ ← 决定需要几页
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ renderFirstPage() │ ← 渲染第一页（含截断内容）
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ renderOverflow    │ ← 渲染续页（含剩余内容）
│ ContinuationPage()│
└───────────────────┘
        │
        ▼
Complete HTML
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Overflow Field Identification

*For any* printSchema with `pagination.overflowFields` configured and *for any* section of type `info-grid`, the renderer should correctly identify whether the section contains an overflow field by checking if any cell's field name matches the overflowFields array.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: First Page Overflow Rendering

*For any* overflow field with content, the first page rendering should:
- Display truncated content (up to `overflowFirstLineChars` characters) when content exceeds the limit
- Append "（续见附页）" marker when there is continuation content
- Display full content without marker when content fits within the limit

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Continuation Page Overflow Rendering

*For any* overflow field with continuation content, the continuation page should:
- Display the field label with "（续）" suffix
- Display the remaining content from `getOverflowRest`
- Only be created when `hasOverflowContent` returns true

**Validates: Requirements 3.1, 3.2, 3.4**

### Property 4: Integration with Existing Features

*For any* configuration combining `overflowFields` with other pagination features (`smartPagination`, `showSignatureOnEachPage`), the renderer should:
- Handle both overflow and smart pagination correctly
- Show signature on overflow continuation pages when configured
- Add "（续）" suffix to page headers on continuation pages

**Validates: Requirements 4.1, 4.2, 4.3**

## Error Handling

### 配置验证

1. **无效溢出字段**：如果 `overflowFields` 中的字段名在 schema 中不存在，记录警告并忽略
2. **空数据**：如果溢出字段的值为 null/undefined，视为空字符串处理
3. **非字符串值**：如果溢出字段的值不是字符串，使用 `String()` 转换

### 渲染降级

1. **无溢出内容**：如果所有溢出字段都没有超出限制，正常渲染不创建续页
2. **配置缺失**：如果 `pagination.overflowFields` 未配置，跳过溢出处理逻辑

## Testing Strategy

### 单元测试

使用 Vitest 进行单元测试，测试文件位于 `test/pagination/overflow-pagination.test.ts`：

1. **溢出字段识别测试**
   - 测试 `isOverflowSection` 函数正确识别包含溢出字段的 section
   - 测试多个溢出字段的情况

2. **渲染函数测试**
   - 测试 `renderOverflowFirstLine` 生成正确的 HTML
   - 测试 `renderOverflowContinuation` 生成正确的 HTML
   - 测试 CSS 类名正确应用

3. **集成测试**
   - 测试完整的 `renderPaginatedHtml` 流程
   - 测试与 `showSignatureOnEachPage` 的集成

### 属性测试

使用 fast-check 进行属性测试，每个测试至少运行 100 次迭代：

1. **Property 1 测试**：生成随机 printSchema 和 overflowFields 配置，验证识别逻辑
2. **Property 2 测试**：生成随机长度的文本内容，验证第一页渲染逻辑
3. **Property 3 测试**：生成随机溢出内容，验证续页渲染逻辑
4. **Property 4 测试**：生成随机配置组合，验证集成逻辑

### 测试标注格式

```typescript
/**
 * Feature: pinned-sections-pagination, Property 1: Overflow Field Identification
 * Validates: Requirements 1.1, 1.2, 1.3
 */
```

## Storybook 故事

### 新增故事文件

在 `stories/pagination/` 目录下新增故事文件：

#### `OverflowPagination.stories.ts`

```typescript
/**
 * @fileoverview Overflow field pagination stories
 * @module stories/pagination/OverflowPagination
 * 
 * @description
 * 展示溢出字段分页功能的各种场景：
 * - 基础溢出分页
 * - 多溢出字段
 * - 与签名区域集成
 * - 与智能分页集成
 */

export default {
  title: 'Pagination/Overflow Field',
  parameters: {
    docs: {
      description: {
        component: '溢出字段分页功能，当字段内容过长时自动分页显示',
      },
    },
  },
}

// 基础溢出分页
export const BasicOverflow = { ... }

// 无溢出内容（内容较短）
export const NoOverflow = { ... }

// 多溢出字段
export const MultipleOverflowFields = { ... }

// 与签名区域集成
export const WithSignatureOnEachPage = { ... }

// 自定义截断长度
export const CustomTruncationLength = { ... }
```

### 更新现有故事

更新 `stories/forms/SingleForm.stories.ts`，添加溢出分页示例：

```typescript
// 新生儿入院评估单（带溢出分页）
export const NewbornAssessmentWithOverflow = {
  args: {
    schema: newbornAssessmentSchema,
    data: {
      ...sampleData,
      nursingPoints: '1. 每天洗澡擦浴后，检查脐部...\n2. 注意观察...\n3. 定时喂养...',
    },
  },
}
```

## 注释规范

### 文件级注释

所有新增/修改的文件必须包含完整的文件级注释，**修改时间必须保持更新**：

```typescript
/**
 * @fileoverview Overflow field pagination rendering
 * @module pagination/overflow-pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04  // ⚠️ 每次修改必须更新此日期
 *
 * @description
 * Handles overflow field pagination rendering logic:
 * - First page displays truncated content + continuation marker
 * - Continuation pages display remaining content
 * - Integrates with existing pagination features
 *
 * @requirements
 * - 1.1: Identify sections containing overflow fields
 * - 2.1: Render truncated content on first page
 * - 3.1: Render remaining content on continuation pages
 *
 * @dependencies
 * - ./overflow-handler.ts - Overflow field processing core logic
 * - ./types.ts - Type definitions
 *
 * @usedBy
 * - ./paginated-renderer.ts - Paginated renderer
 */
```

### 函数级注释

所有公开函数必须包含英文 JSDoc 注释：

```typescript
/**
 * Check if section contains overflow fields
 * 
 * @param section - PrintSection to check
 * @param overflowFields - List of overflow field names
 * @returns Whether section contains overflow fields
 * 
 * @example
 * const isOverflow = isOverflowSection(section, ['nursingPoints'])
 * 
 * @requirements 1.1, 1.2
 */
export function isOverflowSection(
  section: PrintSection,
  overflowFields: string[]
): boolean
```

### 类型注释

所有新增类型必须包含英文描述：

```typescript
/**
 * Overflow field render context
 * 
 * @description
 * Contains all information needed to render overflow fields
 */
export interface OverflowRenderContext {
  /** Overflow field processing result */
  result: OverflowFieldResult
  /** Field label (for continuation page display) */
  fieldLabel: string
  /** Whether this is the first page */
  isFirstPage: boolean
}
```

## 国际化设计

### 可配置文本

所有用户可见的文本必须支持国际化配置：

```typescript
/**
 * Default text configuration (Chinese)
 */
export const DEFAULT_OVERFLOW_TEXT = {
  /** Continuation marker on first page */
  seeNextMarker: '（续见附页）',
  /** Label suffix on continuation page */
  continuationSuffix: '（续）',
  /** Page title suffix for continuation pages */
  pageTitleSuffix: '（续）',
} as const

/**
 * English text configuration
 */
export const ENGLISH_OVERFLOW_TEXT = {
  seeNextMarker: '(continued on next page)',
  continuationSuffix: '(continued)',
  pageTitleSuffix: '(continued)',
} as const

/**
 * Overflow text configuration type
 */
export type OverflowTextConfig = typeof DEFAULT_OVERFLOW_TEXT
```

### 配置传递

通过 `PaginatedRenderConfig` 传递文本配置：

```typescript
export interface PaginatedRenderConfig {
  // ... existing fields
  
  /**
   * Overflow text configuration for i18n support
   * @default DEFAULT_OVERFLOW_TEXT (Chinese)
   */
  overflowText?: Partial<OverflowTextConfig>
}
```

### 使用示例

```typescript
// Chinese (default)
renderPaginatedHtml({
  schema,
  data,
  pageBreakResult,
  measuredItems,
})

// English
renderPaginatedHtml({
  schema,
  data,
  pageBreakResult,
  measuredItems,
  config: {
    overflowText: ENGLISH_OVERFLOW_TEXT,
  },
})
