# Design Document: Font Isolation

## Overview

本设计为 `@medical/print-renderer` 库实现强制字体绑定和 CSS 隔离功能。核心目标是确保渲染输出在任何环境下都使用统一的思源宋体，且样式完全隔离。

### 设计原则

1. **字体自包含** - 字体文件打包进 npm 包，无需外部依赖
2. **样式隔离** - 使用多层防护确保内外样式互不干扰
3. **跨环境一致** - 浏览器预览和 PDF 生成输出一致
4. **零配置** - 开箱即用，不允许修改字体配置

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @medical/print-renderer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Font Module   │  │  CSS Generator  │  │  Renderer   │ │
│  │                 │  │                 │  │             │ │
│  │ • font.woff2    │  │ • @font-face    │  │ • HTML      │ │
│  │ • getFontData() │  │ • isolation     │  │ • isolation │ │
│  │ • waitForFonts()│  │ • namespacing   │  │   wrapper   │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           └────────────────────┼───────────────────┘        │
│                                │                            │
│                    ┌───────────▼───────────┐                │
│                    │   Isolated Output     │                │
│                    │                       │                │
│                    │ <div class="mpr-root">│                │
│                    │   <style>...</style>  │                │
│                    │   <div class="mpr-*"> │                │
│                    │     ...content...     │                │
│                    │   </div>              │                │
│                    │ </div>                │                │
│                    └───────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Font Module (`src/fonts/`)

负责字体资源管理和加载状态追踪。

```typescript
// src/fonts/index.ts

/** 字体配置（内部使用，不可修改） */
interface FontConfig {
  readonly family: 'Source Han Serif SC'
  readonly weight: 400
  readonly style: 'normal'
  readonly format: 'woff2'
}

/** 字体加载选项 */
interface FontLoadOptions {
  /** 超时时间（毫秒），默认 5000 */
  timeout?: number
}

/**
 * 获取字体 Data URL（Base64 编码）
 * @returns woff2 格式的 data URL
 */
export function getFontDataUrl(): string

/**
 * 获取字体 CSS（包含 @font-face）
 * @returns 完整的字体 CSS 字符串
 */
export function getFontCss(): string

/**
 * 检查字体是否已加载（同步）
 * @returns 字体加载状态
 */
export function isFontLoaded(): boolean

/**
 * 等待字体加载完成
 * @param options - 加载选项
 * @returns Promise，字体加载完成时 resolve
 * @throws 超时或加载失败时 reject
 */
export function waitForFonts(options?: FontLoadOptions): Promise<void>
```

### 2. CSS Isolation Module (`src/styles/isolation.ts`)

负责生成隔离样式和命名空间管理。

```typescript
// src/styles/isolation.ts

/** CSS 命名空间前缀 */
export const CSS_NAMESPACE = 'mpr'

/** 隔离容器类名 */
export const ISOLATION_ROOT_CLASS = 'mpr-root'

/**
 * 生成隔离容器样式
 * @returns 隔离容器的 CSS 规则
 */
export function generateIsolationCss(): string

/**
 * 为类名添加命名空间前缀
 * @param className - 原始类名
 * @returns 带前缀的类名
 */
export function namespaceClass(className: string): string

/**
 * 批量转换类名
 * @param classNames - 原始类名数组
 * @returns 带前缀的类名数组
 */
export function namespaceClasses(classNames: string[]): string[]
```

### 3. Enhanced CSS Generator (`src/styles/css-generator.ts`)

扩展现有 CSS 生成器，整合字体和隔离样式。

```typescript
// 扩展 generateCss 函数

/**
 * 生成完整的隔离 CSS
 * @param theme - 主题配置（字体配置将被忽略）
 * @returns 包含字体、隔离和组件样式的完整 CSS
 */
export function generateIsolatedCss(theme?: DeepPartial<Theme>): string
```

### 4. Enhanced HTML Renderer

修改渲染器输出，添加隔离容器包装。

```typescript
// 修改 renderToHtml 输出结构

// Before:
// <body>
//   <div class="print-page">...</div>
// </body>

// After:
// <body>
//   <div class="mpr-root">
//     <style>/* isolated CSS */</style>
//     <div class="mpr-print-page">...</div>
//   </div>
// </body>
```

## Data Models

### Font Asset Structure

```
src/fonts/
├── index.ts              # 字体模块入口
├── font-data.ts          # Base64 编码的字体数据
├── font-css.ts           # @font-face CSS 生成
└── font-loader.ts        # 字体加载状态管理
```

### CSS Class Mapping

| 原始类名 | 命名空间类名 |
|---------|-------------|
| `print-page` | `mpr-print-page` |
| `print-header` | `mpr-print-header` |
| `print-footer` | `mpr-print-footer` |
| `print-content` | `mpr-print-content` |
| `info-grid` | `mpr-info-grid` |
| `data-table` | `mpr-data-table` |
| `checkbox-grid` | `mpr-checkbox-grid` |
| `signature-area` | `mpr-signature-area` |
| ... | ... |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Font Enforcement

*For any* rendered HTML output from `renderToHtml()` or `renderPaginatedHtml()`, the generated CSS SHALL:
- Contain exactly one `@font-face` declaration for 'Source Han Serif SC'
- Include `font-family: 'Source Han Serif SC' !important` on all text elements
- Have the @font-face `src` property containing a `data:` URL (not external URL)

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 2: CSS Isolation Container

*For any* rendered HTML output, the content SHALL be wrapped in an isolation container that:
- Has class `mpr-root`
- Contains inline `<style>` tag with all CSS rules
- All internal class names start with `mpr-` prefix

**Validates: Requirements 3.1, 3.5, 3.6**

### Property 3: External Font Config Ignored

*For any* custom theme configuration passed to `renderToHtml()` with modified `fonts` property, the output CSS SHALL still use 'Source Han Serif SC' as the only font family.

**Validates: Requirements 2.2**

### Property 4: Font Data Embedding

*For any* generated HTML string, the embedded `<style>` tag SHALL contain a `data:font/woff2;base64,` URL within the `@font-face` declaration.

**Validates: Requirements 4.2**

## Error Handling

### Font Loading Errors

```typescript
class FontLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'FontLoadError'
  }
}

// 使用场景
try {
  await waitForFonts({ timeout: 3000 })
} catch (error) {
  if (error instanceof FontLoadError) {
    // 字体加载失败，可能是超时或网络问题
    console.error('Font loading failed:', error.message)
  }
}
```

### Error Scenarios

| 场景 | 错误类型 | 处理方式 |
|-----|---------|---------|
| 字体加载超时 | `FontLoadError` | 抛出带超时信息的错误 |
| 浏览器不支持 woff2 | 静默降级 | 使用 woff 格式 |
| Node.js 环境 | 无需加载 | `isFontLoaded()` 返回 `true` |

## Testing Strategy

### Unit Tests

1. **Font Module Tests**
   - `getFontDataUrl()` 返回有效的 data URL
   - `getFontCss()` 包含正确的 @font-face 声明
   - `isFontLoaded()` 在不同状态下返回正确值

2. **CSS Isolation Tests**
   - `namespaceClass()` 正确添加前缀
   - `generateIsolationCss()` 包含所有隔离属性

3. **Integration Tests**
   - 渲染输出包含隔离容器
   - 自定义字体配置被忽略

### Property-Based Tests

使用 `fast-check` 进行属性测试：

1. **Property 1 Test**: Font Enforcement
   - 生成随机 PrintSchema 和 FormData
   - 渲染 HTML
   - 验证 CSS 中字体声明符合要求

2. **Property 2 Test**: CSS Isolation
   - 生成随机渲染配置
   - 渲染 HTML
   - 验证所有类名都有 `mpr-` 前缀

3. **Property 3 Test**: External Config Ignored
   - 生成随机字体配置
   - 传入 renderToHtml
   - 验证输出字体不变

4. **Property 4 Test**: Font Data Embedding
   - 渲染任意内容
   - 验证 style 标签包含 base64 字体数据

### Test Configuration

```typescript
// vitest.config.ts 中的属性测试配置
{
  test: {
    // 属性测试至少运行 100 次
    fuzz: {
      numRuns: 100
    }
  }
}
```
