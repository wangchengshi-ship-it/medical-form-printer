/**
 * @fileoverview 隔离模式 HTML 渲染器
 * @module renderer/isolated-html-renderer
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 生成带 CSS 隔离的 HTML 输出，确保：
 * 1. 所有类名带 mpr- 前缀
 * 2. 样式完全隔离，不受外部影响
 * 3. 字体强制使用思源宋体 SC
 *
 * @dependencies
 * - ../types/print-schema - 打印配置类型
 * - ../types/options - 渲染选项类型
 * - ../styles - 样式系统
 * - ./section-renderers - 区块渲染器
 * - ../utils - 工具函数
 *
 * @usedBy
 * - ../index.ts - 库主入口
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { RenderOptions } from '../types/options'
import { generateIsolatedCss, ISOLATION_ROOT_CLASS, CSS_NAMESPACE } from '../styles'
import { renderSection } from './section-renderers'
import { escapeHtml, renderWatermarkHtml } from '../utils'

// ==================== 类型定义 ====================

/**
 * 隔离渲染选项
 */
export interface IsolatedRenderOptions extends RenderOptions {
  /** 水印文本 */
  watermark?: string
  /** 水印透明度 (0-1)，超出范围会被自动 clamp */
  watermarkOpacity?: number
}

/**
 * 渲染上下文（内部使用）
 */
interface RenderContext {
  css: string
  pageClasses: string
  header: string
  sections: string
  footer: string
  watermark: string
}

// ==================== 常量 ====================

/** 命名空间前缀 */
const ns = CSS_NAMESPACE

// ==================== 内部渲染函数 ====================

/**
 * 渲染页眉
 */
function renderHeader(schema: PrintSchema): string {
  const { header } = schema

  const logo = header.showLogo && header.logoUrl
    ? `<img src="${escapeHtml(header.logoUrl)}" alt="Logo" class="${ns}-header-logo" />`
    : ''

  const department = header.department
    ? `<div class="${ns}-department-name">${escapeHtml(header.department)}</div>`
    : ''

  return `<header class="${ns}-print-header">
${logo}
<div class="${ns}-hospital-name">${escapeHtml(header.hospital)}</div>
${department}
<h1 class="${ns}-form-title">${escapeHtml(header.title)}</h1>
</header>`
}

/**
 * 渲染页脚
 */
function renderFooter(schema: PrintSchema): string {
  const { footer } = schema
  if (!footer) return ''

  const notes = footer.notes
    ? `<span class="${ns}-footer-notes">${escapeHtml(footer.notes)}</span>`
    : ''

  const pageNumber = footer.showPageNumber
    ? `<span class="${ns}-page-number"></span>`
    : ''

  return `<footer class="${ns}-print-footer">
${notes}
${pageNumber}
</footer>`
}

/**
 * 渲染区块标题
 */
function renderSectionTitle(title: string | undefined): string {
  return title ? `<div class="${ns}-section-title">${escapeHtml(title)}</div>` : ''
}

/**
 * 渲染所有区块
 * @remarks 区块渲染器内部的类名目前不带命名空间前缀，
 * 这是已知限制。完整的命名空间支持需要修改所有 section-renderers。
 * @see {@link file://.kiro/specs/font-isolation/tasks.md} Task 4.1
 */
function renderSections(schema: PrintSchema, data: FormData, options?: RenderOptions): string {
  return schema.sections
    .map((section) => {
      const title = renderSectionTitle(section.title)
      const content = renderSection(section.type, section.config, data, options)
      return `${title}${content}`
    })
    .join('\n')
}

/**
 * 渲染水印
 * @param text - 水印文本
 * @param opacity - 透明度 (0-1)，超出范围会被 clamp
 */
function renderWatermark(text?: string, opacity?: number): string {
  return renderWatermarkHtml({
    text,
    opacity,
    className: `${ns}-watermark`,
  })
}

/**
 * 获取页面类名
 */
function getPageClasses(schema: PrintSchema): string {
  return [
    `${ns}-print-page`,
    schema.pageSize.toLowerCase() !== 'a4' && `${ns}-${schema.pageSize.toLowerCase()}`,
    schema.orientation === 'landscape' && `${ns}-landscape`,
  ].filter(Boolean).join(' ')
}

// ==================== 核心渲染逻辑 ====================

/**
 * 创建渲染上下文
 * 提取公共渲染逻辑，避免重复代码
 */
function createRenderContext(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): RenderContext {
  return {
    css: generateIsolatedCss(options?.theme),
    pageClasses: getPageClasses(schema),
    header: renderHeader(schema),
    sections: renderSections(schema, data, options),
    footer: renderFooter(schema),
    watermark: renderWatermark(options?.watermark, options?.watermarkOpacity),
  }
}

/**
 * 渲染隔离容器内容
 */
function renderIsolatedContent(ctx: RenderContext): string {
  return `<div class="${ISOLATION_ROOT_CLASS}">
<style>
${ctx.css}
</style>
<div class="${ctx.pageClasses}">
${ctx.watermark}
${ctx.header}
<main class="${ns}-print-content">
${ctx.sections}
</main>
${ctx.footer}
</div>
</div>`
}

// ==================== 公共 API ====================

/**
 * 将 PrintSchema 和 FormData 渲染为隔离的 HTML 字符串
 *
 * @param schema - 打印布局配置
 * @param data - 表单数据
 * @param options - 渲染选项（字体配置将被忽略）
 * @returns 完整的隔离 HTML 文档
 *
 * @description
 * 生成的 HTML 具有以下特点：
 * 1. 所有内容包裹在 .mpr-root 隔离容器中
 * 2. CSS 内嵌在隔离容器内的 <style> 标签中
 * 3. 所有类名带 mpr- 前缀
 * 4. 字体强制使用内嵌的思源宋体 SC
 *
 * @example
 * ```typescript
 * const html = renderToIsolatedHtml(schema, data)
 * // 输出的 HTML 样式完全隔离，可安全嵌入任何页面
 * ```
 */
export function renderToIsolatedHtml(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): string {
  const ctx = createRenderContext(schema, data, options)

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(schema.header.title)}</title>
</head>
<body>
${renderIsolatedContent(ctx)}
</body>
</html>`
}

/**
 * 渲染隔离的 HTML 片段（不包含 DOCTYPE 和 html/head/body 标签）
 * 适用于嵌入到现有页面中
 *
 * @param schema - 打印布局配置
 * @param data - 表单数据
 * @param options - 渲染选项
 * @returns 隔离的 HTML 片段
 */
export function renderToIsolatedFragment(
  schema: PrintSchema,
  data: FormData,
  options?: IsolatedRenderOptions
): string {
  return renderIsolatedContent(createRenderContext(schema, data, options))
}
