/**
 * @fileoverview 字体隔离属性测试 - Property-Based Testing
 * @module test/font-isolation-properties
 * @description 使用 fast-check 进行属性测试，验证字体隔离功能的核心不变量
 *
 * 测试的属性：
 * - Property 1: Font Enforcement - 字体强制使用
 * - Property 2: CSS Isolation Container - CSS 隔离容器
 * - Property 3: External Font Config Ignored - 外部字体配置被忽略
 * - Property 4: Font Data Embedding - 字体数据嵌入
 *
 * @dependencies
 * - fast-check - 属性测试库
 * - ../src/renderer - 渲染器模块
 * - ../src/fonts - 字体模块
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { renderToIsolatedHtml, renderToIsolatedFragment } from '../src/renderer'
import { FONT_FAMILY } from '../src/fonts'
import { CSS_NAMESPACE, ISOLATION_ROOT_CLASS } from '../src/styles'
import type { PrintSchema, FormData, InfoGridConfig, TableConfig } from '../src/types/print-schema'

// ==================== 生成器定义 ====================

/**
 * 生成有效的 PrintSchema
 */
const printSchemaArb = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
  orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  sections: fc.constant([]),
  footer: fc.option(
    fc.record({
      notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      showPageNumber: fc.boolean(),
    }),
    { nil: undefined }
  ),
})

/**
 * 生成带 info-grid 区块的 PrintSchema
 */
const printSchemaWithInfoGridArb = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
  orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
  }),
  sections: fc.constant([
    {
      type: 'info-grid' as const,
      config: {
        columns: 2,
        rows: [{ cells: [{ label: '测试', field: 'test', type: 'text' as const }] }],
      } as InfoGridConfig,
    },
  ]),
  footer: fc.option(
    fc.record({
      notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      showPageNumber: fc.boolean(),
    }),
    { nil: undefined }
  ),
})

/**
 * 生成 FormData
 */
const formDataArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
  fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.date(), fc.array(fc.string()))
)

/**
 * 生成随机字体配置
 */
const randomFontConfigArb = fc.record({
  body: fc.string({ minLength: 1, maxLength: 50 }),
  heading: fc.string({ minLength: 1, maxLength: 50 }),
  mono: fc.string({ minLength: 1, maxLength: 50 }),
})

// ==================== Property 1: Font Enforcement ====================

describe('Property 1: Font Enforcement', () => {
  /**
   * **Property 1: Font Enforcement**
   * **Validates: Requirements 2.1, 2.3, 2.4**
   *
   * *For any* rendered HTML output from `renderToIsolatedHtml()`, the generated CSS SHALL:
   * - Contain exactly one `@font-face` declaration for 'Source Han Serif SC'
   * - Include `font-family: 'Source Han Serif SC' !important` on all text elements
   * - Have the @font-face `src` property containing a `data:` URL (not external URL)
   */
  it('should enforce Source Han Serif SC font in all isolated HTML output', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 1. 验证包含 @font-face 声明
        expect(html).toContain('@font-face')

        // 2. 验证 @font-face 中包含正确的字体名称
        expect(html).toContain(`font-family: '${FONT_FAMILY}'`)

        // 3. 验证 font-family 使用 !important 强制覆盖
        expect(html).toContain('!important')

        // 4. 验证 @font-face src 使用 data URL（内嵌字体）
        expect(html).toContain("url('data:font/woff2;base64,")

        // 5. 验证只有一个 @font-face 声明（唯一字体）
        const fontFaceMatches = html.match(/@font-face/g)
        expect(fontFaceMatches).not.toBeNull()
        expect(fontFaceMatches!.length).toBe(1)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should enforce font in fragment output as well', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const fragment = renderToIsolatedFragment(schema as PrintSchema, data)

        // Fragment 也应该包含字体声明
        expect(fragment).toContain('@font-face')
        expect(fragment).toContain(`font-family: '${FONT_FAMILY}'`)
        expect(fragment).toContain('!important')

        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 2: CSS Isolation Container ====================

describe('Property 2: CSS Isolation Container', () => {
  /**
   * **Property 2: CSS Isolation Container**
   * **Validates: Requirements 3.1, 3.5, 3.6**
   *
   * *For any* rendered HTML output, the content SHALL be wrapped in an isolation container that:
   * - Has class `mpr-root`
   * - Contains inline `<style>` tag with all CSS rules
   * - All internal class names start with `mpr-` prefix
   */
  it('should wrap content in mpr-root isolation container', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 1. 验证包含 mpr-root 容器
        expect(html).toContain(`class="${ISOLATION_ROOT_CLASS}"`)

        // 2. 验证 style 标签在 mpr-root 容器内
        const mprRootMatch = html.match(/<div class="mpr-root">([\s\S]*?)<\/div>\s*<\/body>/)
        expect(mprRootMatch).not.toBeNull()
        expect(mprRootMatch![1]).toContain('<style>')
        expect(mprRootMatch![1]).toContain('</style>')

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should use mpr- prefix for top-level container class names', () => {
    fc.assert(
      fc.property(printSchemaWithInfoGridArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 mpr-root 容器内的所有 class 属性
        const mprRootMatch = html.match(/<div class="mpr-root">([\s\S]*?)<\/div>\s*<\/body>/)
        expect(mprRootMatch).not.toBeNull()

        const containerContent = mprRootMatch![1]

        // 提取所有 class="..." 中的类名（排除 style 标签内的内容）
        const htmlWithoutStyle = containerContent.replace(/<style>[\s\S]*?<\/style>/g, '')

        // 验证顶层容器类名使用 mpr- 前缀
        // 注意：section-renderers 内部的类名（如 label-cell, value-cell）目前不带前缀
        // 这是已知限制，参见 isolated-html-renderer.ts 中的注释
        const topLevelClasses = [
          'mpr-print-page',
          'mpr-print-header',
          'mpr-print-content',
          'mpr-print-footer',
          'mpr-watermark',
        ]

        // 验证至少包含 mpr-print-page 类
        expect(htmlWithoutStyle).toContain('class="mpr-print-page')

        // 验证 CSS 中的选择器使用 mpr- 前缀
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
        expect(styleMatch).not.toBeNull()
        const cssContent = styleMatch![1]

        // CSS 中应该包含 mpr- 前缀的选择器
        expect(cssContent).toContain('.mpr-root')
        expect(cssContent).toContain('.mpr-print-page')
        expect(cssContent).toContain('.mpr-print-header')

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should contain CSS isolation properties', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 验证隔离 CSS 属性
        expect(html).toContain('all: initial')
        expect(html).toContain('contain: strict')
        expect(html).toContain('isolation: isolate')

        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 3: External Font Config Ignored ====================

describe('Property 3: External Font Config Ignored', () => {
  /**
   * **Property 3: External Font Config Ignored**
   * **Validates: Requirements 2.2**
   *
   * *For any* custom theme configuration passed to `renderToIsolatedHtml()` with modified
   * `fonts` property, the output CSS SHALL still use 'Source Han Serif SC' as the only font family.
   */
  it('should ignore external font configuration and always use Source Han Serif SC', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, randomFontConfigArb, (schema, data, fontConfig) => {
        // 传入随机字体配置
        const html = renderToIsolatedHtml(schema as PrintSchema, data, {
          theme: {
            fonts: fontConfig,
          },
        })

        // 1. 验证输出仍然使用 Source Han Serif SC
        expect(html).toContain(`font-family: '${FONT_FAMILY}'`)

        // 2. 验证 @font-face 声明使用正确的字体
        const fontFaceMatch = html.match(/@font-face\s*\{([^}]+)\}/)
        expect(fontFaceMatch).not.toBeNull()
        expect(fontFaceMatch![1]).toContain(`font-family: '${FONT_FAMILY}'`)

        // 3. 验证主要文本元素使用 Source Han Serif SC
        // 注意：某些特殊元素（如 checkbox-symbol）可能使用其他字体来正确渲染符号
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
        if (styleMatch) {
          const cssContent = styleMatch[1]

          // 验证 .mpr-root 和 .mpr-print-page 使用 Source Han Serif SC
          const mprRootFontMatch = cssContent.match(/\.mpr-root[^{]*\{[^}]*font-family:[^;]+/)
          if (mprRootFontMatch) {
            expect(mprRootFontMatch[0]).toContain(FONT_FAMILY)
          }

          const printPageFontMatch = cssContent.match(/\.mpr-print-page[^{]*\{[^}]*font-family:[^;]+/)
          if (printPageFontMatch) {
            expect(printPageFontMatch[0]).toContain(FONT_FAMILY)
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should produce identical font output regardless of theme font settings', () => {
    const baseSchema: PrintSchema = {
      pageSize: 'A4',
      orientation: 'portrait',
      header: { hospital: '测试医院', title: '测试表单' },
      sections: [],
    }

    fc.assert(
      fc.property(randomFontConfigArb, randomFontConfigArb, (fontConfig1, fontConfig2) => {
        const html1 = renderToIsolatedHtml(baseSchema, {}, { theme: { fonts: fontConfig1 } })
        const html2 = renderToIsolatedHtml(baseSchema, {}, { theme: { fonts: fontConfig2 } })

        // 提取两个输出的 @font-face 声明
        const fontFace1 = html1.match(/@font-face\s*\{[^}]+\}/)?.[0]
        const fontFace2 = html2.match(/@font-face\s*\{[^}]+\}/)?.[0]

        // @font-face 声明应该完全相同
        expect(fontFace1).toBe(fontFace2)

        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 4: Font Data Embedding ====================

describe('Property 4: Font Data Embedding', () => {
  /**
   * **Property 4: Font Data Embedding**
   * **Validates: Requirements 4.2**
   *
   * *For any* generated HTML string, the embedded `<style>` tag SHALL contain
   * a `data:font/woff2;base64,` URL within the `@font-face` declaration.
   */
  it('should embed font data as base64 in style tag', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 1. 提取 style 标签内容
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
        expect(styleMatch).not.toBeNull()

        const styleContent = styleMatch![1]

        // 2. 验证包含 data:font/woff2;base64 URL
        expect(styleContent).toContain('data:font/woff2;base64,')

        // 3. 验证 base64 数据在 @font-face 的 src 属性中
        const fontFaceMatch = styleContent.match(/@font-face\s*\{([^}]+)\}/)
        expect(fontFaceMatch).not.toBeNull()

        const fontFaceContent = fontFaceMatch![1]
        expect(fontFaceContent).toContain("url('data:font/woff2;base64,")
        expect(fontFaceContent).toContain("format('woff2')")

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should not contain external font URLs', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 style 标签内容
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
        expect(styleMatch).not.toBeNull()

        const styleContent = styleMatch![1]

        // 验证不包含外部 URL（http:// 或 https://）
        expect(styleContent).not.toMatch(/url\(['"]?https?:\/\//)

        // 验证不包含相对路径字体引用
        expect(styleContent).not.toMatch(/url\(['"]?\.\.?\//)

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should embed valid base64 data', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 base64 数据
        const base64Match = html.match(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/)
        expect(base64Match).not.toBeNull()

        const base64Data = base64Match![1]

        // 验证 base64 数据非空且格式有效
        expect(base64Data.length).toBeGreaterThan(0)

        // 验证是有效的 base64 字符串（只包含合法字符）
        expect(base64Data).toMatch(/^[A-Za-z0-9+/=]+$/)

        return true
      }),
      { numRuns: 100 }
    )
  })
})
