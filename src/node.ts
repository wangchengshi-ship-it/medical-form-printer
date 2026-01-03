/**
 * @fileoverview Node.js PDF generation entry point
 * @module medical-form-printer/node
 * @version 0.1.0
 * 
 * @description
 * Provides PDF generation and merging functionality, only for use in Node.js environment.
 * Requires puppeteer as a peer dependency.
 * 
 * @example
 * ```typescript
 * import { renderToPdf, mergePdfs } from 'medical-form-printer/node'
 * 
 * // Generate single PDF
 * const pdfBuffer = await renderToPdf(printSchema, formData, {
 *   watermark: 'Internal Use Only'
 * })
 * 
 * // Merge multiple PDFs
 * const mergedPdf = await mergePdfs([
 *   { schema: schema1, data: data1 },
 *   { schema: schema2, data: data2 },
 * ])
 * ```
 */

// Re-export core functionality
export * from './index'

// PDF generation
export { renderToPdf } from './pdf/pdf-generator'
export { mergePdfs } from './pdf/pdf-merger'
