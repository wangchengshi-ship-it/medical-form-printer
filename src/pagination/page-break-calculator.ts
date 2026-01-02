/**
 * @fileoverview 分页算法核心
 * @module pagination/page-break-calculator
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 提供智能分页的核心算法，包括：
 * - 分页点计算
 * - 表格行不分割保证
 * - 续页表头重复
 * - 预留表头高度计算
 *
 * @requirements
 * - 9.1: 根据测量内容高度计算分页点
 * - 9.2: 确保表格行不被分割
 * - 9.3: 续页自动重复表头
 * - 9.4: 标记续页 isContinuation
 * - 9.6: 预留表头高度计算
 *
 * @dependencies
 * - ./types.ts - 类型定义
 *
 * @usedBy
 * - ./index.ts - 模块入口
 * - ../renderer/paginated-renderer.ts - 分页渲染器（待实现）
 */

import type {
  MeasurableItem,
  PageContent,
  PageBreakResult,
  PageBreakOptions,
} from './types'
import { MEASURABLE_ITEM_TYPES } from './types'

// ==================== 辅助函数 ====================

/**
 * 查找指定表格的表头项
 * @requirements 9.3, 9.6 - 识别表头用于重复
 *
 * @param items - 所有内容项
 * @param tableId - 表格ID
 * @returns 表头项，如果未找到则返回 undefined
 */
export function findTableHeader(
  items: MeasurableItem[],
  tableId: string
): MeasurableItem | undefined {
  return items.find(
    (item) =>
      item.type === MEASURABLE_ITEM_TYPES.TABLE_HEADER &&
      item.tableId === tableId
  )
}

/**
 * 构建表格ID到表头的映射
 * @requirements 9.3 - 快速查找表头
 *
 * @param items - 所有内容项
 * @returns 表格ID到表头项的映射
 */
export function buildTableHeaderMap(
  items: MeasurableItem[]
): Map<string, MeasurableItem> {
  const headerMap = new Map<string, MeasurableItem>()
  for (const item of items) {
    if (item.type === MEASURABLE_ITEM_TYPES.TABLE_HEADER && item.tableId) {
      headerMap.set(item.tableId, item)
    }
  }
  return headerMap
}

/**
 * 检查项是否为表格行
 * @param item - 内容项
 * @returns 是否为表格行
 */
function isTableRow(item: MeasurableItem): boolean {
  return item.type === MEASURABLE_ITEM_TYPES.TABLE_ROW && !!item.tableId
}

/**
 * 创建空页面
 * @param pageNumber - 页码
 * @param isContinuation - 是否为续页
 * @returns 空页面内容
 */
function createEmptyPage(
  pageNumber: number,
  isContinuation: boolean
): PageContent {
  return {
    pageNumber,
    isContinuation,
    items: [],
    repeatedHeaders: [],
  }
}

// ==================== 分页算法核心 ====================

/**
 * 计算分页点
 * @requirements 9.1, 9.2, 9.3, 9.4, 9.6
 *
 * 核心算法：
 * 1. 遍历所有内容项，累计高度
 * 2. 当累计高度超过页面可用高度时，创建新页
 * 3. 确保表格行不被分割（整行移到下一页）
 * 4. 续页需要重复对应表格的表头 (Requirements 9.3)
 * 5. 计算时预留表头高度 (Requirements 9.6)
 *
 * @param items - 所有可测量内容项
 * @param options - 分页计算选项
 * @returns 分页结果
 */
export function calculatePageBreaks(
  items: MeasurableItem[],
  options: PageBreakOptions
): PageBreakResult {
  const {
    pageHeight,
    headerHeight = 0,
    footerHeight = 0,
    repeatTableHeaders = true,
  } = options

  // 空内容返回单页
  if (items.length === 0) {
    return {
      pages: [createEmptyPage(1, false)],
      totalPages: 1,
    }
  }

  const pages: PageContent[] = []
  let currentPage = createEmptyPage(1, false)

  // 基础可用高度（减去页眉页脚）
  const baseAvailableHeight = pageHeight - headerHeight - footerHeight
  let currentAvailableHeight = baseAvailableHeight
  let currentHeight = 0

  // 预先构建表格ID到表头的映射
  const tableHeaderMap = repeatTableHeaders
    ? buildTableHeaderMap(items)
    : new Map<string, MeasurableItem>()

  // 跟踪当前页面已经添加了哪些表格的表头
  const currentPageTableHeaders = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // 如果是表头，记录到当前页面的表头集合
    if (item.type === MEASURABLE_ITEM_TYPES.TABLE_HEADER && item.tableId) {
      currentPageTableHeaders.add(item.tableId)
    }

    // 计算添加此项后的高度
    let heightAfterAdd = currentHeight + item.height

    // 如果是表格行，且当前页面还没有该表格的表头，需要额外预留表头高度
    let needsHeaderRepeat = false
    let tableHeader: MeasurableItem | undefined
    if (isTableRow(item) && repeatTableHeaders) {
      if (!currentPageTableHeaders.has(item.tableId!)) {
        tableHeader = tableHeaderMap.get(item.tableId!)
        if (tableHeader) {
          needsHeaderRepeat = true
          heightAfterAdd += tableHeader.height
        }
      }
    }

    // 检查是否需要分页
    if (
      heightAfterAdd > currentAvailableHeight &&
      currentPage.items.length > 0
    ) {
      // 保存当前页
      pages.push(currentPage)

      // 创建新页
      currentPage = createEmptyPage(pages.length + 1, true)

      // 重置高度计算和表头跟踪
      currentAvailableHeight = baseAvailableHeight
      currentHeight = 0
      currentPageTableHeaders.clear()

      // 如果当前项是表格行，需要在新页重复表头
      if (isTableRow(item) && repeatTableHeaders) {
        tableHeader = tableHeaderMap.get(item.tableId!)
        if (tableHeader) {
          currentPage.repeatedHeaders.push(tableHeader.id)
          currentHeight += tableHeader.height
          currentPageTableHeaders.add(item.tableId!)
        }
      }
    } else if (needsHeaderRepeat && tableHeader) {
      // 在当前页添加表头重复（不分页但需要表头）
      currentPage.repeatedHeaders.push(tableHeader.id)
      currentHeight += tableHeader.height
      currentPageTableHeaders.add(item.tableId!)
    }

    // 添加当前项到页面
    currentPage.items.push(item.id)
    currentHeight += item.height
  }

  // 添加最后一页
  if (currentPage.items.length > 0 || pages.length === 0) {
    pages.push(currentPage)
  }

  return {
    pages,
    totalPages: pages.length,
  }
}

/**
 * 简化版分页计算（使用默认选项）
 * @param items - 所有可测量内容项
 * @param pageHeight - 页面可用高度 (px)
 * @param headerHeight - 页眉高度 (px)，默认 0
 * @param footerHeight - 页脚高度 (px)，默认 0
 * @returns 分页结果
 */
export function calculatePageBreaksSimple(
  items: MeasurableItem[],
  pageHeight: number,
  headerHeight: number = 0,
  footerHeight: number = 0
): PageBreakResult {
  return calculatePageBreaks(items, {
    pageHeight,
    headerHeight,
    footerHeight,
    repeatTableHeaders: true,
  })
}

/**
 * 验证分页结果的完整性
 * @requirements 9.1 - 确保所有项都被分配到页面
 *
 * @param items - 原始内容项
 * @param result - 分页结果
 * @returns 是否所有项都被分配
 */
export function validatePageBreakResult(
  items: MeasurableItem[],
  result: PageBreakResult
): boolean {
  const allItemIds = new Set(items.map((item) => item.id))
  const assignedItemIds = new Set<string>()

  for (const page of result.pages) {
    for (const itemId of page.items) {
      if (assignedItemIds.has(itemId)) {
        // 重复分配
        return false
      }
      assignedItemIds.add(itemId)
    }
  }

  // 检查是否所有项都被分配
  if (assignedItemIds.size !== allItemIds.size) {
    return false
  }

  for (const id of allItemIds) {
    if (!assignedItemIds.has(id)) {
      return false
    }
  }

  return true
}

/**
 * 获取页面的实际内容高度
 * @param page - 页面内容
 * @param items - 所有内容项
 * @returns 页面内容高度 (px)
 */
export function getPageContentHeight(
  page: PageContent,
  items: MeasurableItem[]
): number {
  const itemMap = new Map(items.map((item) => [item.id, item]))
  let height = 0

  // 计算重复表头高度
  for (const headerId of page.repeatedHeaders) {
    const header = itemMap.get(headerId)
    if (header) {
      height += header.height
    }
  }

  // 计算内容项高度
  for (const itemId of page.items) {
    const item = itemMap.get(itemId)
    if (item) {
      height += item.height
    }
  }

  return height
}
