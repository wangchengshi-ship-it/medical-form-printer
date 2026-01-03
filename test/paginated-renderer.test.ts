/**
 * @fileoverview 分页渲染器测试
 * @module test/paginated-renderer
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 测试分页渲染器的核心功能：
 * - 多页 HTML 渲染
 * - 页眉页脚渲染
 * - 表头重复
 * - 页码显示
 * - CSS 分页规则
 *
 * @requirements
 * - 11.1: 每页渲染为独立的 .print-page 元素
 * - 11.2: 续页自动插入表格表头
 * - 11.3: 显示页码
 * - 11.4: 续页标题添加 "(续)" 标记
 * - 11.5: CSS page-break 规则
 * - 11.6: 保持跨页样式一致性
 */

import { describe, it, expect } from 'vitest'
import {
  renderPaginatedHtml,
  renderPaginatedHtmlSimple,
  generatePaginationCss,
  createRenderConfigFromPaginationConfig,
  DEFAULT_PAGINATED_RENDER_CONFIG,
} from '../src/pagination/paginated-renderer'
import type { PrintSchema, FormData } from '../src/types/print-schema'
import type { MeasurableItem, PageBreakResult, PaginationConfig } from '../src/pagination/types'
import { MEASURABLE_ITEM_TYPES } from '../src/pagination/types'

// ==================== 测试数据 ====================

const createTestSchema = (): PrintSchema => ({
  pageSize: '16K',
  orientation: 'portrait',
  header: {
    hospital: '测试医院',
    department: '测试科室',
    title: '测试表单',
  },
  sections: [
    {
      type: 'info-grid',
      title: '基本信息',
      config: {
        columns: 4,
        rows: [
          {
            cells: [
              { label: '姓名', field: 'name' },
              { label: '年龄', field: 'age' },
            ],
          },
        ],
      },
    },
    {
      type: 'table',
      title: '记录表',
      config: {
        columns: [
          { header: '日期', field: 'date' },
          { header: '内容', field: 'content' },
        ],
        dataField: 'records',
      },
    },
    {
      type: 'signature-area',
      config: {
        fields: [
          { label: '签名', field: 'signature', showDate: true },
        ],
      },
    },
  ],
  footer: {
    showPageNumber: true,
    notes: '备注信息',
  },
})

const createTestData = (): FormData => ({
  name: '张三',
  age: 30,
  records: [
    { date: '2026-01-01', content: '内容1' },
    { date: '2026-01-02', content: '内容2' },
  ],
  signature: '李四',
  signatureDate: '2026-01-03',
})

const createTestMeasuredItems = (): MeasurableItem[] => [
  { id: 'section-0', type: MEASURABLE_ITEM_TYPES.SECTION, height: 100 },
  { id: 'table-records-header', type: MEASURABLE_ITEM_TYPES.TABLE_HEADER, height: 30, tableId: 'table-records' },
  { id: 'table-records-row-0', type: MEASURABLE_ITEM_TYPES.TABLE_ROW, height: 25, tableId: 'table-records', dataIndex: 0 },
  { id: 'table-records-row-1', type: MEASURABLE_ITEM_TYPES.TABLE_ROW, height: 25, tableId: 'table-records', dataIndex: 1 },
  { id: 'section-2', type: MEASURABLE_ITEM_TYPES.SIGNATURE, height: 50 },
]

const createSinglePageResult = (): PageBreakResult => ({
  pages: [
    {
      pageNumber: 1,
      isContinuation: false,
      items: ['section-0', 'table-records-header', 'table-records-row-0', 'table-records-row-1', 'section-2'],
      repeatedHeaders: [],
    },
  ],
  totalPages: 1,
})

const createMultiPageResult = (): PageBreakResult => ({
  pages: [
    {
      pageNumber: 1,
      isContinuation: false,
      items: ['section-0', 'table-records-header', 'table-records-row-0'],
      repeatedHeaders: [],
    },
    {
      pageNumber: 2,
      isContinuation: true,
      items: ['table-records-row-1', 'section-2'],
      repeatedHeaders: ['table-records-header'],
    },
  ],
  totalPages: 2,
})

// ==================== 基础渲染测试 ====================

describe('renderPaginatedHtml', () => {
  describe('基础渲染', () => {
    it('should render complete HTML document', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="zh-CN">')
      expect(html).toContain('<head>')
      expect(html).toContain('<body')
      expect(html).toContain('</html>')
    })

    it('should include page title', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('<title>测试表单</title>')
    })

    it('should include CSS styles', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('<style>')
      expect(html).toContain('.print-page')
    })
  })

  describe('单页渲染', () => {
    it('should render single page with correct class', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('class="print-page 16k portrait"')
      expect(html).toContain('data-page="1"')
    })

    it('should render header with hospital and title', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('测试医院')
      expect(html).toContain('测试科室')
      expect(html).toContain('测试表单')
    })

    it('should render footer with page number', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('第 1 页 / 共 1 页')
    })
  })

  describe('多页渲染', () => {
    it('should render multiple pages', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('data-page="1"')
      expect(html).toContain('data-page="2"')
    })

    it('should add continuation suffix to title on subsequent pages', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      // 第二页应该有续页标记
      expect(html).toContain('测试表单 (续)')
    })

    it('should show correct page numbers', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('第 1 页 / 共 2 页')
      expect(html).toContain('第 2 页 / 共 2 页')
    })

    it('should add continuation-page class to subsequent pages', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
      })

      expect(html).toContain('continuation-page')
    })
  })
})

// ==================== 配置测试 ====================

describe('PaginatedRenderConfig', () => {
  it('should use default config when not provided', () => {
    const html = renderPaginatedHtml({
      schema: createTestSchema(),
      data: createTestData(),
      pageBreakResult: createSinglePageResult(),
      measuredItems: createTestMeasuredItems(),
    })

    // 默认显示页眉页脚
    expect(html).toContain('print-header')
    expect(html).toContain('print-footer')
  })

  it('should hide header on subsequent pages when configured', () => {
    const html = renderPaginatedHtml({
      schema: createTestSchema(),
      data: createTestData(),
      pageBreakResult: createMultiPageResult(),
      measuredItems: createTestMeasuredItems(),
      config: {
        showHeaderOnEachPage: false,
      },
    })

    // 第一页有页眉，第二页没有
    const pages = html.split('data-page=')
    expect(pages[1]).toContain('print-header')
    // 第二页不应该有完整的页眉内容
  })

  it('should use custom continuation suffix', () => {
    const html = renderPaginatedHtml({
      schema: createTestSchema(),
      data: createTestData(),
      pageBreakResult: createMultiPageResult(),
      measuredItems: createTestMeasuredItems(),
      config: {
        continuationSuffix: '（续表）',
      },
    })

    expect(html).toContain('测试表单 （续表）')
  })

  it('should use custom page number format', () => {
    const html = renderPaginatedHtml({
      schema: createTestSchema(),
      data: createTestData(),
      pageBreakResult: createSinglePageResult(),
      measuredItems: createTestMeasuredItems(),
      config: {
        pageNumberFormat: 'Page {current} of {total}',
      },
    })

    expect(html).toContain('Page 1 of 1')
  })
})

// ==================== CSS 生成测试 ====================

describe('generatePaginationCss', () => {
  it('should generate pagination CSS', () => {
    const css = generatePaginationCss()

    expect(css).toContain('.paginated-document')
    expect(css).toContain('.continuation-page')
    expect(css).toContain('.repeated-header')
    expect(css).toContain('.page-number')
  })

  it('should include print media query', () => {
    const css = generatePaginationCss()

    expect(css).toContain('@media print')
    expect(css).toContain('page-break-after: always')
    expect(css).toContain('page-break-inside: avoid')
  })

  it('should include page break utility classes', () => {
    const css = generatePaginationCss()

    expect(css).toContain('.page-break-before')
    expect(css).toContain('.page-break-after')
    expect(css).toContain('.no-page-break')
  })
})

// ==================== 工具函数测试 ====================

describe('createRenderConfigFromPaginationConfig', () => {
  it('should return empty config for undefined input', () => {
    const config = createRenderConfigFromPaginationConfig(undefined)
    expect(config).toEqual({})
  })

  it('should map display config correctly', () => {
    const paginationConfig: PaginationConfig = {
      enabled: true,
      display: {
        headerOnEachPage: false,
        footerOnEachPage: true,
        signatureOnEachPage: true,
      },
    }

    const config = createRenderConfigFromPaginationConfig(paginationConfig)

    expect(config.showHeaderOnEachPage).toBe(false)
    expect(config.showFooterOnEachPage).toBe(true)
    expect(config.showSignatureOnEachPage).toBe(true)
  })

  it('should map header and footer config correctly', () => {
    const paginationConfig: PaginationConfig = {
      enabled: true,
      headerConfig: {
        showOnEachPage: true,
        continuationSuffix: '（续）',
      },
      footerConfig: {
        showOnEachPage: true,
        pageNumberFormat: '第{current}页/共{total}页',
      },
    }

    const config = createRenderConfigFromPaginationConfig(paginationConfig)

    expect(config.continuationSuffix).toBe('（续）')
    expect(config.pageNumberFormat).toBe('第{current}页/共{total}页')
  })

  it('should use display config for header/footer settings', () => {
    const paginationConfig: PaginationConfig = {
      enabled: true,
      display: {
        headerOnEachPage: false,
        footerOnEachPage: true,
      },
    }

    const config = createRenderConfigFromPaginationConfig(paginationConfig)

    expect(config.showHeaderOnEachPage).toBe(false)
    expect(config.showFooterOnEachPage).toBe(true)
  })
})

describe('DEFAULT_PAGINATED_RENDER_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.showHeaderOnEachPage).toBe(true)
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.showFooterOnEachPage).toBe(true)
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.showSignatureOnEachPage).toBe(false)
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.continuationSuffix).toBe('(续)')
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.pageNumberFormat).toBe('第 {current} 页 / 共 {total} 页')
    expect(DEFAULT_PAGINATED_RENDER_CONFIG.isolated).toBe(false)
  })
})

// ==================== 隔离模式测试 ====================

describe('Isolated Mode', () => {
  describe('CSS 隔离', () => {
    it('should wrap content in mpr-root container when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      expect(html).toContain('class="mpr-root"')
    })

    it('should use namespaced class names when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      // 检查命名空间类名
      expect(html).toContain('mpr-print-page')
      expect(html).toContain('mpr-print-header')
      expect(html).toContain('mpr-print-footer')
      expect(html).toContain('mpr-print-content')
      expect(html).toContain('mpr-hospital-name')
      expect(html).toContain('mpr-form-title')
      expect(html).toContain('mpr-page-number')
    })

    it('should NOT use namespaced class names when not isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: false },
      })

      // 检查普通类名
      expect(html).toContain('class="print-page')
      expect(html).toContain('class="print-header"')
      expect(html).toContain('class="print-footer"')
      expect(html).not.toContain('mpr-root')
    })

    it('should embed CSS inside isolation container when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      // CSS 应该在 mpr-root 容器内
      const mprRootIndex = html.indexOf('class="mpr-root"')
      const styleIndex = html.indexOf('<style>', mprRootIndex)
      const closingDivIndex = html.lastIndexOf('</div>')
      
      expect(styleIndex).toBeGreaterThan(mprRootIndex)
      expect(styleIndex).toBeLessThan(closingDivIndex)
    })

    it('should include isolation CSS rules when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      // 检查隔离 CSS 规则（使用 layout style 而非 strict，避免高度塌陷）
      expect(html).toContain('isolation: isolate')
      expect(html).toContain('contain: layout style')
    })
  })

  describe('字体嵌入', () => {
    it('should include embedded font CSS when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      // 检查字体 CSS
      expect(html).toContain('@font-face')
      expect(html).toContain('Source Han Serif SC')
      expect(html).toContain('data:font/woff2;base64')
    })

    it('should NOT include embedded font CSS when not isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createSinglePageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: false },
      })

      // 普通模式不应该有 base64 字体
      expect(html).not.toContain('data:font/woff2;base64')
    })
  })

  describe('多页隔离', () => {
    it('should share same isolation container for multiple pages', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      // 只应该有一个 mpr-root 容器
      const mprRootCount = (html.match(/class="mpr-root"/g) || []).length
      expect(mprRootCount).toBe(1)

      // 但应该有多个页面
      expect(html).toContain('data-page="1"')
      expect(html).toContain('data-page="2"')
    })

    it('should use namespaced continuation-page class when isolated', () => {
      const html = renderPaginatedHtml({
        schema: createTestSchema(),
        data: createTestData(),
        pageBreakResult: createMultiPageResult(),
        measuredItems: createTestMeasuredItems(),
        config: { isolated: true },
      })

      expect(html).toContain('mpr-continuation-page')
    })
  })
})

// ==================== generatePaginationCss 隔离模式测试 ====================

describe('generatePaginationCss with isolation', () => {
  it('should generate namespaced CSS when isolated', () => {
    const css = generatePaginationCss(true)

    expect(css).toContain('.mpr-root')
    expect(css).toContain('.mpr-print-page')
    expect(css).toContain('.mpr-continuation-page')
    expect(css).toContain('.mpr-page-number')
    expect(css).toContain('.mpr-page-break-before')
    expect(css).toContain('.mpr-page-break-after')
    expect(css).toContain('.mpr-no-page-break')
  })

  it('should NOT generate namespaced CSS when not isolated', () => {
    const css = generatePaginationCss(false)

    expect(css).toContain('.paginated-document')
    expect(css).toContain('.print-page')
    expect(css).not.toContain('.mpr-root')
    expect(css).not.toContain('.mpr-print-page')
  })
})

// ==================== 简化 API 测试 ====================

describe('renderPaginatedHtmlSimple', () => {
  it('should produce same output as renderPaginatedHtml', () => {
    const schema = createTestSchema()
    const data = createTestData()
    const pageBreakResult = createSinglePageResult()
    const measuredItems = createTestMeasuredItems()

    const html1 = renderPaginatedHtml({
      schema,
      data,
      pageBreakResult,
      measuredItems,
    })

    const html2 = renderPaginatedHtmlSimple(
      schema,
      data,
      pageBreakResult,
      measuredItems
    )

    expect(html1).toBe(html2)
  })
})
