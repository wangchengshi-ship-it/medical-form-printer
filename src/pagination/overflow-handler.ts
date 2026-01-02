/**
 * @fileoverview 溢出字段分页处理
 * @module pagination/overflow-handler
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 处理长文本字段（如 textarea）的分页逻辑：
 * - 第一页显示截断内容
 * - 续页显示剩余内容
 * - 支持配置每个字段的截断字符数
 *
 * 参考前端实现：PrintModeForm.vue 第 130-175 行
 *
 * @requirements
 * - 9.1: 根据测量内容高度计算分页点
 * - 9.7: 支持溢出字段分页
 *
 * @dependencies
 * - ./types.ts - 类型定义
 *
 * @usedBy
 * - ./index.ts - 模块入口
 * - ../renderer/paginated-renderer.ts - 分页渲染器（待实现）
 */

import type { OverflowFieldConfig } from './types'
import { PAGINATION_DEFAULTS } from './types'

// ==================== 类型定义 ====================

/**
 * 溢出字段处理结果
 */
export interface OverflowFieldResult {
  /** 字段名 */
  fieldName: string
  /** 第一页显示内容 */
  firstLine: string
  /** 续页显示内容 */
  rest: string
  /** 是否有溢出内容 */
  hasOverflow: boolean
}

// ==================== 内部工具函数 ====================

/**
 * 安全转换为字符串
 */
function toSafeString(value: unknown): string {
  if (value == null) return ''
  return String(value)
}

/**
 * 按换行符分割文本
 */
function splitLines(text: string): string[] {
  return text.split('\n')
}

// ==================== 核心处理函数 ====================

/**
 * 获取溢出字段的第一页显示内容
 * @requirements 9.7 - 支持溢出字段分页
 *
 * @param value - 字段值
 * @param maxChars - 第一页显示的最大字符数
 * @returns 第一页显示的内容
 *
 * @example
 * getOverflowFirstLine('这是一段很长的文本...', 60)
 */
export function getOverflowFirstLine(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): string {
  const text = toSafeString(value)
  if (!text) return ''

  const firstLine = splitLines(text)[0]

  if (firstLine.length > maxChars) {
    return firstLine.substring(0, maxChars) + '...'
  }
  return firstLine
}

/**
 * 获取溢出字段的续页显示内容
 * @requirements 9.7 - 支持溢出字段分页
 *
 * @param value - 字段值
 * @param maxChars - 第一页显示的最大字符数
 * @returns 续页显示的内容
 */
export function getOverflowRest(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): string {
  const text = toSafeString(value)
  if (!text) return ''

  const lines = splitLines(text)
  const firstLine = lines[0]

  // 第一行超过最大字符数，截取剩余部分
  if (firstLine.length > maxChars) {
    const rest = firstLine.substring(maxChars)
    const remainingLines = lines.slice(1)
    return remainingLines.length > 0
      ? rest + '\n' + remainingLines.join('\n')
      : rest
  }

  // 只有一行且未超过最大字符数
  if (lines.length <= 1) return ''

  // 返回除第一行外的所有内容
  return lines.slice(1).join('\n')
}

/**
 * 判断字段是否有溢出内容
 * @requirements 9.7 - 支持溢出字段分页
 *
 * @param value - 字段值
 * @param maxChars - 第一页显示的最大字符数
 * @returns 是否有溢出内容需要显示在续页
 */
export function hasOverflowContent(
  value: unknown,
  maxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): boolean {
  const text = toSafeString(value)
  if (!text) return false

  const lines = splitLines(text)

  // 第一行超过最大字符数 或 有多行内容
  return lines[0].length > maxChars || lines.length > 1
}

// ==================== 配置工厂函数 ====================

/**
 * 创建溢出字段配置
 * @param fieldName - 字段名
 * @param maxFirstLineChars - 第一页显示的最大字符数
 * @returns 溢出字段配置
 */
export function createOverflowFieldConfig(
  fieldName: string,
  maxFirstLineChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): OverflowFieldConfig {
  return { fieldName, maxFirstLineChars }
}

/**
 * 从字段名数组创建溢出字段配置列表
 * @param fieldNames - 字段名数组
 * @param defaultMaxChars - 默认最大字符数
 * @returns 溢出字段配置列表
 */
export function createOverflowFieldConfigs(
  fieldNames: string[],
  defaultMaxChars: number = PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
): OverflowFieldConfig[] {
  return fieldNames.map((name) =>
    createOverflowFieldConfig(name, defaultMaxChars)
  )
}

// ==================== 配置查询函数 ====================

/**
 * 获取字段的溢出配置
 * @param configs - 溢出字段配置列表
 * @param fieldName - 字段名
 * @returns 溢出字段配置，如果未找到则返回 undefined
 */
export function getOverflowFieldConfig(
  configs: OverflowFieldConfig[],
  fieldName: string
): OverflowFieldConfig | undefined {
  return configs.find((c) => c.fieldName === fieldName)
}

/**
 * 检查字段是否配置为溢出字段
 * @param configs - 溢出字段配置列表
 * @param fieldName - 字段名
 * @returns 是否为溢出字段
 */
export function isOverflowField(
  configs: OverflowFieldConfig[],
  fieldName: string
): boolean {
  return configs.some((c) => c.fieldName === fieldName)
}

// ==================== 批量处理函数 ====================

/**
 * 批量处理溢出字段
 * @param data - 表单数据
 * @param configs - 溢出字段配置列表
 * @returns 溢出字段处理结果列表
 */
export function processOverflowFields(
  data: Record<string, unknown>,
  configs: OverflowFieldConfig[]
): OverflowFieldResult[] {
  return configs.map((config) => {
    const value = data[config.fieldName]
    const maxChars =
      config.maxFirstLineChars ?? PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS

    return {
      fieldName: config.fieldName,
      firstLine: getOverflowFirstLine(value, maxChars),
      rest: getOverflowRest(value, maxChars),
      hasOverflow: hasOverflowContent(value, maxChars),
    }
  })
}

/**
 * 检查是否有任何溢出内容需要续页
 * @param data - 表单数据
 * @param configs - 溢出字段配置列表
 * @returns 是否需要续页
 */
export function hasAnyOverflowContent(
  data: Record<string, unknown>,
  configs: OverflowFieldConfig[]
): boolean {
  return configs.some((config) => {
    const value = data[config.fieldName]
    const maxChars =
      config.maxFirstLineChars ?? PAGINATION_DEFAULTS.OVERFLOW_FIRST_LINE_CHARS
    return hasOverflowContent(value, maxChars)
  })
}
