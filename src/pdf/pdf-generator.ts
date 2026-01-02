/**
 * @fileoverview PDF 生成器
 * @module pdf/pdf-generator
 */

import type { PrintSchema, FormData } from '../types/print-schema'
import type { PdfOptions } from '../types/options'
import { renderToHtml } from '../renderer'

/**
 * 将 PrintSchema 和 FormData 渲染为 PDF Buffer
 * 
 * @param schema - 打印布局配置
 * @param data - 表单数据
 * @param options - PDF 生成选项
 * @returns PDF 文件的 Buffer
 * @throws 如果 Puppeteer 未安装
 */
export async function renderToPdf(
  schema: PrintSchema,
  data: FormData,
  options?: PdfOptions
): Promise<Buffer> {
  // 动态导入 Puppeteer（可选依赖）
  let puppeteer: typeof import('puppeteer')
  try {
    puppeteer = await import('puppeteer')
  } catch {
    throw new Error(
      'Puppeteer is required for PDF generation. Please install it: npm install puppeteer'
    )
  }
  
  // 生成 HTML
  const html = renderToHtml(schema, data, options)
  
  // 启动浏览器
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  
  try {
    const page = await browser.newPage()
    
    // 设置页面内容
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })
    
    // 确定页面尺寸
    const format = schema.pageSize.toUpperCase() as 'A4' | 'A5'
    const landscape = schema.orientation === 'landscape'
    
    // 生成 PDF
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
      // PDF/A 格式（如果需要）
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
