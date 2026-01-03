/**
 * @fileoverview Content measurer
 * @module pagination/content-measurer
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Provides DOM element height measurement functionality for smart print pagination.
 * Core features:
 * - Create hidden measurement container (matching print styles)
 * - Measure actual rendered height of single elements
 * - Batch measure table row heights
 * - Handle dynamic row heights (text wrapping)
 * - Text height estimation (fallback for non-DOM environments)
 *
 * Note: This module is only available in browser environment. Node.js environment requires Puppeteer for measurement.
 *
 * @requirements
 * - 10.1: Create hidden container matching print styles for measurement
 * - 10.2: Measure actual rendered height including line-height, padding, margin
 * - 10.3: Support measuring variable height table rows
 * - 10.4: Handle text wrapping estimation
 * - 10.5: Support batch measuring multiple elements
 * - 10.6: Clean up container after measurement
 *
 * @dependencies
 * - ./measurer-types.ts - Type definitions
 * - ./types.ts - MeasurableItem type
 *
 * @usedBy
 * - ./index.ts - Module entry
 * - international-postpartum-frontend - Frontend print module
 */

import type { MeasurableItem } from './types'
import type {
  MeasureConfig,
  RequiredMeasureConfig,
  MeasureResult,
  MeasureElementOptions,
  MeasureTableOptions,
  TextEstimateOptions,
  MeasureContainerOptions,
  MeasureAllOptions,
} from './measurer-types'
import {
  DEFAULT_MEASURE_CONFIG,
  MEASURE_CONTAINER_CLASS,
  DEFAULT_TEXT_ESTIMATE_OPTIONS,
  MEASURE_SELECTORS,
} from './measurer-types'

// ==================== Environment Detection ====================

/**
 * Check if running in browser environment
 * @returns Whether in browser environment
 */
export function isBrowserEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  )
}

/**
 * Ensure running in browser environment
 * @throws Error if not in browser environment
 */
function ensureBrowserEnvironment(): void {
  if (!isBrowserEnvironment()) {
    throw new Error(
      'Content measurer requires browser environment. ' +
        'Use Puppeteer for Node.js environment.'
    )
  }
}

// ==================== Measurement Container Management ====================

/**
 * Create hidden measurement container
 * @requirements 10.1 - Create hidden container matching print styles
 *
 * @param config - Measurement configuration
 * @param options - Container creation options
 * @returns Measurement container element
 *
 * @example
 * const container = createMeasureContainer({ containerWidth: 624 })
 * // Use container for measurement...
 * destroyMeasureContainer(container)
 */
export function createMeasureContainer(
  config: MeasureConfig = DEFAULT_MEASURE_CONFIG,
  options: MeasureContainerOptions = {}
): HTMLDivElement {
  ensureBrowserEnvironment()

  const mergedConfig: RequiredMeasureConfig = {
    ...DEFAULT_MEASURE_CONFIG,
    ...config,
  }

  const {
    className = MEASURE_CONTAINER_CLASS,
    appendToBody = true,
    customStyles = {},
  } = options

  const container = document.createElement('div')
  container.className = className

  // Set container styles to simulate print environment
  // @requirements 10.1 - Rendering environment consistent with print styles
  Object.assign(container.style, {
    // Hide container
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    visibility: 'hidden',
    // Dimensions
    width: `${mergedConfig.containerWidth}px`,
    // Print styles
    fontSize: mergedConfig.fontSize,
    lineHeight: String(mergedConfig.lineHeight),
    fontFamily: mergedConfig.fontFamily,
    // Ensure consistent box model
    boxSizing: 'border-box',
    // Prevent content overflow affecting measurement
    overflow: 'hidden',
    // Custom styles
    ...customStyles,
  })

  if (appendToBody) {
    document.body.appendChild(container)
  }

  return container
}

/**
 * Destroy measurement container
 * @requirements 10.6 - Clean up container after measurement
 *
 * @param container - Measurement container element
 *
 * @example
 * const container = createMeasureContainer()
 * // Use container...
 * destroyMeasureContainer(container)
 */
export function destroyMeasureContainer(container: HTMLDivElement | null): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}


// ==================== Element Height Measurement ====================

/**
 * Measure height of a single element
 * @requirements 10.2 - Measure actual rendered height including line-height, padding, margin
 *
 * @param element - Element to measure
 * @param container - Measurement container
 * @returns Element height (px), including margin
 *
 * @example
 * const container = createMeasureContainer()
 * const element = document.querySelector('.my-element')
 * const height = measureElementHeight(element, container)
 * destroyMeasureContainer(container)
 */
export function measureElementHeight(
  element: HTMLElement,
  container: HTMLDivElement
): number {
  ensureBrowserEnvironment()

  // Clone element to avoid affecting original DOM
  const clone = element.cloneNode(true) as HTMLElement

  // Ensure element is visible
  clone.style.visibility = 'visible'
  clone.style.position = 'static'
  clone.style.display = ''

  // Add to measurement container
  container.appendChild(clone)

  // Get computed style including margin
  // @requirements 10.2 - Include line-height, padding, margin
  const computedStyle = window.getComputedStyle(clone)
  const marginTop = parseFloat(computedStyle.marginTop) || 0
  const marginBottom = parseFloat(computedStyle.marginBottom) || 0

  // Use getBoundingClientRect for precise height
  const rect = clone.getBoundingClientRect()
  const height = rect.height + marginTop + marginBottom

  // Cleanup
  container.removeChild(clone)

  return height
}

/**
 * Measure single element with options and return MeasurableItem
 *
 * @param element - DOM element to measure
 * @param container - Measurement container
 * @param options - Measurement options
 * @returns MeasurableItem object
 *
 * @example
 * const container = createMeasureContainer()
 * const element = document.querySelector('.section')
 * const item = measureElementWithOptions(element, container, {
 *   id: 'section-1',
 *   type: 'section'
 * })
 */
export function measureElementWithOptions(
  element: HTMLElement,
  container: HTMLDivElement,
  options: MeasureElementOptions
): MeasurableItem {
  const height = measureElementHeight(element, container)
  return {
    id: options.id,
    type: options.type,
    height,
    tableId: options.tableId,
    dataIndex: options.dataIndex,
  }
}

/**
 * Batch measure multiple elements
 *
 * @param elements - Array of elements to measure
 * @param container - Measurement container
 * @param optionsArray - Measurement options for each element
 * @returns Array of MeasurableItem
 */
export function measureElements(
  elements: HTMLElement[],
  container: HTMLDivElement,
  optionsArray: MeasureElementOptions[]
): MeasurableItem[] {
  if (elements.length !== optionsArray.length) {
    throw new Error('Elements and options arrays must have the same length')
  }

  return elements.map((element, index) =>
    measureElementWithOptions(element, container, optionsArray[index])
  )
}


// ==================== Table Row Batch Measurement ====================

/**
 * Batch measure table rows
 * @requirements 10.3 - Support measuring variable height table rows
 * @requirements 10.5 - Support batch measuring multiple elements
 *
 * @param tableElement - Table element
 * @param options - Table measurement options
 * @returns Array of measurement results, including header and each row height
 *
 * @example
 * const container = createMeasureContainer()
 * const table = document.querySelector('table')
 * const items = measureTableRows(table, container, { tableId: 'table-1' })
 * // items: [
 * //   { id: 'table-1-header', type: 'table-header', height: 40, tableId: 'table-1' },
 * //   { id: 'table-1-row-0', type: 'table-row', height: 30, tableId: 'table-1', dataIndex: 0 },
 * //   ...
 * // ]
 */
export function measureTableRows(
  tableElement: HTMLElement,
  container: HTMLDivElement,
  options: MeasureTableOptions
): MeasurableItem[] {
  ensureBrowserEnvironment()

  const { tableId, includeHeader = true, includeRows = true } = options
  const results: MeasurableItem[] = []

  // Clone table for measurement
  const tableClone = tableElement.cloneNode(true) as HTMLElement
  tableClone.style.visibility = 'visible'
  tableClone.style.position = 'static'
  container.appendChild(tableClone)

  // Measure header (thead)
  if (includeHeader) {
    const thead = tableClone.querySelector(MEASURE_SELECTORS.TABLE_HEADER)
    if (thead) {
      const theadRect = thead.getBoundingClientRect()
      results.push({
        id: `${tableId}-header`,
        type: 'table-header',
        height: theadRect.height,
        tableId,
      })
    }
  }

  // Measure each row (tbody tr)
  if (includeRows) {
    const rows = tableClone.querySelectorAll(MEASURE_SELECTORS.TABLE_ROWS)
    rows.forEach((row, index) => {
      const rowRect = row.getBoundingClientRect()
      results.push({
        id: `${tableId}-row-${index}`,
        type: 'table-row',
        height: rowRect.height,
        tableId,
        dataIndex: index,
      })
    })
  }

  // Cleanup
  container.removeChild(tableClone)

  return results
}

/**
 * Measure multiple tables
 *
 * @param tables - Array of table elements
 * @param container - Measurement container
 * @param tableIds - Array of table IDs
 * @returns Measurement results for all tables
 */
export function measureMultipleTables(
  tables: HTMLElement[],
  container: HTMLDivElement,
  tableIds: string[]
): MeasurableItem[] {
  if (tables.length !== tableIds.length) {
    throw new Error('Tables and tableIds arrays must have the same length')
  }

  const results: MeasurableItem[] = []

  tables.forEach((table, index) => {
    const tableResults = measureTableRows(table, container, {
      tableId: tableIds[index],
    })
    results.push(...tableResults)
  })

  return results
}


// ==================== Text Height Estimation ====================

/**
 * Estimate text height (used when direct measurement is not possible)
 * @requirements 10.4 - Handle text wrapping estimation
 *
 * This function is a fallback for non-DOM environments, estimating height by calculating text lines.
 * For Chinese text, assumes each character width equals font size.
 * For English text, assumes each character width is about 0.5 times font size.
 *
 * @param text - Text content
 * @param options - Estimation options
 * @returns Estimated height (px)
 *
 * @example
 * // Estimate Chinese text height
 * const height = estimateTextHeight('This is a test text', {
 *   containerWidth: 624,
 *   fontSize: 13.33,
 *   lineHeight: 1.8
 * })
 */
export function estimateTextHeight(
  text: string,
  options: TextEstimateOptions = DEFAULT_TEXT_ESTIMATE_OPTIONS
): number {
  if (!text) return 0

  const {
    containerWidth,
    fontSize = DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize,
    lineHeight = DEFAULT_TEXT_ESTIMATE_OPTIONS.lineHeight,
    isChinese = DEFAULT_TEXT_ESTIMATE_OPTIONS.isChinese,
  } = options

  // Estimate characters per line
  // Chinese character width equals font size, English character is about 0.5 times
  const charWidth = isChinese ? fontSize : fontSize * 0.5
  const charsPerLine = Math.floor(containerWidth / charWidth)

  // Calculate lines (considering line breaks and auto-wrapping)
  const lines = text.split('\n')
  let totalLines = 0

  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1
    } else {
      // For mixed text, use more conservative estimation
      const effectiveLength = isChinese
        ? line.length
        : countEffectiveChars(line)
      totalLines += Math.ceil(effectiveLength / charsPerLine)
    }
  }

  // Calculate height
  return totalLines * fontSize * lineHeight
}

/**
 * Count effective characters in text (considering mixed Chinese/English)
 * Chinese characters count as 2, English characters count as 1
 *
 * @param text - Text content
 * @returns Effective character count
 */
function countEffectiveChars(text: string): number {
  let count = 0
  for (const char of text) {
    // Chinese character range (including common characters, punctuation, etc.)
    if (char.charCodeAt(0) > 127) {
      count += 2
    } else {
      count += 1
    }
  }
  return count
}

/**
 * Estimate total height of multiple text lines
 *
 * @param texts - Array of texts
 * @param options - Estimation options
 * @returns Total height (px)
 */
export function estimateMultipleTextHeights(
  texts: string[],
  options: TextEstimateOptions = DEFAULT_TEXT_ESTIMATE_OPTIONS
): number {
  return texts.reduce((total, text) => total + estimateTextHeight(text, options), 0)
}

/**
 * Estimate table row height (based on cell contents)
 *
 * @param cellContents - Array of cell contents
 * @param options - Estimation options
 * @returns Estimated row height (px)
 */
export function estimateTableRowHeight(
  cellContents: string[],
  options: TextEstimateOptions = DEFAULT_TEXT_ESTIMATE_OPTIONS
): number {
  // Find the tallest cell
  const maxCellHeight = Math.max(
    ...cellContents.map((content) => estimateTextHeight(content, options)),
    options.fontSize || DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize // Minimum height
  )

  // Add cell padding (estimated as 0.5 times font size)
  const padding = (options.fontSize || DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize) * 0.5
  return maxCellHeight + padding * 2
}


// ==================== Batch Measure All Content ====================

/**
 * Measure all elements in the entire content container
 * @requirements 10.5 - Support batch measuring multiple elements
 * @requirements 10.6 - Clean up container after measurement
 *
 * @param contentContainer - Container element containing all content
 * @param container - Measurement container
 * @param options - Batch measurement options
 * @returns Array of all measurable items
 *
 * @example
 * const measureContainer = createMeasureContainer()
 * const content = document.querySelector('.print-content')
 * const items = measureAll(content, measureContainer)
 * destroyMeasureContainer(measureContainer)
 */
export function measureAll(
  contentContainer: HTMLElement,
  container: HTMLDivElement,
  options: MeasureAllOptions = {}
): MeasurableItem[] {
  ensureBrowserEnvironment()

  const {
    measureHeader = true,
    measureFooter = true,
    measureSignature = true,
    measureTables = true,
    measureSections = true,
  } = options

  const results: MeasurableItem[] = []

  // Clone entire content container
  const clone = contentContainer.cloneNode(true) as HTMLElement
  clone.style.visibility = 'visible'
  clone.style.position = 'static'
  container.appendChild(clone)

  // 1. Page header (.print-header) - direct child element
  if (measureHeader) {
    const header = clone.querySelector(MEASURE_SELECTORS.HEADER)
    if (header) {
      const rect = header.getBoundingClientRect()
      results.push({
        id: 'page-header',
        type: 'header',
        height: rect.height,
      })
    }
  }

  // Get print-body container
  const printBody = clone.querySelector(MEASURE_SELECTORS.BODY)
  if (printBody) {
    if (measureSections) {
      // 2. Section titles (.section-title-block) - direct child elements
      const sectionTitles = printBody.querySelectorAll(MEASURE_SELECTORS.SECTION_TITLE)
      sectionTitles.forEach((title, index) => {
        const rect = title.getBoundingClientRect()
        results.push({
          id: `section-title-${index}`,
          type: 'section',
          height: rect.height,
        })
      })

      // 3. Info grids - find wrapper div with data-section-id
      const infoGridWrappers = printBody.querySelectorAll(MEASURE_SELECTORS.INFO_GRID_WRAPPER)
      infoGridWrappers.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect()
        results.push({
          id: `info-grid-${index}`,
          type: 'section',
          height: rect.height,
        })
      })

      // 5. Checkbox grids - find wrapper div with data-section-id
      const checkboxGridWrappers = printBody.querySelectorAll(
        MEASURE_SELECTORS.CHECKBOX_GRID_WRAPPER
      )
      checkboxGridWrappers.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect()
        results.push({
          id: `checkbox-grid-${index}`,
          type: 'section',
          height: rect.height,
        })
      })

      // 7. Medical checkbox row - Find wrapper div with data-section-id
      const medicalCheckboxRows = printBody.querySelectorAll(
        MEASURE_SELECTORS.MEDICAL_CHECKBOX_ROW_WRAPPER
      )
      medicalCheckboxRows.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect()
        results.push({
          id: `medical-checkbox-row-${index}`,
          type: 'section',
          height: rect.height,
        })
      })
    }

    // 4. Tables - find wrapper div with data-section-id
    if (measureTables) {
      const tableWrappers = printBody.querySelectorAll(MEASURE_SELECTORS.TABLE_WRAPPER)
      tableWrappers.forEach((wrapper, tableIndex) => {
        const tableId = `table-${tableIndex}`

        // Measure header (thead) - find within wrapper div
        const thead = wrapper.querySelector(MEASURE_SELECTORS.TABLE_HEADER)
        if (thead) {
          const theadRect = thead.getBoundingClientRect()
          results.push({
            id: `${tableId}-header`,
            type: 'table-header',
            height: theadRect.height,
            tableId,
          })
        }

        // Measure each row (tbody tr)
        const rows = wrapper.querySelectorAll(MEASURE_SELECTORS.TABLE_ROWS)
        rows.forEach((row, rowIndex) => {
          const rowRect = row.getBoundingClientRect()
          results.push({
            id: `${tableId}-row-${rowIndex}`,
            type: 'table-row',
            height: rowRect.height,
            tableId,
            dataIndex: rowIndex,
          })
        })
      })
    }

    // 6. Notes (.notes-text) - direct child elements
    if (measureFooter) {
      const notes = printBody.querySelectorAll(MEASURE_SELECTORS.NOTES)
      notes.forEach((note, index) => {
        const rect = note.getBoundingClientRect()
        results.push({
          id: `notes-${index}`,
          type: 'footer',
          height: rect.height,
        })
      })
    }
  }

  // 8. Signature area (.signature-area) - direct child elements
  if (measureSignature) {
    const signatures = clone.querySelectorAll(MEASURE_SELECTORS.SIGNATURE)
    signatures.forEach((sig, index) => {
      const rect = sig.getBoundingClientRect()
      results.push({
        id: `signature-${index}`,
        type: 'signature',
        height: rect.height,
      })
    })
  }

  // Cleanup
  container.removeChild(clone)

  return results
}

// ==================== Composable Style API ====================

/**
 * Content measurer state
 */
interface ContentMeasurerState {
  container: HTMLDivElement | null
  config: RequiredMeasureConfig
}

/**
 * Create content measurer instance
 * Provides Vue Composable-like API style, but without Vue dependency
 *
 * @param config - Measurement configuration
 * @returns Measurement utility functions
 *
 * @example
 * const measurer = createContentMeasurer({ containerWidth: 624 })
 *
 * // Measure single element
 * const height = measurer.measureElement(element)
 *
 * // Batch measure table rows
 * const results = measurer.measureTableRows(tableElement, { tableId: 'table-1' })
 *
 * // Measure all content
 * const allItems = measurer.measureAll(contentContainer)
 *
 * // Cleanup
 * measurer.cleanup()
 */
export function createContentMeasurer(config: MeasureConfig = DEFAULT_MEASURE_CONFIG) {
  const state: ContentMeasurerState = {
    container: null,
    config: { ...DEFAULT_MEASURE_CONFIG, ...config },
  }

  /**
   * Get or create measurement container
   */
  const getContainer = (): HTMLDivElement => {
    if (!state.container) {
      state.container = createMeasureContainer(state.config)
    }
    return state.container
  }

  /**
   * Measure single element
   */
  const measureElement = (element: HTMLElement): number => {
    const container = getContainer()
    return measureElementHeight(element, container)
  }

  /**
   * Measure element with options
   */
  const measureElementWith = (
    element: HTMLElement,
    options: MeasureElementOptions
  ): MeasurableItem => {
    const container = getContainer()
    return measureElementWithOptions(element, container, options)
  }

  /**
   * Batch measure table rows
   */
  const measureTable = (
    tableElement: HTMLElement,
    options: MeasureTableOptions
  ): MeasurableItem[] => {
    const container = getContainer()
    return measureTableRows(tableElement, container, options)
  }

  /**
   * Measure all content
   */
  const measureAllContent = (
    contentContainer: HTMLElement,
    options?: MeasureAllOptions
  ): MeasurableItem[] => {
    const container = getContainer()
    return measureAll(contentContainer, container, options)
  }

  /**
   * Clean up measurement container
   */
  const cleanup = (): void => {
    if (state.container) {
      destroyMeasureContainer(state.container)
      state.container = null
    }
  }

  return {
    /** Measure single element height */
    measureElement,
    /** Measure element with options */
    measureElementWith,
    /** Batch measure table rows */
    measureTable,
    /** Measure all content */
    measureAll: measureAllContent,
    /** Estimate text height */
    estimateTextHeight,
    /** Clean up measurement container */
    cleanup,
    /** Measurement configuration */
    config: state.config,
    /** Check if in browser environment */
    isBrowserEnvironment,
  }
}

// ==================== Export Types ====================

export type {
  MeasureConfig,
  RequiredMeasureConfig,
  MeasureResult,
  MeasureElementOptions,
  MeasureTableOptions,
  TextEstimateOptions,
  MeasureContainerOptions,
  MeasureAllOptions,
} from './measurer-types'

export {
  DEFAULT_MEASURE_CONFIG,
  MEASURE_CONTAINER_CLASS,
  DEFAULT_TEXT_ESTIMATE_OPTIONS,
  MEASURE_SELECTORS,
  isValidMeasureConfig,
  isValidMeasureResult,
} from './measurer-types'
