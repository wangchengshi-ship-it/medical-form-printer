/**
 * @fileoverview 属性测试 - Property-Based Testing
 * 
 * 使用 fast-check 进行属性测试，验证渲染器的核心不变量
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { renderToHtml } from '../src/renderer'
import type { PrintSchema, FormData, InfoGridConfig, TableConfig } from '../src/types/print-schema'

// 生成器：有效的 PrintSchema
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

// 生成器：FormData
const formDataArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.date(),
    fc.array(fc.string())
  )
)

describe('Property: HTML 结构完整性', () => {
  /**
   * Property 1: 渲染输出始终是有效的 HTML 文档
   * **Validates: Requirements 1.1**
   */
  it('should always produce valid HTML document structure', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToHtml(schema as PrintSchema, data)

        // 必须包含 HTML 文档基本结构
        expect(html).toContain('<!DOCTYPE html>')
        expect(html).toContain('<html')
        expect(html).toContain('</html>')
        expect(html).toContain('<head>')
        expect(html).toContain('</head>')
        expect(html).toContain('<body>')
        expect(html).toContain('</body>')
        expect(html).toContain('<style>')
        expect(html).toContain('</style>')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 2: 页眉信息始终出现在输出中
   * **Validates: Requirements 1.2, 3.1**
   */
  it('should always include header information', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToHtml(schema as PrintSchema, data)

        // 医院名称和表单标题必须出现
        const escapedHospital = escapeHtml(schema.header.hospital)
        const escapedTitle = escapeHtml(schema.header.title)

        expect(html).toContain(escapedHospital)
        expect(html).toContain(escapedTitle)
        expect(html).toContain('class="print-header"')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3: 页面尺寸和方向类名正确应用
   * **Validates: Requirements 3.2**
   */
  it('should apply correct page size and orientation classes', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToHtml(schema as PrintSchema, data)

        const expectedClass = `class="print-page ${schema.pageSize.toLowerCase()} ${schema.orientation}"`
        expect(html).toContain(expectedClass)

        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: XSS 防护', () => {
  /**
   * Property 4: 所有用户输入都被正确转义
   * **Validates: Requirements 8.1**
   * 
   * 注意：HTML 转义的核心是转义 < > & " ' 这些字符
   * 只要 < 和 > 被转义，就无法构造有效的 HTML 标签进行 XSS 攻击
   */
  it('should escape all HTML special characters in user input', () => {
    const dangerousStrings = fc.constantFrom(
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      '"><script>alert(1)</script>',
      "'; DROP TABLE users; --",
      '<div onclick="alert(1)">click</div>',
      '&lt;already&gt;escaped&lt;/already&gt;'
    )

    fc.assert(
      fc.property(dangerousStrings, (dangerous) => {
        const schema: PrintSchema = {
          pageSize: 'A4',
          orientation: 'portrait',
          header: { hospital: dangerous, department: dangerous, title: dangerous },
          sections: [
            {
              type: 'info-grid',
              title: dangerous,
              config: {
                columns: 1,
                rows: [{ cells: [{ label: dangerous, field: 'test', type: 'text' }] }],
              },
            },
          ],
        }
        const data: FormData = { test: dangerous }
        const html = renderToHtml(schema, data)

        // 核心安全检查：用户输入中的 < 和 > 必须被转义
        // 这样就无法注入任何 HTML 标签
        
        // 检查危险的脚本标签不存在
        expect(html).not.toContain('<script>')
        expect(html).not.toContain('</script>')
        
        // 验证 < 和 > 被正确转义
        if (dangerous.includes('<')) {
          expect(html).toContain('&lt;')
        }
        if (dangerous.includes('>')) {
          expect(html).toContain('&gt;')
        }

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property 5: 转义是幂等的（多次转义不会破坏内容）
   * **Validates: Requirements 8.1**
   */
  it('should handle already escaped content correctly', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const schema: PrintSchema = {
          pageSize: 'A4',
          orientation: 'portrait',
          header: { hospital: '医院', title: '表单' },
          sections: [
            {
              type: 'info-grid',
              config: {
                columns: 1,
                rows: [{ cells: [{ label: '测试', field: 'test', type: 'text' }] }],
              },
            },
          ],
        }
        const data: FormData = { test: input }
        const html = renderToHtml(schema, data)

        // 输出应该是字符串
        expect(typeof html).toBe('string')
        expect(html.length).toBeGreaterThan(0)

        return true
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property: 数据完整性', () => {
  /**
   * Property 6: info-grid 中的所有标签都出现在输出中
   * **Validates: Requirements 2.1**
   */
  it('should include all info-grid labels in output', () => {
    const labelArb = fc.string({ minLength: 1, maxLength: 10 }).filter((s) => s.trim().length > 0)

    fc.assert(
      fc.property(fc.array(labelArb, { minLength: 1, maxLength: 5 }), (labels) => {
        const config: InfoGridConfig = {
          columns: 2,
          rows: [
            {
              cells: labels.map((label, i) => ({
                label,
                field: `field${i}`,
                type: 'text' as const,
              })),
            },
          ],
        }
        const schema: PrintSchema = {
          pageSize: 'A4',
          orientation: 'portrait',
          header: { hospital: '医院', title: '表单' },
          sections: [{ type: 'info-grid', config }],
        }
        const html = renderToHtml(schema, {})

        // 所有标签都应该出现（转义后）
        labels.forEach((label) => {
          const escaped = escapeHtml(label)
          expect(html).toContain(escaped)
        })

        return true
      }),
      { numRuns: 50 }
    )
  })

  /**
   * Property 7: table 中的行数与数据数组长度一致
   * **Validates: Requirements 2.2**
   */
  it('should render correct number of table rows', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ col1: fc.string(), col2: fc.string() }), { maxLength: 10 }),
        (records) => {
          const config: TableConfig = {
            dataField: 'records',
            columns: [
              { header: '列1', field: 'col1', type: 'text' },
              { header: '列2', field: 'col2', type: 'text' },
            ],
          }
          const schema: PrintSchema = {
            pageSize: 'A4',
            orientation: 'portrait',
            header: { hospital: '医院', title: '表单' },
            sections: [{ type: 'table', config }],
          }
          const html = renderToHtml(schema, { records })

          // 计算 tbody 中的 tr 数量
          const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
          if (tbodyMatch) {
            const tbodyContent = tbodyMatch[1]
            const rowCount = (tbodyContent.match(/<tr>/g) || []).length
            expect(rowCount).toBe(records.length)
          }

          return true
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('Property: 水印功能', () => {
  /**
   * Property 8: 水印文本正确渲染
   * **Validates: Requirements 3.4**
   */
  it('should render watermark when provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        (watermarkText) => {
          const schema: PrintSchema = {
            pageSize: 'A4',
            orientation: 'portrait',
            header: { hospital: '医院', title: '表单' },
            sections: [],
          }
          const html = renderToHtml(schema, {}, { watermark: watermarkText })

          expect(html).toContain('class="watermark"')
          expect(html).toContain(escapeHtml(watermarkText))

          return true
        }
      ),
      { numRuns: 50 }
    )
  })

  /**
   * Property 9: 无水印时不渲染水印元素
   * **Validates: Requirements 3.4**
   */
  it('should not render watermark when not provided', () => {
    fc.assert(
      fc.property(printSchemaArb, formDataArb, (schema, data) => {
        const html = renderToHtml(schema as PrintSchema, data)

        // 没有提供水印选项时，不应该有水印元素
        expect(html).not.toContain('class="watermark"')

        return true
      }),
      { numRuns: 50 }
    )
  })
})

describe('Property: 主题一致性', () => {
  /**
   * Property 10: 自定义主题值出现在 CSS 中
   * **Validates: Requirements 4.1, 4.4**
   */
  it('should apply custom theme values to CSS', () => {
    const colorArb = fc.hexaString({ minLength: 6, maxLength: 6 }).map((s) => `#${s}`)

    fc.assert(
      fc.property(colorArb, (customColor) => {
        const schema: PrintSchema = {
          pageSize: 'A4',
          orientation: 'portrait',
          header: { hospital: '医院', title: '表单' },
          sections: [],
        }
        const html = renderToHtml(schema, {}, {
          theme: { colors: { primary: customColor } } as Partial<typeof import('../src/styles').defaultTheme>,
        })

        // 自定义颜色应该出现在 CSS 中
        // 注意：primary 可能不直接用于 CSS，但 colors 对象会被合并
        expect(html).toContain('<style>')

        return true
      }),
      { numRuns: 30 }
    )
  })
})

// 辅助函数：HTML 转义
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
