/**
 * @fileoverview 分页算法属性测试 - Property-Based Testing
 * @module test/pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 使用 fast-check 进行属性测试，验证分页算法的核心不变量：
 * - Property 8: 分页内容完整性 - 所有项分配到恰好一个页面
 * - Property 9: 表格行不分割 - 单行不跨页
 * - Property 10: 续页表头重复 - 有表格行的续页包含表头
 * - Property 11: 页面高度约束 - 页面内容不超过可用高度
 * - Property 12: 单位转换可逆性 - mmToPx(pxToMm(x)) ≈ x
 * - Property 13: 溢出字段分割正确性 - firstLine + rest = original
 *
 * @requirements
 * - 9.1: 根据测量内容高度计算分页点
 * - 9.2: 确保表格行不被分割
 * - 9.3: 续页自动重复表头
 * - 9.6: 预留表头高度计算
 * - 9.7: 支持溢出字段分页
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  // 分页算法
  calculatePageBreaks,
  validatePageBreakResult,
  getPageContentHeight,
  // 页面尺寸
  mmToPx,
  pxToMm,
  PAGE_16K,
  PAGE_A4,
  PAGE_A5,
  calculateUsableHeight,
  // 溢出字段处理
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  // 类型
  MEASURABLE_ITEM_TYPES,
} from '../src/pagination'
import type { MeasurableItem, PageBreakOptions } from '../src/pagination'

// ==================== 生成器定义 ====================

/**
 * 生成有效的内容项 ID
 */
const itemIdArb = fc.string({ minLength: 1, maxLength: 20 })
  .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s))
  .map((s) => `item-${s}`)

/**
 * 生成表格 ID
 */
const tableIdArb = fc.string({ minLength: 1, maxLength: 10 })
  .filter((s) => /^[a-zA-Z0-9_-]+$/.test(s))
  .map((s) => `table-${s}`)

/**
 * 生成正数高度值 (px)
 */
const heightArb = fc.integer({ min: 10, max: 200 })

/**
 * 生成非表格内容项（header, section, signature, footer）
 */
const nonTableItemArb = fc.record({
  id: itemIdArb,
  type: fc.constantFrom(
    MEASURABLE_ITEM_TYPES.HEADER,
    MEASURABLE_ITEM_TYPES.SECTION,
    MEASURABLE_ITEM_TYPES.SIGNATURE,
    MEASURABLE_ITEM_TYPES.FOOTER
  ),
  height: heightArb,
}).map((item) => ({ ...item, tableId: undefined, dataIndex: undefined }))

/**
 * 生成表格表头项
 */
const tableHeaderArb = (tableId: string) =>
  fc.record({
    id: fc.constant(`header-${tableId}`),
    type: fc.constant(MEASURABLE_ITEM_TYPES.TABLE_HEADER),
    height: heightArb,
    tableId: fc.constant(tableId),
  }).map((item) => ({ ...item, dataIndex: undefined }))

/**
 * 生成表格行项
 */
const tableRowArb = (tableId: string, index: number) =>
  fc.record({
    id: fc.constant(`row-${tableId}-${index}`),
    type: fc.constant(MEASURABLE_ITEM_TYPES.TABLE_ROW),
    height: heightArb,
    tableId: fc.constant(tableId),
    dataIndex: fc.constant(index),
  })

/**
 * 生成完整的表格（表头 + 多行）- 确保唯一 ID
 */
const tableArb = fc.tuple(tableIdArb, fc.integer({ min: 1, max: 10 })).chain(([tableId, rowCount]) => {
  // 为每行生成唯一的高度数组
  return fc.tuple(
    tableHeaderArb(tableId),
    fc.array(heightArb, { minLength: rowCount, maxLength: rowCount })
  ).map(([header, heights]) => {
    const rows: MeasurableItem[] = heights.map((height, i) => ({
      id: `row-${tableId}-${i}`,
      type: MEASURABLE_ITEM_TYPES.TABLE_ROW,
      height,
      tableId,
      dataIndex: i,
    }))
    return [header, ...rows]
  })
})

/**
 * 生成混合内容项列表（包含非表格项和表格）- 确保唯一 ID
 */
const mixedItemsArb = fc.tuple(
  fc.array(nonTableItemArb, { minLength: 0, maxLength: 5 }),
  fc.array(tableArb, { minLength: 0, maxLength: 3 }),
  fc.array(nonTableItemArb, { minLength: 0, maxLength: 5 })
).map(([before, tables, after]) => {
  const items: MeasurableItem[] = []
  const usedIds = new Set<string>()
  
  // 生成唯一 ID 的辅助函数
  const makeUniqueId = (baseId: string): string => {
    let id = baseId
    let counter = 0
    while (usedIds.has(id)) {
      counter++
      id = `${baseId}-${counter}`
    }
    usedIds.add(id)
    return id
  }
  
  // 添加前置非表格项
  before.forEach((item, i) => {
    const uniqueId = makeUniqueId(`before-${i}-${item.type}`)
    items.push({ ...item, id: uniqueId })
  })
  
  // 添加表格（表格内部已经有唯一 ID）
  tables.forEach((tableItems, tableIndex) => {
    tableItems.forEach((item) => {
      const uniqueId = makeUniqueId(`t${tableIndex}-${item.id}`)
      items.push({ ...item, id: uniqueId })
    })
  })
  
  // 添加后置非表格项
  after.forEach((item, i) => {
    const uniqueId = makeUniqueId(`after-${i}-${item.type}`)
    items.push({ ...item, id: uniqueId })
  })
  
  return items
})

/**
 * 生成页面高度（确保足够容纳至少一个项）
 */
const pageHeightArb = fc.integer({ min: 300, max: 2000 })

/**
 * 生成分页选项
 */
const pageBreakOptionsArb = fc.record({
  pageHeight: pageHeightArb,
  headerHeight: fc.integer({ min: 0, max: 100 }),
  footerHeight: fc.integer({ min: 0, max: 100 }),
  repeatTableHeaders: fc.boolean(),
})

/**
 * 生成正数毫米值
 */
const mmValueArb = fc.double({ min: 0.1, max: 1000, noNaN: true })

/**
 * 生成正数像素值
 */
const pxValueArb = fc.double({ min: 0.1, max: 5000, noNaN: true })

/**
 * 生成溢出测试文本
 */
const overflowTextArb = fc.oneof(
  // 单行短文本
  fc.string({ minLength: 0, maxLength: 50 }),
  // 单行长文本
  fc.string({ minLength: 61, maxLength: 200 }),
  // 多行文本
  fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 5 })
    .map((lines) => lines.join('\n'))
)

/**
 * 生成最大字符数
 */
const maxCharsArb = fc.integer({ min: 10, max: 200 })

// ==================== Property 8: 分页内容完整性 ====================

describe('Property 8: 分页内容完整性', () => {
  /**
   * Property 8: 所有项分配到恰好一个页面
   * **Validates: Requirements 9.1, 9.7**
   *
   * *For any* list of MeasurableItems, calculatePageBreaks SHALL assign
   * every item to exactly one page, with no items lost or duplicated.
   */
  it('should assign every item to exactly one page', () => {
    fc.assert(
      fc.property(mixedItemsArb, pageBreakOptionsArb, (items, options) => {
        // 确保页面高度足够容纳至少一个项
        const minItemHeight = items.length > 0 
          ? Math.min(...items.map((i) => i.height)) 
          : 50
        const adjustedOptions: PageBreakOptions = {
          ...options,
          pageHeight: Math.max(options.pageHeight, minItemHeight + options.headerHeight + options.footerHeight + 50),
        }

        const result = calculatePageBreaks(items, adjustedOptions)

        // 使用内置验证函数
        const isValid = validatePageBreakResult(items, result)
        expect(isValid).toBe(true)

        // 额外验证：收集所有分配的项 ID
        const assignedIds = new Set<string>()
        for (const page of result.pages) {
          for (const itemId of page.items) {
            // 不应有重复
            expect(assignedIds.has(itemId)).toBe(false)
            assignedIds.add(itemId)
          }
        }

        // 所有原始项都应被分配
        const originalIds = new Set(items.map((i) => i.id))
        expect(assignedIds.size).toBe(originalIds.size)
        for (const id of originalIds) {
          expect(assignedIds.has(id)).toBe(true)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 空内容应返回单页
   */
  it('should return single page for empty content', () => {
    fc.assert(
      fc.property(pageBreakOptionsArb, (options) => {
        const result = calculatePageBreaks([], options)

        expect(result.pages.length).toBe(1)
        expect(result.totalPages).toBe(1)
        expect(result.pages[0].items.length).toBe(0)
        expect(result.pages[0].isContinuation).toBe(false)

        return true
      }),
      { numRuns: 50 }
    )
  })
})

// ==================== Property 9: 表格行不分割 ====================

describe('Property 9: 表格行不分割', () => {
  /**
   * Property 9: 单行不跨页
   * **Validates: Requirements 9.2**
   *
   * *For any* table with multiple rows, calculatePageBreaks SHALL never
   * split a single table row across two pages.
   */
  it('should never split a single table row across pages', () => {
    fc.assert(
      fc.property(mixedItemsArb, pageBreakOptionsArb, (items, options) => {
        // 确保页面高度足够容纳至少一个项
        const minItemHeight = items.length > 0 
          ? Math.min(...items.map((i) => i.height)) 
          : 50
        const adjustedOptions: PageBreakOptions = {
          ...options,
          pageHeight: Math.max(options.pageHeight, minItemHeight + options.headerHeight + options.footerHeight + 50),
        }

        const result = calculatePageBreaks(items, adjustedOptions)

        // 对于每个表格行，它应该完整地出现在某一页
        const tableRows = items.filter((i) => i.type === MEASURABLE_ITEM_TYPES.TABLE_ROW)

        for (const row of tableRows) {
          // 找到包含此行的页面
          const pagesContainingRow = result.pages.filter((page) =>
            page.items.includes(row.id)
          )

          // 每行应该恰好出现在一个页面
          expect(pagesContainingRow.length).toBe(1)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 10: 续页表头重复 ====================

describe('Property 10: 续页表头重复', () => {
  /**
   * Property 10: 有表格行的续页包含表头
   * **Validates: Requirements 9.3, 9.6**
   *
   * *For any* table that spans multiple pages, the table header SHALL be
   * repeated at the beginning of each continuation page.
   */
  it('should repeat table header on continuation pages with table rows', () => {
    fc.assert(
      fc.property(mixedItemsArb, pageHeightArb, (items, pageHeight) => {
        // 启用表头重复
        const options: PageBreakOptions = {
          pageHeight: Math.max(pageHeight, 100),
          headerHeight: 0,
          footerHeight: 0,
          repeatTableHeaders: true,
        }

        const result = calculatePageBreaks(items, options)

        // 构建表格 ID 到表头 ID 的映射
        const tableHeaderMap = new Map<string, string>()
        for (const item of items) {
          if (item.type === MEASURABLE_ITEM_TYPES.TABLE_HEADER && item.tableId) {
            tableHeaderMap.set(item.tableId, item.id)
          }
        }

        // 检查每个续页
        for (let i = 1; i < result.pages.length; i++) {
          const page = result.pages[i]
          
          if (!page.isContinuation) continue

          // 找出此页包含的表格行所属的表格
          const tableIdsOnPage = new Set<string>()
          for (const itemId of page.items) {
            const item = items.find((i) => i.id === itemId)
            if (item?.type === MEASURABLE_ITEM_TYPES.TABLE_ROW && item.tableId) {
              tableIdsOnPage.add(item.tableId)
            }
          }

          // 对于每个表格，检查其表头是否在 repeatedHeaders 中
          // 或者表头已经在当前页的 items 中（首次出现）
          for (const tableId of tableIdsOnPage) {
            const headerId = tableHeaderMap.get(tableId)
            if (headerId) {
              // 表头应该在 repeatedHeaders 中或在 items 中
              const hasHeader = page.repeatedHeaders.includes(headerId) ||
                page.items.includes(headerId)
              
              // 如果表头在之前的页面已经出现过，则续页应该重复
              const headerInPreviousPages = result.pages
                .slice(0, i)
                .some((p) => p.items.includes(headerId))
              
              if (headerInPreviousPages) {
                expect(page.repeatedHeaders.includes(headerId)).toBe(true)
              }
            }
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 禁用表头重复时不应重复
   */
  it('should not repeat headers when repeatTableHeaders is false', () => {
    fc.assert(
      fc.property(mixedItemsArb, pageHeightArb, (items, pageHeight) => {
        const options: PageBreakOptions = {
          pageHeight: Math.max(pageHeight, 100),
          headerHeight: 0,
          footerHeight: 0,
          repeatTableHeaders: false,
        }

        const result = calculatePageBreaks(items, options)

        // 所有页面的 repeatedHeaders 应该为空
        for (const page of result.pages) {
          expect(page.repeatedHeaders.length).toBe(0)
        }

        return true
      }),
      { numRuns: 50 }
    )
  })
})

// ==================== Property 11: 页面高度约束 ====================

describe('Property 11: 页面高度约束', () => {
  /**
   * Property 11: 页面内容不超过可用高度
   * **Validates: Requirements 9.1, 9.6**
   *
   * *For any* page in PageBreakResult, the total height of items
   * (including repeated headers) SHALL not exceed the available page height.
   */
  it('should not exceed available page height', () => {
    fc.assert(
      fc.property(mixedItemsArb, pageBreakOptionsArb, (items, options) => {
        // 确保页面高度足够容纳至少一个项
        const minItemHeight = items.length > 0 
          ? Math.min(...items.map((i) => i.height)) 
          : 50
        const adjustedOptions: PageBreakOptions = {
          ...options,
          pageHeight: Math.max(options.pageHeight, minItemHeight + options.headerHeight + options.footerHeight + 50),
        }

        const result = calculatePageBreaks(items, adjustedOptions)

        // 计算可用高度
        const availableHeight = adjustedOptions.pageHeight - 
          (adjustedOptions.headerHeight ?? 0) - 
          (adjustedOptions.footerHeight ?? 0)

        // 检查每页内容高度
        for (const page of result.pages) {
          const contentHeight = getPageContentHeight(page, items)
          
          // 内容高度不应超过可用高度
          // 注意：由于单个项可能超过页面高度，我们允许单项页面超出
          if (page.items.length > 1) {
            expect(contentHeight).toBeLessThanOrEqual(availableHeight)
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})

// ==================== Property 12: 单位转换可逆性 ====================

describe('Property 12: 单位转换可逆性', () => {
  /**
   * Property 12: mmToPx(pxToMm(x)) ≈ x
   * **Validates: Requirements 10.1**
   *
   * *For any* measurement value, mmToPx(pxToMm(value)) SHALL equal
   * the original value (within floating point precision).
   */
  it('should be reversible: mmToPx(pxToMm(x)) ≈ x', () => {
    fc.assert(
      fc.property(pxValueArb, (px) => {
        const mm = pxToMm(px)
        const backToPx = mmToPx(mm)

        // 允许浮点精度误差
        const tolerance = 0.0001
        expect(Math.abs(backToPx - px)).toBeLessThan(tolerance)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 反向转换也应可逆
   */
  it('should be reversible: pxToMm(mmToPx(x)) ≈ x', () => {
    fc.assert(
      fc.property(mmValueArb, (mm) => {
        const px = mmToPx(mm)
        const backToMm = pxToMm(px)

        // 允许浮点精度误差
        const tolerance = 0.0001
        expect(Math.abs(backToMm - mm)).toBeLessThan(tolerance)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 预设页面尺寸的转换应正确
   */
  it('should correctly convert preset page dimensions', () => {
    const presets = [PAGE_16K, PAGE_A4, PAGE_A5]

    for (const preset of presets) {
      const heightPx = mmToPx(preset.height)
      const widthPx = mmToPx(preset.width)

      // 转换回来应该相等
      expect(Math.abs(pxToMm(heightPx) - preset.height)).toBeLessThan(0.0001)
      expect(Math.abs(pxToMm(widthPx) - preset.width)).toBeLessThan(0.0001)

      // 可用高度计算应该一致
      const usableHeight = calculateUsableHeight(preset)
      const expectedUsableHeightMm = preset.height - preset.marginTop - preset.marginBottom
      const expectedUsableHeightPx = mmToPx(expectedUsableHeightMm)

      expect(Math.abs(usableHeight - expectedUsableHeightPx)).toBeLessThan(0.0001)
    }
  })
})

// ==================== Property 13: 溢出字段分割正确性 ====================

describe('Property 13: 溢出字段分割正确性', () => {
  /**
   * Property 13: firstLine + rest = original
   * **Validates: Requirements 9.7**
   *
   * *For any* text value, the combination of getOverflowFirstLine and
   * getOverflowRest should reconstruct the original content.
   */
  it('should correctly split overflow content: firstLine + rest ≈ original', () => {
    fc.assert(
      fc.property(overflowTextArb, maxCharsArb, (text, maxChars) => {
        const firstLine = getOverflowFirstLine(text, maxChars)
        const rest = getOverflowRest(text, maxChars)
        const hasOverflow = hasOverflowContent(text, maxChars)

        if (!text) {
          // 空文本
          expect(firstLine).toBe('')
          expect(rest).toBe('')
          expect(hasOverflow).toBe(false)
          return true
        }

        const lines = text.split('\n')
        const originalFirstLine = lines[0]

        if (originalFirstLine.length > maxChars) {
          // 第一行超过最大字符数
          expect(firstLine).toBe(originalFirstLine.substring(0, maxChars) + '...')
          expect(hasOverflow).toBe(true)

          // rest 应该包含第一行剩余部分 + 其他行
          const expectedRestStart = originalFirstLine.substring(maxChars)
          expect(rest.startsWith(expectedRestStart)).toBe(true)
        } else if (lines.length > 1) {
          // 多行但第一行未超过
          expect(firstLine).toBe(originalFirstLine)
          expect(hasOverflow).toBe(true)

          // rest 应该是除第一行外的所有内容
          const expectedRest = lines.slice(1).join('\n')
          expect(rest).toBe(expectedRest)
        } else {
          // 单行且未超过
          expect(firstLine).toBe(originalFirstLine)
          expect(rest).toBe('')
          expect(hasOverflow).toBe(false)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * hasOverflowContent 应与实际溢出一致
   */
  it('should correctly detect overflow content', () => {
    fc.assert(
      fc.property(overflowTextArb, maxCharsArb, (text, maxChars) => {
        const hasOverflow = hasOverflowContent(text, maxChars)
        const rest = getOverflowRest(text, maxChars)

        // hasOverflow 为 true 当且仅当 rest 非空
        if (hasOverflow) {
          expect(rest.length).toBeGreaterThan(0)
        } else {
          expect(rest).toBe('')
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * 空值和 null/undefined 处理
   */
  it('should handle null and undefined values gracefully', () => {
    const nullishValues = [null, undefined, '', 0, false]

    for (const value of nullishValues) {
      const firstLine = getOverflowFirstLine(value)
      const rest = getOverflowRest(value)
      const hasOverflow = hasOverflowContent(value)

      if (value === 0 || value === false) {
        // 0 和 false 会被转换为字符串
        expect(firstLine).toBe(String(value))
      } else {
        expect(firstLine).toBe('')
      }
      expect(rest).toBe('')
      expect(hasOverflow).toBe(false)
    }
  })
})
