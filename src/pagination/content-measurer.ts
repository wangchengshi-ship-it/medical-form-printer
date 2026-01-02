/**
 * @fileoverview 内容测量器
 * @module pagination/content-measurer
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 提供 DOM 元素高度测量功能，用于智能打印分页。
 * 核心功能：
 * - 创建隐藏的测量容器（与打印样式一致）
 * - 测量单个元素的实际渲染高度
 * - 批量测量表格行高度
 * - 处理动态行高（文本换行）
 * - 文本高度估算（无 DOM 环境降级方案）
 *
 * 注意：此模块仅在浏览器环境可用，Node.js 环境需要使用 Puppeteer 进行测量。
 *
 * @requirements
 * - 10.1: 创建隐藏容器匹配打印样式进行测量
 * - 10.2: 测量实际渲染高度，包含 line-height、padding、margin
 * - 10.3: 支持测量可变高度的表格行
 * - 10.4: 处理文本换行估算
 * - 10.5: 支持批量测量多个元素
 * - 10.6: 测量后清理容器
 *
 * @dependencies
 * - ./measurer-types.ts - 类型定义
 * - ./types.ts - MeasurableItem 类型
 *
 * @usedBy
 * - ./index.ts - 模块入口
 * - international-postpartum-frontend - 前端打印模块
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

// ==================== 环境检测 ====================

/**
 * 检查是否在浏览器环境
 * @returns 是否在浏览器环境
 */
export function isBrowserEnvironment(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  )
}

/**
 * 确保在浏览器环境中运行
 * @throws Error 如果不在浏览器环境
 */
function ensureBrowserEnvironment(): void {
  if (!isBrowserEnvironment()) {
    throw new Error(
      'Content measurer requires browser environment. ' +
        'Use Puppeteer for Node.js environment.'
    )
  }
}

// ==================== 测量容器管理 ====================

/**
 * 创建隐藏的测量容器
 * @requirements 10.1 - 创建隐藏容器匹配打印样式
 *
 * @param config - 测量配置
 * @param options - 容器创建选项
 * @returns 测量容器元素
 *
 * @example
 * const container = createMeasureContainer({ containerWidth: 624 })
 * // 使用容器进行测量...
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

  // 设置容器样式，模拟打印环境
  // @requirements 10.1 - 与打印样式一致的渲染环境
  Object.assign(container.style, {
    // 隐藏容器
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    visibility: 'hidden',
    // 尺寸
    width: `${mergedConfig.containerWidth}px`,
    // 打印样式
    fontSize: mergedConfig.fontSize,
    lineHeight: String(mergedConfig.lineHeight),
    fontFamily: mergedConfig.fontFamily,
    // 确保盒模型一致
    boxSizing: 'border-box',
    // 防止内容溢出影响测量
    overflow: 'hidden',
    // 自定义样式
    ...customStyles,
  })

  if (appendToBody) {
    document.body.appendChild(container)
  }

  return container
}

/**
 * 销毁测量容器
 * @requirements 10.6 - 测量后清理容器
 *
 * @param container - 测量容器元素
 *
 * @example
 * const container = createMeasureContainer()
 * // 使用容器...
 * destroyMeasureContainer(container)
 */
export function destroyMeasureContainer(container: HTMLDivElement | null): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
}


// ==================== 元素高度测量 ====================

/**
 * 测量单个元素的高度
 * @requirements 10.2 - 测量实际渲染高度，包含 line-height、padding、margin
 *
 * @param element - 要测量的元素
 * @param container - 测量容器
 * @returns 元素高度 (px)，包含 margin
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

  // 克隆元素以避免影响原始 DOM
  const clone = element.cloneNode(true) as HTMLElement

  // 确保元素可见
  clone.style.visibility = 'visible'
  clone.style.position = 'static'
  clone.style.display = ''

  // 添加到测量容器
  container.appendChild(clone)

  // 获取计算后的样式，包含 margin
  // @requirements 10.2 - 包含 line-height、padding、margin
  const computedStyle = window.getComputedStyle(clone)
  const marginTop = parseFloat(computedStyle.marginTop) || 0
  const marginBottom = parseFloat(computedStyle.marginBottom) || 0

  // 使用 getBoundingClientRect 获取精确高度
  const rect = clone.getBoundingClientRect()
  const height = rect.height + marginTop + marginBottom

  // 清理
  container.removeChild(clone)

  return height
}

/**
 * 使用选项测量单个元素并返回 MeasurableItem
 *
 * @param element - 要测量的 DOM 元素
 * @param container - 测量容器
 * @param options - 测量选项
 * @returns MeasurableItem 对象
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
 * 批量测量多个元素
 *
 * @param elements - 要测量的元素数组
 * @param container - 测量容器
 * @param optionsArray - 每个元素的测量选项
 * @returns MeasurableItem 数组
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


// ==================== 表格行批量测量 ====================

/**
 * 批量测量表格行
 * @requirements 10.3 - 支持测量可变高度的表格行
 * @requirements 10.5 - 支持批量测量多个元素
 *
 * @param tableElement - 表格元素
 * @param options - 表格测量选项
 * @returns 测量结果数组，包含表头和每行的高度
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

  // 克隆表格以进行测量
  const tableClone = tableElement.cloneNode(true) as HTMLElement
  tableClone.style.visibility = 'visible'
  tableClone.style.position = 'static'
  container.appendChild(tableClone)

  // 测量表头（thead）
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

  // 测量每一行（tbody tr）
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

  // 清理
  container.removeChild(tableClone)

  return results
}

/**
 * 测量多个表格
 *
 * @param tables - 表格元素数组
 * @param container - 测量容器
 * @param tableIds - 表格 ID 数组
 * @returns 所有表格的测量结果
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


// ==================== 文本高度估算 ====================

/**
 * 估算文本高度（当无法直接测量时使用）
 * @requirements 10.4 - 处理文本换行估算
 *
 * 此函数用于无 DOM 环境的降级方案，通过计算文本行数来估算高度。
 * 对于中文文本，假设每个字符宽度约等于字体大小。
 * 对于英文文本，假设每个字符宽度约为字体大小的 0.5 倍。
 *
 * @param text - 文本内容
 * @param options - 估算选项
 * @returns 估算高度 (px)
 *
 * @example
 * // 估算中文文本高度
 * const height = estimateTextHeight('这是一段测试文本', {
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

  // 估算每行字符数
  // 中文字符宽度约等于字体大小，英文字符约为 0.5 倍
  const charWidth = isChinese ? fontSize : fontSize * 0.5
  const charsPerLine = Math.floor(containerWidth / charWidth)

  // 计算行数（考虑换行符和自动换行）
  const lines = text.split('\n')
  let totalLines = 0

  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1
    } else {
      // 对于混合文本，使用更保守的估算
      const effectiveLength = isChinese
        ? line.length
        : countEffectiveChars(line)
      totalLines += Math.ceil(effectiveLength / charsPerLine)
    }
  }

  // 计算高度
  return totalLines * fontSize * lineHeight
}

/**
 * 计算文本的有效字符数（考虑中英文混合）
 * 中文字符计为 2，英文字符计为 1
 *
 * @param text - 文本内容
 * @returns 有效字符数
 */
function countEffectiveChars(text: string): number {
  let count = 0
  for (const char of text) {
    // 中文字符范围（包括常用汉字、标点等）
    if (char.charCodeAt(0) > 127) {
      count += 2
    } else {
      count += 1
    }
  }
  return count
}

/**
 * 估算多行文本的总高度
 *
 * @param texts - 文本数组
 * @param options - 估算选项
 * @returns 总高度 (px)
 */
export function estimateMultipleTextHeights(
  texts: string[],
  options: TextEstimateOptions = DEFAULT_TEXT_ESTIMATE_OPTIONS
): number {
  return texts.reduce((total, text) => total + estimateTextHeight(text, options), 0)
}

/**
 * 估算表格行高度（基于单元格内容）
 *
 * @param cellContents - 单元格内容数组
 * @param options - 估算选项
 * @returns 估算的行高度 (px)
 */
export function estimateTableRowHeight(
  cellContents: string[],
  options: TextEstimateOptions = DEFAULT_TEXT_ESTIMATE_OPTIONS
): number {
  // 找出最高的单元格
  const maxCellHeight = Math.max(
    ...cellContents.map((content) => estimateTextHeight(content, options)),
    options.fontSize || DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize // 最小高度
  )

  // 添加单元格 padding（估算为字体大小的 0.5 倍）
  const padding = (options.fontSize || DEFAULT_TEXT_ESTIMATE_OPTIONS.fontSize) * 0.5
  return maxCellHeight + padding * 2
}


// ==================== 批量测量所有内容 ====================

/**
 * 测量整个内容容器的所有元素
 * @requirements 10.5 - 支持批量测量多个元素
 * @requirements 10.6 - 测量后清理容器
 *
 * @param contentContainer - 包含所有内容的容器元素
 * @param container - 测量容器
 * @param options - 批量测量选项
 * @returns 所有可测量项的数组
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

  // 克隆整个内容容器
  const clone = contentContainer.cloneNode(true) as HTMLElement
  clone.style.visibility = 'visible'
  clone.style.position = 'static'
  container.appendChild(clone)

  // 1. 页眉 (.print-header) - 直接子元素
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

  // 获取 print-body 容器
  const printBody = clone.querySelector(MEASURE_SELECTORS.BODY)
  if (printBody) {
    if (measureSections) {
      // 2. 区块标题 (.section-title-block) - 直接子元素
      const sectionTitles = printBody.querySelectorAll(MEASURE_SELECTORS.SECTION_TITLE)
      sectionTitles.forEach((title, index) => {
        const rect = title.getBoundingClientRect()
        results.push({
          id: `section-title-${index}`,
          type: 'section',
          height: rect.height,
        })
      })

      // 3. 信息网格 - 查找带 data-section-id 的包装 div
      const infoGridWrappers = printBody.querySelectorAll(MEASURE_SELECTORS.INFO_GRID_WRAPPER)
      infoGridWrappers.forEach((wrapper, index) => {
        const rect = wrapper.getBoundingClientRect()
        results.push({
          id: `info-grid-${index}`,
          type: 'section',
          height: rect.height,
        })
      })

      // 5. 勾选框网格 - 查找带 data-section-id 的包装 div
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

      // 7. 医疗勾选行 - 查找带 data-section-id 的包装 div
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

    // 4. 表格 - 查找带 data-section-id 的包装 div
    if (measureTables) {
      const tableWrappers = printBody.querySelectorAll(MEASURE_SELECTORS.TABLE_WRAPPER)
      tableWrappers.forEach((wrapper, tableIndex) => {
        const tableId = `table-${tableIndex}`

        // 测量表头（thead）- 在包装 div 内查找
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

        // 测量每一行（tbody tr）
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

    // 6. 备注 (.notes-text) - 直接子元素
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

  // 8. 签名区域 (.signature-area) - 直接子元素
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

  // 清理
  container.removeChild(clone)

  return results
}

// ==================== Composable 风格 API ====================

/**
 * 内容测量器状态
 */
interface ContentMeasurerState {
  container: HTMLDivElement | null
  config: RequiredMeasureConfig
}

/**
 * 创建内容测量器实例
 * 提供类似 Vue Composable 的 API 风格，但不依赖 Vue
 *
 * @param config - 测量配置
 * @returns 测量相关的工具函数
 *
 * @example
 * const measurer = createContentMeasurer({ containerWidth: 624 })
 *
 * // 测量单个元素
 * const height = measurer.measureElement(element)
 *
 * // 批量测量表格行
 * const results = measurer.measureTableRows(tableElement, { tableId: 'table-1' })
 *
 * // 测量所有内容
 * const allItems = measurer.measureAll(contentContainer)
 *
 * // 清理
 * measurer.cleanup()
 */
export function createContentMeasurer(config: MeasureConfig = DEFAULT_MEASURE_CONFIG) {
  const state: ContentMeasurerState = {
    container: null,
    config: { ...DEFAULT_MEASURE_CONFIG, ...config },
  }

  /**
   * 获取或创建测量容器
   */
  const getContainer = (): HTMLDivElement => {
    if (!state.container) {
      state.container = createMeasureContainer(state.config)
    }
    return state.container
  }

  /**
   * 测量单个元素
   */
  const measureElement = (element: HTMLElement): number => {
    const container = getContainer()
    return measureElementHeight(element, container)
  }

  /**
   * 使用选项测量元素
   */
  const measureElementWith = (
    element: HTMLElement,
    options: MeasureElementOptions
  ): MeasurableItem => {
    const container = getContainer()
    return measureElementWithOptions(element, container, options)
  }

  /**
   * 批量测量表格行
   */
  const measureTable = (
    tableElement: HTMLElement,
    options: MeasureTableOptions
  ): MeasurableItem[] => {
    const container = getContainer()
    return measureTableRows(tableElement, container, options)
  }

  /**
   * 测量所有内容
   */
  const measureAllContent = (
    contentContainer: HTMLElement,
    options?: MeasureAllOptions
  ): MeasurableItem[] => {
    const container = getContainer()
    return measureAll(contentContainer, container, options)
  }

  /**
   * 清理测量容器
   */
  const cleanup = (): void => {
    if (state.container) {
      destroyMeasureContainer(state.container)
      state.container = null
    }
  }

  return {
    /** 测量单个元素高度 */
    measureElement,
    /** 使用选项测量元素 */
    measureElementWith,
    /** 批量测量表格行 */
    measureTable,
    /** 测量所有内容 */
    measureAll: measureAllContent,
    /** 估算文本高度 */
    estimateTextHeight,
    /** 清理测量容器 */
    cleanup,
    /** 测量配置 */
    config: state.config,
    /** 检查是否在浏览器环境 */
    isBrowserEnvironment,
  }
}

// ==================== 导出类型 ====================

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
