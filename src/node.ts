/**
 * @fileoverview Node.js PDF 生成入口
 * @module @medical/print-renderer/node
 * @version 0.1.0
 * 
 * @description
 * 提供 PDF 生成和合并功能，仅在 Node.js 环境中使用。
 * 需要安装 puppeteer 作为 peer dependency。
 * 
 * @example
 * ```typescript
 * import { renderToPdf, mergePdfs } from '@medical/print-renderer/node'
 * 
 * // 生成单个 PDF
 * const pdfBuffer = await renderToPdf(printSchema, formData, {
 *   watermark: '仅供内部使用'
 * })
 * 
 * // 合并多个 PDF
 * const mergedPdf = await mergePdfs([
 *   { schema: schema1, data: data1 },
 *   { schema: schema2, data: data2 },
 * ])
 * ```
 */

// 重新导出核心功能
export * from './index'

// PDF 生成
export { renderToPdf } from './pdf/pdf-generator'
export { mergePdfs } from './pdf/pdf-merger'
