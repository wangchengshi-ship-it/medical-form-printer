/**
 * @fileoverview PDF generator
 * @module pdf/pdf-generator
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { PdfOptions } from '../types/options'
import { renderToHtml } from '../renderer'

/**
 * Render PrintSchema and FormData to PDF Buffer
 * 
 * @param schema - Print layout configuration
 * @param data - Form data
 * @param options - PDF generation options
 * @returns PDF file Buffer
 * @throws If Puppeteer is not installed
 */
export async function renderToPdf(
  schema: PrintSchema,
  data: FormData,
  options?: PdfOptions
): Promise<Buffer> {
  // Dynamically import Puppeteer (optional dependency)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let puppeteer: any
  try {
    puppeteer = await import('puppeteer')
  } catch {
    throw new Error(
      'Puppeteer is required for PDF generation. Please install it: npm install puppeteer'
    )
  }
  
  // Generate HTML
  const html = renderToHtml(schema, data, options)
  
  // Launch browser
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  
  try {
    const page = await browser.newPage()
    
    // Set page content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })
    
    // Determine page size
    const format = schema.pageSize.toUpperCase() as 'A4' | 'A5'
    const landscape = schema.orientation === 'landscape'
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format,
      landscape,
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      // PDF/A format (if needed)
      ...(options?.pdfA && {
        tagged: true,
        outline: true,
      }),
    })
    
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
