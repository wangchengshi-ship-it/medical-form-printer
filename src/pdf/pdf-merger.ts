/**
 * @fileoverview PDF merger
 * @module pdf/pdf-merger
 */

import { PDFDocument } from 'pdf-lib'
import type { MergeDocumentItem, MergeOptions, PdfOptions } from '../types/options'
import { renderToPdf } from './pdf-generator'

/**
 * Merge multiple documents into one PDF
 * 
 * @param documents - List of documents to merge
 * @param options - Merge options
 * @param pdfOptions - PDF generation options (applied to all documents)
 * @returns Merged PDF Buffer
 */
export async function mergePdfs(
  documents: MergeDocumentItem[],
  options?: MergeOptions,
  pdfOptions?: PdfOptions
): Promise<Buffer> {
  if (documents.length === 0) {
    throw new Error('At least one document is required')
  }
  
  // If only one document, return directly
  if (documents.length === 1) {
    return renderToPdf(documents[0].schema, documents[0].data, pdfOptions)
  }
  
  // Create merged PDF document
  const mergedPdf = await PDFDocument.create()
  
  // Generate and merge one by one
  for (const doc of documents) {
    const pdfBuffer = await renderToPdf(doc.schema, doc.data, pdfOptions)
    const pdf = await PDFDocument.load(pdfBuffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    
    for (const page of pages) {
      mergedPdf.addPage(page)
    }
  }
  
  // Generate table of contents (if needed)
  if (options?.tableOfContents) {
    // TODO: Implement table of contents generation
    console.warn('Table of contents generation is not yet implemented')
  }
  
  // Save and return
  const mergedBuffer = await mergedPdf.save()
  return Buffer.from(mergedBuffer)
}

/**
 * Merge multiple PDF Buffers
 * 
 * @param buffers - Array of PDF Buffers
 * @returns Merged PDF Buffer
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
