/**
 * @fileoverview PDF 合并器
 * @module pdf/pdf-merger
 */

import { PDFDocument } from 'pdf-lib'
import type { MergeDocumentItem, MergeOptions, PdfOptions } from '../types/options'
import { renderToPdf } from './pdf-generator'

/**
 * 合并多个文档为一个 PDF
 * 
 * @param documents - 要合并的文档列表
 * @param options - 合并选项
 * @param pdfOptions - PDF 生成选项（应用于所有文档）
 * @returns 合并后的 PDF Buffer
 */
export async function mergePdfs(
  documents: MergeDocumentItem[],
  options?: MergeOptions,
  pdfOptions?: PdfOptions
): Promise<Buffer> {
  if (documents.length === 0) {
    throw new Error('At least one document is required')
  }
  
  // 如果只有一个文档，直接返回
  if (documents.length === 1) {
    return renderToPdf(documents[0].schema, documents[0].data, pdfOptions)
  }
  
  // 创建合并后的 PDF 文档
  const mergedPdf = await PDFDocument.create()
  
  // 逐个生成并合并
  for (const doc of documents) {
    const pdfBuffer = await renderToPdf(doc.schema, doc.data, pdfOptions)
    const pdf = await PDFDocument.load(pdfBuffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    
    for (const page of pages) {
      mergedPdf.addPage(page)
    }
  }
  
  // 生成目录（如果需要）
  if (options?.tableOfContents) {
    // TODO: 实现目录生成
    console.warn('Table of contents generation is not yet implemented')
  }
  
  // 保存并返回
  const mergedBuffer = await mergedPdf.save()
  return Buffer.from(mergedBuffer)
}

/**
 * 合并多个 PDF Buffer
 * 
 * @param buffers - PDF Buffer 数组
 * @returns 合并后的 PDF Buffer
 */
export async function mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
  if (buffers.length === 0) {
    throw new Error('At least one PDF buffer is required')
  }
  
  if (buffers.length === 1) {
    return buffers[0]
  }
  
  const mergedPdf = await PDFDocument.create()
  
  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    
    for (const page of pages) {
      mergedPdf.addPage(page)
    }
  }
  
  const mergedBuffer = await mergedPdf.save()
  return Buffer.from(mergedBuffer)
}
