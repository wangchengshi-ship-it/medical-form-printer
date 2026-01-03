/**
 * @fileoverview Page break algorithm core
 * @module pagination/page-break-calculator
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Provides core algorithms for intelligent pagination, including:
 * - Page break point calculation
 * - Table row non-splitting guarantee
 * - Continuation page header repetition
 * - Reserved header height calculation
 *
 * @requirements
 * - 9.1: Calculate page breaks based on measured content height
 * - 9.2: Ensure table rows are not split
 * - 9.3: Automatically repeat headers on continuation pages
 * - 9.4: Mark continuation pages with isContinuation
 * - 9.6: Reserved header height calculation
 *
 * @dependencies
 * - ./types.ts - Type definitions
 *
 * @usedBy
 * - ./index.ts - Module entry
 * - ../renderer/paginated-renderer.ts - Paginated renderer (to be implemented)
 */

import type {
  MeasurableItem,
  PageContent,
  PageBreakResult,
  PageBreakOptions,
} from './types'
import { MEASURABLE_ITEM_TYPES } from './types'

// ==================== Helper Functions ====================

/**
 * Find the header item for a specific table
 * @requirements 9.3, 9.6 - Identify headers for repetition
 *
 * @param items - All content items
 * @param tableId - Table ID
 * @returns Header item, or undefined if not found
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
 * Build a map from table ID to header
 * @requirements 9.3 - Fast header lookup
 *
 * @param items - All content items
 * @returns Map from table ID to header item
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
 * Check if item is a table row
 * @param item - Content item
 * @returns Whether it is a table row
 */
function isTableRow(item: MeasurableItem): boolean {
  return item.type === MEASURABLE_ITEM_TYPES.TABLE_ROW && !!item.tableId
}

/**
 * Create an empty page
 * @param pageNumber - Page number
 * @param isContinuation - Whether it is a continuation page
 * @returns Empty page content
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

// ==================== Page Break Algorithm Core ====================

/**
 * Calculate page break points
 * @requirements 9.1, 9.2, 9.3, 9.4, 9.6
 *
 * Core algorithm:
 * 1. Iterate through all content items, accumulating height
 * 2. When accumulated height exceeds available page height, create new page
 * 3. Ensure table rows are not split (move entire row to next page)
 * 4. Continuation pages need to repeat corresponding table headers (Requirements 9.3)
 * 5. Reserve header height during calculation (Requirements 9.6)
 *
 * @param items - All measurable content items
 * @param options - Page break calculation options
 * @returns Page break result
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

  // Empty content returns single page
  if (items.length === 0) {
    return {
      pages: [createEmptyPage(1, false)],
      totalPages: 1,
    }
  }

  const pages: PageContent[] = []
  let currentPage = createEmptyPage(1, false)

  // Base available height (minus header and footer)
  const baseAvailableHeight = pageHeight - headerHeight - footerHeight
  let currentAvailableHeight = baseAvailableHeight
  let currentHeight = 0

  // Pre-build table ID to header map
  const tableHeaderMap = repeatTableHeaders
    ? buildTableHeaderMap(items)
    : new Map<string, MeasurableItem>()

  // Track which table headers have been added to current page
  const currentPageTableHeaders = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // If it's a header, record it in current page's header set
    if (item.type === MEASURABLE_ITEM_TYPES.TABLE_HEADER && item.tableId) {
      currentPageTableHeaders.add(item.tableId)
    }

    // Calculate height after adding this item
    let heightAfterAdd = currentHeight + item.height

    // If it's a table row and current page doesn't have this table's header, need to reserve header height
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

    // Check if page break is needed
    if (
      heightAfterAdd > currentAvailableHeight &&
      currentPage.items.length > 0
    ) {
      // Save current page
      pages.push(currentPage)

      // Create new page
      currentPage = createEmptyPage(pages.length + 1, true)

      // Reset height calculation and header tracking
      currentAvailableHeight = baseAvailableHeight
      currentHeight = 0
      currentPageTableHeaders.clear()

      // If current item is a table row, need to repeat header on new page
      if (isTableRow(item) && repeatTableHeaders) {
        tableHeader = tableHeaderMap.get(item.tableId!)
        if (tableHeader) {
          currentPage.repeatedHeaders.push(tableHeader.id)
          currentHeight += tableHeader.height
          currentPageTableHeaders.add(item.tableId!)
        }
      }
    } else if (needsHeaderRepeat && tableHeader) {
      // Add header repeat on current page (no page break but needs header)
      currentPage.repeatedHeaders.push(tableHeader.id)
      currentHeight += tableHeader.height
      currentPageTableHeaders.add(item.tableId!)
    }

    // Add current item to page
    currentPage.items.push(item.id)
    currentHeight += item.height
  }

  // Add last page
  if (currentPage.items.length > 0 || pages.length === 0) {
    pages.push(currentPage)
  }

  return {
    pages,
    totalPages: pages.length,
  }
}

/**
 * Simplified page break calculation (using default options)
 * @param items - All measurable content items
 * @param pageHeight - Available page height (px)
 * @param headerHeight - Header height (px), default 0
 * @param footerHeight - Footer height (px), default 0
 * @returns Page break result
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
 * Validate completeness of page break result
 * @requirements 9.1 - Ensure all items are assigned to pages
 *
 * @param items - Original content items
 * @param result - Page break result
 * @returns Whether all items are assigned
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
        // Duplicate assignment
        return false
      }
      assignedItemIds.add(itemId)
    }
  }

  // Check if all items are assigned
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
 * Get actual content height of a page
 * @param page - Page content
 * @param items - All content items
 * @returns Page content height (px)
 */
export function getPageContentHeight(
  page: PageContent,
  items: MeasurableItem[]
): number {
  const itemMap = new Map(items.map((item) => [item.id, item]))
  let height = 0

  // Calculate repeated header height
  for (const headerId of page.repeatedHeaders) {
    const header = itemMap.get(headerId)
    if (header) {
      height += header.height
    }
  }

  // Calculate content item height
  for (const itemId of page.items) {
    const item = itemMap.get(itemId)
    if (item) {
      height += item.height
    }
  }

  return height
}
