/**
 * @fileoverview 水印渲染工具函数
 * @module utils/watermark
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 *
 * @description
 * 提供统一的水印渲染功能，确保所有渲染器使用一致的水印实现。
 * 支持透明度设置和边界检查。
 *
 * @usedBy
 * - ../renderer/isolated-html-renderer.ts - 隔离模式渲染器
 * - ../pagination/paginated-renderer.ts - 分页渲染器
 * - ../renderer/templates/index.ts - 模板渲染器基类
 */

import { escapeHtml } from './html-builder'

// ==================== 类型定义 ====================

/**
 * 水印配置选项
 */
export interface WatermarkOptions {
  /** 水印文本 */
  text?: string
  /** 透明度 (0-1)，超出范围会被 clamp */
  opacity?: number
  /** CSS 类名，默认 'watermark' */
  className?: string
}

// ==================== 工具函数 ====================

/**
 * 将数值限制在指定范围内
 * @param value - 输入值
 * @param min - 最小值
 * @param max - 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 安全处理透明度值
 * @param opacity - 原始透明度值
 * @returns 处理后的透明度值（0-1 范围内），undefined 表示不设置
 */
export function normalizeOpacity(opacity?: number): number | undefined {
  if (opacity === undefined) return undefined
  return clamp(opacity, 0, 1)
}

// ==================== 核心渲染函数 ====================

/**
 * 渲染水印 HTML
 *
 * @param options - 水印配置选项
 * @returns 水印 HTML 字符串，无水印时返回空字符串
 *
 * @example
 * ```typescript
 * // 基础用法
 * renderWatermarkHtml({ text: '仅供内部使用' })
 * // => '<div class="watermark">仅供内部使用</div>'
 *
 * // 带透明度
 * renderWatermarkHtml({ text: '草稿', opacity: 0.5 })
 * // => '<div class="watermark" style="opacity: 0.5">草稿</div>'
 *
 * // 自定义类名（用于命名空间）
 * renderWatermarkHtml({ text: '草稿', className: 'mpr-watermark' })
 * // => '<div class="mpr-watermark">草稿</div>'
 *
 * // 透明度边界处理
 * renderWatermarkHtml({ text: '测试', opacity: 1.5 })
 * // => '<div class="watermark" style="opacity: 1">测试</div>'
 * ```
 */
export function renderWatermarkHtml(options: WatermarkOptions): string {
  const { text, opacity, className = 'watermark' } = options

  if (!text) return ''

  const safeOpacity = normalizeOpacity(opacity)
  const styleAttr = safeOpacity !== undefined ? ` style="opacity: ${safeOpacity}"` : ''

  return `<div class="${className}"${styleAttr}>${escapeHtml(text)}</div>`
}

/**
 * 从渲染选项中提取水印配置
 * 用于兼容现有的 RenderOptions 接口
 *
 * @param options - 包含水印配置的选项对象
 * @returns 水印配置选项
 */
export function extractWatermarkOptions(
  options?: { watermark?: string; watermarkOpacity?: number },
  className?: string
): WatermarkOptions {
  return {
    text: options?.watermark,
    opacity: options?.watermarkOpacity,
    className,
  }
}
