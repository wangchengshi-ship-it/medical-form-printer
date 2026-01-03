/**
 * @fileoverview Font isolation property tests - Property-Based Testing
 * @module test/font-isolation-properties
 * @description Uses fast-check for property testing to verify core invariants of font isolation
 *
 * Properties tested:
 * - Property 1: Font Enforcement - Font forced usage
 * - Property 2: CSS Isolation Container - CSS isolation container
 * - Property 3: External Font Config Ignored - External font config ignored
 * - Property 4: Font Data Embedding - Font data embedding
 *
 * @dependencies
 * - fast-check - Property testing library
 * - ../src/renderer - Renderer module
 * - ../src/fonts - Font module
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { renderToIsolatedHtml, renderToIsolatedFragment } from '../src/renderer'
import { FONT_FAMILY } from '../src/fonts'
import { CSS_NAMESPACE, ISOLATION_ROOT_CLASS } from '../src/styles'
import { PLACEHOLDER } from '../src/test-utils/placeholder-data'
import type {
  PrintSchema,
  InfoGridConfig,
  TableConfig,
  CheckboxGridConfig,
  SignatureConfig,
  NotesConfig,
  FreeTextConfig,
} from '../src/types/print-schema'

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

        // 验证隔离 CSS 属性（使用 layout style 而非 strict，避免高度塌陷）
        expect(html).toContain('contain: layout style')
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
      header: { hospital: PLACEHOLDER.hospital.name, title: 'Test Form' },
      sections: [],
    }

    fc.assert(
      fc.property(randomFontConfigArb, randomFontConfigArb, (fontConfig1, fontConfig2) => {
        const html1 = renderToIsolatedHtml(baseSchema, {}, { theme: { fonts: fontConfig1 } })
        const html2 = renderToIsolatedHtml(baseSchema, {}, { theme: { fonts: fontConfig2 } })

        // Extract @font-face declarations from both outputs
        const fontFace1 = html1.match(/@font-face\s*\{[^}]+\}/)?.[0]
        const fontFace2 = html2.match(/@font-face\s*\{[^}]+\}/)?.[0]

        // @font-face declarations should be identical
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


// ==================== Property 5: All Class Names Namespaced ====================

/**
 * Generate PrintSchema with all section types
 * Used for comprehensive namespace prefix testing
 */
const comprehensivePrintSchemaArb = fc.record({
  pageSize: fc.constantFrom('A4', 'A5', '16K') as fc.Arbitrary<'A4' | 'A5' | '16K'>,
  orientation: fc.constantFrom('portrait', 'landscape') as fc.Arbitrary<'portrait' | 'landscape'>,
  header: fc.record({
    hospital: fc.string({ minLength: 1, maxLength: 50 }),
    department: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    showLogo: fc.boolean(),
    logoUrl: fc.option(fc.constant('https://example.com/logo.png'), { nil: undefined }),
  }),
  sections: fc.constant([
    // info-grid section
    {
      type: 'info-grid' as const,
      title: 'Basic Information',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: 'Name', field: 'name', type: 'text' as const },
              { label: 'Age', field: 'age', type: 'number' as const, suffix: 'years' },
            ],
          },
          {
            cells: [
              { label: 'Allergy', field: 'allergy', type: 'checkbox-inline' as const, inlineOptions: ['No', 'Yes'] },
              { label: 'BP', field: 'bp', type: 'compound' as const, compoundFormat: '{systolic}/{diastolic}mmHg', compoundFields: { systolic: 'bpSystolic', diastolic: 'bpDiastolic' } },
            ],
          },
          {
            cells: [
              { label: 'Notes', field: 'notes', type: 'textarea' as const, span: 3, minHeight: '50px' },
            ],
          },
        ],
      } as InfoGridConfig,
    },
    // table section
    {
      type: 'table' as const,
      title: 'Records',
      config: {
        columns: [
          { header: 'Date', field: 'date', width: '100px' },
          { header: 'Content', field: 'content' },
          { header: 'Operator', field: 'operator' },
        ],
        dataField: 'records',
      } as TableConfig,
    },
    // checkbox-grid section
    {
      type: 'checkbox-grid' as const,
      title: 'Symptoms',
      config: {
        field: 'symptoms',
        columns: 4,
        options: [
          { value: 'fever', label: 'Fever' },
          { value: 'cough', label: 'Cough' },
          { value: 'headache', label: 'Headache' },
          { value: 'fatigue', label: 'Fatigue' },
        ],
      } as CheckboxGridConfig,
    },
    // signature-area section
    {
      type: 'signature-area' as const,
      config: {
        fields: [
          { label: 'Doctor Signature', field: 'doctorSignature', showDate: true },
          { label: 'Nurse Signature', field: 'nurseSignature', showDate: true },
        ],
      } as SignatureConfig,
    },
    // notes section
    {
      type: 'notes' as const,
      config: {
        content: 'Note: Please verify all information carefully',
        showBorder: true,
      } as NotesConfig,
    },
    // free-text section
    {
      type: 'free-text' as const,
      title: 'Additional Notes',
      config: {
        field: 'additionalNotes',
        minHeight: '100px',
      } as FreeTextConfig,
    },
  ]),
  footer: fc.constant({
    notes: 'Footer notes',
    showPageNumber: true,
  }),
})

/**
 * Generate FormData with data
 */
const comprehensiveFormDataArb = fc.constant({
  name: PLACEHOLDER.patient.name,
  age: 30,
  allergy: true,
  bpSystolic: 120,
  bpDiastolic: 80,
  notes: 'No special conditions',
  records: [
    { date: '2026-01-01', content: 'Admission exam', operator: PLACEHOLDER.staff.doctor },
    { date: '2026-01-02', content: 'Routine care', operator: PLACEHOLDER.staff.nurse },
  ],
  fever: true,
  cough: false,
  headache: false,
  fatigue: true,
  doctorSignature: PLACEHOLDER.staff.doctor,
  nurseSignature: PLACEHOLDER.staff.nurse,
  additionalNotes: 'Patient in good condition',
})

describe('Property 5: All Class Names Namespaced', () => {
  /**
   * **Property 5: All Class Names Namespaced**
   * **Validates: Requirements 3.5, 3.6**
   *
   * *For any* rendered HTML output from `renderToIsolatedHtml()` with sections,
   * ALL class names in the HTML content (excluding style tag) SHALL either:
   * - Start with 'mpr-' prefix, OR
   * - Be the root class 'mpr-root'
   *
   * This ensures complete CSS isolation with no unprefixed class names that could
   * conflict with external styles.
   */
  it('should have all class names prefixed with mpr- in isolated mode', () => {
    fc.assert(
      fc.property(comprehensivePrintSchemaArb, comprehensiveFormDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 mpr-root 容器内的 HTML（排除 style 标签）
        const mprRootMatch = html.match(/<div class="mpr-root">([\s\S]*?)<\/div>\s*<\/body>/)
        expect(mprRootMatch).not.toBeNull()

        const containerContent = mprRootMatch![1]
        const htmlWithoutStyle = containerContent.replace(/<style>[\s\S]*?<\/style>/g, '')

        // 提取所有 class="..." 属性中的类名
        const classMatches = htmlWithoutStyle.matchAll(/class="([^"]+)"/g)
        const allClasses: string[] = []

        for (const match of classMatches) {
          const classValue = match[1]
          // 分割多个类名（如 "mpr-print-page mpr-16k mpr-portrait"）
          const classes = classValue.split(/\s+/).filter(Boolean)
          allClasses.push(...classes)
        }

        // 验证所有类名都以 mpr- 开头
        const unprefixedClasses = allClasses.filter(
          (cls) => !cls.startsWith(`${CSS_NAMESPACE}-`)
        )

        // 如果有未加前缀的类名，测试失败并显示具体类名
        if (unprefixedClasses.length > 0) {
          throw new Error(
            `Found unprefixed class names: ${unprefixedClasses.join(', ')}\n` +
            `All classes found: ${allClasses.join(', ')}`
          )
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should have matching CSS selectors for all HTML class names', () => {
    fc.assert(
      fc.property(comprehensivePrintSchemaArb, comprehensiveFormDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 style 标签内容
        const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/)
        expect(styleMatch).not.toBeNull()
        const cssContent = styleMatch![1]

        // 提取 HTML 中的所有类名
        const mprRootMatch = html.match(/<div class="mpr-root">([\s\S]*?)<\/div>\s*<\/body>/)
        expect(mprRootMatch).not.toBeNull()
        const htmlWithoutStyle = mprRootMatch![1].replace(/<style>[\s\S]*?<\/style>/g, '')

        const classMatches = htmlWithoutStyle.matchAll(/class="([^"]+)"/g)
        const htmlClasses = new Set<string>()

        for (const match of classMatches) {
          const classes = match[1].split(/\s+/).filter(Boolean)
          classes.forEach((cls) => htmlClasses.add(cls))
        }

        // 验证关键类名在 CSS 中有对应的选择器
        // 注意：某些类名（如 mpr-print-content）只在 HTML 中使用，不需要专门的 CSS 规则
        const criticalClasses = [
          'mpr-print-page',
          'mpr-print-header',
          // 'mpr-print-content', // 这个类只用于结构，不需要专门的 CSS 规则
          'mpr-print-section',
          'mpr-info-grid',
          'mpr-label-cell',
          'mpr-value-cell',
          'mpr-data-table',
          'mpr-checkbox-grid',
          'mpr-checkbox-item',
          'mpr-signature-area',
          'mpr-signature-item',
        ]

        for (const cls of criticalClasses) {
          if (htmlClasses.has(cls)) {
            // 验证 CSS 中包含该类的选择器
            expect(cssContent).toContain(`.${cls}`)
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  it('should namespace all section renderer class names', () => {
    // 测试每种区块类型的类名都正确命名空间化
    // 注意：info-grid 现在使用下划线填空样式，不再使用 label-cell/value-cell
    const sectionTypes = [
      { type: 'info-grid', expectedClasses: ['mpr-info-grid', 'mpr-info-row', 'mpr-info-item'] },
      { type: 'table', expectedClasses: ['mpr-data-table'] },
      { type: 'checkbox-grid', expectedClasses: ['mpr-checkbox-grid', 'mpr-checkbox-item'] },
      { type: 'signature-area', expectedClasses: ['mpr-signature-area', 'mpr-signature-item'] },
      { type: 'notes', expectedClasses: ['mpr-notes-section'] },
      { type: 'free-text', expectedClasses: ['mpr-free-text'] },
    ]

    fc.assert(
      fc.property(comprehensivePrintSchemaArb, comprehensiveFormDataArb, (schema, data) => {
        const html = renderToIsolatedHtml(schema as PrintSchema, data)

        // 提取 HTML 内容（排除 style）
        const mprRootMatch = html.match(/<div class="mpr-root">([\s\S]*?)<\/div>\s*<\/body>/)
        expect(mprRootMatch).not.toBeNull()
        const htmlWithoutStyle = mprRootMatch![1].replace(/<style>[\s\S]*?<\/style>/g, '')

        // 验证每种区块类型的预期类名都存在
        for (const { type, expectedClasses } of sectionTypes) {
          for (const expectedClass of expectedClasses) {
            // 检查类名是否存在于 HTML 中
            const classRegex = new RegExp(`class="[^"]*${expectedClass}[^"]*"`)
            if (!classRegex.test(htmlWithoutStyle)) {
              throw new Error(
                `Expected class '${expectedClass}' for section type '${type}' not found in HTML`
              )
            }
          }
        }

        return true
      }),
      { numRuns: 50 }
    )
  })
})
